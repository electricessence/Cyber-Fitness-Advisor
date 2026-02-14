/**
 * Browser-Specific Security Questions
 * 
 * Questions that test browser-specific security features across different platforms
 * These questions are designed to work with the browser journey testing framework
 */

import type { Question } from '../../engine/schema.js';
import { ASSESSMENT_PRIORITIES } from './priorities.js';

export const browserSecurityQuestions: Question[] = [
  // Edge SmartScreen and Windows Security Integration
  {
    id: 'edge_smartscreen',
    text: 'Have you enabled Microsoft Defender SmartScreen in Edge?',
    priority: ASSESSMENT_PRIORITIES.BROWSER_SECURITY,
    tags: ['browser', 'edge', 'windows', 'security'],
    difficulty: 'beginner',
    effort: '2 minutes',
    journeyIntent: 'probe',
    conditions: {
      include: { "browser": "edge" }
    },
    options: [
      {
        id: 'yes',
        text: 'Yes, SmartScreen is enabled',
        statement: 'Edge SmartScreen: Enabled',
        statusCategory: 'shields-up',
        facts: { "edge_smartscreen": true, "phishing_protection": "enabled" },
        points: 15,
        feedback: 'Excellent! SmartScreen helps protect against malicious websites and downloads.'
      },
      {
        id: 'no',
        text: 'No, SmartScreen is disabled',
        statement: 'Edge SmartScreen: Disabled',
        statusCategory: 'room-for-improvement',
        facts: { "edge_smartscreen": false },
        points: 0,
        feedback: 'Enable SmartScreen in Edge settings for protection against malicious sites.'
      },
      {
        id: 'unsure',
        text: 'I\'m not sure',
        statement: 'Edge SmartScreen: Unknown status',
        statusCategory: 'to-do',
        facts: { "edge_smartscreen": false },
        points: 0,
        feedback: 'Check Edge settings > Privacy & security > Security to enable SmartScreen.'
      }
    ]
  },

  // Edge Password Manager
  {
    id: 'edge_password_manager',
    text: 'Do you use Microsoft Edge\'s built-in password manager?',
    priority: ASSESSMENT_PRIORITIES.PASSWORD_MANAGER,
    tags: ['browser', 'edge', 'passwords'],
    difficulty: 'beginner',
    effort: '5 minutes',
    journeyIntent: 'probe',
    conditions: {
      include: { "browser": "edge" }
    },
    options: [
      {
        id: 'yes',
        text: 'Yes, I use Edge\'s password manager',
        statement: 'Edge Password Manager: Active',
        statusCategory: 'shields-up',
        facts: { "edge_password_manager": true, "password_manager_type": "browser" },
        points: 12,
        feedback: 'Good! Edge\'s password manager integrates well with Windows Hello.'
      },
      {
        id: 'no',
        text: 'No, I use a different password manager',
        statement: 'Edge Password Manager: Using alternative',
        statusCategory: 'shields-up',
        facts: { "edge_password_manager": false, "password_manager_type": "third_party" },
        points: 15,
        feedback: 'Great! Dedicated password managers often offer better security features.'
      },
      {
        id: 'none',
        text: 'I don\'t use any password manager',
        statement: 'Edge Password Manager: Not using any',
        statusCategory: 'room-for-improvement',
        facts: { "edge_password_manager": false, "password_manager_type": "none" },
        points: 0,
        feedback: 'Consider using Edge\'s built-in password manager or a dedicated solution.'
      }
    ]
  },

  // Safari Intelligent Tracking Prevention
  {
    id: 'safari_itp',
    text: 'Have you configured Safari\'s Intelligent Tracking Prevention?',
    priority: ASSESSMENT_PRIORITIES.BROWSER_SECURITY,
    tags: ['browser', 'safari', 'mac', 'privacy'],
    difficulty: 'beginner',
    effort: '2 minutes',
    journeyIntent: 'probe',
    conditions: {
      include: { "browser": "safari" }
    },
    options: [
      {
        id: 'yes',
        text: 'Yes, ITP is enabled and configured',
        statement: 'Safari ITP: Properly configured',
        statusCategory: 'shields-up',
        facts: { "safari_itp": true, "tracking_protection": "enabled" },
        points: 18,
        feedback: 'Excellent! Safari\'s ITP provides strong privacy protection against trackers.'
      },
      {
        id: 'default',
        text: 'Using default settings',
        statement: 'Safari ITP: Default configuration',
        statusCategory: 'shields-up',
        facts: { "safari_itp": true, "tracking_protection": "default" },
        points: 6,
        feedback: 'Safari\'s default ITP settings are already quite protective — you\'re getting solid tracking prevention out of the box.'
      },
      {
        id: 'disabled',
        text: 'No, I\'ve disabled tracking prevention',
        statement: 'Safari ITP: Disabled',
        statusCategory: 'room-for-improvement',
        facts: { "safari_itp": false, "tracking_protection": "disabled" },
        points: 0,
        feedback: 'Consider re-enabling ITP in Safari preferences for better privacy protection.'
      }
    ]
  },

  // Safari iCloud Keychain Integration
  {
    id: 'safari_icloud_keychain',
    text: 'Do you use Safari with iCloud Keychain for password management?',
    priority: ASSESSMENT_PRIORITIES.PASSWORD_MANAGER,
    tags: ['browser', 'safari', 'mac', 'passwords', 'icloud'],
    difficulty: 'beginner',
    effort: '5 minutes',
    journeyIntent: 'probe',
    conditions: {
      include: { "browser": "safari" }
    },
    options: [
      {
        id: 'yes',
        text: 'Yes, I use iCloud Keychain',
        statement: 'iCloud Keychain: Active',
        statusCategory: 'shields-up',
        facts: { "safari_icloud_keychain": true, "password_manager_type": "icloud" },
        points: 15,
        feedback: 'Great! iCloud Keychain provides secure password sync across Apple devices.'
      },
      {
        id: 'no_other',
        text: 'No, I use a different password manager',
        statement: 'iCloud Keychain: Using alternative',
        statusCategory: 'shields-up',
        facts: { "safari_icloud_keychain": false, "password_manager_type": "third_party" },
        points: 18,
        feedback: 'Excellent! Dedicated password managers often provide additional features.'
      },
      {
        id: 'no_none',
        text: 'No, I don\'t use any password manager',
        statement: 'iCloud Keychain: Not using any password manager',
        statusCategory: 'room-for-improvement',
        facts: { "safari_icloud_keychain": false, "password_manager_type": "none" },
        points: 0,
        feedback: 'Consider enabling iCloud Keychain or using a dedicated password manager.'
      }
    ]
  },

  // Apple ID Two-Factor Authentication
  {
    id: 'apple_id_2fa',
    text: 'Have you enabled two-factor authentication for your Apple ID?',
    priority: ASSESSMENT_PRIORITIES.TWO_FACTOR_AUTH,
    tags: ['apple', 'mac', 'safari', '2fa', 'authentication'],
    difficulty: 'beginner',
    effort: '5 minutes',
    journeyIntent: 'probe',
    conditions: {
      include: { "browser": "safari" }
    },
    options: [
      {
        id: 'yes',
        text: 'Yes, 2FA is enabled on my Apple ID',
        statement: 'Apple ID 2FA: Enabled',
        statusCategory: 'shields-up',
        facts: { "apple_id_2fa": true, "apple_ecosystem_security": "strong" },
        points: 20,
        feedback: 'Excellent! Apple ID 2FA protects your entire Apple ecosystem.'
      },
      {
        id: 'no',
        text: 'No, I only use a password',
        statement: 'Apple ID 2FA: Not enabled',
        statusCategory: 'room-for-improvement',
        facts: { "apple_id_2fa": false, "apple_ecosystem_security": "weak" },
        points: 0,
        feedback: 'Enable 2FA in Apple ID settings - it\'s crucial for protecting your Apple devices and data.'
      },
      {
        id: 'unsure',
        text: 'I\'m not sure if it\'s enabled',
        statement: 'Apple ID 2FA: Status unknown',
        statusCategory: 'to-do',
        facts: { "apple_id_2fa": false },
        points: 0,
        feedback: 'Check your Apple ID settings to see if 2FA is enabled, and turn it on if not.'
      }
    ]
  },

  // Firefox Enhanced Tracking Protection
  {
    id: 'firefox_tracking_protection',
    text: 'Have you configured Firefox\'s Enhanced Tracking Protection?',
    priority: ASSESSMENT_PRIORITIES.BROWSER_SECURITY,
    tags: ['browser', 'firefox', 'privacy', 'tracking'],
    difficulty: 'beginner',
    effort: '2 minutes',
    journeyIntent: 'probe',
    conditions: {
      include: { "browser": "firefox" }
    },
    options: [
      {
        id: 'strict',
        text: 'Yes, using Strict protection',
        statement: 'Firefox Tracking Protection: Strict mode',
        statusCategory: 'shields-up',
        facts: { "firefox_tracking_protection": "strict", "tracking_protection": "maximum" },
        points: 20,
        feedback: 'Excellent! Strict mode provides maximum protection against trackers.'
      },
      {
        id: 'standard',
        text: 'Yes, using Standard protection',
        statement: 'Firefox Tracking Protection: Standard mode',
        statusCategory: 'shields-up',
        facts: { "firefox_tracking_protection": "standard", "tracking_protection": "enabled" },
        points: 15,
        feedback: 'Good! Consider upgrading to Strict mode for even better privacy protection.'
      },
      {
        id: 'custom',
        text: 'Yes, using Custom settings',
        statement: 'Firefox Tracking Protection: Custom configuration',
        statusCategory: 'shields-up',
        facts: { "firefox_tracking_protection": "custom", "tracking_protection": "configured" },
        points: 18,
        feedback: 'Great! Custom settings allow you to fine-tune privacy vs. functionality.'
      },
      {
        id: 'disabled',
        text: 'No, tracking protection is disabled',
        statement: 'Firefox Tracking Protection: Disabled',
        statusCategory: 'room-for-improvement',
        facts: { "firefox_tracking_protection": "disabled", "tracking_protection": "disabled" },
        points: 0,
        feedback: 'Enable Enhanced Tracking Protection in Firefox privacy settings for better security.'
      }
    ]
  },

  // Firefox Privacy Settings
  {
    id: 'firefox_privacy_config',
    text: 'Have you optimized Firefox\'s privacy settings beyond the defaults?',
    priority: ASSESSMENT_PRIORITIES.BROWSER_PRIVACY,
    tags: ['browser', 'firefox', 'privacy', 'configuration'],
    difficulty: 'intermediate',
    effort: '15 minutes',
    journeyIntent: 'probe',
    conditions: {
      include: { "browser": "firefox" }
    },
    options: [
      {
        id: 'optimized',
        text: 'Yes, I\'ve configured advanced privacy settings',
        statement: 'Firefox Privacy: Optimized configuration',
        statusCategory: 'shields-up',
        facts: { "firefox_privacy_config": "optimized", "browser_privacy": "advanced" },
        points: 25,
        feedback: 'Excellent! Advanced Firefox privacy configuration provides superior protection.'
      },
      {
        id: 'some_changes',
        text: 'I\'ve made some privacy improvements',
        statement: 'Firefox Privacy: Partially configured',
        statusCategory: 'shields-up',
        facts: { "firefox_privacy_config": "partial", "browser_privacy": "improved" },
        points: 15,
        feedback: 'Good start! Consider reviewing guides for additional privacy enhancements.'
      },
      {
        id: 'default',
        text: 'Using default Firefox settings',
        statement: 'Firefox Privacy: Default settings',
        statusCategory: 'to-do',
        facts: { "firefox_privacy_config": "default", "browser_privacy": "standard" },
        points: 8,
        feedback: 'Firefox defaults are good, but additional privacy tweaks can improve protection.'
      }
    ]
  },

  // Chrome Privacy Settings (for users who must use Chrome)
  {
    id: 'chrome_privacy_hardening',
    text: 'Have you hardened Chrome\'s privacy settings?',
    priority: ASSESSMENT_PRIORITIES.BROWSER_PRIVACY,
    tags: ['browser', 'chrome', 'privacy'],
    difficulty: 'intermediate',
    effort: '10 minutes',
    journeyIntent: 'probe',
    conditions: {
      include: { "browser": "chrome" }
    },
    options: [
      {
        id: 'comprehensive',
        text: 'Yes, I\'ve disabled tracking and data collection',
        statement: 'Chrome Privacy: Comprehensive hardening',
        statusCategory: 'shields-up',
        facts: { "chrome_privacy_hardening": "comprehensive", "browser_privacy": "hardened" },
        points: 15,
        feedback: 'Great! Hardened Chrome settings help reduce data collection significantly.'
      },
      {
        id: 'basic',
        text: 'I\'ve made some privacy improvements',
        statement: 'Chrome Privacy: Basic improvements',
        statusCategory: 'shields-up',
        facts: { "chrome_privacy_hardening": "basic", "browser_privacy": "improved" },
        points: 8,
        feedback: 'Good! Consider additional privacy settings for better protection.'
      },
      {
        id: 'default',
        text: 'Using default Chrome settings',
        statement: 'Chrome Privacy: Default settings',
        statusCategory: 'room-for-improvement',
        facts: { "chrome_privacy_hardening": "default", "browser_privacy": "minimal" },
        points: 2,
        feedback: 'Chrome\'s defaults favor Google\'s data collection. Consider privacy hardening.'
      }
    ]
  }
];