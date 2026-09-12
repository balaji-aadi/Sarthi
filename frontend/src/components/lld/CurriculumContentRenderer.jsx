import React, { useState } from 'react';
import { 
  LuTarget, 
  LuCompass, 
  LuHammer, 
  LuEye, 
  LuCheckCircle2, 
  LuHelpCircle,
  LuSparkles,
  LuLayers,
  LuCode2,
  LuAlertTriangle,
  LuArrowRight,
  LuListChecks,
  LuCopy,
  LuCheck,
  LuTerminal,
  LuCornerDownRight,
  LuBookmark,
  LuFlaskConical
} from 'react-icons/lu';

/**
 * Monospace Code Block Component with Copy-to-Clipboard & Syntax badge
 */
export const CodeBlock = ({ code, language = 'cpp', title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const normLang = (language || '').toLowerCase().trim();
  const displayLang = normLang === 'cpp' || normLang === 'c++' 
    ? 'C++' 
    : normLang === 'text' || normLang === 'output' || normLang === 'bash' || normLang === 'terminal'
    ? 'TERMINAL' 
    : (language || 'CODE').toUpperCase();

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-700/70 bg-[#0d1117] shadow-md select-text">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#161b22] border-b border-slate-800 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-600"></span>
          <span className="font-mono font-bold text-slate-300 tracking-wider text-[10px]">
            {title || displayLang}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer select-none"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <LuCheck className="text-emerald-400 text-xs" />
              <span className="text-emerald-400 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <LuCopy className="text-slate-400 text-xs" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto custom-scrollbar font-mono text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre">
        <code>{code.trim()}</code>
      </div>
    </div>
  );
};

/**
 * Parses inline markdown: **bold**, `code`, *italic*
 */
export const renderInlineMarkdown = (text) => {
  if (!text || typeof text !== 'string') return text;

  // Split by inline code first, then bold/italic
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return parts.map((part, idx) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code 
          key={idx} 
          className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-150 dark:bg-slate-800 text-primary dark:text-primary-light font-mono text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={idx} className="italic text-slate-800 dark:text-slate-200">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
};

/**
 * Detects if a single line of text is likely C++ code or syntax.
 */
export const isLikelyCppCodeLine = (line) => {
  if (!line || typeof line !== 'string') return false;
  const t = line.trim();
  if (!t) return false;

  // C++ keywords, types, or syntax structures
  if (/^(class|struct|enum|union|interface|namespace|using|template)\b/.test(t)) return true;
  if (/^(public|private|protected)\s*:/.test(t)) return true;
  if (/^(virtual|override|explicit|static|const|constexpr|inline|friend)\b/.test(t)) return true;
  if (/^(#include|#define|#pragma|#ifdef|#ifndef|#endif)\b/.test(t)) return true;
  if (/^(void|int|double|float|bool|char|size_t|auto|long|unsigned|short|string|std::)\b/.test(t)) return true;
  if (/^(return\b|throw\b|delete\b|new\b|case\b|default:)/.test(t)) return true;
  if (/^(cout|cin|cerr)\s*<</.test(t)) return true;
  if (/^(\/\/|\/\*|\*\/)/.test(t)) return true;
  if (/^[{}();,]+$/.test(t)) return true;
  if (/;\s*(\/\/.*)?$/.test(t)) return true; // ends in semicolon with optional comment
  if (/^\w+(\.\w+|->\w+)+\s*\(.*\)\s*;?/.test(t)) return true; // e.g. cart.items.clear();
  if (/\b(std::|vector<|map<|set<|unordered_map<|unique_ptr<|shared_ptr<|push_back|emplace_back)\b/.test(t)) return true;
  if (/^[A-Z]\w+[\*&]?\s+\w+(\s*=\s*.*|\(.*\))?;?$/.test(t)) return true; // e.g. TrackerBox stackBox("StackBox");

  return false;
};

/**
 * Parses raw text lines inside a section into structured blocks:
 * - Fenced code blocks (```cpp ... ```)
 * - Auto-detected C++ or Terminal code
 * - Subheadings (### Subheading)
 * - Numbered steps
 * - Bullet lists
 * - Paragraphs
 */
export const parseSectionBlocks = (lines, sectionType = '') => {
  const blocks = [];
  let i = 0;

  // If the entire section is API & Interface and has no fences, but looks like C++ code:
  if (sectionType === 'api') {
    const rawJoined = lines.join('\n').trim();
    if (!rawJoined.includes('```') && (rawJoined.includes('class ') || rawJoined.includes('struct ') || rawJoined.includes('public:') || rawJoined.includes('void ') || rawJoined.includes('virtual '))) {
      return [{ type: 'code', language: 'cpp', code: rawJoined }];
    }
  }

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip blank lines
    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Fenced Code Block Detection
    if (trimmed.startsWith('```')) {
      const lang = trimmed.replace(/^```/, '').trim() || (sectionType === 'output' ? 'terminal' : 'cpp');
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length && lines[i].trim().startsWith('```')) {
        i++; // skip closing ```
      }
      blocks.push({
        type: 'code',
        language: lang,
        code: codeLines.join('\n')
      });
      continue;
    }

    // 2. Subheading (### Step 1 or #### Note)
    if (/^#{2,5}\s+/.test(trimmed)) {
      const headingText = trimmed.replace(/^#{2,5}\s+/, '').trim();
      blocks.push({
        type: 'subheading',
        text: headingText
      });
      i++;
      continue;
    }

    // 3. Expected Terminal Output header inside examples
    if (/^(expected\s+terminal\s+output|sample\s+output|expected\s+output):?/i.test(trimmed)) {
      blocks.push({
        type: 'output_label',
        text: trimmed
      });
      i++;
      // If following lines look like terminal output, capture them as a terminal block
      const outputLines = [];
      while (i < lines.length && !lines[i].trim().startsWith('```') && !lines[i].trim().startsWith('#')) {
        outputLines.push(lines[i]);
        i++;
      }
      if (outputLines.length > 0) {
        blocks.push({
          type: 'code',
          language: 'terminal',
          code: outputLines.join('\n').trim()
        });
      }
      continue;
    }

    // 4. Numbered Step (e.g. "1. Write a class...")
    if (/^\d+\.\s+/.test(trimmed)) {
      const stepMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      const stepNum = stepMatch[1];
      const stepText = stepMatch[2];
      const stepBullets = [];
      const stepCode = [];
      i++;

      // Collect sub-bullets or nested code belonging to this step
      while (i < lines.length) {
        const nextLine = lines[i];
        const nextTrimmed = nextLine.trim();
        if (!nextTrimmed) {
          i++;
          continue;
        }
        if (/^\d+\.\s+/.test(nextTrimmed) || /^#{2,5}\s+/.test(nextTrimmed)) {
          break; // Next step or section
        }
        if (nextTrimmed.startsWith('```')) {
          const lang = nextTrimmed.replace(/^```/, '').trim() || 'cpp';
          i++;
          const innerCode = [];
          while (i < lines.length && !lines[i].trim().startsWith('```')) {
            innerCode.push(lines[i]);
            i++;
          }
          if (i < lines.length && lines[i].trim().startsWith('```')) i++;
          stepCode.push({ language: lang, code: innerCode.join('\n') });
          continue;
        }
        if (nextTrimmed.startsWith('* ') || nextTrimmed.startsWith('- ')) {
          stepBullets.push(nextTrimmed.replace(/^[\*\-]\s+/, ''));
          i++;
          continue;
        }
        // If it's a follow-up explanation sentence for the step
        stepBullets.push(nextTrimmed);
        i++;
      }

      blocks.push({
        type: 'step',
        number: stepNum,
        text: stepText,
        bullets: stepBullets,
        code: stepCode
      });
      continue;
    }

    // 5. Bullet item (* or -)
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const bulletItems = [];
      while (i < lines.length) {
        const bLine = lines[i].trim();
        if (bLine.startsWith('* ') || bLine.startsWith('- ')) {
          bulletItems.push(bLine.replace(/^[\*\-]\s+/, ''));
          i++;
        } else if (bLine === '') {
          i++;
        } else {
          break;
        }
      }
      blocks.push({
        type: 'bullet_list',
        items: bulletItems
      });
      continue;
    }

    // 6. Unfenced Code Block Auto-Detection (Starting Point, API, or general code snippets)
    if (isLikelyCppCodeLine(trimmed) || (sectionType === 'starting_point' && (trimmed.startsWith('//') || /^[{}();,]+$/.test(trimmed)))) {
      const codeLines = [];
      while (i < lines.length) {
        const nextRaw = lines[i];
        const nextTrimmed = nextRaw.trim();

        // Stop if a markdown heading, numbered step or bullet list item
        if (/^#{2,5}\s+/.test(nextTrimmed)) break;
        if (/^\d+\.\s+/.test(nextTrimmed) && !nextTrimmed.endsWith(';')) break;
        if ((nextTrimmed.startsWith('* ') || nextTrimmed.startsWith('- ')) && !nextTrimmed.includes(';')) break;

        // If it's a blank line, check if code continues after it
        if (!nextTrimmed) {
          let j = i + 1;
          while (j < lines.length && !lines[j].trim()) j++;
          if (j < lines.length && (isLikelyCppCodeLine(lines[j]) || lines[j].trim().startsWith('//') || /^[{}();]+$/.test(lines[j].trim()) || (sectionType === 'starting_point' && !/^[A-Z][a-zA-Z\s]{3,}:$/.test(lines[j].trim())))) {
            codeLines.push('');
            i++;
            continue;
          } else {
            break;
          }
        }

        // In starting_point, capture code lines, comments, indented lines, and statements
        if (isLikelyCppCodeLine(nextTrimmed) || nextTrimmed.startsWith('//') || nextTrimmed.startsWith('/*') || nextTrimmed.startsWith('*') || /^[{}();,]+$/.test(nextTrimmed) || sectionType === 'starting_point') {
          // If in starting_point and line looks like a completely new section header ending with colon
          if (sectionType === 'starting_point' && /^[A-Z][a-zA-Z\s]{3,}:$/.test(nextTrimmed) && !isLikelyCppCodeLine(nextTrimmed)) {
            break;
          }
          codeLines.push(nextRaw);
          i++;
        } else {
          break;
        }
      }

      if (codeLines.length > 0) {
        blocks.push({
          type: 'code',
          language: 'cpp',
          code: codeLines.join('\n').trimEnd()
        });
        continue;
      }
    }

    // 7. Normal Paragraph
    blocks.push({
      type: 'paragraph',
      text: trimmed
    });
    i++;
  }

  return blocks;
};

/**
 * Parses raw curriculum markdown text into structured sections.
 * Strips raw ## top-level titles so they don't leak as generic content.
 */
export const parseCurriculumSections = (rawText, isV1 = false) => {
  if (!rawText || typeof rawText !== 'string') return [];

  // Clean unescaped entities
  let text = rawText
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Remove wrapping HTML tags if quill passed <p> or <div> wrapper
  text = text.replace(/<p[^>]*>/gi, '').replace(/<\/p>/gi, '\n');
  text = text.replace(/<div[^>]*>/gi, '').replace(/<\/div>/gi, '\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');

  const lines = text.split('\n');
  const sections = [];
  let currentSection = null;

  const getHeaderType = (line) => {
    const clean = line.replace(/^[#\*\-\s\d\.:]+/, '').trim().toLowerCase();

    // Concept Notes / Core Theory
    if (/^concept notes|^core concept|^theory notes/i.test(clean)) {
      const noteTitle = line.replace(/^[#\*\-\s\d\.:]+/, '').replace(/^concept notes:?\s*/i, '').trim();
      return { type: 'concept_notes', title: noteTitle ? `Concept Notes: ${noteTitle}` : 'Concept Notes' };
    }

    // Problem
    if (/^problem statement|^what are we trying to solve|^problem/i.test(clean)) {
      return { type: 'problem', title: 'Problem Statement' };
    }
    // Context / What You'll Learn
    if (/^what you will learn|^what you'll learn|^learning objective|^the simple idea/i.test(clean)) {
      return { type: 'learn', title: "What You'll Learn" };
    }
    if (/^context & scenario|^context|^scenario|^real-world context/i.test(clean)) {
      return { type: 'context', title: 'Context & Scenario' };
    }
    if (/^why this (matters|module exists)|^why it matters|^why this matters in lld/i.test(clean)) {
      return { type: 'why', title: 'Why This Matters' };
    }
    // Starting Point
    if (/^starting point|^see it with a small example|^initial code/i.test(clean)) {
      return { type: 'starting_point', title: 'Starting Point' };
    }
    // Guided Experiment / Hands-on Experiment
    if (/^guided experiment|^hands-on experiment|^experiment|^try it/i.test(clean)) {
      return { type: 'experiment', title: 'Guided Experiment' };
    }
    // Your Task
    if (/^your task|^task instructions|^what you need to implement|^implementation/i.test(clean)) {
      return { type: 'task', title: 'Your Task' };
    }
    if (/^now change the requirement/i.test(clean)) {
      return { type: 'refactor', title: 'Requirement Change' };
    }
    // Key Concepts / Remember This (Vocab & Core Principles)
    if (/^remember this|^key concepts|^technical words|^core vocabulary|^terms to know/i.test(clean)) {
      return { type: 'key_concepts', title: 'Remember This' };
    }
    // Code / API
    if (/^api & interface|^core operations & api|^core operations|^class interface|^api/i.test(clean)) {
      return { type: 'api', title: 'API & Interface' };
    }
    if (/^input & interaction model|^input \/ interaction model|^interaction model/i.test(clean)) {
      return { type: 'interaction', title: 'Input & Interaction Model' };
    }
    // Output / Behavior
    if (/^examples?|^sample output|^expected terminal output/i.test(clean)) {
      return { type: 'output', title: 'Expected Output & Examples' };
    }
    if (/^expected behavior/i.test(clean)) {
      return { type: 'behavior', title: 'Expected Behavior' };
    }
    // Observations
    if (/^what to observe|^observable behavior|^what to notice|^what did the change teach us/i.test(clean)) {
      return { type: 'observe', title: 'What To Observe' };
    }
    // Acceptance Criteria
    if (/^acceptance criteria|^success criteria/i.test(clean)) {
      return { type: 'criteria', title: 'Acceptance Criteria' };
    }
    // Think About
    if (/^think about|^can you explain it|^questions to consider|^discussion/i.test(clean)) {
      return { type: 'think', title: 'Think About' };
    }
    // Constraints & Edge cases
    if (/^constraints & assumptions|^constraints|^assumptions/i.test(clean)) {
      return { type: 'constraints', title: 'Constraints & Assumptions' };
    }
    if (/^edge cases|^error cases|^failure modes|^what is going wrong/i.test(clean)) {
      return { type: 'edge_cases', title: 'Edge Cases & Errors' };
    }
    // Requirements
    if (/^functional requirements|^requirements/i.test(clean)) {
      return { type: 'requirements', title: 'Functional Requirements' };
    }
    // Versions
    if (/^what is new in this version|^new in this version|^what is new|^new requirements/i.test(clean)) {
      return { 
        type: 'version_new', 
        title: isV1 ? 'Requirements' : 'What Is New In This Version' 
      };
    }
    if (/^what changed from previous version|^what changed|^changes/i.test(clean)) {
      return { 
        type: 'version_changed', 
        title: isV1 ? 'Version Context' : 'What Changed From Previous Version' 
      };
    }
    if (/^version context/i.test(clean)) {
      return { type: 'version_changed', title: 'Version Context' };
    }
    if (/^expected refactor|^refactor behavior/i.test(clean)) {
      return { type: 'refactor', title: 'Expected Refactor / Extension' };
    }

    return null;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check if line is a top-level drill title header like "## Watching an Object..."
    // We omit it so it doesn't repeat the drawer header or render with raw ##
    if (i === 0 && /^##\s+/.test(trimmed)) {
      continue;
    }

    const isHeaderLine = /^#{2,3}\s+/.test(trimmed) || 
                         /^\s*\*\*[A-Z\s]{3,}\*\*\s*$/.test(trimmed) ||
                         /^\s*([0-9]+\.)?\s*(Concept Notes|Core Concept|Version Context|Goal|Problem|Context|Starting Point|Your Task|Guided Experiment|What To|Acceptance Criteria|Success Criteria|Think About|Functional Requirements|Core Operations|Constraints|Edge Cases|API|Expected Behavior|Examples|What Is New|New Requirements|What Changed|Expected Refactor|What Are We Trying|See It With|What Is Going Wrong|The Simple Idea|Technical Words|Remember This|Key Concepts|Why This Matters|Try It|Now Change|What Did The Change|Can You Explain)/i.test(trimmed);

    if (isHeaderLine) {
      const detected = getHeaderType(trimmed);
      if (detected) {
        if (currentSection && (currentSection.lines.length > 0 || currentSection.title)) {
          sections.push(currentSection);
        }
        currentSection = {
          type: detected.type,
          title: detected.title,
          lines: []
        };
        continue;
      }
    }

    if (!currentSection) {
      // If we haven't encountered a section header yet, skip empty lines or initialize general
      if (trimmed) {
        currentSection = {
          type: 'general',
          title: '',
          lines: [rawLine]
        };
      }
    } else {
      currentSection.lines.push(rawLine);
    }
  }

  if (currentSection && (currentSection.lines.length > 0 || currentSection.title)) {
    sections.push(currentSection);
  }

  return sections;
};

/**
 * Renders the parsed blocks inside a section
 */
const RenderSectionBlocks = ({ blocks, sectionType }) => {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="space-y-3">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'code':
            return (
              <CodeBlock 
                key={idx} 
                code={block.code} 
                language={block.language} 
              />
            );

          case 'subheading':
            return (
              <h4 key={idx} className="font-bold text-sm text-slate-850 dark:text-slate-100 mt-3 pt-2 first:mt-0 first:pt-0 border-t border-slate-200/50 dark:border-slate-800/60 first:border-0">
                {renderInlineMarkdown(block.text)}
              </h4>
            );

          case 'output_label':
            return (
              <div key={idx} className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-2">
                {block.text}
              </div>
            );

          case 'step':
            return (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-primary text-white font-mono text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    {block.number}
                  </span>
                  <div className="flex-1 text-sm font-semibold text-slate-850 dark:text-slate-100 leading-snug pt-0.5">
                    {renderInlineMarkdown(block.text)}
                  </div>
                </div>

                {/* Sub-bullets */}
                {block.bullets && block.bullets.length > 0 && (
                  <div className="pl-7 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    {block.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                        <span className="leading-relaxed">{renderInlineMarkdown(b)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Nested Code Blocks */}
                {block.code && block.code.length > 0 && (
                  <div className="pl-7">
                    {block.code.map((c, cIdx) => (
                      <CodeBlock 
                        key={cIdx} 
                        code={c.code} 
                        language={c.language} 
                      />
                    ))}
                  </div>
                )}
              </div>
            );

          case 'bullet_list':
            return (
              <div key={idx} className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {block.items.map((item, iIdx) => (
                  <div key={iIdx} className="flex items-start gap-2.5">
                    {sectionType === 'criteria' ? (
                      <LuCheckCircle2 className="text-emerald-500 shrink-0 mt-0.5 text-base" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0 mt-2" />
                    )}
                    <span className="flex-1 leading-relaxed">
                      {renderInlineMarkdown(item)}
                    </span>
                  </div>
                ))}
              </div>
            );

          case 'paragraph':
          default:
            return (
              <p key={idx} className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {renderInlineMarkdown(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
};

export default function CurriculumContentRenderer({ content, nodeType = 'drill', title = '', taskId = '' }) {
  if (!content) {
    return (
      <p className="italic text-slate-400 text-sm">No curriculum content provided.</p>
    );
  }

  const isV1 = /[-_]v1(\b|$)|version\s*1(\b|$)/i.test(title || '') || /[-_]v1(\b|$)/i.test(taskId || '');
  const sections = parseCurriculumSections(content, isV1);

  // If no structured sections were identified, parse blocks and render gracefully
  if (sections.length === 0 || (sections.length === 1 && sections[0].type === 'general')) {
    const rawLines = content.replace(/<[^>]*>?/gm, '').split('\n').filter(Boolean);
    const blocks = parseSectionBlocks(rawLines, 'general');
    return (
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <RenderSectionBlocks blocks={blocks} sectionType="general" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((sec, idx) => {
        const blocks = parseSectionBlocks(sec.lines, sec.type);

        switch (sec.type) {
          // Concept Notes / Core Theory
          case 'concept_notes':
            return (
              <div key={idx} className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-violet-50/60 to-purple-50/40 dark:from-indigo-950/40 dark:via-violet-950/20 dark:to-slate-900/40 border-2 border-indigo-200/90 dark:border-indigo-800/60 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-indigo-200/60 dark:border-indigo-800/60 pb-2.5">
                  <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-black text-xs uppercase tracking-wider">
                    <LuSparkles className="text-base text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>{sec.title || 'Concept Notes'}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200">
                    Core Theory
                  </span>
                </div>
                <RenderSectionBlocks blocks={blocks} sectionType={sec.type} />
              </div>
            );

          // Problem Statement
          case 'problem':
            return (
              <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/90 dark:border-emerald-900/50 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
                  <LuTarget className="text-base text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{sec.title}</span>
                </div>
                <RenderSectionBlocks blocks={blocks} sectionType={sec.type} />
              </div>
            );

          // What You'll Learn / Context
          case 'learn':
          case 'context':
          case 'why':
            return (
              <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200/90 dark:border-sky-900/50 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-sky-800 dark:text-sky-300 font-bold text-xs uppercase tracking-wider">
                  <LuCompass className="text-base text-sky-600 dark:text-sky-400 shrink-0" />
                  <span>{sec.title}</span>
                </div>
                <RenderSectionBlocks blocks={blocks} sectionType={sec.type} />
              </div>
            );

          // Starting Point
          case 'starting_point':
            return (
              <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider">
                  <LuCornerDownRight className="text-base text-indigo-500 shrink-0" />
                  <span>{sec.title}</span>
                </div>
                <RenderSectionBlocks blocks={blocks} sectionType={sec.type} />
              </div>
            );

          // Key Concepts / Remember This
          case 'key_concepts':
            return (
              <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <LuBookmark className="text-base text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{sec.title || 'Remember This'}</span>
                </div>
                <RenderSectionBlocks blocks={blocks} sectionType={sec.type} />
              </div>
            );

          // Guided Experiment
          case 'experiment':
            return (
              <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-primary/30 dark:border-primary/40 shadow-xs space-y-3">
                <div className="flex items-center gap-2 mb-2 text-primary font-black text-xs uppercase tracking-wider">
                  <LuFlaskConical className="text-base text-primary shrink-0" />
                  <span>{sec.title || 'Guided Experiment'}</span>
                </div>
                <RenderSectionBlocks blocks={blocks} sectionType={sec.type} />
              </div>
            );

          // Your Task
          case 'task':
            return (
              <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-primary/30 dark:border-primary/40 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-primary font-black text-xs uppercase tracking-wider">
                  <LuHammer className="text-base text-primary shrink-0" />
                  <span>{sec.title}</span>
                </div>
                <RenderSectionBlocks blocks={blocks} sectionType={sec.type} />
              </div>
            );

          // API & Interface
          case 'api':
            return (
              <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-[#0f141c] text-slate-200 border border-slate-800 shadow-md">
                <div className="flex items-center gap-2 mb-3 text-primary-light font-bold text-xs uppercase tracking-wider">
                  <LuCode2 className="text-base text-primary-light shrink-0" />
                  <span>{sec.title}</span>
                </div>
                <RenderSectionBlocks blocks={blocks} sectionType={sec.type} />
              </div>
            );

          // What To Observe
          case 'observe':
            return (
              <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200/90 dark:border-purple-900/50 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-purple-800 dark:text-purple-300 font-bold text-xs uppercase tracking-wider">
                  <LuEye className="text-base text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>{sec.title}</span>
                </div>
                <RenderSectionBlocks blocks={blocks} sectionType={sec.type} />
              </div>
            );

          // Acceptance Criteria
          case 'criteria':
            return (
              <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200/90 dark:border-teal-900/50 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-teal-800 dark:text-teal-300 font-bold text-xs uppercase tracking-wider">
                  <LuCheckCircle2 className="text-base text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>{sec.title}</span>
                </div>
                <RenderSectionBlocks blocks={blocks} sectionType={sec.type} />
              </div>
            );

          // Think About
          case 'think':
            return (
              <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/90 dark:border-amber-900/50 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <LuHelpCircle className="text-base text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{sec.title}</span>
                </div>
                <RenderSectionBlocks blocks={blocks} sectionType={sec.type} />
              </div>
            );

          // Expected Output & Examples
          case 'output':
          case 'behavior':
            return (
              <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider">
                  <LuTerminal className="text-base text-slate-700 dark:text-slate-300 shrink-0" />
                  <span>{sec.title}</span>
                </div>
                <RenderSectionBlocks blocks={blocks} sectionType={sec.type} />
              </div>
            );

          // Constraints & Assumptions / Edge Cases
          case 'constraints':
          case 'edge_cases':
          case 'interaction':
          case 'requirements':
            return (
              <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider">
                  {sec.type === 'edge_cases' ? (
                    <LuAlertTriangle className="text-base text-amber-500 shrink-0" />
                  ) : (
                    <LuListChecks className="text-base text-slate-600 dark:text-slate-400 shrink-0" />
                  )}
                  <span>{sec.title}</span>
                </div>
                <RenderSectionBlocks blocks={blocks} sectionType={sec.type} />
              </div>
            );

          // Version Updates
          case 'version_new':
            return (
              <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-blue-800 dark:text-blue-300 font-bold text-xs uppercase tracking-wider">
                  <LuSparkles className="text-base text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>{sec.title}</span>
                </div>
                <RenderSectionBlocks blocks={blocks} sectionType={sec.type} />
              </div>
            );

          case 'version_changed':
          case 'refactor':
            return (
              <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-indigo-800 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
                  <LuArrowRight className="text-base text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>{sec.title}</span>
                </div>
                <RenderSectionBlocks blocks={blocks} sectionType={sec.type} />
              </div>
            );

          default:
            return (
              <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                {sec.title && (
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
                    {sec.title}
                  </h4>
                )}
                <RenderSectionBlocks blocks={blocks} sectionType={sec.type} />
              </div>
            );
        }
      })}
    </div>
  );
}
