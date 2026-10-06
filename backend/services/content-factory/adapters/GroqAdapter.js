import axios from 'axios';
import { AIProvider } from './AIProvider.js';

function sanitizeJSONString(str) {
  let result = '';
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (inString) {
      if (isEscaped) {
        result += char;
        isEscaped = false;
      } else if (char === '\\') {
        result += char;
        isEscaped = true;
      } else if (char === '"') {
        result += char;
        inString = false;
      } else if (char === '\n') {
        result += '\\n';
      } else if (char === '\r') {
        result += '\\r';
      } else if (char === '\t') {
        result += '\\t';
      } else {
        result += char;
      }
    } else {
      if (char === '"') {
        inString = true;
      }
      result += char;
    }
  }
  return result;
}

/**
 * Resilient JSON extractor and cleaner
 */
export function extractAndParseJSON(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error("Invalid response from AI provider: empty or non-string response.");
  }

  console.log("[GroqAdapter] Incoming raw text length:", rawText.length, "Preview:", rawText.slice(0, 150));
  let text = rawText.trim();

  // 1. Strip outer markdown code fence ONLY if the text actually starts with it
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  }

  // 2. Direct parse attempt
  try {
    return JSON.parse(text);
  } catch (initialErr) {
    // Try sanitized
    try {
      return JSON.parse(sanitizeJSONString(text));
    } catch (e2) {}

    // 3. Find outermost brackets
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');
    
    let startIdx = -1;
    let endIdx = -1;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIdx = firstBrace;
      endIdx = text.lastIndexOf('}');
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
      endIdx = text.lastIndexOf(']');
    }

    if (startIdx !== -1 && endIdx > startIdx) {
      const slice = text.substring(startIdx, endIdx + 1);
      try {
        return JSON.parse(slice);
      } catch (sliceErr) {
        // Attempt cleanup: sanitize control characters in strings & remove trailing commas
        const sanitized = sanitizeJSONString(slice);
        const cleaned = sanitized.replace(/,\s*([}\]])/g, '$1');
        try {
          return JSON.parse(cleaned);
        } catch (cleanErr) {
          console.error("[GroqAdapter] Cleaned slice that failed:", cleaned.slice(0, 1000));
          throw new Error(`Failed to parse AI JSON response: ${cleanErr.message}. Content preview: ${text.slice(0, 300)}...`);
        }
      }
    }

    console.error("[GroqAdapter] Failed Raw Response:", rawText);
    throw new Error(`Malformed AI JSON response: No valid JSON object or array found. Content preview: ${text.slice(0, 300)}...`);
  }
}

export class GroqAdapter extends AIProvider {
  constructor(config = {}) {
    super();
    this._configuredApiKey = config.apiKey || '';
    this._configuredModel = config.model || '';
    this.endpoint = config.endpoint || 'https://api.groq.com/openai/v1/chat/completions';
    this.timeoutMs = config.timeoutMs || 60000;
    this.maxRetries = config.maxRetries ?? 4;
  }

  get apiKey() {
    return this._configuredApiKey || process.env.AI_FACTORY_API_KEY || process.env.GROQ_API_KEY || '';
  }

  get model() {
    return this._configuredModel || process.env.AI_FACTORY_MODEL || 'openai/gpt-oss-120b';
  }

  _getAuthHeader() {
    const key = this.apiKey;
    if (!key) {
      throw new Error("GroqAdapter: Missing API key. Please configure AI_FACTORY_API_KEY or GROQ_API_KEY in backend environment.");
    }
    return {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    };
  }

  async _executeWithRetry(payload) {
    let attempt = 0;
    let lastError = null;

    while (attempt <= this.maxRetries) {
      try {
        const response = await axios.post(
          this.endpoint,
          payload,
          {
            headers: this._getAuthHeader(),
            timeout: this.timeoutMs
          }
        );

        const content = response.data?.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error("Groq API returned an empty completion content.");
        }
        return content;
      } catch (err) {
        lastError = err;
        attempt++;

        const status = err.response?.status;
        const isRateLimit = status === 429;
        const isServerErr = status && status >= 500 && status < 600;
        const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');

        // Only retry on transient failures
        if (attempt <= this.maxRetries && (isRateLimit || isServerErr || isTimeout)) {
          const delayMs = isRateLimit ? Math.min(15000, attempt * 3500) : attempt * 1500;
          console.warn(`[GroqAdapter] Transient failure (status: ${status || err.code}). Retrying attempt ${attempt}/${this.maxRetries} after ${delayMs}ms...`);
          await new Promise(res => setTimeout(res, delayMs));
          continue;
        }

        // Fatal or exhausted retries
        const errMsg = err.response?.data?.error?.message || err.message || 'Unknown network error';
        throw new Error(`Groq API invocation failed (${status || 'NETWORK'}): ${errMsg}`);
      }
    }

    throw lastError;
  }

  async generateText({ prompt, systemPrompt = '', temperature = 0.2, maxTokens = 4000 }) {
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const payload = {
      model: this.model,
      messages,
      temperature,
      max_tokens: maxTokens
    };

    return this._executeWithRetry(payload);
  }

  async generateJSON({ prompt, systemPrompt = '', temperature = 0.1, maxTokens = 4000 }) {
    const jsonSystemPrompt = (systemPrompt ? systemPrompt + "\n\n" : "") +
      "IMPORTANT: You must respond ONLY with valid JSON. Do not include introductory notes, conversational filler, or unescaped characters. Output must begin with '{' or '[' and end with '}' or ']'.";

    const messages = [];
    messages.push({ role: 'system', content: jsonSystemPrompt });
    messages.push({ role: 'user', content: prompt });

    const payload = {
      model: this.model,
      messages,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" }
    };

    const raw = await this._executeWithRetry(payload);
    return extractAndParseJSON(raw);
  }
}

let defaultProviderInstance = null;

export function getFactoryAIProvider() {
  if (!defaultProviderInstance) {
    defaultProviderInstance = new GroqAdapter();
  }
  return defaultProviderInstance;
}
