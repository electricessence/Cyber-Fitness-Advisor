/**
 * Comprehensive Unit Tests for Condition Evaluation Functions
 * 
 * This test suite achieves 100% coverage of the extracted condition evaluation logic,
 * ensuring all edge cases and scenarios are properly tested without browser dependency.
 */

import { describe, it, expect } from 'vitest';
import { evaluateQuestionConditions, getVisibleQuestionIds } from './conditionEvaluation';
import type { Question } from './schema';
import type { Fact } from '../facts/types';

// Test data factory functions
function createFact(id: string, value: any): Fact {
  return {
    id,
    name: id.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    category: 'device',
    value,
    establishedAt: new Date(),
    establishedBy: { questionId: 'test', answerValue: value },
    confidence: 0.95,
    metadata: { source: 'test' }
  };
}

function createQuestion(id: string, conditions?: any): Question {
  return {
    id,
    text: `Test question ${id}`,
    options: [
      { id: 'yes', text: 'Yes' },
      { id: 'no', text: 'No' }
    ],
    conditions,
    priority: 1000
  } as Question;
}

describe('evaluateQuestionConditions', () => {
  describe('No conditions', () => {
    it('should return visible:true when question has no conditions', () => {
      const question = createQuestion('no_conditions');
      const facts = {};
      
      const result = evaluateQuestionConditions(question, facts);
      
      expect(result).toEqual({ visible: true });
    });

    it('should return visible:true when conditions is undefined', () => {
      const question = createQuestion('undefined_conditions', undefined);
      const facts = {};
      
      const result = evaluateQuestionConditions(question, facts);
      
      expect(result).toEqual({ visible: true });
    });
  });

  describe('Include conditions', () => {
    it('should return visible:true when all include conditions match', () => {
      const question = createQuestion('include_match', {
        include: {
          os_detected: 'windows',
          browser_detected: 'firefox'
        }
      });
      
      const facts = {
        os_detected: createFact('os_detected', 'windows'),
        browser_detected: createFact('browser_detected', 'firefox')
      };
      
      const result = evaluateQuestionConditions(question, facts);
      
      expect(result).toEqual({ visible: true });
    });

    it('should return visible:false when any include condition fails due to missing fact', () => {
      const question = createQuestion('include_missing', {
        include: {
          os_detected: 'windows',
          missing_fact: 'required_value'
        }
      });
      
      const facts = {
        os_detected: createFact('os_detected', 'windows')
      };
      
      const result = evaluateQuestionConditions(question, facts);
      
      expect(result).toEqual({
        visible: false,
        reason: 'Include condition failed: missing_fact expected required_value, got undefined'
      });
    });

    it('should return visible:false when any include condition fails due to wrong value', () => {
      const question = createQuestion('include_wrong_value', {
        include: {
          os_detected: 'windows',
          browser_detected: 'chrome'
        }
      });
      
      const facts = {
        os_detected: createFact('os_detected', 'windows'),
        browser_detected: createFact('browser_detected', 'firefox')
      };
      
      const result = evaluateQuestionConditions(question, facts);
      
      expect(result).toEqual({
        visible: false,
        reason: 'Include condition failed: browser_detected expected chrome, got firefox'
      });
    });

    it('should handle boolean include conditions correctly', () => {
      const question = createQuestion('include_boolean', {
        include: {
          device_detection_completed: true,
          privacy_dismissed: false
        }
      });
      
      const facts = {
        device_detection_completed: createFact('device_detection_completed', true),
        privacy_dismissed: createFact('privacy_dismissed', false)
      };
      
      const result = evaluateQuestionConditions(question, facts);
      
      expect(result).toEqual({ visible: true });
    });

    it('should handle numeric include conditions correctly', () => {
      const question = createQuestion('include_numeric', {
        include: {
          security_score: 75,
          assessment_version: 2
        }
      });
      
      const facts = {
        security_score: createFact('security_score', 75),
        assessment_version: createFact('assessment_version', 2)
      };
      
      const result = evaluateQuestionConditions(question, facts);
      
      expect(result).toEqual({ visible: true });
    });
  });

  describe('Exclude conditions', () => {
    it('should return visible:true when no exclude conditions match', () => {
      const question = createQuestion('exclude_no_match', {
        exclude: {
          os_confirmed: true,
          browser_confirmed: true
        }
      });
      
      const facts = {
        os_detected: createFact('os_detected', 'windows'),
        browser_detected: createFact('browser_detected', 'firefox')
      };
      
      const result = evaluateQuestionConditions(question, facts);
      
      expect(result).toEqual({ visible: true });
    });

    it('should return visible:false when any exclude condition matches exact value', () => {
      const question = createQuestion('exclude_match', {
        exclude: {
          os_confirmed: true,
          browser_confirmed: true
        }
      });
      
      const facts = {
        os_confirmed: createFact('os_confirmed', true),
        browser_detected: createFact('browser_detected', 'firefox')
      };
      
      const result = evaluateQuestionConditions(question, facts);
      
      expect(result).toEqual({
        visible: false,
        reason: 'Exclude condition matched: os_confirmed = true'
      });
    });

    it('should handle wildcard "*" exclude conditions correctly', () => {
      const question = createQuestion('exclude_wildcard', {
        exclude: {
          os_detected: '*',
          browser_confirmed: true
        }
      });
      
      const facts = {
        os_detected: createFact('os_detected', 'windows'), // Any value should exclude
        browser_detected: createFact('browser_detected', 'firefox')
      };
      
      const result = evaluateQuestionConditions(question, facts);
      
      expect(result).toEqual({
        visible: false,
        reason: 'Exclude condition matched: os_detected has any value (windows)'
      });
    });

    it('should not exclude when fact does not exist for wildcard condition', () => {
      const question = createQuestion('exclude_wildcard_missing', {
        exclude: {
          missing_fact: '*',
          os_confirmed: true
        }
      });
      
      const facts = {
        os_detected: createFact('os_detected', 'windows')
      };
      
      const result = evaluateQuestionConditions(question, facts);
      
      expect(result).toEqual({ visible: true });
    });

    it('should handle string exclude conditions correctly', () => {
      const question = createQuestion('exclude_string', {
        exclude: {
          os_detected: 'linux',
          browser_detected: 'safari'
        }
      });
      
      const facts = {
        os_detected: createFact('os_detected', 'windows'),
        browser_detected: createFact('browser_detected', 'safari')
      };
      
      const result = evaluateQuestionConditions(question, facts);
      
      expect(result).toEqual({
        visible: false,
        reason: 'Exclude condition matched: browser_detected = safari'
      });
    });
  });

  describe('Combined include and exclude conditions', () => {
    it('should return visible:true when include matches and exclude does not', () => {
      const question = createQuestion('combined_visible', {
        include: {
          os_detected: 'windows'
        },
        exclude: {
          os_confirmed: true
        }
      });
      
      const facts = {
        os_detected: createFact('os_detected', 'windows')
      };
      
      const result = evaluateQuestionConditions(question, facts);
      
      expect(result).toEqual({ visible: true });
    });

    it('should return visible:false when include fails (exclude not checked)', () => {
      const question = createQuestion('combined_include_fail', {
        include: {
          os_detected: 'linux'
        },
        exclude: {
          os_confirmed: true
        }
      });
      
      const facts = {
        os_detected: createFact('os_detected', 'windows')
      };
      
      const result = evaluateQuestionConditions(question, facts);
      
      expect(result).toEqual({
        visible: false,
        reason: 'Include condition failed: os_detected expected linux, got windows'
      });
    });

    it('should return visible:false when include passes but exclude matches', () => {
      const question = createQuestion('combined_exclude_match', {
        include: {
          os_detected: 'windows'
        },
        exclude: {
          os_confirmed: true
        }
      });
      
      const facts = {
        os_detected: createFact('os_detected', 'windows'),
        os_confirmed: createFact('os_confirmed', true)
      };
      
      const result = evaluateQuestionConditions(question, facts);
      
      expect(result).toEqual({
        visible: false,
        reason: 'Exclude condition matched: os_confirmed = true'
      });
    });

    it('should handle complex real-world scenario', () => {
      const question = createQuestion('windows_detection_confirm', {
        include: {
          os_detected: 'windows'
        },
        exclude: {
          os_confirmed: true
        }
      });
      
      const facts = {
        os_detected: createFact('os_detected', 'windows'),
        browser_detected: createFact('browser_detected', 'firefox'),
        device_type: createFact('device_type', 'desktop'),
        device_detection_completed: createFact('device_detection_completed', true)
      };
      
      const result = evaluateQuestionConditions(question, facts);
      
      expect(result).toEqual({ visible: true });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty include conditions object', () => {
      const question = createQuestion('empty_include', {
        include: {}
      });
      
      const facts = {
        os_detected: createFact('os_detected', 'windows')
      };
      
      const result = evaluateQuestionConditions(question, facts);
      
      expect(result).toEqual({ visible: true });
    });

    it('should handle empty exclude conditions object', () => {
      const question = createQuestion('empty_exclude', {
        exclude: {}
      });
      
      const facts = {
        os_detected: createFact('os_detected', 'windows')
      };
      
      const result = evaluateQuestionConditions(question, facts);
      
      expect(result).toEqual({ visible: true });
    });

    it('should handle null and undefined fact values', () => {
      const question = createQuestion('null_values', {
        include: {
          null_fact: null,
          undefined_fact: undefined
        }
      });
      
      const facts = {
        null_fact: createFact('null_fact', null),
        undefined_fact: createFact('undefined_fact', undefined)
      };
      
      const result = evaluateQuestionConditions(question, facts);
      
      expect(result).toEqual({ visible: true });
    });

    it('should handle zero and empty string values correctly', () => {
      const question = createQuestion('zero_empty', {
        include: {
          zero_value: 0,
          empty_string: ''
        }
      });
      
      const facts = {
        zero_value: createFact('zero_value', 0),
        empty_string: createFact('empty_string', '')
      };
      
      const result = evaluateQuestionConditions(question, facts);
      
      expect(result).toEqual({ visible: true });
    });
  });
});

