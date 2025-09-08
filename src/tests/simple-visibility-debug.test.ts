import { describe, it, expect, beforeEach } from 'vitest';
import { useAssessmentStore } from '../features/assessment/state/store';

describe('Simple Visibility Debug', () => {
  beforeEach(() => {
    useAssessmentStore.getState().resetAssessment();
  });

  it('should show exact getVisibleQuestionIds output', () => {
    const store = useAssessmentStore.getState();
    
    const visibleIds = store.getVisibleQuestionIds();
    console.log('\n=== VISIBLE QUESTION IDS ===');
    console.log('Count:', visibleIds.length);
    console.log('Full list:');
    visibleIds.forEach((id, index) => {
      console.log(`${index + 1}: ${id}`);
    });
    console.log('========================\n');
    
    expect(visibleIds.length).toBeGreaterThan(0);
  });
});
