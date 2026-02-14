// Unified Question Bank (Clean Schema)
// Uses the new simplified schema with priority-based ordering and facts-based state management

import type { QuestionBank, Question } from '../engine/schema';
import { onboardingQuestions, coreAssessmentQuestions, browserSecurityQuestions, securityHygieneQuestions, passwordManagerDeepDiveQuestions, twoFactorDeepDiveQuestions, adBlockDeepDiveQuestions } from './questions/index.js';

// Advanced security questions — gated by declarative conditions on facts
const advancedSecurityQuestions: Question[] = [
  {
    id: 'advanced_2fa',
    phase: 'assessment',
    priority: 90, // Just above core assessment range (40-85)
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
        feedback: 'Hardware security keys provide the strongest form of 2FA — they\'re phishing-resistant because the key must be physically present to authenticate.'
      },
      {
        id: 'no',
        text: '❌ No, I don\'t use hardware keys',
        statement: 'Hardware 2FA: Not using',
        statusCategory: 'to-do',
        points: 0,
        facts: { "hardware_2fa": false },
        feedback: 'FIDO2 hardware keys (like YubiKey) are the gold standard for phishing-resistant authentication. Worth researching if you want the strongest available protection.'
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
          questions: [...onboardingQuestions, ...coreAssessmentQuestions, ...securityHygieneQuestions, ...passwordManagerDeepDiveQuestions, ...twoFactorDeepDiveQuestions, ...browserSecurityQuestions, ...adBlockDeepDiveQuestions, ...advancedSecurityQuestions]
        }
      ]
    }
  ]
};

// Export both default and named
export default questionBank;
export { questionBank };
