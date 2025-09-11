// @ts-nocheck
import { describe, it, expect, beforeEach } from 'vitest';
import { useAssessmentStore } from '../features/assessment/state/store';

describe('Simple Visibility Debug', () => {
  beforeEach(() => {
    useAssessmentStore.getState().resetAssessment();
  });

  it('should show exact getVisibleQuestionIds output', () => {
    const store = useAssessmentStore.getState();
    
    const visibleIds = store.getVisibleQuestionIds();
    
    
    
    visibleIds.forEach((id, index) => {
      
    });
    
    
    expect(visibleIds.length).toBeGreaterThan(0);
  });
});
