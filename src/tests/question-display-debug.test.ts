import { describe, it, expect, beforeEach } from 'vitest';
import { useAssessmentStore } from '../features/assessment/state/store';

describe('Question Display Debug', () => {
  beforeEach(() => {
    useAssessmentStore.getState().resetAssessment();
  });

  it('should debug the question availability mismatch', () => {
    const store = useAssessmentStore.getState();
    
    // Get visible question IDs from condition engine
    const visibleQuestionIds = store.getVisibleQuestionIds();
    
    
    // Get available questions from store method
    const availableQuestions = store.getAvailableQuestions();
    
    
    // Let's examine the question bank structure
    const questionBank = store.questionBank;
    
    
    
    
    // Collect all question IDs from the question bank
    const allQuestionIds: string[] = [];
    questionBank.domains.forEach((domain: any) => {
      domain.levels.forEach((level: any) => {
        level.questions.forEach((question: any) => {
          allQuestionIds.push(question.id);
        });
      });
    });
    
    questionBank.suites?.forEach((suite: any) => {
      suite.questions.forEach((question: any) => {
        allQuestionIds.push(question.id);
      });
    });
    
    
    
    // Find the mismatch
    const missingFromBank = visibleQuestionIds.filter((id: string) => !allQuestionIds.includes(id));
    const notVisible = allQuestionIds.filter((id: string) => !visibleQuestionIds.includes(id));
    
    
    
    
    // This test is just for debugging - we expect there to be some issues to identify
    expect(visibleQuestionIds.length).toBeGreaterThan(0);
    expect(allQuestionIds.length).toBeGreaterThan(0);
  });
});
