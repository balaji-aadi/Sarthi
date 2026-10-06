import { CoreJudgeExecutor } from '../../judge/executor/CoreJudgeExecutor.js';
import { ReferenceRunner } from '../../judge/referenceRunner.js';
import {
  WrongSolutionRegistry,
  MutationSemantic,
  CorrectnessStatus,
  ComplexityStatus
} from '../patterns/WrongSolutionRegistry.js';
import { normalizePythonReferenceCode } from './JudgeValidationGate.js';
import { ConstraintBoundsValidator } from './ConstraintBoundsValidator.js';

/**
 * AdversarialValidationGate (Phase 2.6 Hardened)
 * 
 * CORE FACTORY PRINCIPLE:
 * "The Question Factory must evaluate whether a student's algorithm is correct
 * under the problem specification, not whether it resembles the factory's
 * reference implementation."
 * 
 * Separates correctness evaluation from performance/complexity limits.
 * Employs differential equivalence validation to prevent rejecting valid alternative solutions.
 */
export class AdversarialValidationGate {
  /**
   * Synthesizes a targeted test input designed to expose specific algorithmic traps.
   * @param {Object} params
   * @param {string} params.targetTrap
   * @param {Object} params.problemSpec
   * @returns {Object|null}
   */
  static synthesizeTargetedTestInput({ targetTrap, problemSpec }) {
    const validator = new ConstraintBoundsValidator(
      problemSpec.constraints || [],
      problemSpec.functionDefinition
    );
    const params = problemSpec.functionDefinition?.parameters || [];
    const arrayParam = params.find(p => p.type.endsWith('[]'))?.name || 'nums';

    // Base input filling in valid default values for all parameters
    const baseInput = {};
    for (const p of params) {
      if (p.name === arrayParam) {
        baseInput[p.name] = [1, 2, 3];
      } else if (p.type === 'number') {
        baseInput[p.name] = 5;
      } else if (p.type === 'string') {
        baseInput[p.name] = "test";
      } else if (p.type === 'boolean') {
        baseInput[p.name] = true;
      }
    }

    if (targetTrap === 'reset_transition_asymmetric_trap') {
      baseInput[arrayParam] = [0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1];
      const scalarP = params.find(p => p.type === 'number')?.name;
      if (scalarP) baseInput[scalarP] = 1;
    } else if (targetTrap === 'peak_drop_recovery_trap') {
      baseInput[arrayParam] = [1, 20, 1, 1, 1];
      const scalarP = params.find(p => p.type === 'number')?.name;
      if (scalarP) baseInput[scalarP] = 3;
    } else if (targetTrap === 'deque_front_stale_trap') {
      baseInput[arrayParam] = [100, 1, 1, 1, 1];
      const scalarP = params.find(p => p.type === 'number')?.name;
      if (scalarP) baseInput[scalarP] = 4;
    } else if (targetTrap === 'surplus_subsidy_trap') {
      const ratingsParam = params.find(p => p.name === 'ratings')?.name || arrayParam;
      const minReqParam = params.find(p => p.name === 'minRequired')?.name || 'minRequired';
      const budgetParam = params.find(p => p.name === 'budget')?.name || 'budget';
      baseInput[ratingsParam] = [1000, 1, 1];
      baseInput[minReqParam] = 10;
      baseInput[budgetParam] = 5;
    } else if (targetTrap === 'minimal_single_element_array') {
      params.forEach(p => {
        if (p.type.endsWith('[]')) baseInput[p.name] = [5];
        else if (p.type === 'number') baseInput[p.name] = 5;
      });
    } else if (targetTrap === 'catastrophic_multi_shrink_spike') {
      baseInput[arrayParam] = [2, 10, 2];
      const scalarP = params.find(p => p.type === 'number')?.name;
      if (scalarP) baseInput[scalarP] = 3;
    } else {
      return null;
    }

    const check = validator.validateInput(baseInput);
    return check.isValid ? baseInput : null;
  }

