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
    
    
    
    // Initial state - should show os_selection
    const initialVisible = store.getVisibleQuestionIds();
    
    
    
    // Find the os_selection question
    const osSelectionQuestion = store.questionBank.domains[0].levels[0].questions
      .find((q: any) => q.id === 'os_selection');
    
    
    
    
    // Find the os_detection_windows question
    const osDetectionQuestion = store.questionBank.domains[0].levels[0].questions
      .find((q: any) => q.id === 'os_detection');
    
    if (osDetectionQuestion) {
      // Answer "Yes" to Windows detection
      const yesOption = osDetectionQuestion.options.find((o: any) => o.id === 'yes');
      
      
      // Submit the answer using the correct store method
      store.answerQuestion(osDetectionQuestion.id, 'yes');
      
      
      
      
      // Check visibility again
      const afterVisible = store.getVisibleQuestionIds();
      
      
      // The os_selection question should now be hidden since exclude: { "os.confirmed": true }
      const isOsSelectionVisible = afterVisible.includes('os_selection');
      
      
      if (isOsSelectionVisible) {
        
        
        
      } else {
        
      }
    }
  });
});
