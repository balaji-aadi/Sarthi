/**
 * Procedural Boundary Test Generator (Phase 2.6 Hardened)
 * 
 * Synthesizes boundary test cases at extreme constraint limits (e.g. N = 100,000,
 * minimum/maximum element values, zero/maximum budgets) deterministically
 * in memory without relying on LLM token generation.
 * 
 * Architecture Principle:
 * LLM -> Test Intent / Specification
 * Deterministic Test Generator -> Actual Payload
 */

export class ProceduralBoundaryTestGenerator {
  /**
   * Generates an array of uniform values.
   * @param {Object} params
   * @param {number} params.length
   * @param {number|string} params.value
   * @returns {Array}
   */
  static generateUniformArray({ length, value = 0 }) {
    const arr = new Array(length);
    for (let i = 0; i < length; i++) arr[i] = value;
    return arr;
  }

  /**
   * Generates an array of alternating values.
   * @param {Object} params
   * @param {number} params.length
   * @param {Array<number|string>} params.values
   * @returns {Array}
   */
  static generateAlternatingArray({ length, values = [0, 1] }) {
    const arr = new Array(length);
    const m = values.length;
    for (let i = 0; i < length; i++) arr[i] = values[i % m];
    return arr;
  }

  /**
   * Generates a monotonic or plateau array.
   * @param {Object} params
   * @param {number} params.length
   * @param {'non_decreasing'|'non_increasing'|'plateau'} [params.direction='non_decreasing']
   * @param {number} [params.minVal=0]
   * @param {number} [params.maxVal=1000]
   * @returns {Array<number>}
   */
  static generateMonotonicArray({ length, direction = 'non_decreasing', minVal = 0, maxVal = 1000 }) {
    const arr = new Array(length);
    if (direction === 'plateau') {
      const mid = Math.floor(length / 2);
      for (let i = 0; i < mid; i++) arr[i] = minVal;
      for (let i = mid; i < length; i++) arr[i] = maxVal;
      return arr;
    }

    const range = Math.max(1, maxVal - minVal);
    for (let i = 0; i < length; i++) {
      const factor = i / Math.max(1, length - 1);
      if (direction === 'non_decreasing') {
        arr[i] = minVal + Math.floor(factor * range);
      } else {
        arr[i] = maxVal - Math.floor(factor * range);
      }
    }
    return arr;
  }

  /**
   * Synthesizes constraint-compliant boundary test cases deterministically.
   * @param {Object} params
   * @param {Object} params.functionDefinition
   * @param {Object} params.normalizedModel
   * @param {Object} params.validator
   * @param {number} [params.count=3]
   * @returns {Array<{ categoryId: string, input: Object, isPerformanceTest: boolean, description: string }>}
   */
  static generateBoundaryInputs({ functionDefinition, normalizedModel, validator, count = 3 }) {
    const inputs = [];
    const parameters = functionDefinition?.parameters || [];
    const arrayParam = parameters.find(p => p.type.endsWith('[]'));

    // 1. Determine array bounds
    let maxN = 100000;
    let minN = 1;
    if (arrayParam && normalizedModel[arrayParam.name]?.length?.defined) {
      maxN = normalizedModel[arrayParam.name].length.max || 100000;
      minN = normalizedModel[arrayParam.name].length.min || 1;
    }
    const targetScale = Math.max(minN, maxN);

    let elemMin = 0;
    let elemMax = 1000;
    if (arrayParam && normalizedModel[arrayParam.name]?.element?.defined) {
      elemMin = normalizedModel[arrayParam.name].element.min ?? 0;
      elemMax = normalizedModel[arrayParam.name].element.max ?? 1000;
    }

    // Boundary Case 1: Upper Bound Array Scale with Uniform Minimum Value & Zero Budget
    const input1 = {};
    for (const p of parameters) {
      if (p.name === arrayParam?.name) {
        input1[p.name] = this.generateUniformArray({ length: targetScale, value: elemMin });
      } else if (p.type === 'number') {
        const pModel = normalizedModel[p.name]?.scalar;
        input1[p.name] = pModel?.min ?? 0;
      } else if (p.type === 'string') {
        input1[p.name] = "boundary_uniform";
      } else if (p.type === 'boolean') {
        input1[p.name] = false;
      }
    }

    const check1 = validator.validateInput(input1);
    if (check1.isValid) {
      inputs.push({
        categoryId: 'boundary_cases',
        input: input1,
        isPerformanceTest: false,
        description: `Boundary Case #1: Upper limit scale (N=${targetScale}) uniform minimum element (${elemMin}) with lower scalar limit`
      });
    }

    // Boundary Case 2: Upper Bound Array Scale with Alternating Pattern & Moderate Budget
    const input2 = {};
    for (const p of parameters) {
      if (p.name === arrayParam?.name) {
        const altSecond = elemMax > elemMin ? (elemMin + 1 <= elemMax ? elemMin + 1 : elemMax) : elemMin;
        input2[p.name] = this.generateAlternatingArray({ length: targetScale, values: [elemMin, altSecond] });
      } else if (p.type === 'number') {
        const pModel = normalizedModel[p.name]?.scalar;
        const maxVal = pModel?.max ?? 10;
        input2[p.name] = Math.min(maxVal, Math.floor(targetScale / 100) || 5);
      } else if (p.type === 'string') {
        input2[p.name] = "boundary_alternating";
      } else if (p.type === 'boolean') {
        input2[p.name] = true;
      }
    }

    const check2 = validator.validateInput(input2);
    if (check2.isValid) {
      inputs.push({
        categoryId: 'boundary_cases',
        input: input2,
        isPerformanceTest: false,
        description: `Boundary Case #2: Upper limit scale (N=${targetScale}) alternating adjacent boundaries with active budget`
      });
    }

    // Boundary Case 3: Upper Bound Array Scale with Non-Decreasing Plateau & Maximum Scalar
    const input3 = {};
    for (const p of parameters) {
      if (p.name === arrayParam?.name) {
        input3[p.name] = this.generateMonotonicArray({
          length: targetScale,
          direction: 'plateau',
          minVal: elemMin,
          maxVal: elemMax
        });
      } else if (p.type === 'number') {
        const pModel = normalizedModel[p.name]?.scalar;
        input3[p.name] = pModel?.max ?? targetScale;
      } else if (p.type === 'string') {
        input3[p.name] = "boundary_plateau";
      } else if (p.type === 'boolean') {
        input3[p.name] = true;
      }
    }

    const check3 = validator.validateInput(input3);
    if (check3.isValid) {
      inputs.push({
        categoryId: 'boundary_cases',
        input: input3,
        isPerformanceTest: false,
        description: `Boundary Case #3: Upper limit scale (N=${targetScale}) plateau pattern with maximum scalar limit`
      });
    }

    return inputs.slice(0, count);
  }
}
