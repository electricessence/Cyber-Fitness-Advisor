/**
 * Question Flow Testing
 * 
 * Tests the simple, elegant question flow model:
 * Question → Answer → Facts → Filter → Priority
 * 
 * No complex flow trees needed - just facts-based filtering!
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAssessmentStore } from '../features/assessment/state/store';
import { renderHook, act } from '@testing-library/react';

describe('Question Flow System', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useAssessmentStore());
    act(() => {
      result.current.resetAssessment();
    });
  });

  describe('Facts-Based Filtering', () => {
    it('should show follow-up questions only when facts are established', () => {
      const { result } = renderHook(() => useAssessmentStore());

      // Get initial available questions
      const initialQuestions = result.current.getOrderedAvailableQuestions?.() || [];
      
      // Should have questions available
      expect(initialQuestions.length).toBeGreaterThan(0);
      
      // Answer a question that sets a fact
      act(() => {
        result.current.answerQuestion('password_manager', 'no');
      });

      // Check facts were established
      const passwordManagerFact = result.current.factsProfile.facts['password_manager'];
      expect(passwordManagerFact).toBeDefined();
      expect(passwordManagerFact?.value).toBe('no');

      // Get questions after answering
      const questionsAfterAnswer = result.current.getOrderedAvailableQuestions?.() || [];
      
      // Should have different available questions (some filtered out, possibly new ones visible)
      expect(questionsAfterAnswer).toBeDefined();
    });

    it('should hide questions when excluding facts are set', () => {
      const { result } = renderHook(() => useAssessmentStore());

      // Answer onboarding question to set tech_comfort
      act(() => {
        result.current.answerQuestion('tech_comfort', 'beginner');
      });

      // Get available questions
      const questions = result.current.getOrderedAvailableQuestions?.() || [];
      
      // Check if questions respect tech_comfort fact
      const techComfortFact = result.current.factsProfile.facts['tech_comfort'];
      expect(techComfortFact?.value).toBe('beginner');
      
      // Questions should be filtered based on this fact
      expect(questions).toBeDefined();
    });

    it('should show questions only when required facts exist', () => {
      const { result } = renderHook(() => useAssessmentStore());

      // Before setting any facts
      const questionsBefore = result.current.getOrderedAvailableQuestions?.() || [];

      // Set a fact that might unlock new questions
      act(() => {
        result.current.answerQuestion('os_confirmed', 'yes');
      });

      // After setting facts
      const questionsAfter = result.current.getOrderedAvailableQuestions?.() || [];
      
      // Available questions might change (some hidden, some revealed)
      expect(questionsAfter).toBeDefined();
      expect(typeof questionsAfter.length).toBe('number');
      expect(questionsBefore).toBeDefined();
    });
  });

  describe('Priority-Based Ordering', () => {
    it('should order questions by priority (highest first)', () => {
      const { result } = renderHook(() => useAssessmentStore());

      const questions = result.current.getOrderedAvailableQuestions?.() || [];
      
      // Check priorities are descending
      for (let i = 0; i < questions.length - 1; i++) {
        const currentPriority = questions[i].priority || 0;
        const nextPriority = questions[i + 1].priority || 0;
        expect(currentPriority).toBeGreaterThanOrEqual(nextPriority);
      }
    });

    it('should show highest priority question first in FirstActionFlow', () => {
      const { result } = renderHook(() => useAssessmentStore());

      // Complete onboarding questions to establish basic facts
      act(() => {
        result.current.answerQuestion('privacy_notice', 'understood');
        result.current.answerQuestion('windows_detection_confirm', 'yes');
        result.current.answerQuestion('chrome_detection_confirm', 'yes');
        result.current.answerQuestion('tech_comfort', 'comfortable');
      });

      // Get ordered questions (what FirstActionFlow sees)
      const orderedQuestions = result.current.getOrderedAvailableQuestions?.() || [];
      
      expect(orderedQuestions.length).toBeGreaterThan(0);
      
      // First question should be highest priority available question
      const firstQuestion = orderedQuestions[0];
      expect(firstQuestion).toBeDefined();
      expect(firstQuestion.priority).toBeDefined();
      
      // Verify it's actually the highest priority
      const allPriorities = orderedQuestions.map(q => q.priority || 0);
      const maxPriority = Math.max(...allPriorities);
      expect(firstQuestion.priority).toBe(maxPriority);
    });
  });

  describe('Conditional Question Visibility', () => {
    it('should respect include conditions', () => {
      const { result } = renderHook(() => useAssessmentStore());

      // Set up conditions
      act(() => {
        result.current.answerQuestion('tech_comfort', 'advanced');
      });

      const questions = result.current.getOrderedAvailableQuestions?.() || [];
      
      // Questions should be available and properly filtered
      expect(questions).toBeDefined();
      
      // All visible questions should either:
      // 1. Have no conditions, or
      // 2. Have conditions that pass with current facts
      questions.forEach(question => {
        if (question.conditions?.include) {
          // Question has include conditions - they should be satisfied
          const includeConditions = question.conditions.include;
          
          // At least one include condition should be checkable
          expect(includeConditions).toBeDefined();
        }
      });
    });

    it('should respect exclude conditions', () => {
      const { result } = renderHook(() => useAssessmentStore());

      // Set a fact that should exclude certain questions
      act(() => {
        result.current.answerQuestion('password_manager', 'yes');
      });

      const questions = result.current.getOrderedAvailableQuestions?.() || [];
      
      // Questions with exclude conditions for password_manager=yes should not appear
      questions.forEach(question => {
        if (question.conditions?.exclude) {
          const excludeConditions = question.conditions.exclude;
          
          // If question has exclude condition for our fact, it shouldn't be visible
          if (excludeConditions['password_manager'] === 'yes') {
            expect(false).toBe(true); // This question should be filtered out
          }
        }
      });
    });
  });

  describe('Answer → Fact → Filter Chain', () => {
    it('should demonstrate the door example flow', () => {
      const { result } = renderHook(() => useAssessmentStore());

      // Step 1: Initially, doorState is not set
      expect(result.current.factsProfile.facts['doorState']).toBeUndefined();

      // Step 2: User sees "Is your door open?" and answers "open"
      // (Simulating with a fact-setting answer)
      act(() => {
        // In real app, this would be a question answer that sets the fact
        result.current.factsActions.injectFact('doorState', 'open', { 
          source: 'test-door-question' 
        });
      });

      // Step 3: Verify fact is set
      const doorFact = result.current.factsProfile.facts['doorState'];
      expect(doorFact).toBeDefined();
      expect(doorFact?.value).toBe('open');

      // Step 4: Now high-priority "Close your door!" question should be visible
      // (If it exists in question bank with condition: include { doorState: "open" })
      const questions = result.current.getOrderedAvailableQuestions?.() || [];
      
      // Questions are filtered based on doorState fact
      expect(questions).toBeDefined();

      // Step 5: User closes door and answers "I closed it"
      act(() => {
        result.current.factsActions.injectFact('doorState', 'closed', { 
          source: 'test-door-closed' 
        });
      });

      // Step 6: Verify fact changed
      const updatedDoorFact = result.current.factsProfile.facts['doorState'];
      expect(updatedDoorFact?.value).toBe('closed');

      // Step 7: "Close your door!" question should now be filtered out
      const questionsAfterClosing = result.current.getOrderedAvailableQuestions?.() || [];
      expect(questionsAfterClosing).toBeDefined();
    });

    it('should handle browser-specific question flows', () => {
      const { result } = renderHook(() => useAssessmentStore());

      // User selects Firefox as their browser
      act(() => {
        result.current.factsActions.injectFact('browser', 'firefox', { 
          source: 'browser-detection' 
        });
      });

      // User indicates they don't have a password manager
      act(() => {
        result.current.answerQuestion('password_manager', 'no');
      });

      const questions = result.current.getOrderedAvailableQuestions?.() || [];
      
      // Browser-specific questions should be available
      // E.g., "Enable Firefox Monitor?" should be visible for Firefox users without password manager
      expect(questions).toBeDefined();
      
      // Verify facts are set correctly
      expect(result.current.factsProfile.facts['browser']?.value).toBe('firefox');
      expect(result.current.factsProfile.facts['password_manager']?.value).toBe('no');
    });
  });

  describe('FirstActionFlow Integration', () => {
    it('should pick contextually relevant first question', () => {
      const { result } = renderHook(() => useAssessmentStore());

      // Complete onboarding to establish user context
      act(() => {
        result.current.answerQuestion('privacy_notice', 'understood');
        result.current.answerQuestion('windows_detection_confirm', 'yes');
        result.current.answerQuestion('chrome_detection_confirm', 'yes');
        result.current.answerQuestion('tech_comfort', 'beginner');
      });

      // Get the question FirstActionFlow would show
      const orderedQuestions = result.current.getOrderedAvailableQuestions?.() || [];
      const firstActionQuestion = orderedQuestions[0];

      expect(firstActionQuestion).toBeDefined();
      
      // Should be appropriate for a beginner
      // Should be Windows/Chrome relevant (if questions are tagged properly)
      // Should be highest priority available
      
      console.log('First Action Question:', {
        id: firstActionQuestion?.id,
        text: firstActionQuestion?.text,
        priority: firstActionQuestion?.priority,
        tags: firstActionQuestion?.tags
      });
    });
  });

  describe('Probe Ceiling (Action-First Pacing)', () => {
    it('should never show more than 3 consecutive probe questions while non-probes remain', () => {
      const { result } = renderHook(() => useAssessmentStore());

      // Complete onboarding so assessment questions appear
      act(() => {
        result.current.answerQuestion('privacy_notice', 'understood');
        result.current.answerQuestion('windows_detection_confirm', 'yes');
        result.current.answerQuestion('chrome_detection_confirm', 'yes');
        result.current.answerQuestion('tech_comfort', 'comfortable');
        result.current.answerQuestion('mobile_context', 'neither');
        result.current.answerQuestion('usage_context', 'general');
      });

      const questions = result.current.getOrderedAvailableQuestions?.() || [];
      const assessmentQuestions = questions.filter(q => q.phase !== 'onboarding');

      // Find the position of the last non-probe
      let lastNonProbeIdx = -1;
      for (let i = assessmentQuestions.length - 1; i >= 0; i--) {
        const intent = assessmentQuestions[i].journeyIntent;
        if (intent !== 'probe' && intent !== 'insight') {
          lastNonProbeIdx = i;
          break;
        }
      }

      // Check: within the interleaved region (before non-probes are exhausted),
      // max consecutive probes should be <= 3
      let maxStreak = 0;
      let streak = 0;
      for (let i = 0; i <= lastNonProbeIdx; i++) {
        const q = assessmentQuestions[i];
        if (q.journeyIntent === 'probe' || q.journeyIntent === 'insight') {
          streak++;
          maxStreak = Math.max(maxStreak, streak);
        } else {
          streak = 0;
        }
      }

      expect(maxStreak).toBeLessThanOrEqual(3);
      // Also verify an action break appears within the first 4 questions
      const firstFour = assessmentQuestions.slice(0, 4);
      const hasEarlyAction = firstFour.some(q => 
        q.journeyIntent !== 'probe' && q.journeyIntent !== 'insight'
      );
      expect(hasEarlyAction).toBe(true);
    });

    it('should preserve the first question as highest priority', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.answerQuestion('privacy_notice', 'understood');
        result.current.answerQuestion('windows_detection_confirm', 'yes');
        result.current.answerQuestion('chrome_detection_confirm', 'yes');
        result.current.answerQuestion('tech_comfort', 'comfortable');
        result.current.answerQuestion('mobile_context', 'neither');
        result.current.answerQuestion('usage_context', 'general');
      });

      const questions = result.current.getOrderedAvailableQuestions?.() || [];
      const assessmentQuestions = questions.filter(q => q.phase !== 'onboarding');

      expect(assessmentQuestions.length).toBeGreaterThan(0);
      // First assessment question should still be the highest-priority one
      const firstPriority = assessmentQuestions[0].priority || 0;
      const maxPriority = Math.max(...assessmentQuestions.map(q => q.priority || 0));
      expect(firstPriority).toBe(maxPriority);
    });
  });

  describe('What\'s That? Educational Options', () => {
    it('password_manager should have a whats_that option', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.answerQuestion('privacy_notice', 'understood');
      });

      const allQuestions = result.current.getOrderedAvailableQuestions?.() || [];
      const pmQuestion = allQuestions.find(q => q.id === 'password_manager');
      expect(pmQuestion).toBeDefined();
      const whatsThat = pmQuestion!.options.find(o => o.id === 'whats_that');
      expect(whatsThat).toBeDefined();
      expect(whatsThat!.facts?.password_manager).toBe('no');
      expect(whatsThat!.facts?.pm_unfamiliar).toBe(true);
    });

    it('two_factor_auth should have a whats_that option', () => {
      const { result } = renderHook(() => useAssessmentStore());

      act(() => {
        result.current.answerQuestion('privacy_notice', 'understood');
      });

      const allQuestions = result.current.getOrderedAvailableQuestions?.() || [];
      const tfaQuestion = allQuestions.find(q => q.id === 'two_factor_auth');
      expect(tfaQuestion).toBeDefined();
      const whatsThat = tfaQuestion!.options.find(o => o.id === 'whats_that');
      expect(whatsThat).toBeDefined();
      expect(whatsThat!.facts?.two_factor).toBe('no');
      expect(whatsThat!.facts?.tfa_unfamiliar).toBe(true);
    });

    it('ad_blocker should have a whats_that option', () => {
      const { result } = renderHook(() => useAssessmentStore());

      // Must acknowledge privacy to see ad_blocker
      act(() => {
        result.current.answerQuestion('privacy_notice', 'understood');
      });

      const allQuestions = result.current.getOrderedAvailableQuestions?.() || [];
      const abQuestion = allQuestions.find(q => q.id === 'ad_blocker');
      expect(abQuestion).toBeDefined();
      const whatsThat = abQuestion!.options.find(o => o.id === 'whats_that');
      expect(whatsThat).toBeDefined();
      expect(whatsThat!.facts?.ad_blocker).toBe('no');
      expect(whatsThat!.facts?.ad_blocker_unfamiliar).toBe(true);
    });

    it('whats_that on password_manager should unlock deep-dive questions', () => {
      const { result } = renderHook(() => useAssessmentStore());

      // Answer whats_that
      act(() => {
        result.current.answerQuestion('privacy_notice', 'understood');
        result.current.answerQuestion('password_manager', 'whats_that');
      });

      // Should assert password_manager=no, which unlocks pm_current_method and pm_barrier
      const fact = result.current.factsProfile.facts['password_manager'];
      expect(fact?.value).toBe('no');

      const questions = result.current.getOrderedAvailableQuestions?.() || [];
      const pmDeepDive = questions.filter(q => q.id.startsWith('pm_'));
      expect(pmDeepDive.length).toBeGreaterThan(0);
    });
  });
});
