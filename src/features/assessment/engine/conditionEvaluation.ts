import type { Question } from './schema';
import type { Fact } from '../facts/types';

/**
 * Core condition evaluation logic - extracted for 100% testability
 * This function determines if a question should be visible based on facts
 */
export function evaluateQuestionConditions(
  question: Question,
  facts: Record<string, Fact>
): { visible: boolean; reason?: string } {
  // Check include conditions - ALL must match for question to be visible
  if (question.conditions?.include) {
    for (const [factId, expectedValue] of Object.entries(question.conditions.include)) {
      const fact = facts[factId];
      if (!fact) {
        return {
          visible: false,
          reason: `Include condition failed: ${factId} expected ${expectedValue}, got undefined`
        };
      }
      // Special case: "*" means "any value" — include if fact exists
      if (expectedValue === "*") {
        continue; // fact exists (checked above), any value is fine
      }

      // Array means "any of these values" (OR semantics)
      if (Array.isArray(expectedValue)) {
        if (!expectedValue.includes(fact.value as never)) {
          return {
            visible: false,
            reason: `Include condition failed: ${factId} expected one of [${expectedValue}], got ${fact.value}`
          };
        }
      } else if (fact.value !== expectedValue) {
        return {
          visible: false,
          reason: `Include condition failed: ${factId} expected ${expectedValue}, got ${fact.value}`
        };
      }
    }
  }
  
  // Check exclude conditions - question is hidden if any fact matches
  if (question.conditions?.exclude) {
    for (const [factId, expectedValue] of Object.entries(question.conditions.exclude)) {
      const fact = facts[factId];
      
      // Special case: "*" means "any value" - exclude if fact exists
      if (expectedValue === "*" && fact) {
        return {
          visible: false,
          reason: `Exclude condition matched: ${factId} has any value (${fact.value})`
        };
      }
      
      // Normal case: exclude if fact matches specific value (or any in array)
      if (fact) {
        if (Array.isArray(expectedValue)) {
          if (expectedValue.includes(fact.value as never)) {
            return {
              visible: false,
              reason: `Exclude condition matched: ${factId} in [${expectedValue}]`
            };
          }
        } else if (fact.value === expectedValue) {
          return {
            visible: false,
            reason: `Exclude condition matched: ${factId} = ${expectedValue}`
          };
        }
      }
    }
  }
  
  return { visible: true };
}

/**
 * Get all visible question IDs based on condition evaluation
 */
export function getVisibleQuestionIds(
  questions: Question[],
  facts: Record<string, Fact>
): string[] {
  const visibleIds: string[] = [];
  
  for (const question of questions) {
    const evaluation = evaluateQuestionConditions(question, facts);
    if (evaluation.visible) {
      visibleIds.push(question.id);
    }
  }

  return visibleIds;
}