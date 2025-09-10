/**
 * Debug Test: Facts-Based Conditional Logic
 * 
 * This test examines why include/exclude conditions aren't working
 * by tracing through the condition evaluation process.
 */

import { describe, it } from 'vitest';
import { useAssessmentStore } from '../features/assessment/state/store';

describe('Facts Conditional Logic Debug', () => {
  it('should trace why os_selection question remains visible after Windows confirmation', () => {
    const store = useAssessmentStore.getState();
    
    console.log('\n=== FACTS CONDITION DEBUG ===');
    
    // Initial state - should show os_selection
    const initialVisible = store.getVisibleQuestionIds();
    console.log('Initial visible questions:', initialVisible);
    console.log('Initial facts:', Object.keys(store.factsProfile.facts));
    
    // Find the os_selection question
    const osSelectionQuestion = store.questionBank.domains[0].levels[0].questions
      .find((q: any) => q.id === 'os_selection');
    console.log('OS Selection Question conditions:', osSelectionQuestion?.conditions);
    
    console.log('All question IDs in bank:', store.questionBank.domains[0].levels[0].questions.map((q: any) => q.id));
    
    // Find the os_detection_windows question
    const osDetectionQuestion = store.questionBank.domains[0].levels[0].questions
      .find((q: any) => q.id === 'os_detection');
    
    if (osDetectionQuestion) {
      // Answer "Yes" to Windows detection
      const yesOption = osDetectionQuestion.options.find((o: any) => o.id === 'yes');
      console.log('Windows detection "Yes" option facts:', yesOption?.facts);
      
      // Submit the answer using the correct store method
      store.answerQuestion(osDetectionQuestion.id, 'yes');
      
      console.log('Facts after Windows confirmation:', Object.keys(store.factsProfile.facts));
      console.log('Facts values:', store.factsProfile.facts);
      
      // Check visibility again
      const afterVisible = store.getVisibleQuestionIds();
      console.log('Visible questions after Windows confirmation:', afterVisible);
      
      // The os_selection question should now be hidden since exclude: { "os.confirmed": true }
      const isOsSelectionVisible = afterVisible.includes('os_selection');
      console.log('Is os_selection still visible?', isOsSelectionVisible);
      
      if (isOsSelectionVisible) {
        console.log('❌ BUG: os_selection should be hidden but is still visible');
        console.log('Expected: os.confirmed = true should exclude os_selection');
        console.log('Actual: include/exclude conditions not being evaluated');
      } else {
        console.log('✅ CORRECT: os_selection is properly hidden');
      }
    }
  });
});
