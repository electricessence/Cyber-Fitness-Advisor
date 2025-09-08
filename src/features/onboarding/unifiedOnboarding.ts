/**
 * Unified Onboarding Questions
 * Consolidates all onboarding approaches into one comprehensive flow
 */

import type { DetectedDevice } from '../device/deviceDetection';

export interface OnboardingQuestion {
  id: string;
  question: string;
  context: string;
  type: 'confirmation' | 'selection' | 'scale';
  options: OnboardingOption[];
  showIf?: (device: DetectedDevice, answers: Record<string, string>) => boolean;
  category: 'device' | 'security' | 'experience';
}

export interface OnboardingOption {
  value: string;
  text: string;
  description?: string;
  points: number;
  feedback: string;
  tip?: string;
}

/**
 * Comprehensive onboarding questions that replace all previous systems
 */
/**
 * OS-Specific Sequential Onboarding Questions
 * Each question builds on the previous answers with targeted, device-specific questions
 */
export const UNIFIED_ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  // Step 1: OS Confirmation - Show the specific OS we detected
  {
    id: 'windows_confirmation',
    question: 'Are you using a Windows computer?',
    context: 'We detected Windows. Confirming this helps us provide specific security recommendations.',
    type: 'confirmation',
    category: 'device',
    showIf: (device) => device.os === 'windows',
    options: [
      {
        value: 'yes',
        text: '✅ Yes, I\'m using Windows',
        points: 0,
        feedback: '✅ Great! We\'ll provide Windows-specific security advice.',
        tip: 'Windows has excellent built-in security features we can help you enable!'
      },
      {
        value: 'no',
        text: '❌ No, different operating system',
        points: 0,
        feedback: '👍 Thanks for the correction! We\'ll ask what you\'re using.',
        tip: 'Accuracy helps us give you the best recommendations.'
      }
    ]
  },

  {
    id: 'mac_confirmation',
    question: 'Are you using a Mac computer?',
    context: 'We detected macOS. Confirming this helps us provide specific security recommendations.',
    type: 'confirmation',
    category: 'device',
    showIf: (device) => device.os === 'mac',
    options: [
      {
        value: 'yes',
        text: '✅ Yes, I\'m using macOS',
        points: 0,
        feedback: '✅ Great! We\'ll provide macOS-specific security advice.',
        tip: 'Macs have excellent security features built-in!'
      },
      {
        value: 'no',
        text: '❌ No, different operating system',
        points: 0,
        feedback: '👍 Thanks for the correction! We\'ll ask what you\'re using.',
        tip: 'Accuracy helps us give you the best recommendations.'
      }
    ]
  },

  {
    id: 'linux_confirmation',
    question: 'Are you using a Linux computer?',
    context: 'We detected Linux. Confirming this helps us provide specific security recommendations.',
    type: 'confirmation',
    category: 'device',
    showIf: (device) => device.os === 'linux',
    options: [
      {
        value: 'yes',
        text: '✅ Yes, I\'m using Linux',
        points: 0,
        feedback: '✅ Great! We\'ll provide Linux-specific security advice.',
        tip: 'Linux users tend to be security-conscious - we\'ll help optimize!'
      },
      {
        value: 'no',
        text: '❌ No, different operating system',
        points: 0,
        feedback: '👍 Thanks for the correction! We\'ll ask what you\'re using.',
        tip: 'Accuracy helps us give you the best recommendations.'
      }
    ]
  },

  // Step 2: OS Selection for unknown or denied detection
  {
    id: 'os_selection',
    question: 'What operating system are you using?',
    context: 'Please help us identify your operating system so we can give you relevant advice.',
    type: 'selection',
    category: 'device',
    showIf: (device, answers) => {
      // Show if OS detection failed or user denied the detected OS
      return device.os === 'unknown' || 
             answers.windows_confirmation === 'no' ||
             answers.mac_confirmation === 'no' ||
             answers.linux_confirmation === 'no';
    },
    options: [
      {
        value: 'windows',
        text: '� Windows',
        description: 'Windows 10, 11, or other version',
        points: 0,
        feedback: '✅ Thanks! We\'ll provide Windows-specific security advice.',
        tip: 'Windows has many built-in security features we can help you enable!'
      },
      {
        value: 'mac',
        text: '🍎 macOS',
        description: 'Any Mac computer',
        points: 0,
        feedback: '✅ Thanks! We\'ll provide macOS-specific security advice.',
        tip: 'Macs have excellent security features built-in!'
      },
      {
        value: 'linux',
        text: '🐧 Linux',
        description: 'Ubuntu, Debian, Fedora, etc.',
        points: 0,
        feedback: '✅ Thanks! We\'ll provide Linux-specific security advice.',
        tip: 'Linux users tend to be security-conscious!'
      },
      {
        value: 'mobile',
        text: '📱 Mobile device',
        description: 'iPhone or Android',
        points: 0,
        feedback: '📱 We\'ll provide mobile-specific security advice.',
        tip: 'Mobile security is just as important as computer security!'
      }
    ]
  },

  // Step 3: Browser Confirmation (only show for confirmed computer users)
  {
    id: 'chrome_confirmation',
    question: 'Are you primarily using Google Chrome as your web browser?',
    context: 'We detected Chrome. Knowing your browser helps us recommend specific security settings.',
    type: 'confirmation',
    category: 'device',
    showIf: (device, answers) => {
      const hasConfirmedOS = answers.windows_confirmation === 'yes' || 
                           answers.mac_confirmation === 'yes' || 
                           answers.linux_confirmation === 'yes' ||
                           ['windows', 'mac', 'linux'].includes(answers.os_selection);
      return hasConfirmedOS && device.browser === 'chrome';
    },
    options: [
      {
        value: 'yes',
        text: '✅ Yes, Chrome is my main browser',
        points: 0,
        feedback: '✅ Great! We\'ll provide Chrome-specific security recommendations.',
        tip: 'Chrome has excellent security features and extension support!'
      },
      {
        value: 'no',
        text: '❌ No, I use a different browser',
        points: 0,
        feedback: '� Thanks! We\'ll ask which browser you prefer.',
        tip: 'All modern browsers have good security features!'
      }
    ]
  },

  {
    id: 'firefox_confirmation',
    question: 'Are you primarily using Mozilla Firefox as your web browser?',
    context: 'We detected Firefox. Knowing your browser helps us recommend specific security settings.',
    type: 'confirmation',
    category: 'device',
    showIf: (device, answers) => {
      const hasConfirmedOS = answers.windows_confirmation === 'yes' || 
                           answers.mac_confirmation === 'yes' || 
                           answers.linux_confirmation === 'yes' ||
                           ['windows', 'mac', 'linux'].includes(answers.os_selection);
      return hasConfirmedOS && device.browser === 'firefox';
    },
    options: [
      {
        value: 'yes',
        text: '✅ Yes, Firefox is my main browser',
        points: 0,
        feedback: '✅ Excellent choice! Firefox has great privacy features.',
        tip: 'Firefox is excellent for privacy-conscious users!'
      },
      {
        value: 'no',
        text: '❌ No, I use a different browser',
        points: 0,
        feedback: '👍 Thanks! We\'ll ask which browser you prefer.',
        tip: 'All modern browsers have good security features!'
      }
    ]
  },

  // Step 4: Browser Selection (fallback for unknown browsers or denied detection)
  {
    id: 'browser_selection',
    question: 'What web browser do you use most often?',
    context: 'Knowing your primary browser helps us recommend specific security settings.',
    type: 'selection',
    category: 'device',
    showIf: (device, answers) => {
      const hasConfirmedOS = answers.windows_confirmation === 'yes' || 
                           answers.mac_confirmation === 'yes' || 
                           answers.linux_confirmation === 'yes' ||
                           ['windows', 'mac', 'linux'].includes(answers.os_selection);
      const deniedBrowser = answers.chrome_confirmation === 'no' || 
                          answers.firefox_confirmation === 'no';
      const unknownBrowser = device.browser === 'unknown';
      
      return hasConfirmedOS && (deniedBrowser || unknownBrowser);
    },
    options: [
      {
        value: 'chrome',
        text: '🟢 Google Chrome',
        description: 'Most popular browser',
        points: 0,
        feedback: '✅ Chrome has excellent security features and extension support!',
        tip: 'Chrome updates automatically and has strong sandboxing!'
      },
      {
        value: 'firefox',
        text: '🦊 Mozilla Firefox',
        description: 'Privacy-focused browser',
        points: 0,
        feedback: '✅ Excellent choice! Firefox prioritizes user privacy.',
        tip: 'Firefox has excellent tracking protection built-in!'
      },
      {
        value: 'safari',
        text: '🧭 Safari',
        description: 'Default on Mac/iPhone',
        points: 0,
        feedback: '✅ Safari has strong privacy features and tight OS integration.',
        tip: 'Safari blocks many trackers by default!'
      },
      {
        value: 'edge',
        text: '🔷 Microsoft Edge',
        description: 'Default on Windows',
        points: 0,
        feedback: '✅ Edge has improved significantly with good security features!',
        tip: 'Modern Edge is built on Chromium with enhanced security!'
      }
    ]
  }
];

