import { getFactoryAIProvider } from '../adapters/GroqAdapter.js';
import {
  buildProblemSpecPrompt,
  buildTestStrategyPrompt,
  buildBatchTestInputsPrompt,
  buildCategoryRegenerationPrompt,
  SUPPORTED_PARAM_TYPES,
  SUPPORTED_RETURN_TYPES
} from '../prompts/factoryPrompts.js';
import {
  validateExecutionProfileCompatibility,
  DATA_TYPE_PARSER_MAP,
  RETURN_TYPE_SERIALIZER_MAP
} from '../../problem-service/problem.validator.js';
import { ConstraintBoundsValidator } from '../validation/ConstraintBoundsValidator.js';
import { PerformanceTestGenerator } from './PerformanceTestGenerator.js';
import { ProceduralBoundaryTestGenerator } from './ProceduralBoundaryTestGenerator.js';
import { normalizePythonReferenceCode } from '../validation/JudgeValidationGate.js';
import { generateAllStarterTemplates } from '../../../../shared/templateGenerator.js';

/**
 * Sanitizes unsupported raw LaTeX mathematical macros into plain Markdown and readable ASCII math.
 */
export function sanitizeLatexMath(text) {
  if (!text || typeof text !== 'string') return text;
  let sanitized = text;

  // 1. \binom{n}{2} -> n * (n - 1) / 2
  sanitized = sanitized.replace(/\\binom\{([^}]+)\}\{2\}/g, '$1 * ($1 - 1) / 2');
  sanitized = sanitized.replace(/\\binom\{([^}]+)\}\{([^}]+)\}/g, 'C($1, $2)');

  // 2. \frac{a}{b} -> (a) / (b)
  sanitized = sanitized.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1) / ($2)');

  // 3. \times -> *
  sanitized = sanitized.replace(/\\times/g, '*');

  // 4. \sum_{p} or \sum_p -> sum over p of
  sanitized = sanitized.replace(/\\sum_\{([^}]+)\}/g, 'sum over $1 of ');
  sanitized = sanitized.replace(/\\sum_([a-zA-Z0-9])/g, 'sum over $1 of ');
  sanitized = sanitized.replace(/\\sum\b/g, 'sum ');

  // 5. \text{...} -> ...
  sanitized = sanitized.replace(/\\text\{([^}]+)\}/g, '$1');

  // 6. Common LaTeX inequalities
  sanitized = sanitized.replace(/\\le(q)?\b/g, '<=');
  sanitized = sanitized.replace(/\\ge(q)?\b/g, '>=');
  sanitized = sanitized.replace(/\\ne(q)?\b/g, '!=');

  // 7. Simplify math blocks $$ ... $$ that were purely TeX
  sanitized = sanitized.replace(/\$\$([\s\S]*?)\$\$/g, (match, inner) => {
    const clean = inner.trim();
    return `\n\`${clean}\`\n`;
  });

  return sanitized;
}

export class QuestionGenerationEngine {
  constructor(provider = null) {
    this.provider = provider || getFactoryAIProvider();
  }

