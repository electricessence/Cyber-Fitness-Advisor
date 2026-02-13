/**
 * Gate Condition Types & Evaluators
 * 
 * Pure types and functions for evaluating gate conditions.
 * All question visibility is data-driven through the question bank.
 * 
 * @version 3.0 — ConditionEngine class removed; pure functions only
 */

/**
 * Comparator operations for gate conditions
 */
export type Comparator = 
  | 'equals' | 'not_equals'
  | 'in' | 'not_in'
  | 'contains' | 'not_contains'
  | 'exists' | 'not_exists'
  | 'greater_than' | 'less_than'
  | 'greater_equal' | 'less_equal'
  | 'truthy' | 'falsy';

/**
 * Gate condition for question visibility
 */
export interface GateCondition {
  /** Question ID to check */
  questionId: string;
  /** Comparator to use */
  when: Comparator;
  /** Value(s) to compare against */
  value?: any;
  /** Array of values for 'in'/'not_in' operations */
  values?: any[];
}

/**
 * Gate definition with logic operators
 */
export interface Gate {
  /** All conditions must be true (AND logic) */
  all?: GateCondition[];
  /** At least one condition must be true (OR logic) */
  any?: GateCondition[];
  /** None of the conditions must be true (NOT logic) */
  none?: GateCondition[];
}

/**
 * Context object containing current answers for evaluation
 */
export interface EvaluationContext {
  /** Current user answers */
  answers: Record<string, any>;
}

/**
 * Result of gate evaluation
 */
export interface EvaluationResult {
  /** Whether the gate passes */
  passes: boolean;
  /** Detailed results for debugging */
  details?: {
    all?: boolean[];
    any?: boolean[];
    none?: boolean[];
  };
}

/**
 * Evaluates a single gate condition against a context
 */
function evaluateCondition(condition: GateCondition, context: EvaluationContext): boolean {
  const { questionId, when, value, values } = condition;
  const answerValue = context.answers[questionId];

  switch (when) {
    case 'exists':
      return answerValue !== undefined && answerValue !== null;
    
    case 'not_exists':
      return answerValue === undefined || answerValue === null;
    
    case 'equals':
      return answerValue === value;
    
    case 'not_equals':
      return answerValue !== value;
    
    case 'in':
      return values ? values.includes(answerValue) : false;
    
    case 'not_in':
      return values ? !values.includes(answerValue) : true;
    
    case 'contains':
      if (typeof answerValue === 'string' && typeof value === 'string') {
        return answerValue.includes(value);
      }
      if (Array.isArray(answerValue) && value !== undefined) {
        return answerValue.includes(value);
      }
      return false;
    
    case 'not_contains':
      if (typeof answerValue === 'string' && typeof value === 'string') {
        return !answerValue.includes(value);
      }
      if (Array.isArray(answerValue) && value !== undefined) {
        return !answerValue.includes(value);
      }
      return true;
    
    case 'truthy':
      return Boolean(answerValue);
    
    case 'falsy':
      return !Boolean(answerValue);
    
    case 'greater_than':
      return typeof answerValue === 'number' && typeof value === 'number' 
        ? answerValue > value 
        : false;
    
    case 'less_than':
      return typeof answerValue === 'number' && typeof value === 'number' 
        ? answerValue < value 
        : false;
    
    case 'greater_equal':
      return typeof answerValue === 'number' && typeof value === 'number' 
        ? answerValue >= value 
        : false;
    
    case 'less_equal':
      return typeof answerValue === 'number' && typeof value === 'number' 
        ? answerValue <= value 
        : false;
    
    default:
      console.warn(`Unknown comparator: ${when}`);
      return false;
  }
}

/**
 * Evaluates a complete gate (all/any/none logic)
 */
export function evaluateGate(gate: Gate, context: EvaluationContext): EvaluationResult {
  const details: EvaluationResult['details'] = {};
  
  // Evaluate 'all' conditions (AND logic)
  let allPasses = true;
  if (gate.all) {
    details.all = gate.all.map(condition => evaluateCondition(condition, context));
    allPasses = details.all.every(result => result);
  }
  
  // Evaluate 'any' conditions (OR logic)  
  // Default to true if no 'any' conditions are specified
  let anyPasses = true;
  if (gate.any) {
    details.any = gate.any.map(condition => evaluateCondition(condition, context));
    anyPasses = details.any.some(result => result);
  }
  
  // Evaluate 'none' conditions (NOT logic)
  let nonePasses = true;
  if (gate.none) {
    details.none = gate.none.map(condition => evaluateCondition(condition, context));
    nonePasses = !details.none.some(result => result);
  }
  
  const passes = allPasses && anyPasses && nonePasses;
  
  return { passes, details };
}
