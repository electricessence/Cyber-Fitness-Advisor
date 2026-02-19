// Level 0 Onboarding Questions
// Privacy-first onboarding flow with device detection and user context

import type { Question } from '../../engine/schema';
import { ONBOARDING_PRIORITIES, ASSESSMENT_PRIORITIES } from './priorities.js';

export const onboardingQuestions: Question[] = [
  // Privacy Notice - Highest Priority (must be first)
  {
    id: 'privacy_notice',
    phase: 'onboarding',
    priority: ONBOARDING_PRIORITIES.PRIVACY_NOTICE,
    statement: '🔒 Privacy First',
    text: 'Everything happens right here in your browser—nothing is uploaded, logged, or analyzed on our side.',
    description: 'We do not run servers for this assessment. You can verify by opening DevTools → Network (no calls leave the page) or by going offline; the experience still works because all data is stored in your browser.',
    tags: ['critical', 'onboarding', 'privacy'],
    journeyIntent: 'onboarding',
    conditions: {
      exclude: { "privacy_acknowledged": true }
    },
    options: [
      {
        id: 'understood',
        text: '✅ Continue locally (keep everything on this device)',
        statement: 'Privacy: Acknowledged ✓',
        statusCategory: 'shields-up',
        facts: { "privacy_acknowledged": true },
        feedback: '🔒 Perfect! We will keep every answer on this device only.'
      }
    ]
  },

  // OS Confirmation - Windows (when detected)
  {
    id: 'windows_detection_confirm',
    phase: 'onboarding',
    priority: ONBOARDING_PRIORITIES.OS_DETECTION,
    statement: '🖥️ Detected: Windows Operating System',
    text: 'Is this correct?',
    tags: ['critical', 'onboarding'],
    journeyIntent: 'onboarding',
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
      },
      { 
        id: 'unsure',
        text: '🤔 I\'m not sure',
        statement: 'Desktop OS: Needs guidance',
        statusCategory: 'to-do',
        facts: { "os_confirmed": false, "tech_comfort": "novice" },
        feedback: 'No worries! We\'ll help you figure out what you\'re using.'
      },
      {
        id: 'prefer_not',
        text: '🙈 I\'d rather not say',
        statement: 'Desktop OS: Preferred not to share',
        statusCategory: 'shields-up',
        facts: { "os": "unknown", "os_confirmed": true },
        feedback: 'No problem at all! We\'ll give you general advice that works everywhere.'
      }
    ]
  },

  // Novice OS Help - appears when user is unsure about their OS
  {
    id: 'os_novice_help',
    phase: 'onboarding',
    priority: ONBOARDING_PRIORITIES.OS_DETECTION - 10, // Right after OS detection
    statement: '🤝 Getting OS Help',
    text: 'No problem! Do you know which operating system you are using?',
    tags: ['novice', 'onboarding'],
    journeyIntent: 'onboarding',
    conditions: {
      include: { "tech_comfort": "novice", "os_confirmed": false }
    },
    options: [
      { 
        id: 'windows',
        text: '🖥️ Windows (most common)',
        statement: 'Desktop OS: Windows (with help)',
        statusCategory: 'shields-up',
        facts: { "os": "windows", "os_confirmed": true },
        feedback: 'Great! Windows is very common. We\'ll give you Windows-specific advice.'
      },
      { 
        id: 'mac',
        text: '🍎 Mac/Apple computer',
        statement: 'Desktop OS: macOS (with help)',
        statusCategory: 'shields-up',
        facts: { "os": "mac", "os_confirmed": true },
        feedback: 'Perfect! We\'ll provide Mac-specific security guidance.'
      },
      { 
        id: 'still_unsure',
        text: '🤔 I really don\'t know',
        statement: 'Desktop OS: Will provide general advice',
        statusCategory: 'to-do',
        facts: { "os": "unknown", "os_confirmed": true, "tech_comfort": "beginner" },
        feedback: 'That\'s okay! We\'ll give you general advice that works on most computers.'
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
    journeyIntent: 'onboarding',
    conditions: {
      include: { "os_detected": "mac" },
      exclude: { "os_confirmed": true }
    },
    options: [
      { 
        id: 'yes',
        text: '✅ Yes, I use macOS',
        statement: 'Desktop OS: macOS',
        statusCategory: 'shields-up',
        facts: { "os": "mac", "os_confirmed": true },
        feedback: 'Great! We\'ll provide macOS-specific security advice.'
      },
      { 
        id: 'no',
        text: '❌ No, that\'s wrong',
        statement: 'Desktop OS: Unconfirmed',
        statusCategory: 'room-for-improvement',
        facts: { "os_confirmed": false },
        feedback: 'No problem! We\'ll ask you to select your actual OS.'
      },
      {
        id: 'prefer_not',
        text: '🙈 I\'d rather not say',
        statement: 'Desktop OS: Preferred not to share',
        statusCategory: 'shields-up',
        facts: { "os": "unknown", "os_confirmed": true },
        feedback: 'No problem at all! We\'ll give you general advice that works everywhere.'
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
    journeyIntent: 'onboarding',
    conditions: {
      include: { "os_detected": "linux" },
      exclude: { "os_confirmed": true }
    },
    options: [
      { 
        id: 'yes',
        text: '✅ Yes, I use Linux',
        statement: 'Desktop OS: Linux',
        statusCategory: 'shields-up',
        facts: { "os": "linux", "os_confirmed": true },
        feedback: 'Excellent! We\'ll provide Linux-specific security advice.'
      },
      { 
        id: 'no',
        text: '❌ No, that\'s wrong',
        statement: 'Desktop OS: Unconfirmed',
        statusCategory: 'room-for-improvement',
        facts: { "os_confirmed": false },
        feedback: 'No problem! We\'ll ask you to select your actual OS.'
      },
      {
        id: 'prefer_not',
        text: '🙈 I\'d rather not say',
        statement: 'Desktop OS: Preferred not to share',
        statusCategory: 'shields-up',
        facts: { "os": "unknown", "os_confirmed": true },
        feedback: 'No problem at all! We\'ll give you general advice that works everywhere.'
      }
    ]
  },

  // OS Confirmation - iOS (when detected)
  {
    id: 'ios_detection_confirm',
    phase: 'onboarding',
    priority: ONBOARDING_PRIORITIES.OS_DETECTION,
    statement: '📱 Detected: iOS (iPhone/iPad)',
    text: 'Is this correct?',
    tags: ['critical', 'onboarding'],
    journeyIntent: 'onboarding',
    conditions: {
      include: { "os_detected": "ios" },
      exclude: { "os_confirmed": true }
    },
    options: [
      {
        id: 'yes',
        text: '✅ Yes, I\'m on an iPhone/iPad',
        statement: 'Mobile OS: iOS',
        statusCategory: 'shields-up',
        facts: { "os": "ios", "os_confirmed": true, "has_mobile": true, "mobile_os": "ios" },
        feedback: 'Great! We\'ll provide iOS-specific security advice.'
      },
      {
        id: 'no',
        text: '❌ No, that\'s wrong',
        statement: 'Mobile OS: Unconfirmed',
        statusCategory: 'room-for-improvement',
        facts: { "os_confirmed": false },
        feedback: 'No problem! We\'ll ask you to select your actual device.'
      },
      {
        id: 'prefer_not',
        text: '🙈 I\'d rather not say',
        statement: 'Device: Preferred not to share',
        statusCategory: 'shields-up',
        facts: { "os": "unknown", "os_confirmed": true },
        feedback: 'No problem at all! We\'ll give you general advice that works everywhere.'
      }
    ]
  },

  // OS Confirmation - Android (when detected)
  {
    id: 'android_detection_confirm',
    phase: 'onboarding',
    priority: ONBOARDING_PRIORITIES.OS_DETECTION,
    statement: '📱 Detected: Android',
    text: 'Is this correct?',
    tags: ['critical', 'onboarding'],
    journeyIntent: 'onboarding',
    conditions: {
      include: { "os_detected": "android" },
      exclude: { "os_confirmed": true }
    },
    options: [
      {
        id: 'yes',
        text: '✅ Yes, I\'m on an Android device',
        statement: 'Mobile OS: Android',
        statusCategory: 'shields-up',
        facts: { "os": "android", "os_confirmed": true, "has_mobile": true, "mobile_os": "android" },
        feedback: 'Great! We\'ll provide Android-specific security advice.'
      },
      {
        id: 'no',
        text: '❌ No, that\'s wrong',
        statement: 'Mobile OS: Unconfirmed',
        statusCategory: 'room-for-improvement',
        facts: { "os_confirmed": false },
        feedback: 'No problem! We\'ll ask you to select your actual device.'
      },
      {
        id: 'prefer_not',
        text: '🙈 I\'d rather not say',
        statement: 'Device: Preferred not to share',
        statusCategory: 'shields-up',
        facts: { "os": "unknown", "os_confirmed": true },
        feedback: 'No problem at all! We\'ll give you general advice that works everywhere.'
      }
    ]
  },

  // OS Selection (when no OS has been detected and not confirmed)
  {
    id: 'os_selection',
    phase: 'onboarding',
    priority: ONBOARDING_PRIORITIES.OS_SELECTION,
    text: 'Which operating system do you primarily use?',
    tags: ['critical', 'onboarding'],
    journeyIntent: 'onboarding',
    conditions: {
      include: { "device_detection_completed": true },
      exclude: { 
        "os_confirmed": true,
        "os_detected": "*" // Special syntax meaning "any value"
      }
    },
    options: [
      { 
        id: 'windows',
        text: '🖥️ Windows', 
        statement: 'Desktop OS: Windows',
        statusCategory: 'shields-up',
        facts: { "os": "windows", "os_confirmed": true },
        feedback: 'Thanks! We\'ll provide Windows-specific advice.'
      },
      { 
        id: 'mac',
        text: '🍎 macOS', 
        statement: 'Desktop OS: macOS',
        statusCategory: 'shields-up',
        facts: { "os": "mac", "os_confirmed": true },
        feedback: 'Great! We\'ll provide macOS-specific advice.'
      },
      { 
        id: 'linux',
        text: '🐧 Linux', 
        statement: 'Desktop OS: Linux',
        statusCategory: 'shields-up',
        facts: { "os": "linux", "os_confirmed": true },
        feedback: 'Excellent! We\'ll provide Linux-specific advice.'
      },
      { 
        id: 'mobile_only',
        text: '📱 I only use mobile devices', 
        statement: 'Primary Device: Mobile Only',
        statusCategory: 'shields-up',
        facts: { "os": "mobile_only", "os_confirmed": true },
        feedback: 'Got it! We\'ll focus on mobile security.'
      },
      { 
        id: 'other',
        text: '🔧 Other/Multiple systems', 
        statement: 'Desktop OS: Multiple/Other',
        statusCategory: 'shields-up',
        facts: { "os": "other", "os_confirmed": true },
        feedback: 'Thanks! We\'ll provide general security advice.'
      },
      {
        id: 'prefer_not',
        text: '🙈 I\'d rather not say',
        statement: 'Desktop OS: Preferred not to share',
        statusCategory: 'shields-up',
        facts: { "os": "unknown", "os_confirmed": true },
        feedback: 'No problem at all! We\'ll give you general advice that works everywhere.'
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
    journeyIntent: 'onboarding',
    conditions: {
      include: { "os_confirmed": true, "browser_detected": "chrome" },
      exclude: { "browser_confirmed": true }
    },
    options: [
      { 
        id: 'yes',
        text: '✅ Yes, Chrome is my main browser',
        statement: 'Primary Browser: Chrome',
        statusCategory: 'shields-up',
        facts: { "browser": "chrome", "browser_confirmed": true }
      },
      { 
        id: 'no',
        text: '❌ No, I use a different browser',
        statement: 'Primary Browser: Not Chrome',
        statusCategory: 'to-do',
        facts: { "browser_confirmed": false }
      },
      { 
        id: 'unsure',
        text: '🤔 I\'m not sure which browser I use',
        statement: 'Primary Browser: Needs guidance',
        statusCategory: 'to-do',
        facts: { "browser_confirmed": false, "tech_comfort": "novice" }
      },
      {
        id: 'prefer_not',
        text: '🙈 I\'d rather not say',
        statement: 'Primary Browser: Preferred not to share',
        statusCategory: 'shields-up',
        facts: { "browser": "unknown", "browser_confirmed": true },
        feedback: 'No problem! We\'ll provide general browser security advice.'
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
    journeyIntent: 'onboarding',
    conditions: {
      include: { "os_confirmed": true, "browser_detected": "firefox" },
      exclude: { "browser_confirmed": true }
    },
    options: [
      { 
        id: 'yes',
        text: '✅ Yes, Firefox is my main browser',
        statement: 'Primary Browser: Firefox',
        statusCategory: 'shields-up',
        facts: { "browser": "firefox", "browser_confirmed": true }
      },
      { 
        id: 'no',
        text: '❌ No, I use a different browser',
        statement: 'Primary Browser: Not Firefox',
        statusCategory: 'to-do',
        facts: { "browser_confirmed": false }
      },
      { 
        id: 'unsure',
        text: '🤔 I\'m not sure which browser I use',
        statement: 'Primary Browser: Needs guidance',
        statusCategory: 'to-do',
        facts: { "browser_confirmed": false, "tech_comfort": "novice" }
      },
      {
        id: 'prefer_not',
        text: '🙈 I\'d rather not say',
        statement: 'Primary Browser: Preferred not to share',
        statusCategory: 'shields-up',
        facts: { "browser": "unknown", "browser_confirmed": true },
        feedback: 'No problem! We\'ll provide general browser security advice.'
      }
    ]
  },

  // Browser Confirmation - Edge (when detected)
  {
    id: 'edge_detection_confirm',
    phase: 'onboarding',
    priority: ONBOARDING_PRIORITIES.BROWSER_DETECTION,
    statement: '🔵 Detected: Microsoft Edge',
    text: 'Is this correct?',
    tags: ['onboarding'],
    journeyIntent: 'onboarding',
    conditions: {
      include: { "os_confirmed": true, "browser_detected": "edge" },
      exclude: { "browser_confirmed": true }
    },
    options: [
      { 
        id: 'yes',
        text: '✅ Yes, Edge is my main browser',
        statement: 'Primary Browser: Microsoft Edge',
        statusCategory: 'shields-up',
        facts: { "browser": "edge", "browser_confirmed": true }
      },
      { 
        id: 'no',
        text: '❌ No, I use a different browser',
        statement: 'Primary Browser: Not Edge',
        statusCategory: 'to-do',
        facts: { "browser_confirmed": false }
      },
      { 
        id: 'unsure',
        text: '🤔 I\'m not sure which browser I use',
        statement: 'Primary Browser: Needs guidance',
        statusCategory: 'to-do',
        facts: { "browser_confirmed": false, "tech_comfort": "novice" }
      },
      {
        id: 'prefer_not',
        text: '🙈 I\'d rather not say',
        statement: 'Primary Browser: Preferred not to share',
        statusCategory: 'shields-up',
        facts: { "browser": "unknown", "browser_confirmed": true },
        feedback: 'No problem! We\'ll provide general browser security advice.'
      }
    ]
  },

  // Browser Confirmation - Safari (when detected)
  {
    id: 'safari_detection_confirm',
    phase: 'onboarding',
    priority: ONBOARDING_PRIORITIES.BROWSER_DETECTION,
    statement: '🧭 Detected: Safari Browser',
    text: 'Is this correct?',
    tags: ['onboarding'],
    journeyIntent: 'onboarding',
    conditions: {
      include: { "os_confirmed": true, "browser_detected": "safari" },
      exclude: { "browser_confirmed": true }
    },
    options: [
      { 
        id: 'yes',
        text: '✅ Yes, Safari is my main browser',
        statement: 'Primary Browser: Safari',
        statusCategory: 'shields-up',
        facts: { "browser": "safari", "browser_confirmed": true }
      },
      { 
        id: 'no',
        text: '❌ No, I use a different browser',
        statement: 'Primary Browser: Not Safari',
        statusCategory: 'to-do',
        facts: { "browser_confirmed": false }
      },
      { 
        id: 'unsure',
        text: '🤔 I\'m not sure which browser I use',
        statement: 'Primary Browser: Needs guidance',
        statusCategory: 'to-do',
        facts: { "browser_confirmed": false, "tech_comfort": "novice" }
      },
      {
        id: 'prefer_not',
        text: '🙈 I\'d rather not say',
        statement: 'Primary Browser: Preferred not to share',
        statusCategory: 'shields-up',
        facts: { "browser": "unknown", "browser_confirmed": true },
        feedback: 'No problem! We\'ll provide general browser security advice.'
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
    journeyIntent: 'onboarding',
    conditions: {
      include: { "os_confirmed": true, "browser_detected": "unknown" },
      exclude: { "browser_confirmed": true }
    },
    options: [
      { 
        id: 'chrome',
        text: '🌐 Chrome', 
        statement: 'Primary Browser: Chrome',
        statusCategory: 'shields-up',
        facts: { "browser": "chrome", "browser_confirmed": true },
        feedback: 'Thanks! We\'ll provide Chrome-specific security tips.'
      },
      { 
        id: 'firefox',
        text: '🦊 Firefox', 
        statement: 'Primary Browser: Firefox',
        statusCategory: 'shields-up',
        facts: { "browser": "firefox", "browser_confirmed": true },
        feedback: 'Great! We\'ll provide Firefox-specific security tips.'
      },
      { 
        id: 'edge',
        text: '🔵 Microsoft Edge', 
        statement: 'Primary Browser: Edge',
        statusCategory: 'shields-up',
        facts: { "browser": "edge", "browser_confirmed": true },
        feedback: 'Perfect! We\'ll provide Edge-specific security tips.'
      },
      { 
        id: 'safari',
        text: '🧭 Safari', 
        statement: 'Primary Browser: Safari',
        statusCategory: 'shields-up',
        facts: { "browser": "safari", "browser_confirmed": true },
        feedback: 'Excellent! We\'ll provide Safari-specific security tips.'
      },
      { 
        id: 'other',
        text: '🔧 Other browser', 
        statement: 'Primary Browser: Other',
        statusCategory: 'shields-up',
        facts: { "browser": "other", "browser_confirmed": true },
        feedback: 'Thanks! We\'ll provide general browser security advice.'
      },
      {
        id: 'prefer_not',
        text: '🙈 I\'d rather not say',
        statement: 'Primary Browser: Preferred not to share',
        statusCategory: 'shields-up',
        facts: { "browser": "unknown", "browser_confirmed": true },
        feedback: 'No problem! We\'ll provide general browser security advice.'
      }
    ]
  },

  // Browser Selection (when detection was rejected)
  {
    id: 'browser_selection_fallback',
    phase: 'onboarding',
    priority: ONBOARDING_PRIORITIES.BROWSER_SELECTION - 10, // Lower priority than main selection
    text: 'Which browser do you primarily use?',
    tags: ['onboarding'],
    journeyIntent: 'onboarding',
    conditions: {
      include: { "os_confirmed": true, "browser_confirmed": false },
      exclude: { "browser_detected": "unknown" } // Don't show if browser was never detected
    },
    options: [
      { 
        id: 'chrome',
        text: '🌐 Chrome', 
        statement: 'Primary Browser: Chrome',
        statusCategory: 'shields-up',
        facts: { "browser": "chrome", "browser_confirmed": true },
        feedback: 'Thanks! We\'ll provide Chrome-specific security tips.'
      },
      { 
        id: 'firefox',
        text: '🦊 Firefox', 
        statement: 'Primary Browser: Firefox',
        statusCategory: 'shields-up',
        facts: { "browser": "firefox", "browser_confirmed": true },
        feedback: 'Great! We\'ll provide Firefox-specific security tips.'
      },
      { 
        id: 'edge',
        text: '🔵 Microsoft Edge', 
        statement: 'Primary Browser: Edge',
        statusCategory: 'shields-up',
        facts: { "browser": "edge", "browser_confirmed": true },
        feedback: 'Perfect! We\'ll provide Edge-specific security tips.'
      },
      { 
        id: 'safari',
        text: '🧭 Safari', 
        statement: 'Primary Browser: Safari',
        statusCategory: 'shields-up',
        facts: { "browser": "safari", "browser_confirmed": true },
        feedback: 'Excellent! We\'ll provide Safari-specific security tips.'
      },
      { 
        id: 'other',
        text: '🔧 Other browser', 
        statement: 'Primary Browser: Other',
        statusCategory: 'shields-up',
        facts: { "browser": "other", "browser_confirmed": true },
        feedback: 'Thanks! We\'ll provide general browser security advice.'
      },
      {
        id: 'prefer_not',
        text: '🙈 I\'d rather not say',
        statement: 'Primary Browser: Preferred not to share',
        statusCategory: 'shields-up',
        facts: { "browser": "unknown", "browser_confirmed": true },
        feedback: 'No problem! We\'ll provide general browser security advice.'
      }
    ]
  },

  // Technology Comfort Assessment
  {
    id: 'tech_comfort',
    // Stint 6: About You — personalization earned after 3 action wins
    priority: ASSESSMENT_PRIORITIES.ABOUT_YOU_TECH_COMFORT,
    text: 'How would you describe your comfort with technology?',
    tags: ['probe'],
    journeyIntent: 'probe',
    conditions: {
      include: { "os_confirmed": true }
    },
    options: [
      {
        id: 'beginner',
        text: '👶 Beginner - I stick to basics',
        statement: 'Tech Experience: Beginner',
        statusCategory: 'shields-up',
        facts: { "tech_comfort": "beginner" },
        feedback: 'Perfect! We\'ll focus on simple, high-impact security steps.'
      },
      {
        id: 'comfortable',
        text: '👍 Comfortable - I can follow instructions',
        statement: 'Tech Experience: Comfortable',
        statusCategory: 'shields-up',
        facts: { "tech_comfort": "comfortable" },
        feedback: 'Great! We\'ll give you clear steps for important security measures.'
      },
      {
        id: 'advanced',
        text: '🛠️ Advanced - I enjoy tweaking settings',
        statement: 'Tech Experience: Advanced',
        statusCategory: 'shields-up',
        facts: { "tech_comfort": "advanced" },
        feedback: 'Excellent! We can recommend more comprehensive security configurations.'
      }
    ]
  },

  // Mobile OS Selection (for users who selected "mobile only" from os_selection)
  {
    id: 'mobile_os_selection',
    // Moved out of onboarding — only needed for mobile-specific deep-dives
    priority: 46, // Just above mobile security questions
    text: 'Which mobile operating system do you use?',
    tags: ['mobile', 'probe'],
    journeyIntent: 'probe',
    conditions: {
      include: { "os": "mobile_only" },
      exclude: { "mobile_os": "*" }
    },
    options: [
      {
        id: 'ios',
        text: '📱 iPhone / iPad (iOS)',
        statement: 'Mobile OS: iOS',
        statusCategory: 'shields-up',
        facts: { "has_mobile": true, "mobile_os": "ios" },
        feedback: 'Got it! We\'ll focus on iOS security.'
      },
      {
        id: 'android',
        text: '📱 Android',
        statement: 'Mobile OS: Android',
        statusCategory: 'shields-up',
        facts: { "has_mobile": true, "mobile_os": "android" },
        feedback: 'Got it! We\'ll focus on Android security.'
      },
      {
        id: 'other',
        text: '📱 Other',
        statement: 'Mobile OS: Other',
        statusCategory: 'shields-up',
        facts: { "has_mobile": true, "mobile_os": "other" },
        feedback: 'Got it! We\'ll include general mobile security advice.'
      },
      {
        id: 'prefer_not',
        text: '🙈 I\'d rather not say',
        statement: 'Mobile OS: Preferred not to share',
        statusCategory: 'shields-up',
        facts: { "has_mobile": false, "mobile_os": "undisclosed" },
        feedback: 'No problem! We\'ll skip mobile-specific questions.'
      }
    ]
  },

  // Mobile Device Context (for desktop users who haven't set mobile_os yet)
  {
    id: 'mobile_context',
    // Moved out of onboarding — asked before mobile-specific questions
    priority: 45, // Just above mobile security questions
    text: 'Do you also use a smartphone or tablet?',
    tags: ['mobile', 'probe'],
    journeyIntent: 'probe',
    conditions: {
      include: { "tech_comfort": "*" },
      exclude: { "mobile_os": "*" }
    },
    options: [
      {
        id: 'ios',
        text: '📱 iOS (iPhone / iPad)',
        statement: 'Mobile Device: iOS',
        statusCategory: 'shields-up',
        facts: { "has_mobile": true, "mobile_os": "ios" },
        feedback: 'Great! We\'ll include iOS security recommendations.'
      },
      {
        id: 'android',
        text: '📱 Android',
        statement: 'Mobile Device: Android',
        statusCategory: 'shields-up',
        facts: { "has_mobile": true, "mobile_os": "android" },
        feedback: 'Perfect! We\'ll include Android security recommendations.'
      },
      {
        id: 'other',
        text: '📱 Other',
        statement: 'Mobile Device: Other',
        statusCategory: 'shields-up',
        facts: { "has_mobile": true, "mobile_os": "other" },
        feedback: 'Got it! We\'ll include general mobile security advice.'
      },
      {
        id: 'neither',
        text: '❌ Neither — just this computer',
        statement: 'Mobile Devices: Desktop Only',
        statusCategory: 'shields-up',
        facts: { "has_mobile": false },
        feedback: 'Got it! We\'ll focus on desktop security.'
      },
      {
        id: 'prefer_not',
        text: '🙈 I\'d rather not say',
        statement: 'Mobile Devices: Preferred not to share',
        statusCategory: 'shields-up',
        facts: { "has_mobile": false, "mobile_os": "undisclosed" },
        feedback: 'No problem! We\'ll skip mobile-specific questions.'
      }
    ]
  },

  // Usage Context
  {
    id: 'usage_context',
    // Stint 6: About You — personalization earned after 3 action wins
    priority: ASSESSMENT_PRIORITIES.ABOUT_YOU_USAGE_CONTEXT,
    text: 'What\'s your main concern about digital security?',
    tags: ['probe'],
    journeyIntent: 'probe',
    conditions: {
      include: { "tech_comfort": "*" }
    },
    options: [
      {
        id: 'personal_data',
        text: '🔐 Protecting personal information',
        statement: 'Security Focus: Privacy Protection',
        statusCategory: 'shields-up',
        facts: { "priority_concern": "privacy" },
        feedback: 'Smart focus! We\'ll prioritize privacy and data protection.'
      },
      {
        id: 'financial',
        text: '💳 Financial security',
        statement: 'Security Focus: Financial Protection',
        statusCategory: 'shields-up',
        facts: { "priority_concern": "financial" },
        feedback: 'Critical area! We\'ll emphasize financial security practices.'
      },
      {
        id: 'family_safety',
        text: '👨‍👩‍👧‍👦 Family/children\'s safety online',
        statement: 'Security Focus: Family Safety',
        statusCategory: 'shields-up',
        facts: { "priority_concern": "family" },
        feedback: 'Important! We\'ll include family-focused security advice.'
      },
      {
        id: 'work_security',
        text: '💼 Work/professional security',
        statement: 'Security Focus: Professional',
        statusCategory: 'shields-up',
        facts: { "priority_concern": "work" },
        feedback: 'Great! We\'ll include professional security considerations.'
      },
      {
        id: 'general',
        text: '🌐 General security best practices',
        statement: 'Security Focus: Comprehensive',
        statusCategory: 'shields-up',
        facts: { "priority_concern": "general" },
        feedback: 'Excellent approach! We\'ll cover comprehensive security fundamentals.'
      },
      {
        id: 'all_above',
        text: '🛡️ All of the above!',
        statement: 'Security Focus: Everything',
        statusCategory: 'shields-up',
        facts: { "priority_concern": "all" },
        feedback: 'You\'re serious about security! We\'ll make sure every angle is covered.'
      }
    ]
  }
];
