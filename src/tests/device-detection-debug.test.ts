import { describe, it, expect, beforeEach } from 'vitest';
import { useAssessmentStore, initializeStore } from '../features/assessment/state/store';

describe('Device Detection Facts Debug', () => {
  beforeEach(() => {
    // Reset facts before each test
    useAssessmentStore.getState().factsActions.resetFacts();
  });

  it('should properly initialize device detection facts', () => {
    console.log('=== BEFORE INITIALIZATION ===');
    const beforeStore = useAssessmentStore.getState();
    console.log('Facts before:', Object.keys(beforeStore.factsProfile.facts));
    
    // Initialize the store (this should set device detection facts)
    initializeStore();
    
    console.log('=== AFTER INITIALIZATION ===');
    const afterStore = useAssessmentStore.getState();
    console.log('Facts after:', Object.keys(afterStore.factsProfile.facts));
    
    // Check if device facts were set
    const osFact = afterStore.factsActions.getFact('os_detected');
    const browserFact = afterStore.factsActions.getFact('browser_detected');
    const deviceTypeFact = afterStore.factsActions.getFact('device_type');
    
    console.log('OS Fact:', osFact);
    console.log('Browser Fact:', browserFact);
    console.log('Device Type Fact:', deviceTypeFact);
    
    // Test fact values
    console.log('Has Windows fact?', afterStore.factsActions.hasFactValue('os_detected', 'windows'));
    console.log('Has Mac fact?', afterStore.factsActions.hasFactValue('os_detected', 'mac'));
    
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
    console.log('=== VISIBLE QUESTIONS AFTER DEVICE DETECTION ===');
    console.log('Count:', visibleQuestions.length);
    console.log('Full list:');
    visibleQuestions.forEach((id, index) => {
      console.log(`${index + 1}: ${id}`);
    });
    console.log('===============================');
    
    // Check if we have device-specific questions
    const hasWindowsConfirm = visibleQuestions.includes('windows_detection_confirm');
    const hasMacConfirm = visibleQuestions.includes('mac_detection_confirm');
    const hasOsSelection = visibleQuestions.includes('os_selection');
    
    console.log('Has windows_detection_confirm?', hasWindowsConfirm);
    console.log('Has mac_detection_confirm?', hasMacConfirm);
    console.log('Has os_selection (fallback)?', hasOsSelection);
    
    // We should either have device-specific confirmation OR fallback selection
    expect(hasWindowsConfirm || hasMacConfirm || hasOsSelection).toBe(true);
  });
});
