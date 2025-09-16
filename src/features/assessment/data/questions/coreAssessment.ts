// Core Security Assessment Questions
// Essential security practices that form the foundation of digital security

import type { Question } from '../../engine/schema';
import { ASSESSMENT_PRIORITIES } from './priorities.js';

export const coreAssessmentQuestions: Question[] = [
  {
    id: 'password_manager',
    text: 'Do you use a password manager?',
    priority: ASSESSMENT_PRIORITIES.PASSWORD_MANAGER,
    tags: ['critical', 'password', 'quickwin'],
    options: [
      { 
        id: 'yes',
        text: '✅ Yes, I use a password manager',
        statement: 'Password Manager: Enabled',
        statusCategory: 'shields-up',
        facts: { "password_manager": "yes" },
        points: 10,
        feedback: 'Excellent! Password managers are essential for security.'
      },
      { 
        id: 'no',
        text: '❌ No, I don\'t use one',
        statement: 'Password Manager: None',
        statusCategory: 'room-for-improvement',
        facts: { "password_manager": "no" },
        points: 0,
        feedback: 'Consider using a password manager - it\'s one of the most important security steps.'
      }
    ]
  },
  {
    id: 'two_factor_auth',
    text: 'Do you use two-factor authentication (2FA) on your important accounts?',
    priority: ASSESSMENT_PRIORITIES.TWO_FACTOR_AUTH,
    tags: ['critical', 'authentication'],
    options: [
      { 
        id: 'yes',
        text: '✅ Yes, on most important accounts',
        statement: 'Two-Factor Auth: Enabled everywhere',
        statusCategory: 'shields-up',
        facts: { "two_factor": "yes" },
        points: 8,
        feedback: 'Great job! 2FA significantly improves your account security.'
      },
      { 
        id: 'partial',
        text: '⚠️ Only on some accounts',
        statement: 'Two-Factor Auth: Partial coverage',
        statusCategory: 'to-do',
        facts: { "two_factor": "partial" },
        points: 4,
        feedback: 'Good start! Consider enabling 2FA on all important accounts.'
      },
      { 
        id: 'no',
        text: '❌ No, I don\'t use 2FA',
        statement: 'Two-Factor Auth: Not using',
        statusCategory: 'room-for-improvement',
        facts: { "two_factor": "no" },
        points: 0,
        feedback: '2FA is crucial - it prevents most account breaches even if passwords are stolen.'
      }
    ]
  },
  {
    id: 'software_updates',
    text: 'How do you handle software updates on your devices?',
    priority: ASSESSMENT_PRIORITIES.SOFTWARE_UPDATES,
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
    priority: ASSESSMENT_PRIORITIES.VIRUS_SCANNING,
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
    priority: ASSESSMENT_PRIORITIES.BACKUP_FREQUENCY,
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
    priority: ASSESSMENT_PRIORITIES.WIFI_SECURITY,
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
    priority: ASSESSMENT_PRIORITIES.EMAIL_ATTACHMENTS,
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
    priority: ASSESSMENT_PRIORITIES.BROWSER_EXTENSIONS,
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
