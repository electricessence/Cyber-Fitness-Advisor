/**
 * Predefined User Journeys
 * 
 * Collection of well-defined, testable user journeys for common workflows
 */

import { JourneyBuilder } from './journeyFramework';
import { useAssessmentStore } from '../features/assessment/state/store';
import { expect } from 'vitest';

/**
 * NEW USER ONBOARDING JOURNEY
 * Tests the complete flow from first visit to initial assessment completion
 */
export const newUserOnboardingJourney = JourneyBuilder
  .create('New User Onboarding')
  .description('A new user completes privacy notice, device detection, and first assessment questions')
  
  .step('User acknowledges privacy notice')
    .answerQuestion('privacy_notice', 'understood')
    .expectStoreState({ 
      answersCount: 1,
      hasAnswers: ['privacy_notice'] 
    })
    .then()
  
  .step('User confirms Windows device')
    .answerQuestion('windows_detection_confirm', 'yes')
    .expectStoreState({ 
      answersCount: 2,
      hasAnswers: ['privacy_notice', 'windows_detection_confirm']
    })
    .expectCustom(() => {
      // Should establish device facts
      const store = useAssessmentStore.getState();
      expect(Object.keys(store.answers)).toContain('windows_detection_confirm');
    })
    .then()
  
  .step('User indicates they use password manager')
    .answerQuestion('password_manager', 'yes')
    .expectStoreState({ 
      answersCount: 3,
      scoreRange: { min: 1, max: 50 } // Should have some score now
    })
    .then()
  
  .finalOutcome(
    'User has completed onboarding with basic security profile established',
    () => {
      const store = useAssessmentStore.getState();
      expect(Object.keys(store.answers)).toHaveLength(3);
      expect(store.overallScore).toBeGreaterThan(0);
      expect(store.deviceProfile).toBeDefined();
    }
  )
  .build();

/**
 * SECURITY ASSESSMENT JOURNEY
 * Tests a user completing multiple security questions across domains
 */
export const securityAssessmentJourney = JourneyBuilder
  .create('Security Assessment Completion')
  .description('User completes multiple security questions and sees score progression')
  
  .step('Setup: User has completed onboarding')
    .custom(async () => {
      // Pre-populate onboarding answers
      const store = useAssessmentStore.getState();
      store.answerQuestion('privacy_notice', 'understood');
      store.answerQuestion('windows_detection_confirm', 'yes');
    })
    .expectStoreState({ answersCount: 2 })
    .then()
  
  .step('User enables automatic Windows updates')
    .answerQuestion('windows_updates_automatic', 'yes')
    .expectStoreState({ 
      answersCount: 3,
      scoreRange: { min: 5, max: 100 }
    })
    .then()
  
  .step('User confirms antivirus is installed')
    .answerQuestion('windows_antivirus_installed', 'yes')
    .expectStoreState({ 
      answersCount: 4,
      scoreRange: { min: 10, max: 100 }
    })
    .then()
  
  .step('User indicates they use 2FA')
    .answerQuestion('two_factor_auth', 'yes')
    .expectStoreState({ 
      answersCount: 5,
      scoreRange: { min: 20, max: 100 }
    })
    .then()
  
  .finalOutcome(
    'User has improved security score through multiple good security practices',
    () => {
      const store = useAssessmentStore.getState();
      expect(store.overallScore).toBeGreaterThan(15);
      expect(Object.keys(store.answers)).toHaveLength(5);
      // Should have answers across multiple domains
      const domains = new Set(
        Object.values(store.answers).map(answer => answer.questionId.split('_')[0])
      );
      expect(domains.size).toBeGreaterThan(1);
    }
  )
  .build();

/**
 * POOR SECURITY REMEDIATION JOURNEY
 * Tests the flow when user has poor security practices and gets recommendations
 */
export const poorSecurityRemediationJourney = JourneyBuilder
  .create('Poor Security Remediation')
  .description('User with poor security practices gets targeted recommendations')
  
  .step('Setup: Basic onboarding')
    .custom(async () => {
      const store = useAssessmentStore.getState();
      store.answerQuestion('privacy_notice', 'understood');
      store.answerQuestion('windows_detection_confirm', 'yes');
    })
    .expectStoreState({ answersCount: 2 })
    .then()
  
  .step('User indicates they reuse passwords')
    .answerQuestion('password_manager', 'no')
    .expectStoreState({ 
      answersCount: 3,
      scoreRange: { min: 0, max: 10 } // Low score for poor practice
    })
    .then()
  
  .step('User has no antivirus')
    .answerQuestion('windows_antivirus_installed', 'no')
    .expectStoreState({ 
      answersCount: 4,
      scoreRange: { min: 0, max: 15 }
    })
    .then()
  
  .step('User does not use 2FA')
    .answerQuestion('two_factor_auth', 'no')
    .expectStoreState({ 
      answersCount: 5,
      scoreRange: { min: 0, max: 20 }
    })
    .then()
  
  .finalOutcome(
    'User has low security score and should receive targeted recommendations',
    () => {
      const store = useAssessmentStore.getState();
      expect(store.overallScore).toBeLessThan(25);
      
      // Should have recommendations for improvement
      const recommendations = store.getRecommendations();
      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Recommendations should prioritize critical security gaps
      const hasPasswordManagerRec = recommendations.some(rec => 
        rec.questionId.includes('password') || rec.text.toLowerCase().includes('password')
      );
      expect(hasPasswordManagerRec).toBe(true);
    }
  )
  .build();

