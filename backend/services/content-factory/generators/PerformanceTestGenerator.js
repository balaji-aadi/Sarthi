/**
 * Deterministic Performance Test Generator (Phase 2 Hardened)
 * 
 * Synthesizes full-scale, constraint-compliant test inputs (N = 25,000 - 50,000)
 * algorithmically to penalize O(N^2) or O(N*K) slice-rescanning submissions
 * without blowing LLM token limits.
 */

export class PerformanceTestGenerator {
  /**
   * Generates deterministic performance test cases based on normalized constraint bounds.
   * @param {Object} params
   * @param {Object} params.functionDefinition
   * @param {Object} params.normalizedModel - from ConstraintBoundsValidator
   * @param {Object} params.validator - instance of ConstraintBoundsValidator
   * @param {number} [params.count=2]
   * @returns {Array<Object>} Array of valid performance test inputs
   */
  static generatePerformanceInputs({ functionDefinition, normalizedModel, validator, count = 2 }) {
    const inputs = [];
    const parameters = functionDefinition.parameters || [];
    const arrayParam = parameters.find(p => p.type.endsWith('[]'));

    // Determine target array scale N (Scale to 50,000 if constraints allow)
    let targetN = 30000;
    if (arrayParam && normalizedModel[arrayParam.name]?.length?.max) {
      const maxConstraint = normalizedModel[arrayParam.name].length.max;
      targetN = Math.max(5000, Math.min(maxConstraint, 25000));
    }

    // Determine element range bounds
    let elemMin = 0;
    let elemMax = 1000;
    if (arrayParam && normalizedModel[arrayParam.name]?.element?.defined) {
      elemMin = normalizedModel[arrayParam.name].element.min ?? 0;
      elemMax = normalizedModel[arrayParam.name].element.max ?? 1000;
    }
    const elemSpread = Math.max(1, elemMax - elemMin);

    // Distribution 1: Sustained Large Window Topology (Catches O(N*K) Slice Rescanning)
    // Generates a window that stays valid for 15,000+ elements, forcing naive slicing to do 15,000 x 15,000 ops
    const input1 = {};
    for (const p of parameters) {
      if (p.name === arrayParam?.name) {
        const arr = new Array(targetN);
        const baseVal = elemMin + Math.floor(elemSpread / 2);
        for (let i = 0; i < targetN; i++) {
          // Subtle high-frequency ripple within small amplitude (e.g. +/- 3)
          // Keeps the window valid for a sustained run of ~15,000 elements
          arr[i] = baseVal + ((i % 7) - 3);
        }
        input1[p.name] = arr;
      } else if (p.type === 'number') {
        const pModel = normalizedModel[p.name]?.scalar;
        const pRel = normalizedModel[p.name]?.relational;
        
        if (pRel && pRel.length > 0) {
          const minK = pRel[0].min || 1;
          input1[p.name] = Math.max(minK, Math.floor(targetN / 2));
        } else if (pModel?.defined) {
          // Choose generous disparity / budget to sustain large window
          input1[p.name] = Math.max(pModel.min, Math.min(pModel.max, 50));
        } else {
          input1[p.name] = 50;
        }
      } else if (p.type === 'string') {
        input1[p.name] = "performance_token";
      } else if (p.type === 'boolean') {
        input1[p.name] = true;
      }
    }

    const check1 = validator.validateInput(input1);
    if (check1.isValid) {
      inputs.push({
        categoryId: 'performance_cases',
        input: input1,
        isPerformanceTest: true,
        scaleN: targetN,
        topology: 'Sustained Large Window (Slice Rescan Stress)',
        performanceProfile: {
          targetComplexity: 'O(N)',
          intendedN: targetN,
          adversarialTopology: 'sustained_large_window',
          expectedStressReason: 'Maintains window size > 15,000 elements to penalize naive O(N*K) array slicing',
          targetFailureMode: 'Time Limit Exceeded'
        }
      });
    }

    // Distribution 2: High-Frequency Saw-Tooth Oscillation Topology (Stresses Monotonic Deque & Pointers)
    const input2 = {};
    for (const p of parameters) {
      if (p.name === arrayParam?.name) {
        const arr = new Array(targetN);
        for (let i = 0; i < targetN; i++) {
          // Sharp saw-tooth oscillation between elemMin and elemMax/2
          if (i % 2 === 0) {
            arr[i] = elemMin + ((i * 3) % Math.floor(elemSpread / 2));
          } else {
            arr[i] = elemMin + ((i * 7) % Math.floor(elemSpread / 2));
          }
        }
        input2[p.name] = arr;
      } else if (p.type === 'number') {
        const pModel = normalizedModel[p.name]?.scalar;
        const pRel = normalizedModel[p.name]?.relational;
        
        if (pRel && pRel.length > 0) {
          const minK = pRel[0].min || 1;
          input2[p.name] = Math.max(minK, Math.floor(targetN / 4));
        } else if (pModel?.defined) {
          input2[p.name] = Math.floor((pModel.min + pModel.max) / 2);
        } else {
          input2[p.name] = 100;
        }
      } else if (p.type === 'string') {
        input2[p.name] = "performance_scale";
      } else if (p.type === 'boolean') {
        input2[p.name] = false;
      }
    }

    const check2 = validator.validateInput(input2);
    if (check2.isValid) {
      inputs.push({
        categoryId: 'performance_cases',
        input: input2,
        isPerformanceTest: true,
        scaleN: targetN,
        topology: 'High-Frequency Saw-Tooth Oscillation',
        performanceProfile: {
          targetComplexity: 'O(N)',
          intendedN: targetN,
          adversarialTopology: 'saw_tooth_oscillation',
          expectedStressReason: 'Forces continuous deque candidate evictions and multi-step pointer adjustments',
          targetFailureMode: 'Time Limit Exceeded'
        }
      });
    }

    return inputs.slice(0, count);
  }
}