  /**
   * Generates a batch of randomized differential test inputs to test equivalence.
   * @param {Object} params
   * @param {Object} params.problemSpec
   * @param {number} [params.count=100]
   * @returns {Array<Object>}
   */
  static generateDifferentialInputs({ problemSpec, count = 100 }) {
    const validator = new ConstraintBoundsValidator(
      problemSpec.constraints || [],
      problemSpec.functionDefinition
    );
    const model = validator.getNormalizedModel();
    const parameters = problemSpec.functionDefinition?.parameters || [];
    const arrayParam = parameters.find(p => p.type.endsWith('[]'));

    const inputs = [];
    const seedValues = [0, 1, 2, 5, 10, 20, 50, 100];

    for (let i = 0; i < count; i++) {
      const inputObj = {};
      const targetLen = Math.floor(Math.random() * 8) + 1; // small domain for high collision

      for (const p of parameters) {
        if (p.name === arrayParam?.name) {
          const arr = [];
          for (let j = 0; j < targetLen; j++) {
            const v = seedValues[Math.floor(Math.random() * seedValues.length)];
            arr.push(v);
          }
          inputObj[p.name] = arr;
        } else if (p.type === 'number') {
          const pModel = model[p.name]?.scalar;
          const maxVal = Math.min(pModel?.max ?? 50, 50);
          inputObj[p.name] = Math.floor(Math.random() * (maxVal + 1));
        } else if (p.type === 'string') {
          inputObj[p.name] = "test";
        } else if (p.type === 'boolean') {
          inputObj[p.name] = Math.random() > 0.5;
        }
      }

      const check = validator.validateInput(inputObj);
      if (check.isValid) {
        inputs.push(inputObj);
      }
    }

    return inputs;
  }

  /**
   * Runs differential equivalence validation between a mutation and the reference code.
   * @param {Object} params
   * @returns {Promise<{ isEquivalent: boolean, counterexample: Object|null, testsExecuted: number, mismatches: number, confidence: string }>}
   */
  static async validateEquivalence({
    referenceCode,
    mutationCode,
    problemSpec,
    targetedInputs = []
  }) {
    const funcDef = problemSpec.functionDefinition;
    const execProfile = (problemSpec.executionProfile && Object.keys(problemSpec.executionProfile).length > 0)
      ? problemSpec.executionProfile
      : {
          runtimeType: 'FUNCTION',
          outputSerializer: 'DefaultSerializer',
          comparator: 'ExactMatch'
        };
    const diffInputs = [
      ...targetedInputs,
      ...this.generateDifferentialInputs({ problemSpec, count: 150 })
    ];

    if (diffInputs.length === 0) {
      return {
        isEquivalent: false,
        counterexample: null,
        testsExecuted: 0,
        mismatches: 0,
        confidence: 'LOW'
      };
    }

    // 1. Execute reference solution
    const refRes = await ReferenceRunner.execute({
      language: 'python',
      referenceCode,
      functionDefinition: funcDef,
      testCases: diffInputs.map(input => ({ input })),
      executionProfile: execProfile,
      timeLimitMs: 6000
    });

    if (!refRes.success || !refRes.compiledTestCases) {
      return {
        isEquivalent: false,
        counterexample: null,
        testsExecuted: 0,
        mismatches: 0,
        confidence: 'LOW'
      };
    }

    // 2. Execute mutation solution
    const mutRes = await ReferenceRunner.execute({
      language: 'python',
      referenceCode: mutationCode,
      functionDefinition: funcDef,
      testCases: diffInputs.map(input => ({ input })),
      executionProfile: execProfile,
      timeLimitMs: 6000
    });

    if (!mutRes.success || !mutRes.compiledTestCases) {
      return {
        isEquivalent: false,
        counterexample: diffInputs[0],
        testsExecuted: 1,
        mismatches: 1,
        confidence: 'HIGH'
      };
    }

    let mismatches = 0;
    let firstCounterexample = null;

    for (let i = 0; i < refRes.compiledTestCases.length; i++) {
      const refOut = refRes.compiledTestCases[i]?.expectedOutput;
      const mutOut = mutRes.compiledTestCases[i]?.expectedOutput;

      if (JSON.stringify(refOut) !== JSON.stringify(mutOut)) {
        mismatches++;
        if (!firstCounterexample) {
          firstCounterexample = {
            input: diffInputs[i],
            expectedOutput: refOut,
            actualMutationOutput: mutOut
          };
        }
      }
    }

    const isEquivalent = mismatches === 0;
    return {
      isEquivalent,
      counterexample: firstCounterexample,
      testsExecuted: refRes.compiledTestCases.length,
      mismatches,
      confidence: isEquivalent ? 'HIGH' : 'DEFINITIVE'
    };
  }

