/**
 * Onboarding Flow Tests
 * Comprehensive vitest suite for testing Q&A flows
 */

import { describe, it, expect } from 'vitest';
import { 
  UNIFIED_ONBOARDING_QUESTIONS, 
  processOnboardingAnswers 
} from '../features/onboarding/unifiedOnboarding';
import type { DetectedDevice } from '../features/device/deviceDetection';
import { TEST_DEVICES } from '../testing/testData';

// Helper function to simulate onboarding flow
function simulateOnboardingFlow(device: DetectedDevice, answers: Record<string, string> = {}) {
  const questionsShown: string[] = [];
  const finalAnswers = { ...answers };

  for (const question of UNIFIED_ONBOARDING_QUESTIONS) {
    const shouldShow = !question.showIf || question.showIf(device, finalAnswers);
    if (shouldShow) {
      questionsShown.push(question.id);
    }
  }

  const profile = processOnboardingAnswers(finalAnswers, device);
  
  return {
    questionsShown,
    finalAnswers,
    profile
  };
}

describe('Onboarding Flow Tests', () => {
  describe('Question Selection Logic', () => {
    it('should show Windows confirmation for Windows Chrome user', () => {
      const result = simulateOnboardingFlow(TEST_DEVICES.windowsChrome);
      
      expect(result.questionsShown).toContain('windows_confirmation');
      expect(result.questionsShown).not.toContain('mac_confirmation');
      expect(result.questionsShown).not.toContain('linux_confirmation');
    });

    it('should show Mac confirmation for Mac Safari user', () => {
      const result = simulateOnboardingFlow(TEST_DEVICES.macSafari);
      
      expect(result.questionsShown).toContain('mac_confirmation');
      expect(result.questionsShown).not.toContain('windows_confirmation');
      expect(result.questionsShown).not.toContain('linux_confirmation');
    });

    it('should show Linux confirmation for Linux Firefox user', () => {
      const result = simulateOnboardingFlow(TEST_DEVICES.linuxFirefox);
      
      expect(result.questionsShown).toContain('linux_confirmation');
      expect(result.questionsShown).not.toContain('windows_confirmation');
      expect(result.questionsShown).not.toContain('mac_confirmation');
    });

    it('should show OS selection for unknown device', () => {
      const result = simulateOnboardingFlow(TEST_DEVICES.unknownDevice);
      
      expect(result.questionsShown).toContain('os_selection');
      expect(result.questionsShown).not.toContain('windows_confirmation');
      expect(result.questionsShown).not.toContain('mac_confirmation');
      expect(result.questionsShown).not.toContain('linux_confirmation');
    });
  });

  describe('Answer Flow Logic', () => {
    it('should show Chrome confirmation after Windows confirmation', () => {
      const answers = { windows_confirmation: 'yes' };
      const result = simulateOnboardingFlow(TEST_DEVICES.windowsChrome, answers);
      
      expect(result.questionsShown).toContain('windows_confirmation');
      expect(result.questionsShown).toContain('chrome_confirmation');
    });

    it('should show OS selection when Windows is denied', () => {
      const answers = { windows_confirmation: 'no' };
      const result = simulateOnboardingFlow(TEST_DEVICES.windowsChrome, answers);
      
      expect(result.questionsShown).toContain('windows_confirmation');
      expect(result.questionsShown).toContain('os_selection');
      expect(result.questionsShown).not.toContain('chrome_confirmation');
    });

    it('should show browser selection after OS selection', () => {
      const answers = { 
        windows_confirmation: 'no',
        os_selection: 'mac'
      };
      const result = simulateOnboardingFlow(TEST_DEVICES.windowsChrome, answers);
      
      expect(result.questionsShown).toContain('os_selection');
      expect(result.questionsShown).toContain('browser_selection');
    });

    it('should skip browser questions for mobile OS selection', () => {
      const answers = { 
        windows_confirmation: 'no',
        os_selection: 'mobile'
      };
      const result = simulateOnboardingFlow(TEST_DEVICES.windowsChrome, answers);
      
      expect(result.questionsShown).toContain('os_selection');
      expect(result.questionsShown).not.toContain('chrome_confirmation');
      expect(result.questionsShown).not.toContain('browser_selection');
    });
  });

  describe('Profile Processing', () => {
    it('should create correct profile for confirmed Windows Chrome', () => {
      const answers = { 
        windows_confirmation: 'yes',
        chrome_confirmation: 'yes'
      };
      const result = simulateOnboardingFlow(TEST_DEVICES.windowsChrome, answers);
      
      expect(result.profile.confirmedOS).toBe('windows');
      expect(result.profile.confirmedBrowser).toBe('chrome');
    });

    it('should create correct profile when detection is denied', () => {
      const answers = { 
        windows_confirmation: 'no',
        os_selection: 'mac',
        browser_selection: 'safari'
      };
      const result = simulateOnboardingFlow(TEST_DEVICES.windowsChrome, answers);
      
      expect(result.profile.confirmedOS).toBe('mac');
      expect(result.profile.confirmedBrowser).toBe('safari');
    });

    it('should handle unknown device correctly', () => {
      const answers = { 
        os_selection: 'linux',
        browser_selection: 'firefox'
      };
      const result = simulateOnboardingFlow(TEST_DEVICES.unknownDevice, answers);
      
      expect(result.profile.confirmedOS).toBe('linux');
      expect(result.profile.confirmedBrowser).toBe('firefox');
    });
  });

  describe('Flow Integrity', () => {
    it('should show at least one question for every device type', () => {
      Object.entries(TEST_DEVICES).forEach(([deviceName, device]) => {
        const result = simulateOnboardingFlow(device);
        expect(result.questionsShown.length, 
          `Device ${deviceName} should show at least one question`).toBeGreaterThan(0);
      });
    });

    it('should not show browser questions before OS is confirmed', () => {
      // Test with no answers - should not show browser questions
      const result = simulateOnboardingFlow(TEST_DEVICES.windowsChrome, {});
      
      const osQuestions = ['windows_confirmation', 'mac_confirmation', 'linux_confirmation', 'os_selection'];
      const browserQuestions = ['chrome_confirmation', 'firefox_confirmation', 'browser_selection'];
      
      const firstBrowserIndex = result.questionsShown.findIndex(q => browserQuestions.includes(q));
      const lastOSIndex = result.questionsShown.map((q, i) => osQuestions.includes(q) ? i : -1)
        .filter(i => i !== -1).pop() ?? -1;
      
      if (firstBrowserIndex !== -1 && lastOSIndex !== -1) {
        expect(firstBrowserIndex, 
          'Browser questions should come after OS questions').toBeGreaterThan(lastOSIndex);
      }
    });

    it('should have valid showIf conditions for all questions', () => {
      // Test that all showIf functions don't throw errors
      UNIFIED_ONBOARDING_QUESTIONS.forEach((question) => {
        if (question.showIf) {
          expect(() => {
            question.showIf!(TEST_DEVICES.windowsChrome, {});
            question.showIf!(TEST_DEVICES.unknownDevice, { windows_confirmation: 'no' });
          }).not.toThrow(`Question ${question.id} showIf condition should not throw`);
        }
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle Firefox detection correctly', () => {
      const result = simulateOnboardingFlow(TEST_DEVICES.linuxFirefox);
      
      expect(result.questionsShown).toContain('linux_confirmation');
      // Should show Firefox confirmation if Linux is confirmed
      const withLinuxConfirmed = simulateOnboardingFlow(TEST_DEVICES.linuxFirefox, {
        linux_confirmation: 'yes'
      });
      expect(withLinuxConfirmed.questionsShown).toContain('firefox_confirmation');
    });

    it('should handle multiple OS denials', () => {
      // Test Mac device with Windows confirmation shown (wrong detection)
      const answers = { 
        windows_confirmation: 'no',
        os_selection: 'mac'
      };
      const result = simulateOnboardingFlow(TEST_DEVICES.windowsChrome, answers);
      
      expect(result.profile.confirmedOS).toBe('mac');
      expect(result.questionsShown).toContain('browser_selection');
    });

    it('should handle partial answer sets gracefully', () => {
      // Only answer first question
      const answers = { windows_confirmation: 'yes' };
      const result = simulateOnboardingFlow(TEST_DEVICES.windowsChrome, answers);
      
      expect(result.profile.confirmedOS).toBe('windows');
      // Browser should fall back to detected browser
      expect(result.profile.confirmedBrowser).toBe('chrome');
    });
  });
});

describe('Q&A Flow Framework', () => {
  describe('Generic Flow Testing', () => {
    it('should validate question sequencing', () => {
      // Test that questions appear in logical order
      const result = simulateOnboardingFlow(TEST_DEVICES.windowsChrome);
      
      // OS questions should come before browser questions
      const osQuestionIndex = result.questionsShown.indexOf('windows_confirmation');
      const browserQuestionIndex = result.questionsShown.findIndex(q => 
        ['chrome_confirmation', 'firefox_confirmation'].includes(q));
      
      if (browserQuestionIndex !== -1) {
        expect(osQuestionIndex).toBeLessThan(browserQuestionIndex);
      }
    });

    it('should handle conditional branching correctly', () => {
      // Test multiple branching paths
      const scenarios: Array<{ answers: Record<string, string>, expectedOS: string }> = [
        { answers: { windows_confirmation: 'yes' }, expectedOS: 'windows' },
        { answers: { os_selection: 'mobile' }, expectedOS: 'mobile' }
      ];

      scenarios.forEach(({ answers, expectedOS }) => {
        const device = TEST_DEVICES.windowsChrome; // Use consistent device for testing
        const result = simulateOnboardingFlow(device, answers);
        expect(result.profile.confirmedOS).toBe(expectedOS);
      });
    });
  });
});
