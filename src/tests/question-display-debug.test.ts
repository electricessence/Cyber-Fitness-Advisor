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
    console.log('Visible Question IDs (condition engine):', visibleQuestionIds.length, visibleQuestionIds.slice(0, 5));
    
    // Get available questions from store method
    const availableQuestions = store.getAvailableQuestions();
    console.log('Available Questions (store method):', availableQuestions.length, availableQuestions.slice(0, 3).map((q: any) => q.id));
    
    // Let's examine the question bank structure
    const questionBank = store.questionBank;
    console.log('Question Bank Structure:');
    console.log('- Domains:', questionBank.domains.length);
    console.log('- Suites:', questionBank.suites?.length || 0);
    
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
    
    console.log('All Question IDs in bank:', allQuestionIds.length, allQuestionIds.slice(0, 5));
    
    // Find the mismatch
    const missingFromBank = visibleQuestionIds.filter((id: string) => !allQuestionIds.includes(id));
    const notVisible = allQuestionIds.filter((id: string) => !visibleQuestionIds.includes(id));
    
    console.log('Missing from question bank:', missingFromBank.slice(0, 5));
    console.log('In bank but not visible:', notVisible.slice(0, 5));
    
    // This test is just for debugging - we expect there to be some issues to identify
    expect(visibleQuestionIds.length).toBeGreaterThan(0);
    expect(allQuestionIds.length).toBeGreaterThan(0);
  });
});
