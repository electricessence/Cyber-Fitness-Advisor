// Unified Question Bank (Clean Schema)
// Uses the new simplified schema with priority-based ordering and facts-based state management

import type { Question, QuestionBank } from '../engine/schema';

// Essential onboarding questions to establish facts for filtering
const onboardingQuestions: Question[] = [
  {
    id: 'os_detection',
    statement: 'Detected: Windows Operating System',
    text: 'Is this correct?',
    priority: 100, // Highest priority - critical for filtering
    tags: ['critical', 'onboarding'],
    conditions: {
      include: { "detected_os": "windows" }
    },
    options: [
      { 
        id: 'yes',
        text: '✅ Yes, Windows', 
        facts: { "os": "windows", "os.confirmed": true },
        feedback: '✅ Great! We\'ll provide Windows-specific security advice.'
      },
      { 
        id: 'no',
        text: '❌ No, different OS', 
        facts: { "os": "not-windows" },
        feedback: '👍 We\'ll ask what you\'re actually using.'
      }
    ]
  },
  {
    id: 'os_selection',
    text: 'Which operating system do you use?',
    priority: 95,
    tags: ['critical', 'onboarding'],
    conditions: {
      exclude: { "os.confirmed": true } // Show when OS is not yet confirmed
    },
    options: [
      { 
        id: 'windows',
        text: 'Windows', 
        facts: { "os": "windows", "os.confirmed": true },
        feedback: 'Thanks! We\'ll provide Windows-specific advice.',
        conditions: {
          exclude: { "os": "not-windows" } // Don't show Windows if they said not-windows
        }
      },
      { 
        id: 'mac',
        text: 'macOS', 
        facts: { "os": "mac", "os.confirmed": true },
        feedback: 'Great! We\'ll provide macOS-specific advice.'
      },
      { 
        id: 'linux',
        text: 'Linux', 
        facts: { "os": "linux", "os.confirmed": true },
        feedback: 'Excellent! We\'ll provide Linux-specific advice.'
      },
      { 
        id: 'other',
        text: 'Other (BSD, Solaris, etc.)', 
        facts: { "os": "other", "os.confirmed": true },
        feedback: 'Thanks! We\'ll provide general security advice.'
      },
      { 
        id: 'none',
        text: 'I don\'t use a desktop computer', 
        facts: { "os": "none", "os.confirmed": true },
        feedback: 'Got it! We\'ll focus on mobile and web security.'
      }
    ]
  },
  {
    id: 'browser_detection',
    statement: 'Detected: Chrome Browser',
    text: 'Is this your primary browser?',
    priority: 90,
    tags: ['onboarding'],
    conditions: {
      include: { "detected_browser": "chrome" }
    },
    options: [
      { 
        id: 'yes',
        text: '✅ Yes, Chrome is primary',
        facts: { "browser": "chrome" },
        feedback: 'We\'ll provide Chrome-specific security tips.'
      },
      { 
        id: 'no',
        text: '❌ No, different browser',
        facts: { "browser": "needs-prompting" },
        feedback: 'We\'ll ask which browser you prefer.'
      }
    ]
  }
];

// Core assessment questions with simplified structure
const assessmentQuestions: Question[] = [
  {
    id: 'password_manager',
    text: 'Do you use a password manager?',
    priority: 85, // High priority security fundamental
    tags: ['critical', 'password', 'quickwin'],
    options: [
      { 
        id: 'yes',
        text: '✅ Yes, I use a password manager',
        facts: { "password_manager": "yes" },
        points: 10,
        feedback: 'Excellent! Password managers are essential for security.'
      },
      { 
        id: 'no',
        text: '❌ No, I don\'t use one',
        facts: { "password_manager": "no" },
        points: 0,
        feedback: 'Consider using a password manager - it\'s one of the most important security steps.'
      }
    ]
  },
  {
    id: 'two_factor_auth',
    text: 'Do you use two-factor authentication (2FA) on your important accounts?',
    priority: 80,
    tags: ['critical', 'authentication'],
    options: [
      { 
        id: 'yes',
        text: '✅ Yes, on most important accounts',
        facts: { "two_factor": "yes" },
        points: 8,
        feedback: 'Great job! 2FA significantly improves your account security.'
      },
      { 
        id: 'partial',
        text: '⚠️ Only on some accounts',
        facts: { "two_factor": "partial" },
        points: 4,
        feedback: 'Good start! Consider enabling 2FA on all important accounts.'
      },
      { 
        id: 'no',
        text: '❌ No, I don\'t use 2FA',
        facts: { "two_factor": "no" },
        points: 0,
        feedback: '2FA is crucial - it prevents most account breaches even if passwords are stolen.'
      }
    ]
  },
  {
    id: 'software_updates',
    text: 'How do you handle software updates on your devices?',
    priority: 75,
    tags: ['critical', 'updates'],
    options: [
      { 
        id: 'automatic',
        text: '✅ Automatic updates enabled',
        facts: { "updates": "automatic" },
        points: 8,
        feedback: 'Perfect! Automatic updates provide the best security coverage.'
      },
      { 
        id: 'manual',
        text: '⚠️ Manual updates when reminded',
        facts: { "updates": "manual" },
        points: 4,
        feedback: 'Consider enabling automatic updates for better security.'
      },
      { 
        id: 'rarely',
        text: '❌ I rarely update software',
        facts: { "updates": "rarely" },
        points: 0,
        feedback: 'Outdated software is a major security risk. Enable automatic updates!'
      }
    ]
  },
  {
    id: 'virus_scan_recent',
    text: 'When did you last run a virus scan?',
    priority: 70,
    tags: ['security', 'antivirus'],
    options: [
      { 
        id: 'this_week',
        text: 'This week',
        facts: { "virus_scan": "recent" },
        points: 8,
        feedback: 'Great! Regular scanning is important for security.'
      },
      { 
        id: 'this_month',
        text: 'This month',
        facts: { "virus_scan": "monthly" },
        points: 4,
        feedback: 'Consider scanning more frequently for better protection.'
      },
      { 
        id: 'rarely',
        text: 'Rarely or never',
        facts: { "virus_scan": "never" },
        points: 0,
        feedback: 'Regular virus scans help detect threats early.'
      }
    ]
  }
];

// Combine all questions into the question bank
const questionBank: QuestionBank = {
  version: 2.0, // Numeric version
  domains: [
    {
      id: 'unified',
      title: 'Unified Assessment',
      levels: [
        {
          level: 1,
          questions: [...onboardingQuestions, ...assessmentQuestions]
        }
      ]
    }
  ]
};

// Export both default and named
export default questionBank;
export { questionBank };