  /**
   * Pass 1: Generate & Structurally Validate Problem Specification
   */
  async generateProblemSpec({ pattern = 'Sliding Window', difficulty = 'Medium', directives = '' }) {
    const prompt = buildProblemSpecPrompt({ pattern, difficulty, directives });
    const spec = await this.provider.generateJSON({
      prompt,
      systemPrompt: "You are an elite DSA Curriculum Architect. Return strict, valid JSON conforming to the requested schema.",
      temperature: 0.2,
      maxTokens: 4000
    });

    console.log("[QuestionGenerationEngine] Generated Spec Keys:", Object.keys(spec || {}));
    if (!spec.title && spec.problem) {
      Object.assign(spec, spec.problem);
    }
    if (!spec.title || typeof spec.title !== 'string') {
      console.error("[QuestionGenerationEngine] Full spec received:", JSON.stringify(spec, null, 2));
      throw new Error("Generation Error: AI failed to generate problem title.");
    }
    if (!spec.descriptionMarkdown || typeof spec.descriptionMarkdown !== 'string') {
      throw new Error("Generation Error: AI failed to generate problem description.");
    }
    if (!spec.functionDefinition || !spec.functionDefinition.functionName) {
      throw new Error("Generation Error: AI failed to provide a valid functionDefinition.");
    }
    if (!Array.isArray(spec.functionDefinition.parameters) || spec.functionDefinition.parameters.length === 0) {
      throw new Error("Generation Error: AI generated problem with zero parameters.");
    }

    // 2. Validate Data Types against Sarthi Type Engine
    for (const p of spec.functionDefinition.parameters) {
      const cleanType = (p.type || '').toLowerCase();
      if (!DATA_TYPE_PARSER_MAP[cleanType]) {
        throw new Error(`Generation Error: Unsupported parameter type '${p.type}' for parameter '${p.name}'.`);
      }
    }
    const cleanReturn = (spec.functionDefinition.returnType || '').toLowerCase();
    if (!RETURN_TYPE_SERIALIZER_MAP[cleanReturn]) {
      throw new Error(`Generation Error: Unsupported return type '${spec.functionDefinition.returnType}'.`);
    }

    // 3. Execution Profile Compatibility Validation
    const execProfile = spec.executionProfile || {
      runtimeType: 'FUNCTION',
      outputSerializer: cleanReturn.includes('[]') ? 'ArraySerializer' : 'PrimitiveSerializer',
      comparator: 'ExactMatch'
    };
    validateExecutionProfileCompatibility(spec.functionDefinition, execProfile);
    spec.executionProfile = execProfile;

    // 4. Validate Reference Solution
    if (!spec.referenceSolution || !spec.referenceSolution.code) {
      throw new Error("Generation Error: AI did not provide a referenceSolution.");
    }
    spec.referenceSolution.language = 'python';

    // 5. Ensure Python signature matches functionDefinition
    const funcName = spec.functionDefinition.functionName;
    if (!spec.referenceSolution.code.includes(`def ${funcName}`)) {
      const defMatch = spec.referenceSolution.code.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
      if (defMatch && defMatch[1] !== funcName) {
        spec.referenceSolution.code = spec.referenceSolution.code.replace(
          new RegExp(`def\\s+${defMatch[1]}\\s*\\(`, 'g'),
          `def ${funcName}(`
        );
      }
    }

    spec.referenceSolution.code = normalizePythonReferenceCode(spec.referenceSolution.code, funcName);

    // 6. Sanitize unsupported LaTeX in problem statement and editorial
    spec.descriptionMarkdown = sanitizeLatexMath(spec.descriptionMarkdown);
    if (spec.editorialMarkdown) {
      spec.editorialMarkdown = sanitizeLatexMath(spec.editorialMarkdown);
    }

    // 7. Generate All Starter Templates (Deterministic Single Source of Truth)
    try {
      const templates = generateAllStarterTemplates(spec.functionDefinition, spec.executionProfile);
      spec.starterCode = Object.entries(templates).map(([lang, code]) => ({
        language: lang,
        code: code,
        defaultTemplate: code
      }));
    } catch (tmplErr) {
      throw new Error(`StarterCodeGenerationError: Failed to synthesize starter templates: ${tmplErr.message}`);
    }

    return spec;
  }

