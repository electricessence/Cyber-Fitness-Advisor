/**
 * Example implementation of Scenario 1: Windows Desktop User with iPhone
 * 
 * This demonstrates how the device scenario specifications translate into
 * actual question flows and conditional logic.
 */

import type { DeviceProfile } from '../features/assessment/engine/deviceScenarios';
import type { Question } from '../features/assessment/engine/schema';

// Scenario 1 Device Profile
const scenario1Profile: DeviceProfile = {
  currentDevice: {
    type: 'desktop',
    os: 'windows',
    browser: 'firefox'
  },
  otherDevices: {
    hasWindows: true,
    hasMac: false,
    hasLinux: false,
    hasIPhone: true,
    hasAndroid: false,
    hasIPad: false
  },
  primaryDesktop: 'windows',
  primaryMobile: 'ios'
};

// Example Questions for Scenario 1
export const scenario1Questions: Question[] = [
  // Windows Security - High Priority
  {
    id: 'windows_update_frequency',
    type: 'ACTION',
    weight: 10,
    text: 'How often do you respond to Windows update notifications?',
    explanation: 'Windows updates contain critical security patches that protect against vulnerabilities',
    actionHint: 'Immediate response is ideal, but within a week is acceptable',
    relatedTopics: ['system_security', 'windows_updates'],
    actionOptions: [
      { 
        id: 'immediately', 
        text: 'Immediately when I see them', 
        points: 10,
        // Follow-up: No additional questions needed - excellent behavior
      },
      { 
        id: 'within_week', 
        text: 'Within a week', 
        points: 7,
        // Follow-up: Monthly reminder about importance (30-day expiration)
      },
      { 
        id: 'when_remember', 
        text: 'When I remember to check', 
        points: 4,
        // Follow-up: Bi-weekly check-in questions (14-day expiration)
      },
      { 
        id: 'ignore_them', 
        text: 'I usually ignore them', 
        points: 0,
        // Follow-up: Weekly urgent education + follow-ups (7-day expiration)
      }
    ]
  },
  
  {
    id: 'windows_virus_scan_frequency',
    type: 'ACTION',
    weight: 8,
    text: 'How often do you run a virus scan (Windows Defender or otherwise)?',
    explanation: 'Regular virus scans detect malware that might slip past real-time protection',
    actionHint: 'Windows Defender can be set to scan automatically',
    relatedTopics: ['malware_protection', 'windows_defender'],
    actionOptions: [
      { 
        id: 'automatic_daily', 
        text: 'Automatic scans run daily', 
        points: 10,
        // Follow-up: Quarterly check-in (90-day expiration)
      },
      { 
        id: 'weekly_manual', 
        text: 'I run manual scans weekly', 
        points: 8,
        // Follow-up: Quarterly reminder about automation (90-day expiration)
      },
      { 
        id: 'monthly', 
        text: 'About once a month', 
        points: 5,
        // Follow-up: Monthly encouragement for more frequent scanning (30-day expiration)
      },
      { 
        id: 'rarely_never', 
        text: 'Rarely or never', 
        points: 0,
        // Follow-up: Weekly education + setup help (7-day expiration)
      }
    ]
  },

  // Conditional Follow-up Questions
  {
    id: 'windows_updates_weekly_reminder',
    type: 'YN',
    weight: 3,
    text: 'Have you checked for Windows updates this week?',
    explanation: 'Since you update within a week of notifications, let\'s make sure you\'re current',
    actionHint: 'Windows Settings > Update & Security > Check for updates',
    relatedTopics: ['system_security'],
    conditions: {
      requireAnswers: { 'windows_update_frequency': ['within_week'] }
    },
    // This question expires in 30 days and reminds monthly
  },

  {
    id: 'windows_updates_automation_suggestion',
    type: 'ACTION',
    weight: 5,
    text: 'Would you like to enable automatic Windows updates?',
    explanation: 'Since you sometimes forget to update, automation would improve your security',
    actionHint: 'Windows Settings > Update & Security > Advanced options > Automatic',
    relatedTopics: ['system_security', 'automation'],
    conditions: {
      requireAnswers: { 'windows_update_frequency': ['when_remember', 'ignore_them'] }
    },
    actionOptions: [
      { 
        id: 'enable_automatic', 
        text: 'Yes, enable automatic updates', 
        points: 5,
        // Follow-up: Quarterly check that automation is still working
      },
      { 
        id: 'prefer_manual', 
        text: 'I prefer to stay in control', 
        points: 2,
        // Follow-up: Bi-weekly reminders to check manually
      }
    ]
  },

  // iOS Security - Medium Priority  
  {
    id: 'ios_passcode_security',
    type: 'ACTION',
    weight: 9,
    text: 'What type of screen lock do you use on your iPhone?',
    explanation: 'Your iPhone contains sensitive personal data that needs protection',
    actionHint: 'Face ID or Touch ID with a strong passcode is recommended',
    relatedTopics: ['mobile_security', 'biometric_auth'],
    actionOptions: [
      { 
        id: 'face_id_touch_id', 
        text: 'Face ID or Touch ID with passcode', 
        points: 10,
        // Follow-up: Quarterly security checkup
      },
      { 
        id: 'passcode_only', 
        text: 'Passcode only (6+ digits)', 
        points: 7,
        // Follow-up: Suggest biometric upgrade
      },
      { 
        id: 'simple_passcode', 
        text: 'Simple 4-digit passcode', 
        points: 4,
        // Follow-up: Education about stronger passcodes
      },
      { 
        id: 'no_lock', 
        text: 'No screen lock', 
        points: 0,
        // Follow-up: Urgent security education (immediate)
      }
    ]
  },

  // Cross-Platform - Always Included
  {
    id: 'password_management_strategy',
    type: 'ACTION',
    weight: 12,
    text: 'How do you manage passwords across your Windows PC and iPhone?',
    explanation: 'Consistent password management across devices improves security and convenience',
    actionHint: 'iCloud Keychain or a dedicated password manager work well for this setup',
    relatedTopics: ['password_security', 'cross_platform'],
    actionOptions: [
      { 
        id: 'dedicated_password_manager', 
        text: 'Dedicated password manager (1Password, Bitwarden)', 
        points: 12,
        // Follow-up: Quarterly advanced security tips
      },
      { 
        id: 'icloud_keychain', 
        text: 'iCloud Keychain', 
        points: 10,
        // Follow-up: Tips for Windows integration
      },
      { 
        id: 'browser_passwords', 
        text: 'Browser password managers', 
        points: 8,
        // Follow-up: Cross-device sync suggestions
      },
      { 
        id: 'manual_different', 
        text: 'Different passwords, I remember them', 
        points: 5,
        // Follow-up: Password manager education
      },
      { 
        id: 'reuse_passwords', 
        text: 'I reuse the same passwords', 
        points: 0,
        // Follow-up: Urgent password security education
      }
    ]
  }
];

