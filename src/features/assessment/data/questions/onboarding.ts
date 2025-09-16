// Level 0 Onboarding Questions
// Privacy-first onboarding flow with device detection and user context

import type { Question } from '../../engine/schema';
import { ONBOARDING_PRIORITIES } from './priorities.js';

export const onboardingQuestions: Question[] = [
  // Privacy Notice - Highest Priority (must be first)
  {
    id: 'privacy_notice',
    phase: 'onboarding',
    priority: ONBOARDING_PRIORITIES.PRIVACY_NOTICE,
    resettable: false, // Cannot reset privacy acknowledgment
    statement: '🔒 Privacy First',
    text: 'Your data stays on your device. No tracking, no cloud storage.',
    tags: ['critical', 'onboarding', 'privacy'],
    options: [
      {
        id: 'understood',
        text: '✅ I understand',
        statement: 'Privacy: Acknowledged ✓',
        statusCategory: 'shields-up',
        facts: { "privacy_acknowledged": true },
        feedback: '🔒 Perfect! Your security assessment begins now.'
      }
    ]
  },

  // OS Confirmation - Windows (when detected)
  {
    id: 'windows_detection_confirm',
    phase: 'onboarding',
    priority: ONBOARDING_PRIORITIES.OS_DETECTION,
    resettable: false, // Cannot reset OS detection
    statement: '🖥️ Detected: Windows Operating System',
    text: 'Is this correct?',
    tags: ['critical', 'onboarding'],
    conditions: {
      include: { "os_detected": "windows" },
      exclude: { "os_confirmed": true }
    },
    options: [
      { 
        id: 'yes',
        text: '✅ Yes, I use Windows',
        statement: 'Desktop OS: Windows',
        statusCategory: 'shields-up',
        facts: { "os": "windows", "os_confirmed": true },
        feedback: 'Great! We\'ll provide Windows-specific security advice.'
      },
      { 
        id: 'no',
        text: '❌ No, that\'s wrong',
        statement: 'Desktop OS: Unconfirmed',
        statusCategory: 'room-for-improvement',
        facts: { "os_confirmed": false },
        feedback: 'No problem! We\'ll ask you to select your actual OS.'
      }
    ]
  },

  // OS Confirmation - macOS (when detected)
  {
    id: 'mac_detection_confirm',
    phase: 'onboarding',
    priority: ONBOARDING_PRIORITIES.OS_DETECTION,
    statement: '🍎 Detected: macOS',
    text: 'Is this correct?',
    tags: ['critical', 'onboarding'],
    conditions: {
      include: { "os_detected": "mac" },
      exclude: { "os_confirmed": true }
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
    priority: ONBOARDING_PRIORITIES.OS_DETECTION,
    statement: '🐧 Detected: Linux',
    text: 'Is this correct?',
    tags: ['critical', 'onboarding'],
    conditions: {
      include: { "os_detected": "linux" },
      exclude: { "os_confirmed": true }
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
    priority: ONBOARDING_PRIORITIES.OS_SELECTION,
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
    priority: ONBOARDING_PRIORITIES.BROWSER_DETECTION,
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
    priority: ONBOARDING_PRIORITIES.BROWSER_DETECTION,
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
    priority: ONBOARDING_PRIORITIES.BROWSER_DETECTION,
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
    priority: ONBOARDING_PRIORITIES.BROWSER_DETECTION,
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
    priority: ONBOARDING_PRIORITIES.BROWSER_SELECTION,
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
    priority: ONBOARDING_PRIORITIES.TECH_COMFORT,
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
    priority: ONBOARDING_PRIORITIES.MOBILE_CONTEXT,
    text: 'Do you also use a smartphone or tablet for important activities like email, banking, or work?',
    tags: ['onboarding'],
    conditions: {
      include: { "tech_comfort": "*" },
      exclude: { "os": "mobile_only" }
    },
    options: [
      {
        id: 'iphone',
        text: '📱 Yes - iPhone (iOS)',
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
    priority: ONBOARDING_PRIORITIES.USAGE_CONTEXT,
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