/**
 * Process onboarding answers to create user profile
 */
export interface OnboardingProfile {
  deviceInfo: DetectedDevice;
  confirmedOS: 'windows' | 'mac' | 'linux' | 'mobile' | 'unknown';
  confirmedBrowser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown';
  totalScore: number;
  answers: Record<string, string>;
}

/**
 * Calculate onboarding score and create profile
 */
export function processOnboardingAnswers(
  answers: Record<string, string>,
  detectedDevice: DetectedDevice
): OnboardingProfile {
  let totalScore = 0;
  
  // Calculate score from all answers
  UNIFIED_ONBOARDING_QUESTIONS.forEach(question => {
    const answer = answers[question.id];
    if (answer) {
      const option = question.options.find(opt => opt.value === answer);
      if (option) {
        totalScore += option.points;
      }
    }
  });
  
  // Determine confirmed OS
  let confirmedOS: OnboardingProfile['confirmedOS'] = 'unknown';
  if (answers.windows_confirmation === 'yes') confirmedOS = 'windows';
  else if (answers.mac_confirmation === 'yes') confirmedOS = 'mac';  
  else if (answers.linux_confirmation === 'yes') confirmedOS = 'linux';
  else if (answers.os_selection) confirmedOS = answers.os_selection as OnboardingProfile['confirmedOS'];
  else {
    // Map detected device OS to confirmed OS
    switch (detectedDevice.os) {
      case 'windows': confirmedOS = 'windows'; break;
      case 'mac': confirmedOS = 'mac'; break;
      case 'linux': confirmedOS = 'linux'; break;
      case 'ios':
      case 'android': confirmedOS = 'mobile'; break;
      default: confirmedOS = 'unknown'; break;
    }
  }
  
  // Determine confirmed browser
  let confirmedBrowser: OnboardingProfile['confirmedBrowser'] = 'unknown';
  if (answers.chrome_confirmation === 'yes') confirmedBrowser = 'chrome';
  else if (answers.firefox_confirmation === 'yes') confirmedBrowser = 'firefox';
  else if (answers.browser_selection) confirmedBrowser = answers.browser_selection as OnboardingProfile['confirmedBrowser'];
  else confirmedBrowser = detectedDevice.browser === 'unknown' ? 'unknown' : detectedDevice.browser;
  
  return {
    deviceInfo: detectedDevice,
    confirmedOS,
    confirmedBrowser,
    totalScore,
    answers
  };
}
