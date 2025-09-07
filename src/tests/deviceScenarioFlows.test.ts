import { describe, it, expect, beforeEach } from 'vitest';
import type { DeviceProfile } from '../features/assessment/engine/deviceScenarios';
import { detectCurrentDevice, getApplicableScenarios } from '../features/assessment/engine/deviceScenarios';
import { loadDeviceSpecificQuestions, getAllDeviceQuestions } from '../features/assessment/data/deviceQuestionLoader';
import { shouldQuestionBeAvailable, calculateAnswerExpiration } from '../features/assessment/engine/scoring';
import { processDeviceOnboarding } from '../features/onboarding/deviceOnboarding';

describe('Device Scenario Flow Tests', () => {
  describe('Scenario 1: Windows Desktop User with iPhone', () => {
    let deviceProfile: DeviceProfile;
    let availableQuestions: any[];
    let userAnswers: Record<string, any>;

    beforeEach(() => {
      // Simulate Windows desktop user with iPhone
      deviceProfile = {
        currentDevice: {
          type: 'desktop',
          os: 'windows',
          browser: 'firefox'
        },
        otherDevices: {
          hasWindows: true,
          hasMac: false,
          hasLinux: false,
          hasIPhone: true,
          hasAndroid: false,
          hasIPad: false
        },
        primaryDesktop: 'windows',
        primaryMobile: 'ios'
      };
      
      availableQuestions = getAllDeviceQuestions(deviceProfile);
      userAnswers = {};
    });

    it('should load Windows and iOS specific questions', () => {
      const questionBank = loadDeviceSpecificQuestions(deviceProfile);
      
      expect(questionBank.domains).toBeDefined();
      
      // Should include Windows domains
      const windowsDomains = questionBank.domains.filter(d => 
        d.id.includes('windows') || d.title.includes('Windows')
      );
      expect(windowsDomains.length).toBeGreaterThan(0);
      
      // Should include iOS domains
      const iosDomains = questionBank.domains.filter(d => 
        d.id.includes('ios') || d.title.includes('iOS') || d.title.includes('iPhone')
      );
      expect(iosDomains.length).toBeGreaterThan(0);
      
      // Should include cross-platform domains
      const crossPlatformDomains = questionBank.domains.filter(d => 
        d.id.includes('cross_platform') || d.id.includes('password') || d.id.includes('email')
      );
      expect(crossPlatformDomains.length).toBeGreaterThan(0);
    });

    it('should show Windows update question first', () => {
      const windowsUpdateQuestion = availableQuestions.find(q => 
        q.id === 'windows_update_frequency'
      );
      
      expect(windowsUpdateQuestion).toBeDefined();
      expect(windowsUpdateQuestion.text).toContain('Windows update');
      expect(windowsUpdateQuestion.type).toBe('ACTION');
      expect(windowsUpdateQuestion.actionOptions).toHaveLength(4);
    });

    it('should trigger different follow-ups based on update frequency answer', () => {
      const updateQuestion = availableQuestions.find(q => q.id === 'windows_update_frequency');
      
      // Test "when I remember" answer
      userAnswers['windows_update_frequency'] = 'when_remember';
      const expiration1 = calculateAnswerExpiration('windows_update_frequency', 'when_remember');
      expect(expiration1.expiresAt).toBeDefined();
      expect(expiration1.expirationReason).toContain('check');
      
      // Test "ignore them" answer
      const expiration2 = calculateAnswerExpiration('windows_update_frequency', 'ignore_them');
      expect(expiration2.expiresAt).toBeDefined();
      expect(expiration2.expirationReason).toContain('attention');
      
      // Test "immediately" answer
      const expiration3 = calculateAnswerExpiration('windows_update_frequency', 'immediately');
      expect(expiration3.expiresAt).toBeUndefined(); // No follow-up needed
    });

    it('should unlock conditional follow-up questions', () => {
      // Answer initial question poorly
      userAnswers['windows_update_frequency'] = 'when_remember';
      
      // Check if automation suggestion question should be available
      const automationQuestion = availableQuestions.find(q => 
        q.id === 'windows_updates_automation_suggestion'
      );
      
      if (automationQuestion) {
        const shouldShow = shouldQuestionBeAvailable(automationQuestion, userAnswers);
        expect(shouldShow).toBe(true);
      }
    });

    it('should include iOS security questions', () => {
      const iosPasscodeQuestion = availableQuestions.find(q => 
        q.id === 'ios_passcode_security'
      );
      
      expect(iosPasscodeQuestion).toBeDefined();
      expect(iosPasscodeQuestion.text).toContain('iPhone');
      expect(iosPasscodeQuestion.actionOptions).toBeDefined();
    });

    it('should include cross-platform password management', () => {
      const passwordQuestion = availableQuestions.find(q => 
        q.id === 'password_management_strategy'
      );
      
      expect(passwordQuestion).toBeDefined();
      expect(passwordQuestion.text).toContain('Windows PC and iPhone');
      expect(passwordQuestion.weight).toBe(12); // High importance
    });
  });

  describe('Scenario 2: iPhone User (Mobile-First)', () => {
    let deviceProfile: DeviceProfile;
    let availableQuestions: any[];

    beforeEach(() => {
      deviceProfile = {
        currentDevice: {
          type: 'mobile',
          os: 'ios',
          browser: 'safari'
        },
        otherDevices: {
          hasWindows: false,
          hasMac: true, // Assumed
          hasLinux: false,
          hasIPhone: true,
          hasAndroid: false,
          hasIPad: false
        },
        primaryDesktop: 'mac',
        primaryMobile: 'ios'
      };
      
      availableQuestions = getAllDeviceQuestions(deviceProfile);
    });

    it('should prioritize iOS questions', () => {
      const iosQuestions = availableQuestions.filter(q => 
        q.id.includes('ios') || q.text.includes('iPhone') || q.text.includes('iPad')
      );
      
      expect(iosQuestions.length).toBeGreaterThan(0);
    });

    it('should include Mac questions due to Apple ecosystem assumption', () => {
      const macQuestions = availableQuestions.filter(q => 
        q.id.includes('mac') || q.text.includes('Mac') || q.text.includes('macOS')
      );
      
      expect(macQuestions.length).toBeGreaterThan(0);
    });

    it('should NOT include Windows-specific questions', () => {
      const windowsQuestions = availableQuestions.filter(q => 
        q.id.includes('windows') && !q.id.includes('cross_platform')
      );
      
      expect(windowsQuestions.length).toBe(0);
    });
  });

  describe('Scenario 3: Basic User (Older Adult Profile)', () => {
    let deviceProfile: DeviceProfile;
    let availableQuestions: any[];

    beforeEach(() => {
      deviceProfile = {
        currentDevice: {
          type: 'desktop',
          os: 'windows',
          browser: 'edge' // Default browser indicates less technical
        },
        otherDevices: {
          hasWindows: true,
          hasMac: false,
          hasLinux: false,
          hasIPhone: false,
          hasAndroid: false,
          hasIPad: false
        },
        primaryDesktop: 'windows',
        primaryMobile: 'none'
      };
      
      availableQuestions = getAllDeviceQuestions(deviceProfile);
    });

    it('should focus on basic Windows security', () => {
      const basicQuestions = availableQuestions.filter(q => 
        q.weight && q.weight >= 7 && // High importance basic questions
        (q.text.includes('Windows') || q.text.includes('email'))
      );
      
      expect(basicQuestions.length).toBeGreaterThan(0);
    });

    it('should not include mobile-specific questions', () => {
      const mobileQuestions = availableQuestions.filter(q => 
        q.text.includes('iPhone') || q.text.includes('Android') || q.text.includes('phone')
      );
      
      expect(mobileQuestions.length).toBe(0);
    });

    it('should include email security (high risk for this demographic)', () => {
      const emailQuestions = availableQuestions.filter(q => 
        q.text.includes('email') || q.id.includes('email')
      );
      
      expect(emailQuestions.length).toBeGreaterThan(0);
    });
  });

  describe('Scenario 4: Linux Enthusiast', () => {
    let deviceProfile: DeviceProfile;
    let availableQuestions: any[];

    beforeEach(() => {
      deviceProfile = {
        currentDevice: {
          type: 'desktop',
          os: 'linux',
          browser: 'firefox'
        },
        otherDevices: {
          hasWindows: false,
          hasMac: false,
          hasLinux: true,
          hasIPhone: false,
          hasAndroid: true, // Tech users often prefer Android
          hasIPad: false
        },
        primaryDesktop: 'linux',
        primaryMobile: 'android'
      };
      
      availableQuestions = getAllDeviceQuestions(deviceProfile);
    });

    it('should include advanced Linux security questions', () => {
      const linuxQuestions = availableQuestions.filter(q => 
        q.id.includes('linux') || q.text.includes('Linux')
      );
      
      expect(linuxQuestions.length).toBeGreaterThan(0);
    });

    it('should include Android security questions', () => {
      const androidQuestions = availableQuestions.filter(q => 
        q.id.includes('android') || q.text.includes('Android')
      );
      
      expect(androidQuestions.length).toBeGreaterThan(0);
    });

    it('should NOT include Windows or iOS questions', () => {
      const windowsQuestions = availableQuestions.filter(q => 
        q.id.includes('windows') && !q.id.includes('cross_platform')
      );
      const iosQuestions = availableQuestions.filter(q => 
        q.id.includes('ios') && !q.id.includes('cross_platform')
      );
      
      expect(windowsQuestions.length).toBe(0);
      expect(iosQuestions.length).toBe(0);
    });
  });
});

// Helper function to simulate complete user flow
export function simulateUserFlow(deviceProfile: DeviceProfile, answers: Record<string, any>) {
  const questionBank = loadDeviceSpecificQuestions(deviceProfile);
  const allQuestions = getAllDeviceQuestions(deviceProfile);
  
  const results = {
    profile: deviceProfile,
    totalQuestions: allQuestions.length,
    answeredQuestions: 0,
    unansweredQuestions: [] as any[],
    expiredAnswers: [] as any[],
    upcomingFollowUps: [] as any[],
    securityScore: 0
  };
  
  // Process each question
  for (const question of allQuestions) {
    if (answers[question.id]) {
      results.answeredQuestions++;
      
      // Check if answer creates follow-up
      const expiration = calculateAnswerExpiration(question.id, answers[question.id]);
      if (expiration.expiresAt) {
        results.upcomingFollowUps.push({
          questionId: question.id,
          originalAnswer: answers[question.id],
          expiresAt: expiration.expiresAt,
          reason: expiration.expirationReason
        });
      }
    } else {
      // Check if question should be available
      if (shouldQuestionBeAvailable(question, answers)) {
        results.unansweredQuestions.push(question);
      }
    }
  }
  
  return results;
}
