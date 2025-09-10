import { describe, it, expect, beforeEach } from 'vitest';
import { useAssessmentStore } from '../features/assessment/state/store';

describe('Condition Engine Data Source Debug', () => {
  beforeEach(() => {
    useAssessmentStore.getState().resetAssessment();
  });

  it('should trace condition engine data source', () => {
    const store = useAssessmentStore.getState();
    
    // Get the raw condition engine
    const conditionEngine = (store as any).conditionEngine;
    
    
    // Access the private questions array if possible
    const questions = (conditionEngine as any).questions;
    const suites = (conditionEngine as any).suites;
    
    
    
    
    
    // Compare with question bank
    const questionBank = store.questionBank;
    const bankQuestions: string[] = [];
    questionBank.domains.forEach((domain: any) => {
      domain.levels.forEach((level: any) => {
        level.questions.forEach((question: any) => {
          bankQuestions.push(question.id);
        });
      });
    });
    
    
    
    
    // Check overlap
    const engineIds = questions?.map((q: any) => q.id) || [];
    const overlap = bankQuestions.filter((id: string) => engineIds.includes(id));
    const onlyInEngine = engineIds.filter((id: string) => !bankQuestions.includes(id));
    const onlyInBank = bankQuestions.filter((id: string) => !engineIds.includes(id));
    
    
    
    
    
    // This test always passes - we just want the debug output
    expect(true).toBe(true);
  });
});
