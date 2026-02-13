/**
 * Tests for pure gate evaluation functions
 * 
 * Validates comparator operations and gate logic (all/any/none).
 * ConditionEngine class has been removed — all visibility is data-driven
 * through question conditions and the evaluateQuestionConditions function.
 */

import { describe, it, expect } from 'vitest';
import { 
  evaluateGate, 
  type Gate, 
} from './conditions';

describe('evaluateGate — Comparators', () => {
  it('should handle truthy comparator', () => {
    const gate: Gate = {
      all: [{ questionId: 'q1', when: 'truthy' }]
    };

    expect(evaluateGate(gate, { answers: { q1: true } }).passes).toBe(true);
    expect(evaluateGate(gate, { answers: { q1: 'yes' } }).passes).toBe(true);
    expect(evaluateGate(gate, { answers: { q1: 1 } }).passes).toBe(true);
    expect(evaluateGate(gate, { answers: { q1: false } }).passes).toBe(false);
    expect(evaluateGate(gate, { answers: { q1: '' } }).passes).toBe(false);
  });

  it('should handle falsy comparator', () => {
    const gate: Gate = {
      all: [{ questionId: 'q1', when: 'falsy' }]
    };

    expect(evaluateGate(gate, { answers: { q1: false } }).passes).toBe(true);
    expect(evaluateGate(gate, { answers: { q1: '' } }).passes).toBe(true);
    expect(evaluateGate(gate, { answers: { q1: 0 } }).passes).toBe(true);
    expect(evaluateGate(gate, { answers: { q1: true } }).passes).toBe(false);
    expect(evaluateGate(gate, { answers: { q1: 'yes' } }).passes).toBe(false);
  });

  it('should handle equals comparator', () => {
    const gate: Gate = {
      all: [{ questionId: 'q1', when: 'equals', value: 'yes' }]
    };

    expect(evaluateGate(gate, { answers: { q1: 'yes' } }).passes).toBe(true);
    expect(evaluateGate(gate, { answers: { q1: 'no' } }).passes).toBe(false);
    expect(evaluateGate(gate, { answers: {} }).passes).toBe(false);
  });

  it('should handle not_equals comparator', () => {
    const gate: Gate = {
      all: [{ questionId: 'q1', when: 'not_equals', value: 'no' }]
    };

    expect(evaluateGate(gate, { answers: { q1: 'yes' } }).passes).toBe(true);
    expect(evaluateGate(gate, { answers: { q1: 'no' } }).passes).toBe(false);
  });

  it('should handle in comparator', () => {
    const gate: Gate = {
      all: [{ questionId: 'q1', when: 'in', values: ['expert', 'advanced'] }]
    };

    expect(evaluateGate(gate, { answers: { q1: 'expert' } }).passes).toBe(true);
    expect(evaluateGate(gate, { answers: { q1: 'advanced' } }).passes).toBe(true);
    expect(evaluateGate(gate, { answers: { q1: 'beginner' } }).passes).toBe(false);
  });

  it('should handle not_in comparator', () => {
    const gate: Gate = {
      all: [{ questionId: 'q1', when: 'not_in', values: ['blocked', 'banned'] }]
    };

    expect(evaluateGate(gate, { answers: { q1: 'active' } }).passes).toBe(true);
    expect(evaluateGate(gate, { answers: { q1: 'blocked' } }).passes).toBe(false);
  });

  it('should handle contains with arrays', () => {
    const gate: Gate = {
      all: [{ questionId: 'tags', when: 'contains', value: 'security' }]
    };

    expect(evaluateGate(gate, { answers: { tags: ['security', 'privacy'] } }).passes).toBe(true);
    expect(evaluateGate(gate, { answers: { tags: ['privacy'] } }).passes).toBe(false);
    expect(evaluateGate(gate, { answers: { tags: 'security,privacy' } }).passes).toBe(true); // String fallback
  });

  it('should handle not_contains with arrays', () => {
    const gate: Gate = {
      all: [{ questionId: 'tags', when: 'not_contains', value: 'deprecated' }]
    };

    expect(evaluateGate(gate, { answers: { tags: ['security', 'privacy'] } }).passes).toBe(true);
    expect(evaluateGate(gate, { answers: { tags: ['deprecated', 'security'] } }).passes).toBe(false);
  });

  it('should handle exists / not_exists comparators', () => {
    const existsGate: Gate = { all: [{ questionId: 'q1', when: 'exists' }] };
    const notExistsGate: Gate = { all: [{ questionId: 'q1', when: 'not_exists' }] };

    expect(evaluateGate(existsGate, { answers: { q1: 'anything' } }).passes).toBe(true);
    expect(evaluateGate(existsGate, { answers: {} }).passes).toBe(false);
    expect(evaluateGate(notExistsGate, { answers: {} }).passes).toBe(true);
    expect(evaluateGate(notExistsGate, { answers: { q1: 'x' } }).passes).toBe(false);
  });

  it('should handle numeric comparators', () => {
    const gtGate: Gate = { all: [{ questionId: 'score', when: 'greater_than', value: 80 }] };
    const lteGate: Gate = { all: [{ questionId: 'score', when: 'less_equal', value: 50 }] };

    expect(evaluateGate(gtGate, { answers: { score: 85 } }).passes).toBe(true);
    expect(evaluateGate(gtGate, { answers: { score: 80 } }).passes).toBe(false);
    expect(evaluateGate(gtGate, { answers: { score: 50 } }).passes).toBe(false);
    expect(evaluateGate(lteGate, { answers: { score: 50 } }).passes).toBe(true);
    expect(evaluateGate(lteGate, { answers: { score: 51 } }).passes).toBe(false);
  });

  it('should handle invalid comparator values gracefully', () => {
    const gate: Gate = {
      all: [{ questionId: 'q1', when: 'greater_than' as const, value: 'not_a_number' }]
    };

    // Type mismatch should fail gracefully
    expect(evaluateGate(gate, { answers: { q1: 5 } }).passes).toBe(false);
  });
});

