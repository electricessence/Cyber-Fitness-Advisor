/**
 * Unified Onboarding Questions
 * Consolidates all onboarding approaches into one comprehensive flow
 */

import type { DetectedDevice } from '../device/deviceDetection';

export interface OnboardingQuestion {
  id: string;
  text: string;
  context: string;
  type: 'confirmation' | 'selection' | 'scale';
  options: OnboardingOption[];
  skipIf?: (device: DetectedDevice, answers: Record<string, string>) => boolean;
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
export const UNIFIED_ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'device_confirmation',
    text: 'I detected you\'re using a {{deviceDescription}}. Is that correct?',
    context: 'Knowing your device helps us give you specific, actionable security advice.',
    type: 'confirmation',
    category: 'device',
    options: [
      {
        value: 'yes',
        text: '✅ Yes, that\'s correct',
        points: 0,
        feedback: '✅ Great! We can give you device-specific security tips.',
        tip: 'Device-specific advice is always more effective!'
      },
      {
        value: 'no',
        text: '❌ No, let me specify',
        points: 0,
        feedback: '👍 Thanks for the correction! What device are you using?',
        tip: 'Being accurate helps us help you better.'
      }
    ]
  },
  
  {
    id: 'browser_confirmation',
    text: 'Is {{browserName}} your primary browser?',
    context: 'Knowing your primary browser helps us provide relevant security settings and extensions.',
    type: 'confirmation',
    category: 'device',
    options: [
      {
        value: 'yes',
        text: '✅ Yes, that\'s my primary browser',
        points: 0,
        feedback: '✅ Great! We can give you browser-specific security advice.',
        tip: 'Browser-specific recommendations are more actionable!'
      },
      {
        value: 'no',
        text: '❌ No, I use a different browser primarily',
        points: 0,
        feedback: '👍 Thanks! What browser do you use most often?',
        tip: 'We\'ll ask you to specify your main browser next'
      }
    ]
  },
  
  {
    id: 'primary_mobile',
    text: 'What type of mobile device do you primarily use?',
    context: 'Mobile devices have different security considerations than desktop computers.',
    type: 'selection', 
    category: 'device',
    options: [
      {
        value: 'iphone',
        text: '📱 iPhone',
        description: 'Any iPhone model',
        points: 0,
        feedback: '📱 iPhone users get iOS-specific security recommendations!',
        tip: 'iPhones have excellent built-in security features'
      },
      {
        value: 'android',
        text: '🤖 Android phone', 
        description: 'Samsung, Google Pixel, etc.',
        points: 0,
        feedback: '🤖 Android users get Google Play security tips!',
        tip: 'Android has great customization and security options'
      },
      {
        value: 'other_smartphone',
        text: '📲 Other smartphone',
        description: 'Windows Phone, BlackBerry, or other',
        points: 0,
        feedback: '📲 Other smartphone users get general mobile security tips!',
        tip: 'Basic smartphone security principles apply across platforms'
      },
      {
        value: 'basic_phone',
        text: '📞 Basic/flip phone',
        description: 'Calls and texts only', 
        points: 0,
        feedback: '📞 Basic phones are naturally more secure!',
        tip: 'Fewer features mean fewer attack vectors'
      },
      {
        value: 'none',
        text: '❌ I don\'t have a mobile device',
        points: 0,
        feedback: '💻 Desktop-focused security coming up!',
        tip: 'We\'ll focus on computer security best practices'
      }
    ],
    skipIf: (device) => device.type === 'mobile'
  },

  {
    id: 'tech_comfort',
    text: 'How comfortable are you with technology and security settings?',
    context: 'This helps us adjust the complexity of our recommendations and instructions.',
    type: 'scale',
    category: 'experience', 
    options: [
      {
        value: 'expert',
        text: '🧠 Very comfortable',
        description: 'I can handle technical instructions',
        points: 10,
        feedback: '🧠 Expert mode activated! You\'ll get advanced security tips.',
        tip: 'We\'ll show you the most effective security practices'
      },
      {
        value: 'intermediate', 
        text: '⚡ Somewhat comfortable',
        description: 'I can follow detailed step-by-step guides',
        points: 8,
        feedback: '⚡ Perfect! You\'ll get detailed but manageable guidance.',
        tip: 'Great balance of security and usability coming up'
      },
      {
        value: 'beginner',
        text: '🌱 Not very comfortable', 
        description: 'I prefer simple, visual instructions',
        points: 6,
        feedback: '🌱 No problem! We\'ll keep things simple and effective.',
        tip: 'Simple security steps can be just as powerful'
      },
      {
        value: 'cautious',
        text: '⚠️ Very cautious',
        description: 'I want to understand before I change anything',
        points: 7,
        feedback: '⚠️ Smart approach! We\'ll explain everything clearly.',
        tip: 'Understanding security makes you more secure'
      }
    ]
  },

  {
    id: 'security_priority',
    text: 'What\'s your biggest security concern right now?',
    context: 'We\'ll prioritize recommendations based on what worries you most.',
    type: 'selection',
    category: 'security',
    options: [
      {
        value: 'passwords',
        text: '🔐 Password security',
        description: 'Managing and securing passwords',
        points: 8,
        feedback: '🔐 Password security is the foundation! Great choice.',
        tip: 'Strong passwords prevent 80% of security breaches'
      },
      {
        value: 'privacy',
        text: '🕵️ Online privacy',
        description: 'Protecting personal information online',
        points: 8, 
        feedback: '🕵️ Privacy-focused recommendations coming up!',
        tip: 'Privacy and security go hand in hand'
      },
      {
        value: 'scams',
        text: '🎣 Scams and phishing',
        description: 'Avoiding malicious emails and websites',
        points: 8,
        feedback: '🎣 Anti-scam training is incredibly valuable!',
        tip: 'Recognizing scams is a superpower in 2025'
      },
      {
        value: 'device_security',
        text: '💻 Device security',
        description: 'Keeping devices secure and updated',
        points: 8,
        feedback: '💻 Device security creates a strong foundation!',
        tip: 'Secure devices protect everything else'
      },
      {
        value: 'not_sure',
        text: '🤷 Not sure',
        description: 'I want to learn what\'s most important',
        points: 5,
        feedback: '🤷 Perfect! We\'ll show you the highest-impact areas.',
        tip: 'We\'ll help you identify your biggest risks'
      }
    ]
  },

  {
    id: 'current_habits',
    text: 'How do you currently handle software updates?',
    context: 'Updates patch security holes that hackers try to exploit daily.',
    type: 'scale',
    category: 'security',
    options: [
      {
        value: 'automatic',
        text: '🔥 Automatic updates enabled',
        description: 'Updates install automatically',
        points: 20,
        feedback: '🔥 Gold Star! You\'ve got the ultimate "set and forget" security!',
        tip: 'Automatic updates are the lazy person\'s path to great security!'
      },
      {
        value: 'install_quickly',
        text: '⚡ Install them quickly',
        description: 'I update within a few days',
        points: 18,
        feedback: '⚡ Excellent! Your quick update habits are top-tier security!',
        tip: 'You\'ve got great instincts - staying current is key!'
      },
      {
        value: 'install_eventually',
        text: '📅 Install them eventually',
        description: 'I update within a week or two',
        points: 12,
        feedback: '📅 You\'re updating, which puts you ahead of most people!',
        tip: 'Consider: auto-updates OR weekly reminders to stay current?'
      },
      {
        value: 'rarely_update',
        text: '😅 I rarely update',
        description: 'I postpone or ignore most updates',
        points: 5,
        feedback: '😅 Let\'s make this super easy for you!',
        tip: 'Try: enable auto-updates OR set a monthly "update day" reminder?'
      },
      {
        value: 'not_sure',
        text: '❓ I\'m not sure',
        description: 'I don\'t pay attention to updates',
        points: 3,
        feedback: '❓ No problem! We\'ll show you how to stay secure effortlessly.',
        tip: 'Understanding updates is the first step to better security'
      }
    ]
  }
];

/**
 * Process onboarding answers to create user profile
 */
export interface OnboardingProfile {
  deviceInfo: DetectedDevice;
  techComfort: 'expert' | 'intermediate' | 'beginner' | 'cautious';
  securityPriority: 'passwords' | 'privacy' | 'scams' | 'device_security' | 'not_sure';
  updateHabits: 'automatic' | 'install_quickly' | 'install_eventually' | 'rarely_update' | 'not_sure';
  mobileDevice: 'iphone' | 'android' | 'basic_phone' | 'none';
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
  
  return {
    deviceInfo: detectedDevice,
    techComfort: (answers.tech_comfort as any) || 'beginner',
    securityPriority: (answers.security_priority as any) || 'not_sure',
    updateHabits: (answers.current_habits as any) || 'not_sure',
    mobileDevice: (answers.primary_mobile as any) || 'none',
    totalScore,
    answers
  };
}
