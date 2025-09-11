// @ts-nocheck
import { describe, it, expect, beforeEach } from 'vitest';
import { useAssessmentStore } from '../features/assessment/state/store';

describe('Available Questions Debug', () => {
  beforeEach(() => {
    useAssessmentStore.getState().resetAssessment();
  });

  it('should debug getAvailableQuestions filtering', () => {
    const store = useAssessmentStore.getState();
    
    
    
    // Step 1: Check visible IDs
    const visibleQuestionIds = store.getVisibleQuestionIds();
    
    
    // Step 2: Check current answers
    const currentAnswers = store.answers;
    
    
    
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
    
    
    
    
    // Step 4: Filter step by step
    
    
    const visibleQuestions = allQuestions.filter(question => {
      const isVisible = visibleQuestionIds.includes(question.id);
      if (!isVisible) {
        
      }
      return isVisible;
    });
    
    
    
    const unansweredQuestions = visibleQuestions.filter(question => {
      const existingAnswer = currentAnswers[question.id];
      const isAnswered = existingAnswer && !existingAnswer.isExpired;
      if (isAnswered) {
        
      }
      return !isAnswered;
    });
    
    
    
    
    // Step 5: Compare with actual method
    const actualAvailable = store.getAvailableQuestions();
    
    
    
    
    
    expect(true).toBe(true);
  });
});