describe('evaluateGate — Logic Operators', () => {
  it('should AND all conditions with "all"', () => {
    const gate: Gate = {
      all: [
        { questionId: 'a', when: 'equals', value: 'yes' },
        { questionId: 'b', when: 'equals', value: 'yes' }
      ]
    };

    expect(evaluateGate(gate, { answers: { a: 'yes', b: 'yes' } }).passes).toBe(true);
    expect(evaluateGate(gate, { answers: { a: 'yes', b: 'no' } }).passes).toBe(false);
    expect(evaluateGate(gate, { answers: { a: 'no', b: 'no' } }).passes).toBe(false);
  });

  it('should OR conditions with "any"', () => {
    const gate: Gate = {
      any: [
        { questionId: 'a', when: 'equals', value: 'yes' },
        { questionId: 'b', when: 'equals', value: 'yes' }
      ]
    };

    expect(evaluateGate(gate, { answers: { a: 'yes', b: 'no' } }).passes).toBe(true);
    expect(evaluateGate(gate, { answers: { a: 'no', b: 'yes' } }).passes).toBe(true);
    expect(evaluateGate(gate, { answers: { a: 'no', b: 'no' } }).passes).toBe(false);
  });

  it('should negate conditions with "none"', () => {
    const gate: Gate = {
      none: [
        { questionId: 'blocked', when: 'equals', value: true }
      ]
    };

    expect(evaluateGate(gate, { answers: { blocked: false } }).passes).toBe(true);
    expect(evaluateGate(gate, { answers: {} }).passes).toBe(true);
    expect(evaluateGate(gate, { answers: { blocked: true } }).passes).toBe(false);
  });

  it('should combine all/any/none correctly', () => {
    const gate: Gate = {
      all: [{ questionId: 'level', when: 'equals', value: 'expert' }],
      any: [
        { questionId: 'badge', when: 'equals', value: 'gold' },
        { questionId: 'score', when: 'greater_than', value: 90 }
      ],
      none: [{ questionId: 'banned', when: 'equals', value: true }]
    };

    // All pass
    expect(evaluateGate(gate, { answers: { level: 'expert', badge: 'gold', score: 50 } }).passes).toBe(true);
    // 'all' fails
    expect(evaluateGate(gate, { answers: { level: 'beginner', badge: 'gold' } }).passes).toBe(false);
    // 'any' fails
    expect(evaluateGate(gate, { answers: { level: 'expert', badge: 'silver', score: 50 } }).passes).toBe(false);
    // 'none' fails (banned)
    expect(evaluateGate(gate, { answers: { level: 'expert', badge: 'gold', banned: true } }).passes).toBe(false);
  });

  it('should pass when gate has no conditions', () => {
    const gate: Gate = {};
    expect(evaluateGate(gate, { answers: {} }).passes).toBe(true);
  });

  it('should provide evaluation details', () => {
    const gate: Gate = {
      all: [
        { questionId: 'a', when: 'equals', value: 'yes' },
        { questionId: 'b', when: 'equals', value: 'yes' }
      ]
    };

    const result = evaluateGate(gate, { answers: { a: 'yes', b: 'no' } });
    expect(result.passes).toBe(false);
    expect(result.details?.all).toEqual([true, false]);
  });

  it('should handle missing question references gracefully', () => {
    const gate: Gate = {
      all: [{ questionId: 'nonexistent', when: 'equals', value: 'yes' }]
    };

    // Missing answer → condition fails, doesn't throw
    expect(evaluateGate(gate, { answers: {} }).passes).toBe(false);
  });
});
