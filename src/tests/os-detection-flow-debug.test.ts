// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { useAssessmentStore, initializeStore } from '../features/assessment/state/store';

describe('Full OS Detection Flow Debug', () => {
  it('should show windows confirmation and hide after confirming', () => {
    // Initialize the store with device detection (Windows detected)
    initializeStore();
    const store = useAssessmentStore.getState();
    
    // Check initial state - Windows detected, so confirmation should appear
    // but manual OS selection should NOT appear (since OS was detected)
    const visibleQuestionsBefore = store.getVisibleQuestionIds();
    const hasWindowsBefore = visibleQuestionsBefore.includes('windows_detection_confirm');
    const hasOSSelectionBefore = visibleQuestionsBefore.includes('os_selection');
    
    // When OS is detected, we should see:
    // - windows_detection_confirm: YES (because os_detected=windows, os_confirmed=false)
    // - os_selection: NO (because os_detected exists, which excludes manual selection)
    expect(hasWindowsBefore).toBe(true);
    expect(hasOSSelectionBefore).toBe(false); // Manual selection excluded when OS detected
    
    // Now simulate user confirming Windows
    store.answerQuestion('windows_detection_confirm', 'yes');
    
    // After confirmation, check that detection question is hidden
    const visibleQuestionsAfter = store.getVisibleQuestionIds();
    const hasWindowsAfter = visibleQuestionsAfter.includes('windows_detection_confirm');
    const hasOSSelectionAfter = visibleQuestionsAfter.includes('os_selection');
    
    // After confirmation:
    // - windows_detection_confirm: NO (because os_confirmed=true now)
    // - os_selection: NO (still excluded because os_detected exists)
    expect(hasWindowsAfter).toBe(false); // Hidden after confirmation
    expect(hasOSSelectionAfter).toBe(false); // Still excluded (OS was detected)
    
    // Check facts after confirmation
    const osConfirmedFact = store.factsActions.getFact('os_confirmed');
    const osFact = store.factsActions.getFact('os');
    
    expect(osConfirmedFact?.value).toBe(true);
    expect(osFact?.value).toBe('windows');
  });
});
