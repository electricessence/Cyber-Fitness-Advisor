/**
 * Conditional Question Engine
 * 
 * Evaluates gate conditions to determine question visibility and unlocks.
 * Supports dependency graphs and cycle detection.
 * 
 * @version 2.0
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
 * Gate definition with optional logic operators and actions
 */
export interface Gate {
  /** All conditions must be true (AND logic) */
  all?: GateCondition[];
  /** At least one condition must be true (OR logic) */
  any?: GateCondition[];
  /** None of the conditions must be true (NOT logic) */
  none?: GateCondition[];
  
  /** Actions to take when this gate passes */
  /** Questions to show */
  show?: string[];
  /** Questions to hide (overrides show) */
  hide?: string[];
  /** Suites to unlock */
  unlockSuites?: string[];
  /** Question patches to apply */
  patch?: Record<string, Partial<any>>;
}

/**
 * Question patch to modify questions after gate evaluation
 * @deprecated Use Gate.patch instead
 */
export interface QuestionPatch {
  /** Target question ID */
  questionId: string;
  /** Fields to modify */
  patch: {
    text?: string;
    options?: any[];
    weight?: number;
    [key: string]: any;
  };
}

/**
 * Suite definition for unlockable question banks
 */
export interface Suite {
  /** Unique suite identifier */
  id: string;
  /** Display name */
  title: string;
  /** Description */
  description: string;
  /** Gate conditions to unlock this suite - any gate passing unlocks the suite */
  gates: Gate[];
  /** Questions in this suite */
  questionIds: string[];
  /** Priority for suite ordering */
  priority?: number;
}

/**
 * Context object containing current answers for evaluation
 */
export interface EvaluationContext {
  /** Current user answers */
  answers: Record<string, any>;
  /** User device profile */
  deviceProfile?: any;
  /** Additional context data */
  metadata?: Record<string, any>;
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
 * Dependency graph edge
 */
interface DependencyEdge {
  from: string;
  to: string;
}

/**
 * Evaluates a single gate condition
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
 * Evaluates a complete gate
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

/**
 * Extracts dependencies from a gate
 */
function extractGateDependencies(gate: Gate): string[] {
  const deps: string[] = [];
  
  if (gate.all) {
    deps.push(...gate.all.map(c => c.questionId));
  }
  if (gate.any) {
    deps.push(...gate.any.map(c => c.questionId));
  }
  if (gate.none) {
    deps.push(...gate.none.map(c => c.questionId));
  }
  
  return [...new Set(deps)]; // Remove duplicates
}

/**
 * Builds dependency graph from questions and suites
 */
function buildDependencyGraph(
  questions: Array<{ id: string; gates?: Gate[] }>,
  suites: Suite[] = []
): DependencyEdge[] {
  const edges: DependencyEdge[] = [];
  
  // Question dependencies
  for (const question of questions) {
    if (question.gates) {
      for (const gate of question.gates) {
        const deps = extractGateDependencies(gate);
        for (const dep of deps) {
          edges.push({ from: dep, to: question.id });
        }
      }
    }
  }
  
  // Suite dependencies
  for (const suite of suites) {
    for (const gate of suite.gates) {
      const deps = extractGateDependencies(gate);
      for (const dep of deps) {
        edges.push({ from: dep, to: `suite:${suite.id}` });
      }
    }
  }
  
  return edges;
}

/**
 * Detects cycles in dependency graph using DFS
 */
export function detectCycles(
  questions: Array<{ id: string; gates?: Gate[] }>,
  suites: Suite[] = []
): string[] {
  const edges = buildDependencyGraph(questions, suites);
  const graph: Record<string, string[]> = {};
  
  // Build adjacency list
  for (const edge of edges) {
    if (!graph[edge.from]) graph[edge.from] = [];
    graph[edge.from].push(edge.to);
  }
  
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycles: string[] = [];
  
  function dfs(node: string, path: string[] = []): void {
    if (recursionStack.has(node)) {
      const cycleStart = path.indexOf(node);
      const cycle = path.slice(cycleStart).concat(node);
      cycles.push(`Cycle detected: ${cycle.join(' → ')}`);
      return;
    }
    
    if (visited.has(node)) return;
    
    visited.add(node);
    recursionStack.add(node);
    
    const neighbors = graph[node] || [];
    for (const neighbor of neighbors) {
      dfs(neighbor, [...path, node]);
    }
    
    recursionStack.delete(node);
  }
  
  // Check all nodes
  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }
  
  return cycles;
}

/**
 * Main condition engine class
 */
export class ConditionEngine {
  private questions: Array<{ id: string; gates?: Gate[] }>;
  private suites: Suite[];
  private patches: QuestionPatch[];
  private dependencyGraph: DependencyEdge[];
  
  constructor(
    questions: Array<{ id: string; gates?: Gate[] }> = [],
    suites: Suite[] = [],
    patches: QuestionPatch[] = []
  ) {
    this.questions = questions;
    this.suites = suites;
    this.patches = patches;
    
    // Build and validate dependency graph
    this.dependencyGraph = buildDependencyGraph(questions, suites);
    
    // Validate no cycles on construction
    const cycles = detectCycles(questions, suites);
    if (cycles.length > 0) {
      throw new Error(`Dependency cycles detected:\n${cycles.join('\n')}`);
    }
  }
  