/**
 * MOBILE USER JOURNEY
 * Tests device-specific flows for mobile users
 */
export const mobileUserJourney = JourneyBuilder
  .create('Mobile User Journey')
  .description('Mobile user completes device-specific security assessment')
  
  .step('User acknowledges privacy notice')
    .answerQuestion('privacy_notice', 'understood')
    .expectStoreState({ answersCount: 1 })
    .then()
  
  .step('User selects iPhone as device')
    .answerQuestion('ios_detection_confirm', 'yes')
    .expectStoreState({ 
      answersCount: 2,
      hasAnswers: ['privacy_notice', 'ios_detection_confirm']
    })
    .then()
  
  .step('User confirms they use device passcode')
    .answerQuestion('mobile_screen_lock', 'yes')
    .expectStoreState({ 
      answersCount: 3,
      scoreRange: { min: 5, max: 50 }
    })
    .then()
  
  .step('User has auto-updates enabled')
    .answerQuestion('ios_auto_updates', 'yes')
    .expectStoreState({ 
      answersCount: 4,
      scoreRange: { min: 10, max: 60 }
    })
    .then()
  
  .finalOutcome(
    'Mobile user has device-appropriate security assessment',
    () => {
      const store = useAssessmentStore.getState();
      expect(store.deviceProfile?.currentDevice?.os).toBe('ios');
      expect(store.overallScore).toBeGreaterThan(10);
      
      // Should have mobile-specific questions answered
      const mobileAnswers = Object.keys(store.answers).filter(id => 
        id.includes('ios') || id.includes('mobile')
      );
      expect(mobileAnswers.length).toBeGreaterThan(0);
    }
  )
  .build();

/**
 * EXPERT USER JOURNEY  
 * Tests advanced security features for tech-savvy users
 */
export const expertUserJourney = JourneyBuilder
  .create('Expert User Journey')
  .description('Advanced user completes sophisticated security assessment')
  
  .step('Setup: Complete basic onboarding as Windows user')
    .custom(async () => {
      const store = useAssessmentStore.getState();
      store.answerQuestion('privacy_notice', 'understood');
      store.answerQuestion('windows_detection_confirm', 'yes');
      store.answerQuestion('tech_comfort_level', 'advanced');
    })
    .expectStoreState({ answersCount: 3 })
    .then()
  
  .step('User has dedicated password manager')
    .answerQuestion('password_manager', 'yes')
    .expectStoreState({ scoreRange: { min: 10, max: 100 } })
    .then()
  
  .step('User uses hardware 2FA keys')
    .answerQuestion('two_factor_hardware', 'yes')
    .expectStoreState({ scoreRange: { min: 20, max: 100 } })
    .then()
  
  .step('User has full disk encryption enabled')
    .answerQuestion('disk_encryption', 'yes')
    .expectStoreState({ scoreRange: { min: 35, max: 100 } })
    .then()
  
  .step('User uses VPN for all connections')
    .answerQuestion('vpn_usage', 'always')
    .expectStoreState({ scoreRange: { min: 50, max: 100 } })
    .then()
  
  .finalOutcome(
    'Expert user achieves high security score with advanced practices',
    () => {
      const store = useAssessmentStore.getState();
      expect(store.overallScore).toBeGreaterThan(45);
      expect(store.currentLevel).toBeGreaterThanOrEqual(2); // Should be at intermediate+ level
      
      // Should have unlocked advanced questions
      const advancedAnswers = Object.keys(store.answers).filter(id =>
        id.includes('hardware') || id.includes('encryption') || id.includes('vpn')
      );
      expect(advancedAnswers.length).toBeGreaterThan(0);
    }
  )
  .build();

// Export all journeys for easy testing
export const ALL_JOURNEYS = [
  newUserOnboardingJourney,
  securityAssessmentJourney, 
  poorSecurityRemediationJourney,
  mobileUserJourney,
  expertUserJourney
] as const;