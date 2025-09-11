// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { useAssessmentStore, initializeStore } from '../features/assessment/state/store';

describe('Full OS Detection Flow Debug', () => {
  it('should hide os_selection after windows confirmation', () => {
    // Initialize the store with device detection
    initializeStore();
    const store = useAssessmentStore.getState();
    
    
    
    const visibleQuestionsBefore = store.getVisibleQuestionIds();
    const hasWindowsBefore = visibleQuestionsBefore.includes('windows_detection_confirm');
    const hasOSSelectionBefore = visibleQuestionsBefore.includes('os_selection');
    
    
    
    
    // Now simulate user confirming Windows
    
    store.answerQuestion('windows_detection_confirm', 'yes');
    
    
    
    const visibleQuestionsAfter = store.getVisibleQuestionIds();
    const hasWindowsAfter = visibleQuestionsAfter.includes('windows_detection_confirm');
    const hasOSSelectionAfter = visibleQuestionsAfter.includes('os_selection');
    
    
    
    
    // Check facts after confirmation
    
    const allFacts = store.factsActions.getFacts();
    
    
    const osConfirmedFact = store.factsActions.getFact('os_confirmed');
    const osFact = store.factsActions.getFact('os');
    
    
    
    expect(hasWindowsBefore).toBe(true);
    expect(hasOSSelectionBefore).toBe(true);
    expect(hasOSSelectionAfter).toBe(false); // Should be hidden after confirmation
  });
});
