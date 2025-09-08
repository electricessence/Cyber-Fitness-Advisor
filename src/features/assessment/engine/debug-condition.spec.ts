/**
 * Direct condition engine test for debugging
 */

import { describe, it, expect } from 'vitest';
import { ConditionEngine } from './conditions';

describe('Condition Engine Direct Test', () => {
  it('should unlock suite and show questions correctly', () => {
    // Create a simple test setup
    const questions = [
      { id: 'lock_screen', gates: [] },
      { id: 'browser_passwords', gates: [] },
      { id: 'advanced_2fa', gates: [] } // Suite question
    ];
    
    const suites = [
      {
        id: 'advanced_security',
        title: 'Advanced Security',
        description: 'Test suite',
        gates: [
          {
            all: [
              { questionId: 'lock_screen', when: 'equals' as const, value: 'yes' },
              { questionId: 'browser_passwords', when: 'equals' as const, value: 'yes' }
            ]
          }
        ],
        questionIds: ['advanced_2fa'],
        priority: 0
      }
    ];
    
    const engine = new ConditionEngine(questions, suites);
    
    // Test with no answers - suite should not be unlocked
    let result = engine.evaluate({
      answers: {}
    });
    
    console.log('No answers:');
    console.log('Visible questions:', result.visibleQuestionIds);
    console.log('Unlocked suites:', result.unlockedSuites.map(s => s.id));
    
    expect(result.unlockedSuites).toHaveLength(0);
    expect(result.visibleQuestionIds).not.toContain('advanced_2fa');
    expect(result.visibleQuestionIds).toContain('lock_screen');
    expect(result.visibleQuestionIds).toContain('browser_passwords');
    
    // Test with partial answers - suite should not be unlocked
    result = engine.evaluate({
      answers: { lock_screen: 'yes' }
    });
    
    console.log('Partial answers:');
    console.log('Visible questions:', result.visibleQuestionIds);
    console.log('Unlocked suites:', result.unlockedSuites.map(s => s.id));
    
    expect(result.unlockedSuites).toHaveLength(0);
    expect(result.visibleQuestionIds).not.toContain('advanced_2fa');
    
    // Test with all answers - suite should be unlocked
    result = engine.evaluate({
      answers: { 
        lock_screen: 'yes',
        browser_passwords: 'yes'
      }
    });
    
    console.log('All answers:');
    console.log('Visible questions:', result.visibleQuestionIds);
    console.log('Unlocked suites:', result.unlockedSuites.map(s => s.id));
    
    expect(result.unlockedSuites).toHaveLength(1);
    expect(result.unlockedSuites[0].id).toBe('advanced_security');
    expect(result.visibleQuestionIds).toContain('advanced_2fa');
  });
});