  /**
   * Pass 2: Derive Problem-Specific Test Strategy
   */
  async generateTestStrategy({ problemSpec }) {
    const prompt = buildTestStrategyPrompt({ problemSpec });
    const strategy = await this.provider.generateJSON({
      prompt,
      systemPrompt: "You are an elite QA Test Strategist. Return strict JSON outlining comprehensive DSA test categories.",
      temperature: 0.1,
      maxTokens: 2500
    });

    const standardCategories = [
      { categoryId: "edge_cases", description: "Minimal inputs, boundaries, zero or single elements", targetCount: 3 },
      { categoryId: "boundary_cases", description: "Inputs on constraint boundaries and extreme limits", targetCount: 3 },
      { categoryId: "pattern_traps", description: "Problem-specific traps to catch wrong invariants and off-by-one errors", targetCount: 4 },
      { categoryId: "typical_cases", description: "Standard representative cases with varied distribution", targetCount: 3 },
      { categoryId: "performance_cases", description: "Full-scale large inputs (N = 10,000 - 30,000) to penalize O(n^2) algorithms", targetCount: 2 }
    ];

    if (!strategy.categories || !Array.isArray(strategy.categories) || strategy.categories.length === 0) {
      strategy.categories = standardCategories;
    } else {
      // Ensure all 5 required categories exist with non-zero targets
      for (const std of standardCategories) {
        const existing = strategy.categories.find(c => c.categoryId === std.categoryId);
        if (!existing) {
          strategy.categories.push(std);
        } else if (!existing.targetCount || existing.targetCount <= 0) {
          existing.targetCount = std.targetCount;
        }
      }
    }

    return strategy;
  }

