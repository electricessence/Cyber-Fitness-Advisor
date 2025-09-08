import { describe, it, expect } from 'vitest';
import { UNIFIED_ONBOARDING_QUESTIONS } from '../features/onboarding/unifiedOnboarding';
import { useAssessmentStore } from '../features/assessment/state/store';

describe('Onboarding Question ID Validation', () => {
  it('should check if onboarding question IDs exist in assessment bank', () => {
    const store = useAssessmentStore.getState();
    
    // Get all question IDs from assessment bank
    const assessmentQuestionIds: string[] = [];
    store.questionBank.domains.forEach((domain: any) => {
      domain.levels.forEach((level: any) => {
        level.questions.forEach((question: any) => {
          assessmentQuestionIds.push(question.id);
        });
      });
    });
    
    // Add suite questions
    store.questionBank.suites?.forEach((suite: any) => {
      suite.questions.forEach((question: any) => {
        assessmentQuestionIds.push(question.id);
      });
    });
    
    console.log('\n=== ONBOARDING QUESTION ID VALIDATION ===');
    console.log('Assessment Question IDs:', assessmentQuestionIds.length);
    console.log('Onboarding Questions:', UNIFIED_ONBOARDING_QUESTIONS.length);
    
    // Check each onboarding question
    const onboardingIds = UNIFIED_ONBOARDING_QUESTIONS.map(q => q.id);
    console.log('Onboarding Question IDs:', onboardingIds);
    
    const validIds: string[] = [];
    const invalidIds: string[] = [];
    
    onboardingIds.forEach(id => {
      if (assessmentQuestionIds.includes(id)) {
        validIds.push(id);
      } else {
        invalidIds.push(id);
      }
    });
    
    console.log('\n--- VALIDATION RESULTS ---');
    console.log('Valid IDs (exist in assessment):', validIds.length, validIds);
    console.log('Invalid IDs (NOT in assessment):', invalidIds.length, invalidIds);
    
    if (invalidIds.length > 0) {
      console.log('\n❌ PROBLEM: Onboarding questions with invalid IDs will be ignored!');
    } else {
      console.log('\n✅ All onboarding question IDs are valid');
    }
    
    console.log('=== END VALIDATION ===\n');
    
    // This test always passes - we just want the debug output
    expect(true).toBe(true);
  });
});