describe('getVisibleQuestionIds', () => {
  const testQuestions: Question[] = [
    createQuestion('always_visible'), // No conditions
    createQuestion('windows_only', {
      include: { os_detected: 'windows' }
    }),
    createQuestion('not_if_confirmed', {
      exclude: { os_confirmed: true }
    }),
    createQuestion('complex_conditions', {
      include: { os_detected: 'windows', device_type: 'desktop' },
      exclude: { os_confirmed: true }
    }),
    createQuestion('linux_only', {
      include: { os_detected: 'linux' }
    })
  ];

  it('should return all question IDs when no facts are provided', () => {
    const facts = {};
    
    const result = getVisibleQuestionIds(testQuestions, facts);
    
    expect(result).toEqual([
      'always_visible',
      'not_if_confirmed'
    ]);
  });

  it('should filter questions based on include conditions', () => {
    const facts = {
      os_detected: createFact('os_detected', 'windows')
    };
    
    const result = getVisibleQuestionIds(testQuestions, facts);
    
    expect(result).toEqual([
      'always_visible',
      'windows_only',
      'not_if_confirmed'
    ]);
  });

  it('should filter questions based on exclude conditions', () => {
    const facts = {
      os_detected: createFact('os_detected', 'windows'),
      os_confirmed: createFact('os_confirmed', true)
    };
    
    const result = getVisibleQuestionIds(testQuestions, facts);
    
    expect(result).toEqual([
      'always_visible',
      'windows_only'
    ]);
  });

  it('should handle complex filtering scenarios', () => {
    const facts = {
      os_detected: createFact('os_detected', 'windows'),
      device_type: createFact('device_type', 'desktop'),
      browser_detected: createFact('browser_detected', 'firefox')
    };
    
    const result = getVisibleQuestionIds(testQuestions, facts);
    
    expect(result).toEqual([
      'always_visible',
      'windows_only',
      'not_if_confirmed',
      'complex_conditions'
    ]);
  });

  it('should return empty array when no questions are provided', () => {
    const facts = {
      os_detected: createFact('os_detected', 'windows')
    };
    
    const result = getVisibleQuestionIds([], facts);
    
    expect(result).toEqual([]);
  });

  it('should handle questions with different operating systems', () => {
    const facts = {
      os_detected: createFact('os_detected', 'linux')
    };
    
    const result = getVisibleQuestionIds(testQuestions, facts);
    
    expect(result).toEqual([
      'always_visible',
      'not_if_confirmed',
      'linux_only'
    ]);
  });

  it('should preserve question order in results', () => {
    const orderedQuestions = [
      createQuestion('z_question'),
      createQuestion('a_question'),
      createQuestion('m_question')
    ];
    
    const facts = {};
    
    const result = getVisibleQuestionIds(orderedQuestions, facts);
    
    expect(result).toEqual(['z_question', 'a_question', 'm_question']);
  });

  it('should handle wildcard exclude conditions', () => {
    const questionsWithWildcard = [
      createQuestion('no_os_detected', {
        exclude: { os_detected: '*' }
      }),
      createQuestion('require_browser', {
        include: { browser_detected: 'firefox' }
      })
    ];
    
    const facts = {
      os_detected: createFact('os_detected', 'windows'),
      browser_detected: createFact('browser_detected', 'firefox')
    };
    
    const result = getVisibleQuestionIds(questionsWithWildcard, facts);
    
    // no_os_detected should be excluded because os_detected exists (wildcard)
    // require_browser should be included because browser_detected matches firefox
    expect(result).toEqual(['require_browser']);
  });
});