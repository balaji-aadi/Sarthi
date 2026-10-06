import { validateSingleInput } from '../../problem-service/problem.validator.js';

/**
 * Parses numeric strings including scientific notation / exponents (e.g., "1e5", "10^5", "2 * 10^4", "-10^9")
 */
export function parseConstraintBound(str) {
  if (!str) return null;
  const s = str.trim().toLowerCase().replace(/\s+/g, '');

  // 1. Direct scientific notation e.g., "1e5", "2e4"
  if (/^[+-]?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(s)) {
    return Number(s);
  }

  // 2. Power of 10 expressions e.g., "10^5", "10**5", "2*10^4"
  const powMatch = s.match(/^([+-]?\d*(?:\.\d+)?)\*?10\^([+-]?\d+)$/);
  if (powMatch) {
    const coeff = powMatch[1] === '' || powMatch[1] === '+' ? 1 : (powMatch[1] === '-' ? -1 : Number(powMatch[1]));
    const exp = Number(powMatch[2]);
    return coeff * Math.pow(10, exp);
  }

  // 3. Simple integer or float
  const parsed = parseFloat(s);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Deterministic Constraint Bounds Validator
 * Parses, normalizes, and enforces constraint rules derived from functionDefinition.
 */
export class ConstraintBoundsValidator {
  constructor(constraints = [], functionDefinition = {}) {
    this.rawConstraints = Array.isArray(constraints) ? constraints : [];
    this.functionDefinition = functionDefinition;
    this.parameters = functionDefinition.parameters || [];
    this.unmappedConstraints = [];
    
    // Internal normalized constraint representation
    this.normalizedModel = this._buildNormalizedModel();
    this.rules = this._parseConstraintRules(this.rawConstraints);
  }

  /**
   * Builds normalized parameter slots based on functionDefinition.
   */
  _buildNormalizedModel() {
    const model = {};
    for (const p of this.parameters) {
      model[p.name] = {
        name: p.name,
        type: p.type,
        isArray: p.type.endsWith('[]'),
        length: { min: null, max: null, defined: false },
        element: { min: null, max: null, defined: false },
        scalar: { min: null, max: null, defined: false },
        relational: []
      };
    }
    return model;
  }

  /**
   * Resolves common mathematical symbol aliases (e.g. 'n' -> primary array's length)
   */
  _resolveParamOrAlias(token) {
    if (!token) return null;
    const clean = token.trim();
    
    // 1. Exact match on parameter name
    if (this.parameters.some(p => p.name === clean)) {
      return { paramName: clean, isProperty: false };
    }

    // 2. Exact match on parameter.length or parameter.size
    const propMatch = clean.match(/^([a-zA-Z0-9_]+)\.(?:length|size)$/i);
    if (propMatch && this.parameters.some(p => p.name === propMatch[1])) {
      return { paramName: propMatch[1], isProperty: true, property: 'length' };
    }

    // 3. Standard 'n' or 'm' alias for array parameters
    const arrayParams = this.parameters.filter(p => p.type.endsWith('[]'));
    if ((clean === 'n' || clean === 'N') && arrayParams.length >= 1) {
      // Default to first primary array
      return { paramName: arrayParams[0].name, isProperty: true, property: 'length', isAlias: true };
    }
    if ((clean === 'm' || clean === 'M') && arrayParams.length >= 2) {
      return { paramName: arrayParams[1].name, isProperty: true, property: 'length', isAlias: true };
    }

    return null;
  }

  /**
   * Parses natural/standard DSA constraint strings into normalized executable rules.
   */
  _parseConstraintRules(constraints) {
    const rules = [];
    this.unmappedConstraints = [];

    for (const c of constraints) {
      if (!c || typeof c !== 'string') continue;
      const clean = c.trim();

      // Case A: Array Length: A <= arr.length <= B or A <= n <= B
      // e.g. "1 <= stations.length <= 10^5" or "1 <= n <= 10^5"
      const lenMatch = clean.match(/([^\s<=]+)\s*<=\s*([a-zA-Z0-9_]+(?:\.(?:length|size))?)\s*<=\s*([^\s<=]+)/i);
      if (lenMatch) {
        const resolved = this._resolveParamOrAlias(lenMatch[2]);
        const minVal = parseConstraintBound(lenMatch[1]);
        const maxVal = parseConstraintBound(lenMatch[3]);

        if (resolved && (resolved.isProperty || resolved.isAlias) && minVal !== null && maxVal !== null) {
          rules.push({
            type: 'ARRAY_LENGTH',
            param: resolved.paramName,
            min: minVal,
            max: maxVal,
            raw: clean
          });
          if (this.normalizedModel[resolved.paramName]) {
            this.normalizedModel[resolved.paramName].length = { min: minVal, max: maxVal, defined: true, raw: clean };
          }
          continue;
        }
      }

      // Case B: Element Range: A <= arr[i] <= B
      // e.g. "0 <= stations[i] <= 10^4" or "-10^9 <= nums[i] <= 10^9"
      const elemRangeMatch = clean.match(/([^\s<=]+)\s*<=\s*([a-zA-Z0-9_]+)\[[a-zA-Z0-9_]*\]\s*<=\s*([^\s<=]+)/i);
      if (elemRangeMatch) {
        const param = elemRangeMatch[2];
        const minVal = parseConstraintBound(elemRangeMatch[1]);
        const maxVal = parseConstraintBound(elemRangeMatch[3]);
        if (minVal !== null && maxVal !== null && this.parameters.some(p => p.name === param)) {
          rules.push({
            type: 'ELEMENT_RANGE',
            param,
            min: minVal,
            max: maxVal,
            raw: clean
          });
          if (this.normalizedModel[param]) {
            this.normalizedModel[param].element = { min: minVal, max: maxVal, defined: true, raw: clean };
          }
          continue;
        }
      }

      // Case C: Relational Bound: A <= k <= arr.length or A <= k <= n
      // e.g. "1 <= k <= stations.length" or "1 <= k <= n"
      const relMatch = clean.match(/([^\s<=]+)\s*<=\s*([a-zA-Z0-9_]+)\s*<=\s*([a-zA-Z0-9_]+(?:\.(?:length|size))?)/i);
      if (relMatch) {
        const scalarParam = relMatch[2];
        const resolvedTarget = this._resolveParamOrAlias(relMatch[3]);
        const minVal = parseConstraintBound(relMatch[1]);

        if (this.parameters.some(p => p.name === scalarParam) && resolvedTarget && minVal !== null) {
          rules.push({
            type: 'RELATIONAL_ARRAY_LENGTH',
            scalarParam,
            targetArr: resolvedTarget.paramName,
            min: minVal,
            raw: clean
          });
          if (this.normalizedModel[scalarParam]) {
            this.normalizedModel[scalarParam].relational.push({
              min: minVal,
              targetArr: resolvedTarget.paramName,
              raw: clean
            });
          }
          continue;
        }
      }

      // Case D: Scalar Range: A <= param <= B
      // e.g. "1 <= T <= 10^4" or "0 <= target <= 1000"
      const scalarMatch = clean.match(/([^\s<=]+)\s*<=\s*([a-zA-Z0-9_]+)\s*<=\s*([^\s<=]+)/i);
      if (scalarMatch) {
        const param = scalarMatch[2];
        const minVal = parseConstraintBound(scalarMatch[1]);
        const maxVal = parseConstraintBound(scalarMatch[3]);

        if (this.parameters.some(p => p.name === param) && minVal !== null && maxVal !== null) {
          rules.push({
            type: 'SCALAR_RANGE',
            param,
            min: minVal,
            max: maxVal,
            raw: clean
          });
          if (this.normalizedModel[param]) {
            this.normalizedModel[param].scalar = { min: minVal, max: maxVal, defined: true, raw: clean };
          }
          continue;
        }
      }

      // If we reach here, the constraint rule is non-standard or unmapped
      this.unmappedConstraints.push(clean);
      rules.push({
        type: 'CUSTOM_AUDIT',
        raw: clean
      });
    }

    return rules;
  }

  /**
   * Validates a single input object against all parameters and normalized rules.
   * @param {Object} input - Key-value pair of parameter names to values
   * @returns {{ isValid: boolean, errors: string[], warnings: string[] }}
   */
  validateInput(input) {
    const errors = [];
    const warnings = [];

    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return {
        isValid: false,
        errors: ["Test input must be a structured JSON object mapping parameter names to values."],
        warnings: []
      };
    }

    // 1. Parameter Completeness & Basic Type Validation
    for (const p of this.parameters) {
      if (!(p.name in input)) {
        errors.push(`Missing required parameter '${p.name}'.`);
        continue;
      }

      const val = input[p.name];
      try {
        validateSingleInput(val, p.type, p.name);
      } catch (err) {
        errors.push(`Parameter '${p.name}' invalid type: ${err.message}`);
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors, warnings };
    }

    // 2. Deterministic Rule Verification
    for (const rule of this.rules) {
      switch (rule.type) {
        case 'ARRAY_LENGTH': {
          const val = input[rule.param];
          if (Array.isArray(val)) {
            if (val.length < rule.min || val.length > rule.max) {
              errors.push(`Array '${rule.param}' length ${val.length} violates constraint [${rule.min}, ${rule.max}]: '${rule.raw}'`);
            }
          }
          break;
        }

        case 'ELEMENT_RANGE': {
          const val = input[rule.param];
          if (Array.isArray(val)) {
            for (let i = 0; i < val.length; i++) {
              const el = val[i];
              if (typeof el === 'number' && (el < rule.min || el > rule.max)) {
                errors.push(`Element ${rule.param}[${i}] = ${el} violates range [${rule.min}, ${rule.max}]: '${rule.raw}'`);
                break;
              }
            }
          }
          break;
        }

        case 'RELATIONAL_ARRAY_LENGTH': {
          const scalar = input[rule.scalarParam];
          const arr = input[rule.targetArr];
          if (typeof scalar === 'number' && Array.isArray(arr)) {
            if (scalar < rule.min || scalar > arr.length) {
              errors.push(`Parameter '${rule.scalarParam}' (${scalar}) violates relational constraint ${rule.min} <= ${rule.scalarParam} <= ${rule.targetArr}.length (${arr.length}): '${rule.raw}'`);
            }
          }
          break;
        }

        case 'SCALAR_RANGE': {
          const scalar = input[rule.param];
          if (typeof scalar === 'number') {
            if (scalar < rule.min || scalar > rule.max) {
              errors.push(`Parameter '${rule.param}' value ${scalar} violates bounds [${rule.min}, ${rule.max}]: '${rule.raw}'`);
            }
          }
          break;
        }

        case 'CUSTOM_AUDIT': {
          warnings.push(`Constraint '${rule.raw}' could not be parsed deterministically; manual review required.`);
          break;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Returns normalized parameter model.
   */
  getNormalizedModel() {
    return this.normalizedModel;
  }
}