// Example of personality-based adaptations based on answers
export function getPersonalityInsights(answers: Record<string, string>): {
  techLevel: 'basic' | 'intermediate' | 'advanced';
  securityAwareness: 'low' | 'moderate' | 'high';
  recommendedApproach: 'education' | 'automation' | 'optimization';
} {
  const updateFrequency = answers.windows_update_frequency;
  const scanFrequency = answers.windows_virus_scan_frequency;
  const passwordStrategy = answers.password_management_strategy;
  
  let techLevel: 'basic' | 'intermediate' | 'advanced' = 'intermediate';
  let securityAwareness: 'low' | 'moderate' | 'high' = 'moderate';
  let recommendedApproach: 'education' | 'automation' | 'optimization' = 'automation';
  
  // Determine tech level
  if (scanFrequency === 'automatic_daily' && passwordStrategy === 'dedicated_password_manager') {
    techLevel = 'advanced';
  } else if (updateFrequency === 'ignore_them' && passwordStrategy === 'reuse_passwords') {
    techLevel = 'basic';
  }
  
  // Determine security awareness
  if (updateFrequency === 'immediately' && scanFrequency === 'automatic_daily') {
    securityAwareness = 'high';
  } else if (updateFrequency === 'ignore_them' || scanFrequency === 'rarely_never') {
    securityAwareness = 'low';
  }
  
  // Determine recommended approach
  if (securityAwareness === 'high' && techLevel === 'advanced') {
    recommendedApproach = 'optimization'; // Advanced tips
  } else if (securityAwareness === 'low') {
    recommendedApproach = 'education'; // Basic security education
  } else {
    recommendedApproach = 'automation'; // Help them automate good practices
  }
  
  return { techLevel, securityAwareness, recommendedApproach };
}

// Example follow-up scheduling based on answers
export function calculateFollowUpSchedule(questionId: string, answer: string): {
  daysUntilFollowUp: number;
  followUpType: 'reminder' | 'education' | 'checkup' | 'advanced_tip';
  urgency: 'low' | 'medium' | 'high' | 'critical';
} {
  const schedules: Record<string, Record<string, any>> = {
    'windows_update_frequency': {
      'immediately': { days: 90, type: 'checkup', urgency: 'low' },
      'within_week': { days: 30, type: 'reminder', urgency: 'medium' },
      'when_remember': { days: 14, type: 'reminder', urgency: 'high' },
      'ignore_them': { days: 7, type: 'education', urgency: 'critical' }
    },
    'windows_virus_scan_frequency': {
      'automatic_daily': { days: 90, type: 'advanced_tip', urgency: 'low' },
      'weekly_manual': { days: 90, type: 'reminder', urgency: 'low' },
      'monthly': { days: 30, type: 'education', urgency: 'medium' },
      'rarely_never': { days: 7, type: 'education', urgency: 'critical' }
    }
  };
  
  return schedules[questionId]?.[answer] || { days: 30, type: 'checkup', urgency: 'medium' };
}
