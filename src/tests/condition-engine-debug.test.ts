import { describe, it, expect } from 'vitest';
import { useAssessmentStore, initializeStore } from '../features/assessment/state/store';

describe('Condition Engine Facts Debug', () => {
  it('should properly evaluate conditions based on injected facts', () => {
    // Initialize the store with device detection
    initializeStore();
    const store = useAssessmentStore.getState();
    
    console.log('\n=== FACTS DEBUGGING ===');
    
    // Get all facts
    const allFacts = store.factsActions.getFacts();
    console.log('All facts:', allFacts.map(f => ({ id: f.id, value: f.value })));
    
    // Test specific fact checks
    const osDetectedFact = store.factsActions.getFact('os_detected');
    console.log('OS Detected Fact:', osDetectedFact);
    
    const hasWindowsFact = store.factsActions.hasFactValue('os_detected', 'windows');
    console.log('Has windows fact?', hasWindowsFact);
    
    // Get the windows detection question
    const windowsQuestion = store.questionBank.domains[0].levels[0].questions
      .find((q: any) => q.id === 'windows_detection_confirm');
    console.log('Windows detection question:', windowsQuestion ? 'FOUND' : 'NOT FOUND');
    if (windowsQuestion) {
      console.log('Windows question conditions:', windowsQuestion.conditions);
    }
    
    // Get the OS selection question
    const osSelectionQuestion = store.questionBank.domains[0].levels[0].questions
      .find((q: any) => q.id === 'os_selection');
    console.log('OS selection question:', osSelectionQuestion ? 'FOUND' : 'NOT FOUND');
    if (osSelectionQuestion) {
      console.log('OS selection conditions:', osSelectionQuestion.conditions);
    }
    
    // Test the condition engine directly
    console.log('\n=== CONDITION ENGINE TEST ===');
    const conditionEngine = store.conditionEngine;
    
    // Create evaluation context
    const context = {
      answers: store.answers,
      facts: store.factsProfile.facts,
      deviceProfile: null,
      suiteContext: {}
    };
    
    const evaluation = conditionEngine.evaluate(context);
    console.log('Visible question IDs:', evaluation.visibleQuestionIds);
    
    const hasWindowsDetection = evaluation.visibleQuestionIds.includes('windows_detection_confirm');
    const hasOSSelection = evaluation.visibleQuestionIds.includes('os_selection');
    
    console.log('Windows detection visible?', hasWindowsDetection);
    console.log('OS selection visible?', hasOSSelection);
    
    expect(hasWindowsFact).toBe(true);
  });
});