  /**
   * Executes adversarial evaluation on all registered mutations.
   * Separates correctness from performance.
   * 
   * @param {Object} params
   * @param {Object} params.problemSpec
   * @param {Object} params.referenceSolution
   * @param {Array<Object>} params.testCases
   * @param {Object} [params.executionLimits]
   * @returns {Promise<Object>}
   */
  static async validate({
    problemSpec,
    referenceSolution,
    testCases = [],
    executionLimits = { timeLimitMs: 2000, memoryLimitMb: 256 }
  }) {
    const mutations = WrongSolutionRegistry.getWrongSolutions({
      pattern: problemSpec.factoryMetadata?.learningObjective?.pattern || "Sliding Window",
      problemSpec
    });

    if (mutations.length === 0) {
      return {
        passed: true,
        verdict: 'NO_MUTATIONS_CONFIGURED',
        totalTested: 0,
        killedCount: 0,
        survivedCount: 0,
        details: [],
        newTargetedTests: []
      };
    }

    const funcDef = problemSpec.functionDefinition;
    const execProfile = (problemSpec.executionProfile && Object.keys(problemSpec.executionProfile).length > 0)
      ? problemSpec.executionProfile
      : {
          runtimeType: 'FUNCTION',
          outputSerializer: 'DefaultSerializer',
          comparator: 'ExactMatch'
        };
    const funcName = funcDef?.name || funcDef?.functionName || 'solution';

    const results = [];
    const newTargetedTests = [];
    let currentTestCases = [...testCases];

    for (const mut of mutations) {
      const executableCode = normalizePythonReferenceCode(mut.code, funcName);

      // Pass 1: Run mutation against current test suite via CoreJudgeExecutor
      let judgeRes = await CoreJudgeExecutor.execute({
        language: 'python',
        code: executableCode,
        functionDefinition: funcDef,
        executionProfile: execProfile,
        testCases: currentTestCases,
        executionLimits,
        isSubmit: true
      });

      const isKilledBySuite = judgeRes.verdict !== 'ACCEPTED' &&
        judgeRes.verdict !== 'Accepted' &&
        (judgeRes.passedTestCases < judgeRes.totalTestCases);

      if (isKilledBySuite) {
        // Solution failed existing test suite
        const isTimeLimit = judgeRes.verdict === 'TIME_LIMIT_EXCEEDED' || judgeRes.verdict === 'Time Limit Exceeded';
        const isSuboptimal = mut.initialClassification === MutationSemantic.SUBOPTIMAL_BUT_CORRECT;

        results.push({
          id: mut.id,
          name: mut.name,
          description: mut.description,
          classification: isSuboptimal ? MutationSemantic.SUBOPTIMAL_BUT_CORRECT : MutationSemantic.INTENTIONALLY_WRONG,
          correctness: isSuboptimal && isTimeLimit ? CorrectnessStatus.CORRECT : CorrectnessStatus.WRONG,
          complexity: isTimeLimit ? ComplexityStatus.PERFORMANCE_FAILURE : ComplexityStatus.WITHIN_LIMIT,
          status: 'KILLED',
          killedByTestCaseIndex: judgeRes.failedTestCaseIndex,
          killedByExplanation: judgeRes.failedTestDetails?.explanation || `Test #${(judgeRes.failedTestCaseIndex || 0) + 1}`,
          targetedTestAdded: false
        });
        continue;
      }

      // PASS 2: Mutation passed the test suite!
      // Before declaring it a surviving bug, run differential equivalence testing
      console.log(`[AdversarialGate] Mutation "${mut.name}" passed the current suite. Running Equivalence Validation...`);

      const targetedCandidateInput = this.synthesizeTargetedTestInput({
        targetTrap: mut.targetTrap,
        problemSpec
      });

      const equivCheck = await this.validateEquivalence({
        referenceCode: referenceSolution.code,
        mutationCode: executableCode,
        problemSpec,
        targetedInputs: targetedCandidateInput ? [targetedCandidateInput] : []
      });

      if (equivCheck.isEquivalent) {
        // MATHEMATICAL EQUIVALENCE CONFIRMED:
        // Mutation is a valid alternative implementation or optimization!
        console.log(`[AdversarialGate] Mutation "${mut.name}" verified as EQUIVALENT_OPTIMIZATION across ${equivCheck.testsExecuted} tests!`);
        results.push({
          id: mut.id,
          name: mut.name,
          description: mut.description,
          classification: MutationSemantic.EQUIVALENT_OPTIMIZATION,
          correctness: CorrectnessStatus.CORRECT,
          complexity: ComplexityStatus.WITHIN_LIMIT,
          status: 'EQUIVALENT_VERIFIED',
          testsExecuted: equivCheck.testsExecuted,
          mismatchesFound: 0,
          confidence: equivCheck.confidence,
          targetedTestAdded: false
        });
        continue;
      }

      // Mismatch discovered! The mutation is confirmed INTENTIONALLY_WRONG.
      console.warn(`[AdversarialGate] Mismatch confirmed for "${mut.name}"! Injecting counterexample into problem test suite...`);

      const counterexample = equivCheck.counterexample;
      if (counterexample && counterexample.input) {
        const targetedTestCase = {
          input: counterexample.input,
          expectedOutput: counterexample.expectedOutput,
          explanation: `Adversarial test targeting [${mut.name}] (${mut.targetTrap})`,
          categoryId: 'pattern_traps',
          isPerformanceTest: false
        };

        // Test mutation on newly synthesized targeted test
        const retryRes = await CoreJudgeExecutor.execute({
          language: 'python',
          code: executableCode,
          functionDefinition: funcDef,
          executionProfile: execProfile,
          testCases: [targetedTestCase],
          executionLimits,
          isSubmit: true
        });

        const killedByTargeted = retryRes.verdict !== 'ACCEPTED' &&
          retryRes.verdict !== 'Accepted' &&
          (retryRes.passedTestCases === 0);

        if (killedByTargeted) {
          console.log(`[AdversarialGate] Targeted counterexample successfully KILLED "${mut.name}". Added to test suite.`);
          currentTestCases.push(targetedTestCase);
          newTargetedTests.push(targetedTestCase);
          results.push({
            id: mut.id,
            name: mut.name,
            description: mut.description,
            classification: MutationSemantic.INTENTIONALLY_WRONG,
            correctness: CorrectnessStatus.WRONG,
            complexity: ComplexityStatus.WITHIN_LIMIT,
            status: 'KILLED',
            killedByTestCaseIndex: currentTestCases.length - 1,
            killedByExplanation: targetedTestCase.explanation,
            targetedTestAdded: true
          });
          continue;
        }
      }

      // If we reach here, an INTENTIONALLY_WRONG mutation survived all tests
      results.push({
        id: mut.id,
        name: mut.name,
        description: mut.description,
        classification: MutationSemantic.INTENTIONALLY_WRONG,
        correctness: CorrectnessStatus.WRONG,
        complexity: ComplexityStatus.WITHIN_LIMIT,
        status: 'SURVIVED',
        reason: 'Surviving wrong solution produced mismatch against reference but passed all suite tests.',
        targetedTestAdded: false
      });
    }

    // Gate Rule:
    // Only INTENTIONALLY_WRONG mutations that have status === 'SURVIVED' trigger failure.
    // EQUIVALENT_OPTIMIZATION, CORRECT_ALTERNATIVE, and SUBOPTIMAL_BUT_CORRECT do not fail correctness.
    const failingWrongSolutions = results.filter(
      r => r.classification === MutationSemantic.INTENTIONALLY_WRONG && r.status === 'SURVIVED'
    );
    const passed = failingWrongSolutions.length === 0;

    return {
      passed,
      verdict: passed ? 'PASSED' : 'ADVERSARIAL_TEST_FAILED',
      totalTested: mutations.length,
      killedCount: results.filter(r => r.status === 'KILLED').length,
      equivalentCount: results.filter(r => r.status === 'EQUIVALENT_VERIFIED').length,
      survivedCount: failingWrongSolutions.length,
      details: results,
      newTargetedTests,
      updatedTestCases: currentTestCases,
      error: passed ? '' : `Adversarial test failure: Surviving wrong solution(s) [${failingWrongSolutions.map(s => s.name).join(', ')}]`
    };
  }
}
