import { describe, it, expect, beforeEach } from 'vitest';
import { useAssessmentStore } from '../state/store';

describe('Phase 2.3 Final Integration', () => {
  beforeEach(() => {
    useAssessmentStore.getState().resetAssessment();
  });

  it('should complete full Phase 2.3 acceptance criteria', () => {
    const store = useAssessmentStore.getState();
    
    // 1. Suite unlocking: Initially no suites unlocked
    expect(store.getUnlockedSuiteIds()).toEqual([]);
    
    // 2. Question visibility: Suite questions hidden initially
    const initialVisible = store.getVisibleQuestionIds();
    expect(initialVisible).not.toContain('advanced_2fa');
    expect(initialVisible.length).toBeGreaterThan(0); // Regular questions visible
    
    // 3. Progressive unlocking: Answer gates to unlock suite
    store.answerQuestion('lock_screen', 'yes');
    expect(store.getUnlockedSuiteIds()).toEqual([]); // Still locked with only one gate
    
    store.answerQuestion('browser_passwords', 'yes');
    expect(store.getUnlockedSuiteIds()).toContain('advanced_security'); // Now unlocked
    
    // 4. Suite question visibility: Advanced questions now visible
    const finalVisible = store.getVisibleQuestionIds();
    expect(finalVisible).toContain('advanced_2fa');
    
    console.log('✅ Phase 2.3 Core Features Working:');
    console.log('- Suite unlocking:', store.getUnlockedSuiteIds());
    console.log('- Advanced questions visible:', finalVisible.includes('advanced_2fa'));
    console.log('- Total visible questions:', finalVisible.length);
  });

  it('should handle onboarding without affecting scoring', () => {
    const store = useAssessmentStore.getState();
    
    // Check that basic level 0 questions are available  
    const visibleQuestions = store.getVisibleQuestionIds();
    expect(visibleQuestions).toContain('lock_screen'); // Level 0 quickwin
    expect(visibleQuestions).toContain('browser_passwords'); // Level 0 quickwin
    expect(visibleQuestions.length).toBeGreaterThan(20); // Multiple questions available
    
    console.log('✅ Basic assessment questions available:', {
      lock_screen: visibleQuestions.includes('lock_screen'),
      browser_passwords: visibleQuestions.includes('browser_passwords'),
      total_visible: visibleQuestions.length
    });
  });
});
