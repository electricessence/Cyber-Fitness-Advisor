/**
 * Facts-Based Architecture: Condition Engine
 * 
 * This module extends the existing condition engine to work with facts
 * instead of raw answers, providing more stable and semantic conditional logic.
 */

import type { FactsProfile } from './types';
import type { Gate } from '../engine/conditions';

// Extended gate types that work with facts
export interface FactGate extends Omit<Gate, 'question'> {
  /** The fact ID to check */
  fact: string;
  /** Operator for fact-based conditions */
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'exists' | 'not_exists' | 'greater_than' | 'less_than';
  /** Value to compare against (not needed for exists/not_exists) */
  value?: any;
}

// Condition that can use either legacy answer-based or new fact-based gates
export interface HybridCondition {
  /** Legacy answer-based gates for backward compatibility */
  answerGates?: Gate[];
  /** New fact-based gates */
  factGates?: FactGate[];
  /** Logic operator between gates */
  logic?: 'AND' | 'OR';
}

export class FactsConditionEngine {
  /**
   * Evaluate a hybrid condition against both facts and legacy answers
   */
  public evaluateCondition(
    condition: HybridCondition,
    factsProfile: FactsProfile,
    legacyAnswers?: Record<string, any>
  ): boolean {
    const factResults = this.evaluateFactGates(condition.factGates || [], factsProfile);
    const answerResults = this.evaluateAnswerGates(condition.answerGates || [], legacyAnswers || {});
    
    const allResults = [...factResults, ...answerResults];
    
    if (allResults.length === 0) {
      return true; // No conditions means always pass
    }
    
    const logic = condition.logic || 'AND';
    return logic === 'AND' 
      ? allResults.every(result => result)
      : allResults.some(result => result);
  }
  
  /**
   * Evaluate fact-based gates
   */
  private evaluateFactGates(gates: FactGate[], factsProfile: FactsProfile): boolean[] {
    return gates.map(gate => this.evaluateFactGate(gate, factsProfile));
  }
  
  /**
   * Evaluate a single fact-based gate
   */
  private evaluateFactGate(gate: FactGate, factsProfile: FactsProfile): boolean {
    const fact = factsProfile.facts[gate.fact];
    
    switch (gate.operator) {
      case 'exists':
        return !!fact;
      
      case 'not_exists':
        return !fact;
      
      case 'equals':
        return fact ? fact.value === gate.value : false;
      
      case 'not_equals':
        return fact ? fact.value !== gate.value : true;
      
      case 'contains':
        if (!fact) return false;
        if (Array.isArray(fact.value)) {
          return fact.value.includes(gate.value);
        }
        if (typeof fact.value === 'string') {
          return fact.value.includes(gate.value as string);
        }
        return false;
      
      case 'not_contains':
        if (!fact) return true;
        if (Array.isArray(fact.value)) {
          return !fact.value.includes(gate.value);
        }
        if (typeof fact.value === 'string') {
          return !fact.value.includes(gate.value as string);
        }
        return true;
      
      case 'greater_than':
        return fact && typeof fact.value === 'number' && fact.value > (gate.value as number);
      
      case 'less_than':
        return fact && typeof fact.value === 'number' && fact.value < (gate.value as number);
      
      default:
        console.warn(`Unknown fact gate operator: ${gate.operator}`);
        return false;
    }
  }
  
  /**
   * Evaluate legacy answer-based gates (for backward compatibility)
   */
  private evaluateAnswerGates(gates: Gate[], answers: Record<string, any>): boolean[] {
    return gates.map(gate => this.evaluateLegacyGate(gate, answers));
  }
  
  /**
   * Evaluate a single legacy gate structure
   */
  private evaluateLegacyGate(gate: Gate, answers: Record<string, any>): boolean {
    let allResults: boolean[] = [];
    let anyResults: boolean[] = [];
    let noneResults: boolean[] = [];
    
    // Evaluate 'all' conditions (AND logic)
    if (gate.all) {
      allResults = gate.all.map(condition => this.evaluateGateCondition(condition, answers));
    }
    
    // Evaluate 'any' conditions (OR logic)  
    if (gate.any) {
      anyResults = gate.any.map(condition => this.evaluateGateCondition(condition, answers));
    }
    
    // Evaluate 'none' conditions (NOT logic)
    if (gate.none) {
      noneResults = gate.none.map(condition => !this.evaluateGateCondition(condition, answers));
    }
    
    // Combine results: all 'all' must be true, at least one 'any' must be true, all 'none' must be true
    const allPass = allResults.length === 0 || allResults.every(r => r);
    const anyPass = anyResults.length === 0 || anyResults.some(r => r);  
    const nonePass = noneResults.length === 0 || noneResults.every(r => r);
    
    return allPass && anyPass && nonePass;
  }
  
