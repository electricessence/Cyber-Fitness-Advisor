// Unified Question Bank (Clean Schema)
// Uses the new simplified schema with priority-based ordering and facts-based state management

import type { Question, QuestionBank } from '../engine/schema';

// Priority Constants for Onboarding Flow
const PRIORITY = {
  PRIVACY_NOTICE: 10000,
  OS_DETECTION: 9500,
  OS_SELECTION: 9400,
  BROWSER_DETECTION: 9300,
  BROWSER_SELECTION: 9250,
  TECH_COMFORT: 9200,
  MOBILE_CONTEXT: 9100,
  USAGE_CONTEXT: 9000
} as const;

// Level 0 Onboarding Questions - Complete privacy-first flow
const onboardingQuestions: Question[] = [
  // Privacy Notice - Highest Priority (must be first)
  {
    id: 'privacy_notice',
    phase: 'onboarding',
    priority: PRIORITY.PRIVACY_NOTICE, // Highest priority - must be first
    statement: '🔒 Privacy First',
    text: 'Your data stays on your device. No tracking, no cloud storage.',
    tags: ['critical', 'onboarding', 'privacy'],
    options: [
      {
        id: 'understood',
        text: '✅ I understand',
        facts: { "privacy_acknowledged": true },
        feedback: '🔒 Perfect! Your security assessment begins now.'
      }
    ]
  },

  // OS Confirmation - Windows (when detected)
  {
    id: 'windows_detection_confirm',
    phase: 'onboarding',
    priority: PRIORITY.OS_DETECTION,
    statement: '🖥️ Detected: Windows Operating System',
    text: 'Is this correct?',
    tags: ['critical', 'onboarding'],
    conditions: {
      include: { "os_detected": "windows" }
    },
    options: [
      { 
        id: 'yes',
        text: '✅ Yes, I use Windows', 
        facts: { "os": "windows", "os_confirmed": true },
        feedback: 'Great! We\'ll provide Windows-specific security advice.'
      },
      { 
        id: 'no',
        text: '❌ No, that\'s wrong', 
        facts: { "os_confirmed": false },
        feedback: 'No problem! We\'ll ask you to select your actual OS.'
      }
    ]
  },

  // OS Confirmation - macOS (when detected)
  {
    id: 'mac_detection_confirm',
    phase: 'onboarding',
    priority: PRIORITY.OS_DETECTION,
    statement: '🍎 Detected: macOS',
    text: 'Is this correct?',
    tags: ['critical', 'onboarding'],
    conditions: {
      include: { "os_detected": "mac" }
    },
    options: [
      { 
        id: 'yes',
        text: '✅ Yes, I use macOS', 
        facts: { "os": "mac", "os_confirmed": true },
        feedback: 'Great! We\'ll provide macOS-specific security advice.'
      },
      { 
        id: 'no',
        text: '❌ No, that\'s wrong', 
        facts: { "os_confirmed": false },
        feedback: 'No problem! We\'ll ask you to select your actual OS.'
      }
    ]
  },

  // OS Confirmation - Linux (when detected)
  {
    id: 'linux_detection_confirm',
    phase: 'onboarding',
    priority: PRIORITY.OS_DETECTION,
    statement: '🐧 Detected: Linux',
    text: 'Is this correct?',
    tags: ['critical', 'onboarding'],
    conditions: {
      include: { "os_detected": "linux" }
    },
    options: [
      { 
        id: 'yes',
        text: '✅ Yes, I use Linux', 
        facts: { "os": "linux", "os_confirmed": true },
        feedback: 'Excellent! We\'ll provide Linux-specific security advice.'
      },
      { 
        id: 'no',
        text: '❌ No, that\'s wrong', 
        facts: { "os_confirmed": false },
        feedback: 'No problem! We\'ll ask you to select your actual OS.'
      }
    ]
  },

  // OS Selection (when not confirmed or not detected)
  {
    id: 'os_selection',
    phase: 'onboarding',
    priority: PRIORITY.OS_SELECTION,
    text: 'Which operating system do you primarily use?',
    tags: ['critical', 'onboarding'],
    conditions: {
      exclude: { "os_confirmed": true }
    },
    options: [
      { 
        id: 'windows',
        text: '🖥️ Windows', 
        facts: { "os": "windows", "os_confirmed": true },
        feedback: 'Thanks! We\'ll provide Windows-specific advice.'
      },
      { 
        id: 'mac',
        text: '🍎 macOS', 
        facts: { "os": "mac", "os_confirmed": true },
        feedback: 'Great! We\'ll provide macOS-specific advice.'
      },
      { 
        id: 'linux',
        text: '🐧 Linux', 
        facts: { "os": "linux", "os_confirmed": true },
        feedback: 'Excellent! We\'ll provide Linux-specific advice.'
      },
      { 
        id: 'mobile_only',
        text: '📱 I only use mobile devices', 
        facts: { "os": "mobile_only", "os_confirmed": true },
        feedback: 'Got it! We\'ll focus on mobile security.'
      },
      { 
        id: 'other',
        text: '🔧 Other/Multiple systems', 
        facts: { "os": "other", "os_confirmed": true },
        feedback: 'Thanks! We\'ll provide general security advice.'
      }
    ]
  },

  // Browser Confirmation - Chrome (when detected)
  {
    id: 'chrome_detection_confirm',
    phase: 'onboarding',
    priority: PRIORITY.BROWSER_DETECTION,
    statement: '🌐 Detected: Chrome Browser',
    text: 'Is this your primary browser?',
    tags: ['onboarding'],
    conditions: {
      include: { "os_confirmed": true, "browser_detected": "chrome" }
    },
    options: [
      { 
        id: 'yes',
        text: '✅ Yes, Chrome is my main browser',
        facts: { "browser": "chrome", "browser_confirmed": true }
      },
      { 
        id: 'no',
        text: '❌ No, I use a different browser',
        facts: { "browser_confirmed": false }
      }
    ]
  },

  // Browser Confirmation - Firefox (when detected)
  {
    id: 'firefox_detection_confirm',
    phase: 'onboarding',
    priority: PRIORITY.BROWSER_DETECTION,
    statement: '🦊 Detected: Firefox Browser',
    text: 'Is this your primary browser?',
    tags: ['onboarding'],
    conditions: {
      include: { "os_confirmed": true, "browser_detected": "firefox" }
    },
    options: [
      { 
        id: 'yes',
        text: '✅ Yes, Firefox is my main browser',
        facts: { "browser": "firefox", "browser_confirmed": true }
      },
      { 
        id: 'no',
        text: '❌ No, I use a different browser',
        facts: { "browser_confirmed": false }
      }
    ]
  },

  // Browser Confirmation - Edge (when detected)
  {
    id: 'edge_detection_confirm',
    phase: 'onboarding',
    priority: PRIORITY.BROWSER_DETECTION,
    statement: '🔵 Detected: Microsoft Edge',
    text: 'Is this your primary browser?',
    tags: ['onboarding'],
    conditions: {
      include: { "os_confirmed": true, "browser_detected": "edge" }
    },
    options: [
      { 
        id: 'yes',
        text: '✅ Yes, Edge is my main browser',
        facts: { "browser": "edge", "browser_confirmed": true }
      },
      { 
        id: 'no',
        text: '❌ No, I use a different browser',
        facts: { "browser_confirmed": false }
      }
    ]
  },

  // Browser Confirmation - Safari (when detected)
  {
    id: 'safari_detection_confirm',
    phase: 'onboarding',
    priority: PRIORITY.BROWSER_DETECTION,
    statement: '🧭 Detected: Safari Browser',
    text: 'Is this your primary browser?',
    tags: ['onboarding'],
    conditions: {
      include: { "os_confirmed": true, "browser_detected": "safari" }
    },
    options: [
      { 
        id: 'yes',
        text: '✅ Yes, Safari is my main browser',
        facts: { "browser": "safari", "browser_confirmed": true }
      },
      { 
        id: 'no',
        text: '❌ No, I use a different browser',
        facts: { "browser_confirmed": false }
      }
    ]
  },

  // Browser Selection (when detection failed or not detected)
  {
    id: 'browser_selection',
    phase: 'onboarding',
    priority: PRIORITY.BROWSER_SELECTION,
    text: 'Which browser do you primarily use?',
    tags: ['onboarding'],
    conditions: {
      include: { "os_confirmed": true },
      exclude: { "browser_confirmed": true }
    },
    options: [
      { 
        id: 'chrome',
        text: '🌐 Chrome', 
        facts: { "browser": "chrome", "browser_confirmed": true },
        feedback: 'Thanks! We\'ll provide Chrome-specific security tips.'
      },
      { 
        id: 'firefox',
        text: '🦊 Firefox', 
        facts: { "browser": "firefox", "browser_confirmed": true },
        feedback: 'Great! We\'ll provide Firefox-specific security tips.'
      },
      { 
        id: 'edge',
        text: '🔵 Microsoft Edge', 
        facts: { "browser": "edge", "browser_confirmed": true },
        feedback: 'Perfect! We\'ll provide Edge-specific security tips.'
      },
      { 
        id: 'safari',
        text: '🧭 Safari', 
        facts: { "browser": "safari", "browser_confirmed": true },
        feedback: 'Excellent! We\'ll provide Safari-specific security tips.'
      },
      { 
        id: 'other',
        text: '🔧 Other browser', 
        facts: { "browser": "other", "browser_confirmed": true },
        feedback: 'Thanks! We\'ll provide general browser security advice.'
      }
    ]
  },

  // Technology Comfort Assessment
  {
    id: 'tech_comfort',
    phase: 'onboarding',
    priority: PRIORITY.TECH_COMFORT,
    text: 'How would you describe your comfort with technology?',
    tags: ['onboarding'],
    conditions: {
      include: { "os_confirmed": true }
    },
    options: [
      {
        id: 'beginner',
        text: '👶 Beginner - I stick to basics',
        facts: { "tech_comfort": "beginner" },
        feedback: 'Perfect! We\'ll focus on simple, high-impact security steps.'
      },
      {
        id: 'comfortable',
        text: '👍 Comfortable - I can follow instructions',
        facts: { "tech_comfort": "comfortable" },
        feedback: 'Great! We\'ll give you clear steps for important security measures.'
      },
      {
        id: 'advanced',
        text: '🛠️ Advanced - I enjoy tweaking settings',
        facts: { "tech_comfort": "advanced" },
        feedback: 'Excellent! We can recommend more comprehensive security configurations.'
      }
    ]
  },

  // Mobile Device Context (for desktop users)
  {
    id: 'mobile_context',
    phase: 'onboarding',
    priority: PRIORITY.MOBILE_CONTEXT,
    text: 'Do you also use a smartphone or tablet for important activities like email, banking, or work?',
    tags: ['onboarding'],
    conditions: {
      include: { "tech_comfort": "*" },
      exclude: { "os": "mobile_only" }
    },
    options: [
      {
        id: 'iphone',
        text: '� Yes - iPhone (iOS)',
        facts: { "has_mobile": true, "mobile_os": "ios" },
        feedback: 'Great! We\'ll include iPhone security recommendations.'
      },
      {
        id: 'android',
        text: '📱 Yes - Android phone',
        facts: { "has_mobile": true, "mobile_os": "android" },
        feedback: 'Perfect! We\'ll include Android security recommendations.'
      },
      {
        id: 'both',
        text: '📱 Yes - Both iPhone and Android',
        facts: { "has_mobile": true, "mobile_os": "both" },
        feedback: 'We\'ll provide security advice for both platforms.'
      },
      {
        id: 'tablet_only',
        text: '📱 Yes - iPad/tablet only',
        facts: { "has_mobile": true, "mobile_os": "tablet" },
        feedback: 'Good! We\'ll include tablet-specific security advice.'
      },
      {
        id: 'no_mobile',
        text: '❌ No - Just this computer',
        facts: { "has_mobile": false },
        feedback: 'Got it! We\'ll focus on desktop security.'
      }
    ]
  },

  // Usage Context
  {
    id: 'usage_context',
    phase: 'onboarding',
    priority: PRIORITY.USAGE_CONTEXT,
    text: 'What\'s your main concern about digital security?',
    tags: ['onboarding'],
    conditions: {
      include: { "tech_comfort": "*" }
    },
    options: [
      {
        id: 'personal_data',
        text: '🔐 Protecting personal information',
        facts: { "priority_concern": "privacy" },
        feedback: 'Smart focus! We\'ll prioritize privacy and data protection.'
      },
      {
        id: 'financial',
        text: '💳 Financial security',
        facts: { "priority_concern": "financial" },
        feedback: 'Critical area! We\'ll emphasize financial security practices.'
      },
      {
        id: 'family_safety',
        text: '👨‍👩‍👧‍👦 Family/children\'s safety online',
        facts: { "priority_concern": "family" },
        feedback: 'Important! We\'ll include family-focused security advice.'
      },
      {
        id: 'work_security',
        text: '💼 Work/professional security',
        facts: { "priority_concern": "work" },
        feedback: 'Great! We\'ll include professional security considerations.'
      },
      {
        id: 'general',
        text: '🌐 General security best practices',
        facts: { "priority_concern": "general" },
        feedback: 'Excellent approach! We\'ll cover comprehensive security fundamentals.'
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