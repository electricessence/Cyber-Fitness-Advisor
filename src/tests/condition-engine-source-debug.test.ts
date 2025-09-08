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
    console.log('Condition Engine:', !!conditionEngine);
    
    // Access the private questions array if possible
    const questions = (conditionEngine as any).questions;
    const suites = (conditionEngine as any).suites;
    
    console.log('Engine Questions Count:', questions?.length || 0);
    console.log('Engine Questions Sample:', questions?.slice(0, 5).map((q: any) => q.id) || []);
    console.log('Engine Suites Count:', suites?.length || 0);
    
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
    
    console.log('Bank Questions Count:', bankQuestions.length);
    console.log('Bank Questions:', bankQuestions);
    
    // Check overlap
    const engineIds = questions?.map((q: any) => q.id) || [];
    const overlap = bankQuestions.filter((id: string) => engineIds.includes(id));
    const onlyInEngine = engineIds.filter((id: string) => !bankQuestions.includes(id));
    const onlyInBank = bankQuestions.filter((id: string) => !engineIds.includes(id));
    
    console.log('Overlap:', overlap.length);
    console.log('Only in engine:', onlyInEngine.slice(0, 10));
    console.log('Only in bank:', onlyInBank);
    
    // This test always passes - we just want the debug output
    expect(true).toBe(true);
  });
});
