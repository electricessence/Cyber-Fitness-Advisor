/**
 * Comprehensive tests for the Conditional Question Engine
 * 
 * Tests all Phase 2.1 refinements including:
 * - New visibility semantics (any gate passes)
 * - Gate-attached patches
 * - New comparators (truthy, falsy, contains with arrays)
 * - Suite gates (multiple gates per suite)
 * - Hide vs show precedence
 * - Cycle detection
 */

import { describe, it, expect } from 'vitest';
import { 
  ConditionEngine, 
  evaluateGate, 
  detectCycles,
  type Gate, 
  type Suite, 
  type EvaluationContext 
} from './conditions';

describe('Condition Engine - Phase 2.1', () => {
  describe('New Comparators', () => {
    it('should handle truthy comparator', () => {
      const gate: Gate = {
        all: [{ questionId: 'q1', when: 'truthy' }]
      };

      const context1: EvaluationContext = { answers: { q1: true } };
      const context2: EvaluationContext = { answers: { q1: 'yes' } };
      const context3: EvaluationContext = { answers: { q1: 1 } };
      const context4: EvaluationContext = { answers: { q1: false } };
      const context5: EvaluationContext = { answers: { q1: '' } };

      expect(evaluateGate(gate, context1).passes).toBe(true);
      expect(evaluateGate(gate, context2).passes).toBe(true);
      expect(evaluateGate(gate, context3).passes).toBe(true);
      expect(evaluateGate(gate, context4).passes).toBe(false);
      expect(evaluateGate(gate, context5).passes).toBe(false);
    });

    it('should handle falsy comparator', () => {
      const gate: Gate = {
        all: [{ questionId: 'q1', when: 'falsy' }]
      };

      const context1: EvaluationContext = { answers: { q1: false } };
      const context2: EvaluationContext = { answers: { q1: '' } };
      const context3: EvaluationContext = { answers: { q1: 0 } };
      const context4: EvaluationContext = { answers: { q1: true } };
      const context5: EvaluationContext = { answers: { q1: 'yes' } };

      expect(evaluateGate(gate, context1).passes).toBe(true);
      expect(evaluateGate(gate, context2).passes).toBe(true);
      expect(evaluateGate(gate, context3).passes).toBe(true);
      expect(evaluateGate(gate, context4).passes).toBe(false);
      expect(evaluateGate(gate, context5).passes).toBe(false);
    });

    it('should handle contains with arrays', () => {
      const gate: Gate = {
        all: [{ questionId: 'tags', when: 'contains', value: 'security' }]
      };

      const context1: EvaluationContext = { 
        answers: { tags: ['security', 'privacy', 'encryption'] } 
      };
      const context2: EvaluationContext = { 
        answers: { tags: ['privacy', 'encryption'] } 
      };
      const context3: EvaluationContext = { 
        answers: { tags: 'security,privacy' } 
      };

      expect(evaluateGate(gate, context1).passes).toBe(true);
      expect(evaluateGate(gate, context2).passes).toBe(false);
      expect(evaluateGate(gate, context3).passes).toBe(true); // String fallback
    });

    it('should handle not_contains with arrays', () => {
      const gate: Gate = {
        all: [{ questionId: 'tags', when: 'not_contains', value: 'deprecated' }]
      };

      const context1: EvaluationContext = { 
        answers: { tags: ['security', 'privacy'] } 
      };
      const context2: EvaluationContext = { 
        answers: { tags: ['deprecated', 'security'] } 
      };

      expect(evaluateGate(gate, context1).passes).toBe(true);
      expect(evaluateGate(gate, context2).passes).toBe(false);
    });
  });

  describe('Visibility Semantics', () => {
    it('should show question if any gate passes', () => {
      const questions = [
        {
          id: 'q1',
          gates: [
            { all: [{ questionId: 'prereq1', when: 'equals' as const, value: 'yes' }] },
            { all: [{ questionId: 'prereq2', when: 'equals' as const, value: 'yes' }] }
          ]
        }
      ];

      const engine = new ConditionEngine(questions);
      
      // First gate fails, second passes
      const context: EvaluationContext = {
        answers: { prereq1: 'no', prereq2: 'yes' }
      };

      const result = engine.evaluate(context);
      expect(result.visibleQuestionIds).toContain('q1');
    });

    it('should hide question if no gates are present but default visible', () => {
      const questions = [{ id: 'q1' }]; // No gates = default visible

      const engine = new ConditionEngine(questions);
      const context: EvaluationContext = { answers: {} };

      const result = engine.evaluate(context);
      expect(result.visibleQuestionIds).toContain('q1');
    });

    it('should hide question if all gates fail', () => {
      const questions = [
        {
          id: 'q1',
          gates: [
            { all: [{ questionId: 'prereq1', when: 'equals' as const, value: 'yes' }] },
            { all: [{ questionId: 'prereq2', when: 'equals' as const, value: 'yes' }] }
          ]
        }
      ];

      const engine = new ConditionEngine(questions);
      
      // Both gates fail
      const context: EvaluationContext = {
        answers: { prereq1: 'no', prereq2: 'no' }
      };

      const result = engine.evaluate(context);
      expect(result.visibleQuestionIds).not.toContain('q1');
    });
  });

  describe('Hide vs Show Precedence', () => {
    it('should hide override show', () => {
      const questions = [
        { id: 'q1' },
        { id: 'q2' }
      ];

      const showGate: Gate = {
        all: [{ questionId: 'trigger', when: 'equals' as const, value: 'show' }],
        show: ['q1', 'q2']
      };

      const hideGate: Gate = {
        all: [{ questionId: 'trigger', when: 'equals' as const, value: 'show' }],
        hide: ['q1'] // Should override the show for q1
      };

      // Add gates to a dummy question to trigger them
      const questionsWithGates = [
        ...questions,
        { id: 'controller', gates: [showGate, hideGate] }
      ];

      const engine = new ConditionEngine(questionsWithGates);
      const context: EvaluationContext = { answers: { trigger: 'show' } };

      const result = engine.evaluate(context);
      
      expect(result.visibleQuestionIds).not.toContain('q1'); // Hidden
      expect(result.visibleQuestionIds).toContain('q2'); // Still shown
    });
  });

  describe('Gate-Attached Patches', () => {
    it('should apply patches from gates', () => {
      const questions = [
        { id: 'q1' },
        {
          id: 'controller',
          gates: [{
            all: [{ questionId: 'level', when: 'equals' as const, value: 'advanced' }],
            patch: {
              q1: {
                text: 'Advanced version of question 1',
                weight: 15
              }
            }
          }]
        }
      ];

      const engine = new ConditionEngine(questions);
      const context: EvaluationContext = { answers: { level: 'advanced' } };

      const result = engine.evaluate(context);
      
      expect(result.questionPatches.q1).toEqual({
        text: 'Advanced version of question 1',
        weight: 15
      });
    });

    it('should handle patch conflicts deterministically', () => {
      const questions = [
        { id: 'q1' },
        {
          id: 'controller1',
          gates: [{
            all: [{ questionId: 'trigger', when: 'equals' as const, value: 'yes' }],
            patch: {
              q1: { text: 'First patch', weight: 10 }
            }
          }]
        },
        {
          id: 'controller2',
          gates: [{
            all: [{ questionId: 'trigger', when: 'equals' as const, value: 'yes' }],
            patch: {
              q1: { text: 'Second patch', priority: 5 }
            }
          }]
        }
      ];

      const engine = new ConditionEngine(questions);
      const context: EvaluationContext = { answers: { trigger: 'yes' } };

      const result = engine.evaluate(context);
      
      // Last writer wins, with merged fields
      expect(result.questionPatches.q1).toEqual({
        text: 'Second patch', // Overwritten
        weight: 10, // Preserved
        priority: 5 // Added
      });
    });
  });

  describe('Suite Gates', () => {
    it('should unlock suite if any gate passes', () => {
      const suites: Suite[] = [
        {
          id: 'advanced_suite',
          title: 'Advanced Security',
          description: 'For experienced users',
          questionIds: ['adv1', 'adv2'],
          gates: [
            { all: [{ questionId: 'experience', when: 'equals' as const, value: 'expert' }] },
            { all: [{ questionId: 'score', when: 'greater_than' as const, value: 80 }] }
          ]
        }
      ];

      const engine = new ConditionEngine([], suites);
      
      // First gate fails, second passes
      const context: EvaluationContext = {
        answers: { experience: 'beginner', score: 85 }
      };

      const result = engine.evaluate(context);
      expect(result.unlockedSuites).toHaveLength(1);
      expect(result.unlockedSuites[0].id).toBe('advanced_suite');
    });

    it('should not unlock suite if all gates fail', () => {
      const suites: Suite[] = [
        {
          id: 'advanced_suite',
          title: 'Advanced Security',
          description: 'For experienced users',
          questionIds: ['adv1', 'adv2'],
          gates: [
            { all: [{ questionId: 'experience', when: 'equals' as const, value: 'expert' }] },
            { all: [{ questionId: 'score', when: 'greater_than' as const, value: 80 }] }
          ]
        }
      ];

      const engine = new ConditionEngine([], suites);
      
      // Both gates fail
      const context: EvaluationContext = {
        answers: { experience: 'beginner', score: 50 }
      };

      const result = engine.evaluate(context);
      expect(result.unlockedSuites).toHaveLength(0);
    });

    it('should handle suite unlock actions from gates', () => {
      const questions = [
        {
          id: 'controller',
          gates: [{
            all: [{ questionId: 'trigger', when: 'equals' as const, value: 'unlock' }],
            unlockSuites: ['bonus_suite']
          }]
        }
      ];

      const suites: Suite[] = [
        {
          id: 'bonus_suite',
          title: 'Bonus Questions',
          description: 'Extra challenges',
          questionIds: ['bonus1'],
          gates: [
            { all: [{ questionId: 'never', when: 'equals' as const, value: 'true' }] } // Normally locked
          ]
        }
      ];

      const engine = new ConditionEngine(questions, suites);
      const context: EvaluationContext = { answers: { trigger: 'unlock' } };

      const result = engine.evaluate(context);
      expect(result.unlockedSuites).toHaveLength(1);
      expect(result.unlockedSuites[0].id).toBe('bonus_suite');
    });
  });

  describe('Cycle Detection', () => {
    it('should detect simple cycles', () => {
      const questions = [
        {
          id: 'q1',
          gates: [{ all: [{ questionId: 'q2', when: 'equals' as const, value: 'yes' }] }]
        },
        {
          id: 'q2',
          gates: [{ all: [{ questionId: 'q1', when: 'equals' as const, value: 'yes' }] }]
        }
      ];

      expect(() => {
        new ConditionEngine(questions);
      }).toThrow(/Dependency cycles detected/);
    });

    it('should detect complex cycles', () => {
      const questions = [
        {
          id: 'q1',
          gates: [{ all: [{ questionId: 'q2', when: 'equals' as const, value: 'yes' }] }]
        },
        {
          id: 'q2',
          gates: [{ all: [{ questionId: 'q3', when: 'equals' as const, value: 'yes' }] }]
        },
        {
          id: 'q3',
          gates: [{ all: [{ questionId: 'q1', when: 'equals' as const, value: 'yes' }] }]
        }
      ];

      expect(() => {
        new ConditionEngine(questions);
      }).toThrow(/Dependency cycles detected/);
    });

    it('should allow valid dependency chains', () => {
      const questions = [
        {
          id: 'q1',
          gates: [{ all: [{ questionId: 'q2', when: 'equals' as const, value: 'yes' }] }]
        },
        {
          id: 'q2',
          gates: [{ all: [{ questionId: 'q3', when: 'equals' as const, value: 'yes' }] }]
        },
        { id: 'q3' } // No dependencies
      ];

      expect(() => {
        new ConditionEngine(questions);
      }).not.toThrow();
    });

    it('should perform lightweight cycle check during evaluation', () => {
      const questions = [{ id: 'q1' }];
      const engine = new ConditionEngine(questions);
      
      // Try to update configuration with cyclic dependency
      expect(() => {
        engine.updateConfiguration([
          {
            id: 'q1',
            gates: [{ all: [{ questionId: 'q1', when: 'equals' as const, value: 'yes' }] }]
          }
        ]);
      }).toThrow(/Dependency cycles detected/);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complex scenario with all features', () => {
      const questions = [
        { id: 'basic_q1' }, // Default visible
        { id: 'basic_q2' }, // Default visible
        {
          id: 'advanced_q1',
          gates: [
            { all: [{ questionId: 'experience', when: 'in' as const, values: ['expert', 'advanced'] }] }
          ]
        },
        {
          id: 'conditional_controller',
          gates: [{
            all: [{ questionId: 'show_advanced', when: 'truthy' as const }],
            show: ['advanced_q2'],
            hide: ['basic_q2'], // Hide basic when showing advanced
            patch: {
              basic_q1: {
                text: 'Enhanced basic question',
                hint: 'This question has been enhanced for advanced users'
              }
            },
            unlockSuites: ['expert_suite']
          }]
        }
      ];

      const suites: Suite[] = [
        {
          id: 'expert_suite',
          title: 'Expert Level',
          description: 'For security experts',
          questionIds: ['expert1', 'expert2'],
          priority: 10,
          gates: [
            { all: [{ questionId: 'never_unlock_normally', when: 'equals' as const, value: 'impossible' }] }
          ]
        }
      ];

      const engine = new ConditionEngine(questions, suites);
      const context: EvaluationContext = {
        answers: {
          experience: 'expert',
          show_advanced: true
        }
      };

      const result = engine.evaluate(context);

      // Check visibility
      expect(result.visibleQuestionIds).toContain('basic_q1'); // Default visible + patched
      expect(result.visibleQuestionIds).not.toContain('basic_q2'); // Hidden by gate
      expect(result.visibleQuestionIds).toContain('advanced_q1'); // Shown by experience gate
      expect(result.visibleQuestionIds).toContain('advanced_q2'); // Shown by controller gate

      // Check patches
      expect(result.questionPatches.basic_q1).toEqual({
        text: 'Enhanced basic question',
        hint: 'This question has been enhanced for advanced users'
      });

      // Check suite unlocks
      expect(result.unlockedSuites).toHaveLength(1);
      expect(result.unlockedSuites[0].id).toBe('expert_suite');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing question references gracefully', () => {
      const questions = [
        {
          id: 'q1',
          gates: [{ all: [{ questionId: 'nonexistent', when: 'equals' as const, value: 'yes' }] }]
        }
      ];

      const engine = new ConditionEngine(questions);
      const context: EvaluationContext = { answers: {} };

      // Should not throw, just treat as false condition
      const result = engine.evaluate(context);
      expect(result.visibleQuestionIds).not.toContain('q1');
    });

    it('should handle invalid comparator values gracefully', () => {
      const gate: Gate = {
        all: [{ questionId: 'q1', when: 'greater_than' as const, value: 'not_a_number' }]
      };

      const context: EvaluationContext = { answers: { q1: 5 } };
      const result = evaluateGate(gate, context);
      
      expect(result.passes).toBe(false); // Should fail gracefully
    });
  });
});

describe('detectCycles function', () => {
  it('should return detailed cycle information', () => {
    const questions = [
      {
        id: 'a',
        gates: [{ all: [{ questionId: 'b', when: 'equals' as const, value: 'yes' }] }]
      },
      {
        id: 'b',
        gates: [{ all: [{ questionId: 'c', when: 'equals' as const, value: 'yes' }] }]
      },
      {
        id: 'c',
        gates: [{ all: [{ questionId: 'a', when: 'equals' as const, value: 'yes' }] }]
      }
    ];

    const cycles = detectCycles(questions);
    expect(cycles).toHaveLength(1);
    expect(cycles[0]).toContain('Cycle detected:');
    expect(cycles[0]).toContain('→');
  });
});
