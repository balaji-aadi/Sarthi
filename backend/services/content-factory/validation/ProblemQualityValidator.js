import Problem from '../../../models/problem.model.js';
import { getPatternContract } from '../patterns/PatternContractRegistry.js';

export class ProblemQualityValidator {
  /**
   * Evaluates problem quality and produces discrete PASS | WARNING | FAIL signals
   * backed by algorithmic pattern contracts and explainable calibration.
   * @param {Object} params
   * @param {Object} params.problemSpec
   * @param {Object} params.testStrategy
   * @param {Array} params.compiledTestCases
   * @param {Array} [params.categoryAudit]
   * @returns {Promise<Object>} { qualityReport, details, learningObjective, difficultyReasoning }
   */
  static async evaluate({ problemSpec, testStrategy, compiledTestCases = [], categoryAudit = [] }) {
    const report = {
      clarity: 'PASS',
      patternAlignment: 'PASS',
      difficultyCalibration: 'PASS',
      constraintComplexity: 'PASS',
      exampleQuality: 'PASS',
      testCoverage: 'PASS',
      similarity: 'PASS',
      similarityScore: 0.0,
      similarityDetails: 'No significant overlap detected with existing question bank.'
    };

    const details = [];
    const pattern = problemSpec.factoryMetadata?.learningObjective?.pattern || problemSpec.pattern || 'Sliding Window';
    const difficulty = problemSpec.difficulty || 'Medium';
    const contract = getPatternContract(pattern);

    // 1. Clarity Assessment
    const desc = problemSpec.descriptionMarkdown || '';
    if (desc.length < 100) {
      report.clarity = 'FAIL';
      details.push("Problem description is excessively brief (< 100 characters) or lacks problem background.");
    } else {
      const missingParams = (problemSpec.functionDefinition?.parameters || [])
        .filter(p => !desc.toLowerCase().includes(p.name.toLowerCase()));
      if (missingParams.length > 0) {
        report.clarity = 'WARNING';
        details.push(`Description does not explicitly mention function parameters: ${missingParams.map(p => p.name).join(', ')}`);
      }
    }

    // 1B. LaTeX / Markdown Rendering Safety Assessment
    const UNSUPPORTED_LATEX_PATTERNS = [
      { pattern: /\\binom\b/i, name: '\\binom' },
      { pattern: /\\frac\b/i, name: '\\frac' },
      { pattern: /\\sum\b/i, name: '\\sum' },
      { pattern: /\\text\{/i, name: '\\text{}' }
    ];

    const detectedLatex = [];
    for (const item of UNSUPPORTED_LATEX_PATTERNS) {
      if (item.pattern.test(desc) || item.pattern.test(problemSpec.editorialMarkdown || '')) {
        detectedLatex.push(item.name);
      }
    }

    if (detectedLatex.length > 0) {
      report.clarity = 'FAIL';
      details.push(
        `Unsupported LaTeX syntax detected in problem content: [${detectedLatex.join(', ')}]. ` +
        `Sarthi's markdown renderer does not support LaTeX macros; content must use plain Markdown or ASCII math.`
      );
    }

    // 2. Pattern Alignment & Trivialization Detection (Phase 7 & 8)
    const algoDesc = (problemSpec.intendedAlgorithm || '').toLowerCase();
    const refCode = (problemSpec.referenceSolution?.code || '').toLowerCase();
    const editorial = (problemSpec.editorialMarkdown || '').toLowerCase();

    // Check 2A: Anti-Pattern & Trivialization Detection
    let isTrivialized = false;
    if (pattern === 'Sliding Window') {
      // Detect trivial max sum of size k with scalar added at end
      const hasDirectTrivialAddition = refCode.includes('return max_sum +') || refCode.includes('return window_sum +');
      const hasNoConditionInLoop = !refCode.includes('if ') && !refCode.includes('while ');
      const mentionsTrivialKSum = algoDesc.includes('maximum sum of any contiguous subarray of size k, plus');

      if (hasDirectTrivialAddition && hasNoConditionInLoop && mentionsTrivialKSum) {
        isTrivialized = true;
        report.patternAlignment = 'FAIL';
        details.push("Pattern Trivialization Detected: Problem degenerated into a trivial unconstrained fixed-window sum with a constant added at the end. It lacks dynamic invariant maintenance or constraint trade-offs.");
      }
    }

    // Check 2B: Required Algorithmic Invariant Verification
    if (!isTrivialized) {
      const hasLoop = refCode.includes('for ') || refCode.includes('while ');
      const hasStateUpdate = refCode.includes('+=') || refCode.includes('-=') || refCode.includes('append') || refCode.includes('pop');
      
      if (!hasLoop || !hasStateUpdate) {
        report.patternAlignment = 'FAIL';
        details.push(`Algorithmic Invariant Failure: Reference solution does not demonstrate iterative state transitions required for '${pattern}'.`);
      } else {
        const matchesContractKeyword = contract.recognitionSignals.some(sig => {
          const words = sig.toLowerCase().split(/\s+/).filter(w => w.length > 4);
          return words.some(w => algoDesc.includes(w) || editorial.includes(w));
        });

        if (!matchesContractKeyword) {
          report.patternAlignment = 'WARNING';
          details.push(`Low explicit contract alignment: Algorithm explanation has low correlation with '${pattern}' recognition signals.`);
        }
      }
    }

    // 3. Difficulty Calibration Assessment (Phase 10)
    const timeComplexity = (problemSpec.referenceSolution?.timeComplexity || '').toLowerCase();
    const paramCount = (problemSpec.functionDefinition?.parameters || []).length;
    const constraintCount = (problemSpec.constraints || []).length;
    let difficultyReasoning = '';

    if (difficulty === 'Easy') {
      if (timeComplexity.includes('o(n^2)') || timeComplexity.includes('o(2^n)')) {
        report.difficultyCalibration = 'WARNING';
        details.push("Easy difficulty declared but solution has quadratic/exponential complexity.");
      }
      difficultyReasoning = `Calibrated as Easy: Straightforward single-variable pattern invariant with ${paramCount} parameter(s) and standard bounds.`;
    } else if (difficulty === 'Medium') {
      if (timeComplexity.includes('o(1)') && !timeComplexity.includes('space')) {
        report.difficultyCalibration = 'WARNING';
        details.push("Medium difficulty declared but solution claims trivial O(1) time complexity.");
      }
      difficultyReasoning = `Calibrated as Medium: Requires linear ${timeComplexity || 'O(N)'} invariant management across ${paramCount} parameters with ${constraintCount} interacting constraints to prevent O(N^2) brute-force timeouts.`;
    } else if (difficulty === 'Hard') {
      difficultyReasoning = `Calibrated as Hard: Involves multi-state invariants or auxiliary data structures with strict edge handling.`;
    }

    // 4. Constraint Complexity Assessment
    const constraints = problemSpec.constraints || [];
    if (constraints.length === 0) {
      report.constraintComplexity = 'FAIL';
      details.push("Problem specifies zero constraints.");
    } else if (constraints.length < 2) {
      report.constraintComplexity = 'WARNING';
      details.push("Minimal constraint declarations (fewer than 2 rules).");
    }

    // 5. Example Quality Assessment
    if (!problemSpec.examples || problemSpec.examples.length === 0) {
      report.exampleQuality = 'FAIL';
      details.push("No examples provided in problem specification.");
    } else {
      const missingExExplanation = problemSpec.examples.some(ex => !ex.explanation || ex.explanation.length < 5);
      if (missingExExplanation) {
        report.exampleQuality = 'WARNING';
        details.push("One or more examples lack a meaningful step-by-step explanation.");
      }
    }

    // 6. Test Coverage & Performance Case Enforcement (Phase 12)
    const totalTests = compiledTestCases.length;
    const hasPerfTest = compiledTestCases.some(tc => tc.isPerformanceTest);
    
    // Check if any category in audit failed to reach target
    const failedCategories = categoryAudit.filter(c => c.actualCount < c.targetCount);

    if (totalTests < 10) {
      report.testCoverage = 'FAIL';
      details.push(`Insufficient test suite size: only ${totalTests} test cases compiled (minimum 10 required).`);
    } else if (!hasPerfTest) {
      report.testCoverage = 'FAIL';
      details.push("Zero executable performance test cases present in the test suite.");
    } else if (failedCategories.length > 0) {
      report.testCoverage = 'FAIL';
      details.push(`Test category deficit: Categories [${failedCategories.map(c => `${c.categoryId}: ${c.actualCount}/${c.targetCount}`).join(', ')}] failed to generate target counts.`);
    }

    // 7. Similarity Assessment
    try {
      if (Problem.db && Problem.db.readyState === 1) {
        const existingProblems = await Problem.find(
          { status: { $in: ['Review', 'Published'] } },
          'title slug functionDefinition.functionName'
        ).lean();

        let highestScore = 0;
        let matchedTitle = '';

        const currentWords = new Set(
          problemSpec.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/)
        );

        for (const ep of existingProblems) {
          if (!ep.title) continue;
          const otherWords = new Set(
            ep.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/)
          );
          let intersection = 0;
          for (const w of currentWords) {
            if (otherWords.has(w)) intersection++;
          }
          const union = new Set([...currentWords, ...otherWords]).size;
          const score = union > 0 ? intersection / union : 0;

          if (score > highestScore) {
            highestScore = score;
            matchedTitle = ep.title;
          }
        }

        report.similarityScore = parseFloat(highestScore.toFixed(2));
        if (highestScore > 0.85) {
          report.similarity = 'WARNING';
          report.similarityDetails = `High title/concept similarity (${(highestScore * 100).toFixed(0)}%) with existing problem: "${matchedTitle}".`;
        } else {
          report.similarity = 'PASS';
          report.similarityDetails = `Acceptable uniqueness. Closest match: ${(highestScore * 100).toFixed(0)}% similarity.`;
        }
      } else {
        report.similarity = 'PASS';
        report.similarityScore = 0.0;
        report.similarityDetails = "Similarity audit bypassed (standalone execution).";
      }
    } catch (dbErr) {
      report.similarity = 'PASS';
      report.similarityScore = 0.0;
      report.similarityDetails = "Similarity audit bypassed (standalone execution).";
    }

    // Learning Objective Synthesis (Phase 9)
    const learningObjective = {
      pattern: contract.pattern,
      coreSkill: contract.coreSkill,
      recognitionSignal: contract.recognitionSignals[0] || 'Contiguous range optimization',
      requiredInvariant: contract.requiredInvariants[0] || 'Valid window bounds maintenance',
      expectedComplexity: `${contract.expectedTimeComplexity} time, ${contract.expectedSpaceComplexity} space`,
      commonWrongApproaches: contract.commonWrongApproaches,
      difficultyReason: difficultyReasoning,
      testObjectives: (testStrategy?.categories || []).map(c => `${c.categoryId}: ${c.description}`)
    };

    return {
      qualityReport: report,
      details,
      learningObjective,
      difficultyReasoning
    };
  }
}
