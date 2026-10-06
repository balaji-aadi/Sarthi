/**
 * Base AI Provider Abstract Interface
 * Establishes contract for LLM generation adapters.
 */
export class AIProvider {
  /**
   * Generates a parsed JSON response from the LLM.
   * @param {Object} options
   * @param {string} options.prompt - Prompt instructions
   * @param {string} [options.systemPrompt] - System instructions
   * @param {number} [options.temperature=0.2] - Sampling temperature
   * @param {number} [options.maxTokens=4000] - Token limit
   * @returns {Promise<Object>} Parsed JSON object
   */
  async generateJSON(options) {
    throw new Error("AIProvider: generateJSON must be implemented by subclass.");
  }

  /**
   * Generates raw text response from the LLM.
   * @param {Object} options
   * @param {string} options.prompt
   * @param {string} [options.systemPrompt]
   * @param {number} [options.temperature=0.2]
   * @param {number} [options.maxTokens=4000]
   * @returns {Promise<string>} Raw text
   */
  async generateText(options) {
    throw new Error("AIProvider: generateText must be implemented by subclass.");
  }
}
