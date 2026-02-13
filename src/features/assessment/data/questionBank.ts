// Unified Question Bank (Clean Schema)
// Uses the new simplified schema with priority-based ordering and facts-based state management

import type { QuestionBank, Question } from '../engine/schema';
import { onboardingQuestions, coreAssessmentQuestions, browserSecurityQuestions, securityHygieneQuestions, passwordManagerDeepDiveQuestions, twoFactorDeepDiveQuestions } from './questions/index.js';

// Advanced security questions — gated by declarative conditions on facts
const advancedSecurityQuestions: Question[] = [
  {
    id: 'advanced_2fa',
    phase: 'assessment',
    priority: 1000, // High priority for unlocked content
    statement: 'Hardware 2FA Keys Used',
    text: 'Do you use hardware security keys (like YubiKey) for 2FA?',
    tags: ['security', 'authentication', 'advanced'],
    difficulty: 'advanced',
    effort: '30 minutes to set up',
    conditions: {
      include: { password_manager: 'yes', updates: 'automatic' }
    },
    options: [
      {
        id: 'yes',
        text: '✅ Yes, I use hardware security keys',
        statement: 'Hardware 2FA: Enabled',
        statusCategory: 'shields-up',
        points: 15,
        facts: { "hardware_2fa": true },
        feedback: '🔐 Excellent! Hardware keys provide the strongest 2FA protection.'
      },
      {
        id: 'no',
        text: '❌ No, I don\'t use hardware keys',
        statement: 'Hardware 2FA: Not using',
        statusCategory: 'to-do',
        points: 0,
        facts: { "hardware_2fa": false },
        feedback: '📱 Consider YubiKey or similar FIDO2 security keys for maximum protection.'
      }
    ]
  }
];

// Combine all question groups into the question bank
const questionBank: QuestionBank = {
  version: 2.0, // Numeric version
  domains: [
    {
      id: 'unified',
      title: 'Unified Assessment',
      levels: [
        {
          level: 1,
          questions: [...onboardingQuestions, ...coreAssessmentQuestions, ...securityHygieneQuestions, ...passwordManagerDeepDiveQuestions, ...twoFactorDeepDiveQuestions, ...browserSecurityQuestions, ...advancedSecurityQuestions]
        }
      ]
    }
  ]
};

// Export both default and named
export default questionBank;
export { questionBank };
