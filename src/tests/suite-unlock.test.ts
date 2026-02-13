/**
 * Test to verify condition-based question visibility
 * Replaces suite-unlock tests — advanced_2fa is now gated by declarative conditions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAssessmentStore } from '../features/assessment/state/store';

describe('Condition-Based Question Visibility', () => {
  beforeEach(() => {
    // Reset store before each test
    useAssessmentStore.getState().resetAssessment();
  });

  it('should show advanced_2fa when both fact conditions are met', () => {
    const store = useAssessmentStore.getState();
    
    // Initially advanced_2fa should not be visible (requires password_manager + updates facts)
    const initialVisible = store.getVisibleQuestionIds();
    expect(initialVisible).not.toContain('advanced_2fa');
    
    // Answer first question — password_manager=yes sets fact password_manager='yes'
    store.answerQuestion('password_manager', 'yes');
    
    // Still not visible (needs both conditions)
    const afterFirstAnswer = useAssessmentStore.getState().getVisibleQuestionIds();
    expect(afterFirstAnswer).not.toContain('advanced_2fa');
    
    // Answer second question — software_updates=automatic sets fact updates='automatic'
    store.answerQuestion('software_updates', 'automatic');
    
    // Now both conditions met → advanced_2fa should be visible
    const afterBothAnswered = useAssessmentStore.getState().getVisibleQuestionIds();
    expect(afterBothAnswered).toContain('advanced_2fa');
  });

  it('should not show advanced_2fa when only one condition is met', () => {
    const store = useAssessmentStore.getState();
    
    // Answer only password_manager
    store.answerQuestion('password_manager', 'yes');
    
    const visibleIds = useAssessmentStore.getState().getVisibleQuestionIds();
    expect(visibleIds).not.toContain('advanced_2fa');
  });

  it('should not show advanced_2fa when conditions have wrong values', () => {
    const store = useAssessmentStore.getState();
    
    // Answer questions with values that don't meet conditions
    store.answerQuestion('password_manager', 'no');
    store.answerQuestion('software_updates', 'manual');
    
    const visibleIds = useAssessmentStore.getState().getVisibleQuestionIds();
    expect(visibleIds).not.toContain('advanced_2fa');
  });
});
