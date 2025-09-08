/**
 * Test to demonstrate suite unlocking functionality
 * Phase 2.3 verification
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAssessmentStore } from '../state/store';

describe('Suite Unlocking Integration', () => {
  beforeEach(() => {
    // Reset store before each test
    useAssessmentStore.getState().resetAssessment();
  });

  it('should unlock advanced_security suite when both gates conditions are met', () => {
    const store = useAssessmentStore.getState();
    
    // Initially no suites should be unlocked
    const initialSuites = store.getUnlockedSuiteIds();
    expect(initialSuites).toEqual([]);
    
    // Answer first question - should not unlock suite yet
    store.answerQuestion('lock_screen', 'yes');
    
    const afterFirstAnswer = store.getUnlockedSuiteIds();
    expect(afterFirstAnswer).toEqual([]);
    
    // Answer second question - should unlock the suite
    store.answerQuestion('browser_passwords', 'yes');
    
    const afterSecondAnswer = store.getUnlockedSuiteIds();
    expect(afterSecondAnswer).toContain('advanced_security');
  });

  it('should not unlock suite if only one condition is met', () => {
    const store = useAssessmentStore.getState();
    
    // Answer only one of the required questions
    store.answerQuestion('lock_screen', 'yes');
    
    const unlockedSuites = store.getUnlockedSuiteIds();
    expect(unlockedSuites).toEqual([]);
  });

  it('should not unlock suite if conditions are not met', () => {
    const store = useAssessmentStore.getState();
    
    // Answer questions with values that don't meet the gate conditions
    store.answerQuestion('lock_screen', 'no');
    store.answerQuestion('browser_passwords', 'no');
    
    const unlockedSuites = store.getUnlockedSuiteIds();
    expect(unlockedSuites).toEqual([]);
  });

  it('should show suite questions once unlocked', () => {
    const store = useAssessmentStore.getState();
    
    // Initially advanced_2fa should not be visible (it's in the suite)
    const initialVisible = store.getVisibleQuestionIds();
    expect(initialVisible).not.toContain('advanced_2fa');
    
    // Unlock the suite
    store.answerQuestion('lock_screen', 'yes');
    store.answerQuestion('browser_passwords', 'yes');
    
    // Now the suite question should be visible
    const afterUnlock = store.getVisibleQuestionIds();
    expect(afterUnlock).toContain('advanced_2fa');
  });
});