  /**
   * Evaluates all conditions and returns visible questions, unlocked suites, and patches
   */
  evaluate(context: EvaluationContext): {
    visibleQuestionIds: string[];
    unlockedSuites: Suite[];
    questionPatches: Record<string, QuestionPatch['patch']>;
  } {
    // Lightweight cycle check (cached graph)
    if (this.dependencyGraph.length > 0) {
      // Quick validation that no new cycles were introduced
      const cycles = detectCycles(this.questions, this.suites);
      if (cycles.length > 0) {
        throw new Error(`Active dependency cycles detected:\n${cycles.join('\n')}`);
      }
    }

    const visibleQuestionIds = new Set<string>();
    const hiddenQuestionIds = new Set<string>();
    const unlockedSuites: Suite[] = [];
    const questionPatches: Record<string, QuestionPatch['patch']> = {};
    
    // Get all suite question IDs for special handling
    const suiteQuestionIds = new Set<string>();
    for (const suite of this.suites) {
      for (const questionId of suite.questionIds) {
        suiteQuestionIds.add(questionId);
      }
    }
    
    // First pass: determine base visibility 
    // - Non-suite questions with no gates are visible by default
    // - Suite questions are hidden by default
    for (const question of this.questions) {
      if (suiteQuestionIds.has(question.id)) {
        // Suite questions are hidden by default
        hiddenQuestionIds.add(question.id);
      } else if (!question.gates || question.gates.length === 0) {
        // Regular questions with no gates are visible
        visibleQuestionIds.add(question.id);
      }
    }
    
    // Second pass: evaluate gates for show/hide/patch actions
    const allGates: Array<{ gate: Gate; source: string }> = [];
    
    // Collect gates from questions
    for (const question of this.questions) {
      if (question.gates) {
        for (const gate of question.gates) {
          allGates.push({ gate, source: question.id });
        }
      }
    }
    
    // Collect gates from suites
    for (const suite of this.suites) {
      for (const gate of suite.gates) {
        allGates.push({ gate, source: `suite:${suite.id}` });
      }
    }
    
    // Process gates and their actions
    for (const { gate } of allGates) {
      const result = evaluateGate(gate, context);
      
      if (result.passes) {
        // Handle show actions
        if (gate.show) {
          for (const questionId of gate.show) {
            visibleQuestionIds.add(questionId);
          }
        }
        
        // Handle hide actions (override show)
        if (gate.hide) {
          for (const questionId of gate.hide) {
            hiddenQuestionIds.add(questionId);
            visibleQuestionIds.delete(questionId);
          }
        }
        
        // Handle suite unlocks
        if (gate.unlockSuites) {
          for (const suiteId of gate.unlockSuites) {
            const suite = this.suites.find(s => s.id === suiteId);
            if (suite && !unlockedSuites.some(s => s.id === suiteId)) {
              unlockedSuites.push(suite);
            }
          }
        }
        
        // Handle patches (deterministic by questionId)
        if (gate.patch) {
          for (const [questionId, patch] of Object.entries(gate.patch)) {
            if (!questionPatches[questionId]) {
              questionPatches[questionId] = {};
            }
            Object.assign(questionPatches[questionId], patch);
          }
        }
      }
    }
    
    // Third pass: evaluate questions with gates for visibility
    for (const question of this.questions) {
      if (question.gates && question.gates.length > 0) {
        // Any gate passing makes the question visible (unless explicitly hidden)
        let anyGatePasses = false;
        for (const gate of question.gates) {
          const result = evaluateGate(gate, context);
          if (result.passes) {
            anyGatePasses = true;
            break;
          }
        }
        
        if (anyGatePasses && !hiddenQuestionIds.has(question.id)) {
          visibleQuestionIds.add(question.id);
        }
      }
    }
    
    // Fourth pass: evaluate suite unlocks
    for (const suite of this.suites) {
      // Any gate passing unlocks the suite
      let anyGatePasses = false;
      for (const gate of suite.gates) {
        const result = evaluateGate(gate, context);
        if (result.passes) {
          anyGatePasses = true;
          break;
        }
      }
      
      if (anyGatePasses && !unlockedSuites.some(s => s.id === suite.id)) {
        unlockedSuites.push(suite);
        
        // Make suite questions visible when suite is unlocked
        for (const questionId of suite.questionIds) {
          hiddenQuestionIds.delete(questionId);
          visibleQuestionIds.add(questionId);
        }
      }
    }
    
    // Apply legacy patches (deprecated path)
    const sortedPatches = this.patches.slice().sort((a, b) => 
      a.questionId.localeCompare(b.questionId)
    );
    
    for (const patch of sortedPatches) {
      if (visibleQuestionIds.has(patch.questionId)) {
        if (!questionPatches[patch.questionId]) {
          questionPatches[patch.questionId] = {};
        }
        Object.assign(questionPatches[patch.questionId], patch.patch);
      }
    }
    
    return {
      visibleQuestionIds: Array.from(visibleQuestionIds).sort(),
      unlockedSuites: unlockedSuites.sort((a, b) => (b.priority || 0) - (a.priority || 0)),
      questionPatches
    };
  }
  
  /**
   * Updates the engine configuration
   */
  updateConfiguration(
    questions?: Array<{ id: string; gates?: Gate[] }>,
    suites?: Suite[],
    patches?: QuestionPatch[]
  ): void {
    if (questions) this.questions = questions;
    if (suites) this.suites = suites;
    if (patches) this.patches = patches;
    
    // Rebuild dependency graph
    this.dependencyGraph = buildDependencyGraph(this.questions, this.suites);
    
    // Re-validate cycles
    const cycles = detectCycles(this.questions, this.suites);
    if (cycles.length > 0) {
      throw new Error(`Dependency cycles detected after update:\n${cycles.join('\n')}`);
    }
  }
}
