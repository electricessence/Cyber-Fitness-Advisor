import { describe, it, expect, beforeEach } from 'vitest';
import { useAssessmentStore } from '../features/assessment/state/store';

describe('Available Questions Debug', () => {
  beforeEach(() => {
    useAssessmentStore.getState().resetAssessment();
  });

  it('should debug getAvailableQuestions filtering', () => {
    const store = useAssessmentStore.getState();
    
    console.log('\n=== AVAILABLE QUESTIONS DEBUGGING ===');
    
    // Step 1: Check visible IDs
    const visibleQuestionIds = store.getVisibleQuestionIds();
    console.log('Visible Question IDs:', visibleQuestionIds.length);
    
    // Step 2: Check current answers
    const currentAnswers = store.answers;
    console.log('Current Answers Count:', Object.keys(currentAnswers).length);
    console.log('Current Answers:', Object.keys(currentAnswers));
    
    // Step 3: Get all questions from question bank
    const questionBank = store.questionBank;
    const allQuestions: any[] = [];
    
    questionBank.domains.forEach((domain: any) => {
      domain.levels.forEach((level: any) => {
        level.questions.forEach((question: any) => {
          allQuestions.push(question);
        });
      });
    });
    
    // Add suite questions
    questionBank.suites?.forEach((suite: any) => {
      suite.questions.forEach((question: any) => {
        allQuestions.push(question);
      });
    });
    
    console.log('All Questions in Bank:', allQuestions.length);
    console.log('All Question IDs:', allQuestions.map(q => q.id));
    
    // Step 4: Filter step by step
    console.log('\n--- Filtering Process ---');
    
    const visibleQuestions = allQuestions.filter(question => {
      const isVisible = visibleQuestionIds.includes(question.id);
      if (!isVisible) {
        console.log(`FILTERED OUT (not visible): ${question.id}`);
      }
      return isVisible;
    });
    
    console.log('After visibility filter:', visibleQuestions.length);
    
    const unansweredQuestions = visibleQuestions.filter(question => {
      const existingAnswer = currentAnswers[question.id];
      const isAnswered = existingAnswer && !existingAnswer.isExpired;
      if (isAnswered) {
        console.log(`FILTERED OUT (answered): ${question.id}`);
      }
      return !isAnswered;
    });
    
    console.log('After answer filter:', unansweredQuestions.length);
    console.log('Final available IDs:', unansweredQuestions.map(q => q.id));
    
    // Step 5: Compare with actual method
    const actualAvailable = store.getAvailableQuestions();
    console.log('Actual method result:', actualAvailable.length);
    console.log('Actual method IDs:', actualAvailable.map((q: any) => q.id));
    
    console.log('=== END DEBUG ===\n');
    
    expect(true).toBe(true);
  });
});
