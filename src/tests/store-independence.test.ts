import { describe, it, expect, beforeEach } from 'vitest';
import { useAssessmentStore } from '../features/assessment/state/store';

/**
 * Test Suite: Store Independence
 * 
 * Validates that the data store (questions, answers, facts) works completely
 * independently from any view components. The store should:
 * 1. Load questions correctly
 * 2. Process answers and generate facts
 * 3. Filter questions based on facts
 * 4. Be completely view-agnostic
 */
describe('Store Independence - Data Layer Only', () => {
  let store: ReturnType<typeof useAssessmentStore.getState>;

  beforeEach(() => {
    store = useAssessmentStore.getState();
    // Each test will handle its own reset as needed
  });

  it('should load question bank independently of view', () => {
    // The store should have questions loaded
    expect(store.questionBank).toBeDefined();
    expect(store.questionBank.domains).toBeDefined();
    expect(store.questionBank.domains.length).toBeGreaterThan(0);
    
    // Should find onboarding questions
    const allQuestions = store.questionBank.domains.flatMap(d => 
      d.levels.flatMap(l => l.questions)
    );
    const onboardingQuestions = allQuestions.filter(q => q.phase === 'onboarding');
    
    expect(onboardingQuestions.length).toBeGreaterThan(0);
    expect(onboardingQuestions.some(q => q.id === 'privacy_notice')).toBe(true);
  });

  it('should show privacy notice for fresh user (no facts)', () => {
    // Fresh user - no facts, no answers
    const availableQuestions = store.getAvailableQuestions();
    
    // Privacy notice should be available (no privacy_acknowledged fact exists)
    const privacyNotice = availableQuestions.find(q => q.id === 'privacy_notice');
    expect(privacyNotice).toBeDefined();
    expect(privacyNotice?.phase).toBe('onboarding');
  });

  it('should hide privacy notice after acknowledgment (fact-based filtering)', () => {
    // Reset to ensure clean state for this test
    store.resetAssessment();
    
    // First verify privacy notice is available for fresh user
    const initialQuestions = store.getAvailableQuestions();
    const initialPrivacyQuestion = initialQuestions.find(q => q.id === 'privacy_notice');
    expect(initialPrivacyQuestion).toBeDefined();
    
    // Manually inject the privacy_acknowledged fact to test filtering
    store.factsActions.injectFact('privacy_acknowledged', true, { 
      source: 'test',
      confidence: 1.0 
    });
    
    // Verify the fact was created
    const facts = store.factsActions.getFacts();
    const privacyFact = facts.find(f => f.id === 'privacy_acknowledged');
    expect(privacyFact).toBeDefined();
    expect(privacyFact?.value).toBe(true);
    
    // Verify privacy notice is now filtered out due to exclude condition
    const filteredQuestions = store.getAvailableQuestions();
    const privacyQuestion = filteredQuestions.find(q => q.id === 'privacy_notice');
    expect(privacyQuestion).toBeUndefined();
  });

  it('should show OS detection after privacy acknowledgment', () => {
    // Manually inject privacy acknowledgment fact
    store.factsActions.injectFact('privacy_acknowledged', true, { 
      source: 'test',
      confidence: 1.0 
    });
    
    // Should now show OS detection (since os_detected fact exists from device detection)
    const availableQuestions = store.getAvailableQuestions();
    const osDetection = availableQuestions.find(q => q.id === 'windows_detection_confirm');
    
    // This depends on device detection setting os_detected fact
    const facts = store.factsActions.getFacts();
    const osDetectedFact = facts.find(f => f.id === 'os_detected');
    if (osDetectedFact?.value === 'windows') {
      expect(osDetection).toBeDefined();
    }
  });

  it('should maintain fact consistency when importing external facts', () => {
    // Simulate importing facts from external source
    const externalFacts = {
      privacy_acknowledged: true,
      os_detected: 'windows',
      os_confirmed: true,
      browser_detected: 'chrome',
      browser_confirmed: true
    };

    // Import facts
    Object.entries(externalFacts).forEach(([key, value]) => {
      store.factsActions.injectFact(key, value, { source: 'import' });
    });

    // Questions should filter based on these facts
    const availableQuestions = store.getAvailableQuestions();
    
    // Privacy notice should be hidden
    expect(availableQuestions.find(q => q.id === 'privacy_notice')).toBeUndefined();
    
    // OS detection should be hidden (already confirmed)
    expect(availableQuestions.find(q => q.id === 'windows_detection_confirm')).toBeUndefined();
    
    // Should show next questions in flow
    expect(availableQuestions.length).toBeGreaterThan(0);
  });

  it('should be completely view-agnostic', () => {
    // Store should work without any view components
    // Test core methods that views would call
    
    const questions = store.getAvailableQuestions();
    const orderedQuestions = store.getOrderedAvailableQuestions?.() || [];
    const facts = store.factsActions.getFacts();
    
    expect(Array.isArray(questions)).toBe(true);
    expect(Array.isArray(orderedQuestions)).toBe(true);
    expect(Array.isArray(facts)).toBe(true);
    
    // Should be able to answer questions
    if (questions.length > 0) {
      const firstQuestion = questions[0];
      const firstOption = firstQuestion.options[0];
      
      // This should work without any view
      expect(() => {
        store.answerQuestion(firstQuestion.id, firstOption.id);
      }).not.toThrow();
    }
  });
});