  /**
   * Evaluate a single gate condition
   */
  private evaluateGateCondition(condition: any, answers: Record<string, any>): boolean {
    const answer = answers[condition.questionId];
    if (!answer) return false;
    
    switch (condition.when) {
      case 'contains':
        return Array.isArray(answer.value) 
          ? answer.value.includes(condition.value)
          : answer.value === condition.value;
      
      case 'not_contains':
        return Array.isArray(answer.value)
          ? !answer.value.includes(condition.value)
          : answer.value !== condition.value;
      
      case 'equals':
        return answer.value === condition.value;
        
      case 'not_equals':
        return answer.value !== condition.value;
        
      case 'exists':
        return answer.value !== undefined && answer.value !== null;
        
      case 'not_exists':
        return answer.value === undefined || answer.value === null;
      
      default:
        console.warn(`Unknown gate condition operator: ${condition.when}`);
        return false;
    }
  }
}

/**
 * Helper functions to create common fact-based conditions
 */
export const FactConditions = {
  /** Condition: User has a specific OS */
  hasOS: (os: string): HybridCondition => ({
    factGates: [{
      fact: 'device.os.primary',
      operator: 'equals',
      value: os
    }]
  }),
  
  /** Condition: User uses browser password manager */
  usesBrowserPasswordManager: (): HybridCondition => ({
    factGates: [{
      fact: 'behavior.password_manager.browser',
      operator: 'equals',
      value: true
    }]
  }),
  
  /** Condition: User has good password practices (rarely/never reuses) */
  hasGoodPasswordPractices: (): HybridCondition => ({
    factGates: [{
      fact: 'behavior.password_reuse.frequency',
      operator: 'contains',
      value: 'rarely'
    }, {
      fact: 'behavior.password_reuse.frequency',
      operator: 'contains',
      value: 'never'
    }],
    logic: 'OR'
  }),
  
  /** Condition: Has completed onboarding (has device OS fact) */
  hasCompletedOnboarding: (): HybridCondition => ({
    factGates: [{
      fact: 'device.os.primary',
      operator: 'exists'
    }]
  }),
  
  /** Condition: Is Windows user */
  isWindowsUser: (): HybridCondition => FactConditions.hasOS('windows'),
  
  /** Condition: Is Mac user */
  isMacUser: (): HybridCondition => FactConditions.hasOS('macos'),
  
  /** Condition: Needs password manager recommendation */
  needsPasswordManagerRecommendation: (): HybridCondition => ({
    factGates: [{
      fact: 'behavior.password_manager.browser',
      operator: 'equals',
      value: false
    }]
  })
};

/**
 * Migration helpers to convert legacy conditions to fact-based conditions
 */
export const ConditionMigration = {
  /** Convert a legacy OS check to fact-based */
  migrateOSCheck: (legacyQuestionId: string, osName: string): HybridCondition => {
    return {
      // Try fact-based first, fall back to legacy
      factGates: [{
        fact: 'device.os.primary',
        operator: 'equals',
        value: osName
      }],
      answerGates: [{
        all: [{
          questionId: legacyQuestionId,
          when: 'contains',
          value: true
        }]
      }],
      logic: 'OR'
    };
  },
  
  /** Convert password manager check to fact-based */
  migratePasswordManagerCheck: (legacyQuestionId: string): HybridCondition => {
    return {
      factGates: [{
        fact: 'behavior.password_manager.browser',
        operator: 'equals',
        value: true
      }],
      answerGates: [{
        all: [{
          questionId: legacyQuestionId,
          when: 'contains',
          value: true
        }]
      }],
      logic: 'OR'
    };
  }
};
