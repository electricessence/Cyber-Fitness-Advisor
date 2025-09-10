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
  },
  {
    id: 'backup_frequency',
    text: 'How often do you back up your important data?',
    priority: 65,
    tags: ['critical', 'backup'],
    options: [
      { 
        id: 'daily',
        text: 'Daily (automated)',
        facts: { "backup": "daily" },
        points: 10,
        feedback: 'Excellent! Daily automated backups provide the best protection.'
      },
      { 
        id: 'weekly',
        text: 'Weekly',
        facts: { "backup": "weekly" },
        points: 6,
        feedback: 'Good! Consider more frequent backups for critical data.'
      },
      { 
        id: 'monthly',
        text: 'Monthly or less',
        facts: { "backup": "monthly" },
        points: 2,
        feedback: 'This leaves you vulnerable to significant data loss.'
      },
      { 
        id: 'never',
        text: 'I don\'t back up regularly',
        facts: { "backup": "never" },
        points: 0,
        feedback: 'Backups are essential! One hardware failure could lose everything.'
      }
    ]
  },
  {
    id: 'wifi_security',
    text: 'What type of security does your home WiFi network use?',
    priority: 60,
    tags: ['network', 'wifi'],
    options: [
      { 
        id: 'wpa3',
        text: 'WPA3 (latest)',
        facts: { "wifi_security": "wpa3" },
        points: 10,
        feedback: 'Perfect! WPA3 provides the strongest WiFi security.'
      },
      { 
        id: 'wpa2',
        text: 'WPA2',
        facts: { "wifi_security": "wpa2" },
        points: 8,
        feedback: 'Good! WPA2 is still secure, but consider upgrading to WPA3.'
      },
      { 
        id: 'wpa',
        text: 'WPA (older)',
        facts: { "wifi_security": "wpa" },
        points: 3,
        feedback: 'WPA is outdated. Upgrade to WPA2 or WPA3 immediately.'
      },
      { 
        id: 'open',
        text: 'Open (no password)',
        facts: { "wifi_security": "open" },
        points: 0,
        feedback: 'This is very dangerous! Anyone can access your network and data.'
      },
      { 
        id: 'unknown',
        text: 'I don\'t know',
        facts: { "wifi_security": "unknown" },
        points: 1,
        feedback: 'Check your router settings - this is important for your security.'
      }
    ]
  },
  {
    id: 'email_attachments',
    text: 'How do you handle email attachments from unknown senders?',
    priority: 55,
    tags: ['email', 'phishing'],
    options: [
      { 
        id: 'never_open',
        text: 'Never open them',
        facts: { "email_safety": "cautious" },
        points: 10,
        feedback: 'Excellent! This prevents most email-based attacks.'
      },
      { 
        id: 'scan_first',
        text: 'Scan with antivirus first',
        facts: { "email_safety": "scan" },
        points: 7,
        feedback: 'Good practice! But some threats can still get through.'
      },
      { 
        id: 'sometimes_open',
        text: 'Open them if they seem legitimate',
        facts: { "email_safety": "risky" },
        points: 2,
        feedback: 'This is risky - attackers are very good at seeming legitimate.'
      },
      { 
        id: 'always_open',
        text: 'Open them without hesitation',
        facts: { "email_safety": "dangerous" },
        points: 0,
        feedback: 'This is very dangerous! Email attachments are a common attack vector.'
      }
    ]
  },
  {
    id: 'browser_extensions',
    text: 'How careful are you about browser extensions/add-ons?',
    priority: 50,
    tags: ['browser', 'extensions'],
    options: [
      { 
        id: 'very_selective',
        text: 'Only install well-known, necessary extensions',
        facts: { "browser_safety": "cautious" },
        points: 8,
        feedback: 'Great approach! Extensions can be a security risk.'
      },
      { 
        id: 'research_first',
        text: 'Research extensions before installing',
        facts: { "browser_safety": "research" },
        points: 6,
        feedback: 'Good! Always check reviews and permissions.'
      },
      { 
        id: 'install_freely',
        text: 'Install extensions that look useful',
        facts: { "browser_safety": "risky" },
        points: 2,
        feedback: 'Be more careful - malicious extensions can steal your data.'
      },
      { 
        id: 'no_extensions',
        text: 'I don\'t use any extensions',
        facts: { "browser_safety": "minimal" },
        points: 5,
        feedback: 'Safe approach! Some extensions can improve security though.'
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