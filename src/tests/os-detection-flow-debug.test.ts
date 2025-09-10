import { describe, it, expect } from 'vitest';
import { useAssessmentStore, initializeStore } from '../features/assessment/state/store';

describe('Full OS Detection Flow Debug', () => {
  it('should hide os_selection after windows confirmation', () => {
    // Initialize the store with device detection
    initializeStore();
    const store = useAssessmentStore.getState();
    
    console.log('\n=== BEFORE WINDOWS CONFIRMATION ===');
    
    const context1 = {
      answers: store.answers,
      facts: store.factsProfile.facts,
      deviceProfile: null,
      suiteContext: {}
    };
    
    const evaluation1 = store.conditionEngine.evaluate(context1);
    const hasWindowsBefore = evaluation1.visibleQuestionIds.includes('windows_detection_confirm');
    const hasOSSelectionBefore = evaluation1.visibleQuestionIds.includes('os_selection');
    
    console.log('Windows detection visible?', hasWindowsBefore);
    console.log('OS selection visible?', hasOSSelectionBefore);
    
    // Now simulate user confirming Windows
    console.log('\n=== CONFIRMING WINDOWS ===');
    store.answerQuestion('windows_detection_confirm', 'yes');
    
    console.log('\n=== AFTER WINDOWS CONFIRMATION ===');
    
    const context2 = {
      answers: store.answers,
      facts: store.factsProfile.facts,
      deviceProfile: null,
      suiteContext: {}
    };
    
    const evaluation2 = store.conditionEngine.evaluate(context2);
    const hasWindowsAfter = evaluation2.visibleQuestionIds.includes('windows_detection_confirm');
    const hasOSSelectionAfter = evaluation2.visibleQuestionIds.includes('os_selection');
    
    console.log('Windows detection visible?', hasWindowsAfter);
    console.log('OS selection visible?', hasOSSelectionAfter);
    
    // Check facts after confirmation
    console.log('\n=== DEBUGGING FACTS AFTER ANSWER ===');
    const allFacts = store.factsActions.getFacts();
    console.log('All facts after answer:', allFacts.map(f => ({ id: f.id, value: f.value })));
    
    const osConfirmedFact = store.factsActions.getFact('os_confirmed');
    const osFact = store.factsActions.getFact('os');
    console.log('OS confirmed fact:', osConfirmedFact?.value);
    console.log('OS fact:', osFact?.value);
    
    expect(hasWindowsBefore).toBe(true);
    expect(hasOSSelectionBefore).toBe(true);
    expect(hasOSSelectionAfter).toBe(false); // Should be hidden after confirmation
  });
});
