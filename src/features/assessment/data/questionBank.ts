// Unified Question Bank (Clean Schema)
// Uses the new simplified schema with priority-based ordering and facts-based state management

import type { QuestionBank, Suite, Question } from '../engine/schema';
import { onboardingQuestions, coreAssessmentQuestions } from './questions/index.js';

// Advanced security suite questions
const advancedSecurityQuestions: Question[] = [
  {
    id: 'advanced_2fa',
    phase: 'assessment',
    priority: 1000, // High priority for unlocked content
    statement: 'Hardware 2FA Keys Used',
    text: 'Do you use hardware security keys (like YubiKey) for 2FA?',
    tags: ['security', 'authentication', 'advanced'],
    options: [
      {
        id: 'yes',
        text: '✅ Yes, I use hardware security keys',
        points: 15,
        facts: { "hardware_2fa": true },
        feedback: '🔐 Excellent! Hardware keys provide the strongest 2FA protection.'
      },
      {
        id: 'no',
        text: '❌ No, I don\'t use hardware keys',
        points: 0,
        facts: { "hardware_2fa": false },
        feedback: '📱 Consider YubiKey or similar FIDO2 security keys for maximum protection.'
      }
    ]
  }
];

// Define suites for unlockable content
const suites: Suite[] = [
  {
    id: 'advanced_security',
    title: 'Advanced Security Features',
    description: 'Unlocked when you demonstrate strong basic security practices',
    gates: [
      {
        all: [
          { questionId: 'password_manager', when: 'equals', value: 'yes' },
          { questionId: 'software_updates', when: 'equals', value: 'automatic' }
        ]
      }
    ],
    questions: advancedSecurityQuestions
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
          questions: [...onboardingQuestions, ...coreAssessmentQuestions]
        }
      ]
    }
  ],
  suites: suites
};

// Export both default and named
export default questionBank;
export { questionBank };
