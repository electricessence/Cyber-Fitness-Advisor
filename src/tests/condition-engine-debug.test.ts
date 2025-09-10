import { describe, it, expect } from 'vitest';
import { useAssessmentStore, initializeStore } from '../features/assessment/state/store';

describe('Condition Engine Facts Debug', () => {
  it('should properly evaluate conditions based on injected facts', () => {
    // Initialize the store with device detection
    initializeStore();
    const store = useAssessmentStore.getState();
    
    
    
    // Get all facts
    const allFacts = store.factsActions.getFacts();
    
    
    // Test specific fact checks
    const osDetectedFact = store.factsActions.getFact('os_detected');
    
    
    const hasWindowsFact = store.factsActions.hasFactValue('os_detected', 'windows');
    
    
    // Get the windows detection question
    const windowsQuestion = store.questionBank.domains[0].levels[0].questions
      .find((q: any) => q.id === 'windows_detection_confirm');
    
    if (windowsQuestion) {
      
    }
    
    // Get the OS selection question
    const osSelectionQuestion = store.questionBank.domains[0].levels[0].questions
      .find((q: any) => q.id === 'os_selection');
    
    if (osSelectionQuestion) {
      
    }
    
    // Test the condition engine directly
    
    const conditionEngine = store.conditionEngine;
    
    // Create evaluation context
    const context = {
      answers: store.answers,
      facts: store.factsProfile.facts,
      deviceProfile: null,
      suiteContext: {}
    };
    
    const evaluation = conditionEngine.evaluate(context);
    
    
    const hasWindowsDetection = evaluation.visibleQuestionIds.includes('windows_detection_confirm');
    const hasOSSelection = evaluation.visibleQuestionIds.includes('os_selection');
    
    
    
    
    expect(hasWindowsFact).toBe(true);
  });
});