  /**
   * Pass 3: Generate Raw Test Inputs with Deterministic Category-Specific Regeneration
   */
  async generateValidatedTestInputs({ problemSpec, testStrategy, maxRegenerationAttempts = 3 }) {
    const validator = new ConstraintBoundsValidator(problemSpec.constraints || [], problemSpec.functionDefinition);
    const validInputsByCategory = {};
    const categoryAudit = [];

    (testStrategy.categories || []).forEach(c => {
      validInputsByCategory[c.categoryId] = [];
    });

    // Step 3A: Deterministic Performance & Boundary Test Generation (Phase 2.6 Hardened)
    // Synthesize real full-scale performance inputs algorithmically
    const perfCategory = (testStrategy.categories || []).find(c => c.categoryId === 'performance_cases');
    const perfTargetCount = perfCategory?.targetCount || 2;
    try {
      const perfInputs = PerformanceTestGenerator.generatePerformanceInputs({
        functionDefinition: problemSpec.functionDefinition,
        normalizedModel: validator.getNormalizedModel(),
        validator,
        count: perfTargetCount
      });
      validInputsByCategory['performance_cases'] = perfInputs;
    } catch (perfErr) {
      console.warn("[QuestionGenerationEngine] Deterministic performance generator warning:", perfErr.message);
    }

    // Synthesize extreme constraint boundary inputs procedurally (N=100k, min/max limits)
    const boundaryCategory = (testStrategy.categories || []).find(c => c.categoryId === 'boundary_cases');
    const boundaryTargetCount = boundaryCategory?.targetCount || 3;
    try {
      const boundaryInputs = ProceduralBoundaryTestGenerator.generateBoundaryInputs({
        functionDefinition: problemSpec.functionDefinition,
        normalizedModel: validator.getNormalizedModel(),
        validator,
        count: boundaryTargetCount
      });
      if (boundaryInputs.length > 0) {
        validInputsByCategory['boundary_cases'] = boundaryInputs;
      }
    } catch (bErr) {
      console.warn("[QuestionGenerationEngine] Procedural boundary generator warning:", bErr.message);
    }

    // Step 3B: Batch Generation for Semantic Categories
    try {
      const batchPrompt = buildBatchTestInputsPrompt({ problemSpec, testStrategy });
      const batchRes = await this.provider.generateJSON({
        prompt: batchPrompt,
        systemPrompt: "You are an elite DSA test data generator. Generate comprehensive valid inputs across all categories.",
        temperature: 0.2,
        maxTokens: 4000
      });

      // Parse either explicit category keys ({ edge_cases: [], ... }) or general testInputs array
      const knownCats = ['edge_cases', 'boundary_cases', 'pattern_traps', 'typical_cases'];
      for (const catKey of knownCats) {
        if (Array.isArray(batchRes[catKey])) {
          for (const item of batchRes[catKey]) {
            const inputObj = item.input || item;
            const check = validator.validateInput(inputObj);
            if (check.isValid) {
              if (!validInputsByCategory[catKey]) validInputsByCategory[catKey] = [];
              validInputsByCategory[catKey].push({
                categoryId: catKey,
                input: inputObj,
                isPerformanceTest: false
              });
            }
          }
        }
      }

      if (Array.isArray(batchRes.testInputs)) {
        for (const item of batchRes.testInputs) {
          const catId = item.categoryId || 'typical_cases';
          if (catId === 'performance_cases') continue;
          const inputObj = item.input || item;
          const check = validator.validateInput(inputObj);
          if (check.isValid) {
            if (!validInputsByCategory[catId]) validInputsByCategory[catId] = [];
            validInputsByCategory[catId].push({
              categoryId: catId,
              input: inputObj,
              isPerformanceTest: false
            });
          }
        }
      }
    } catch (batchErr) {
      console.warn("[QuestionGenerationEngine] Batch input generation fallback:", batchErr.message);
    }

    // Step 3C: Category-Specific Regeneration for any Deficit Categories
    for (const cat of testStrategy.categories) {
      const categoryId = cat.categoryId;
      const targetCount = cat.targetCount || 3;
      let currentValid = validInputsByCategory[categoryId] || [];
      let attempts = 0;
      let lastFailureReasons = [];

      // If performance_cases was generated deterministically, or boundary_cases is satisfied, skip LLM regeneration
      if (categoryId === 'performance_cases' || (categoryId === 'boundary_cases' && currentValid.length >= targetCount)) {
        validInputsByCategory[categoryId] = currentValid.slice(0, targetCount);
        categoryAudit.push({
          categoryId,
          description: cat.description,
          targetCount,
          actualCount: validInputsByCategory[categoryId].length,
          attemptsNeeded: 1,
          passed: validInputsByCategory[categoryId].length >= targetCount
        });
        continue;
      }

      while (currentValid.length < targetCount && attempts < maxRegenerationAttempts) {
        attempts++;
        const needed = targetCount - currentValid.length;
        
        // Wait 1200ms to stay safely under Groq's RPM limits
        await new Promise(res => setTimeout(res, 1200));

        const regenPrompt = buildCategoryRegenerationPrompt({
          problemSpec,
          categoryId,
          categoryDescription: cat.description,
          count: needed,
          failureReasons: lastFailureReasons.length > 0 ? lastFailureReasons : ["Insufficient test count in category"]
        });

        try {
          const genRes = await this.provider.generateJSON({
            prompt: regenPrompt,
            systemPrompt: "You are a DSA test data generator. Correct all invalid inputs.",
            temperature: 0.2,
            maxTokens: 3000
          });

          const rawList = Array.isArray(genRes.inputs) ? genRes.inputs : (Array.isArray(genRes) ? genRes : []);
          lastFailureReasons = [];

          for (const rawInput of rawList) {
            const check = validator.validateInput(rawInput);
            if (check.isValid) {
              currentValid.push({
                categoryId,
                input: rawInput,
                isPerformanceTest: false
              });
            } else {
              lastFailureReasons.push(...check.errors);
            }
          }
        } catch (callErr) {
          lastFailureReasons.push(`AI Generation error: ${callErr.message}`);
        }
      }

      validInputsByCategory[categoryId] = currentValid;
      categoryAudit.push({
        categoryId,
        description: cat.description,
        targetCount,
        actualCount: currentValid.length,
        attemptsNeeded: attempts + 1,
        passed: currentValid.length >= targetCount
      });
    }

    const allValidInputs = Object.values(validInputsByCategory).flat();
    const allCategoriesPassed = categoryAudit.every(c => c.actualCount >= c.targetCount);

    return {
      testInputs: allValidInputs,
      categoryAudit,
      allCategoriesPassed
    };
  }
}
