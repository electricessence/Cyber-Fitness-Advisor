import { describe, it, expect, beforeEach } from 'vitest';
import { useAssessmentStore, initializeStore } from '../features/assessment/state/store';

describe('Device Detection Facts Debug', () => {
  beforeEach(() => {
    // Reset facts before each test
    useAssessmentStore.getState().factsActions.resetFacts();
  });

  it('should properly initialize device detection facts', () => {
    
    const beforeStore = useAssessmentStore.getState();
    
    
    // Initialize the store (this should set device detection facts)
    initializeStore();
    
    
    const afterStore = useAssessmentStore.getState();
    
    
    // Check if device facts were set
    const osFact = afterStore.factsActions.getFact('os_detected');
    const browserFact = afterStore.factsActions.getFact('browser_detected');
    const deviceTypeFact = afterStore.factsActions.getFact('device_type');
    
    
    
    
    
    // Test fact values
    
    
    
    expect(osFact).toBeTruthy();
    expect(browserFact).toBeTruthy();
    expect(deviceTypeFact).toBeTruthy();
  });

  it('should show conditional questions based on device detection', () => {
    // Initialize store with device facts
    initializeStore();
    
    const store = useAssessmentStore.getState();
    
    // Get visible questions
    const visibleQuestions = store.getVisibleQuestionIds();
    
    
    
    visibleQuestions.forEach((id, index) => {
      
    });
    
    
    // Check if we have device-specific questions
    const hasWindowsConfirm = visibleQuestions.includes('windows_detection_confirm');
    const hasMacConfirm = visibleQuestions.includes('mac_detection_confirm');
    const hasOsSelection = visibleQuestions.includes('os_selection');
    
    
    
    
    
    // We should either have device-specific confirmation OR fallback selection
    expect(hasWindowsConfirm || hasMacConfirm || hasOsSelection).toBe(true);
  });
});
