// Core Security Assessment Questions
// Essential security practices that form the foundation of digital security

import type { Question } from '../../engine/schema';
import { ASSESSMENT_PRIORITIES } from './priorities.js';

export const coreAssessmentQuestions: Question[] = [
  {
    id: 'password_manager',
    text: 'Do you use a password manager to store and generate your passwords?',
    priority: ASSESSMENT_PRIORITIES.PASSWORD_MANAGER,
    tags: ['critical', 'password', 'quickwin', 'action'],
    difficulty: 'beginner',
    effort: '15 minutes to set up',
    options: [
      { 
        id: 'yes',
        text: '✅ Yes, I use a password manager',
        statement: 'Password Manager: Enabled',
        statusCategory: 'shields-up',
        facts: { "password_manager": "yes" },
        points: 10,
        feedback: 'Excellent! Password managers are one of the most effective security tools available.'
      },
      { 
        id: 'no',
        text: '❌ No, I don\'t use one',
        statement: 'Password Manager: None',
        statusCategory: 'room-for-improvement',
        facts: { "password_manager": "no" },
        points: 0,
        feedback: 'Consider using a password manager - it\'s the single most impactful security improvement you can make.'
      }
    ]
  },
  {
    id: 'two_factor_auth',
    text: 'Do you use two-factor authentication (2FA) to protect your important accounts?',
    priority: ASSESSMENT_PRIORITIES.TWO_FACTOR_AUTH,
    tags: ['critical', 'authentication', 'action'],
    difficulty: 'beginner',
    effort: '5 minutes per account',
    options: [
      { 
        id: 'yes',
        text: '✅ Yes, on most important accounts',
        statement: 'Two-Factor Auth: Enabled everywhere',
        statusCategory: 'shields-up',
        facts: { "two_factor": "yes" },
        points: 8,
        feedback: 'Excellent! 2FA makes your accounts dramatically more secure against hackers.'
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
    tags: ['critical', 'updates', 'action'],
    difficulty: 'beginner',
    effort: '2 minutes',
    options: [
      { 
        id: 'automatic',
        text: '✅ Automatic updates enabled',
        statement: 'Software Updates: Automatic',
        statusCategory: 'shields-up',
        facts: { "updates": "automatic" },
        points: 8,
        feedback: 'Perfect! Automatic updates provide the best security coverage.'
      },
      { 
        id: 'manual',
        text: '⚠️ Manual updates when reminded',
        statement: 'Software Updates: Manual only',
        statusCategory: 'to-do',
        facts: { "updates": "manual" },
        points: 4,
        feedback: 'Consider enabling automatic updates for better security.'
      },
      { 
        id: 'rarely',
        text: '❌ I rarely update software',
        statement: 'Software Updates: Rarely updated',
        statusCategory: 'room-for-improvement',
        facts: { "updates": "rarely" },
        points: 0,
        feedback: 'Outdated software creates serious security vulnerabilities. Enable automatic updates to stay protected!'
      }
    ]
  },
  {
    id: 'virus_scan_recent',
    text: 'When did you last run a virus scan?',
    priority: ASSESSMENT_PRIORITIES.VIRUS_SCANNING,
    tags: ['security', 'antivirus', 'probe'],
    difficulty: 'beginner',
    effort: '5 minutes',
    options: [
      { 
        id: 'this_week',
        text: 'This week',
        statement: 'Virus Scan: Recent (this week)',
        statusCategory: 'shields-up',
        facts: { "virus_scan": "recent" },
        points: 8,
        feedback: 'Great! Regular scanning is important for security.'
      },
      { 
        id: 'this_month',
        text: 'This month',
        statement: 'Virus Scan: Monthly',
        statusCategory: 'to-do',
        facts: { "virus_scan": "monthly" },
        points: 4,
        feedback: 'Consider scanning more frequently for better protection.'
      },
      { 
        id: 'rarely',
        text: 'Rarely or never',
        statement: 'Virus Scan: Rarely or never',
        statusCategory: 'room-for-improvement',
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
    tags: ['critical', 'backup', 'probe'],
    difficulty: 'beginner',
    effort: '15 minutes to set up',
    options: [
      { 
        id: 'daily',
        text: 'Daily (automated)',
        statement: 'Data Backup: Daily automated',
        statusCategory: 'shields-up',
        facts: { "backup": "daily" },
        points: 10,
        feedback: 'Excellent! Daily automated backups provide the best protection.'
      },
      { 
        id: 'weekly',
        text: 'Weekly',
        statement: 'Data Backup: Weekly',
        statusCategory: 'shields-up',
        facts: { "backup": "weekly" },
        points: 6,
        feedback: 'Good! Consider more frequent backups for critical data.'
      },
      { 
        id: 'monthly',
        text: 'Monthly or less',
        statement: 'Data Backup: Monthly or less',
        statusCategory: 'to-do',
        facts: { "backup": "monthly" },
        points: 2,
        feedback: 'This leaves you vulnerable to significant data loss.'
      },
      { 
        id: 'never',
        text: 'I don\'t back up regularly',
        statement: 'Data Backup: No regular backups',
        statusCategory: 'room-for-improvement',
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
    tags: ['network', 'wifi', 'checklist'],
    difficulty: 'intermediate',
    effort: '10 minutes',
    options: [
      { 
        id: 'wpa3',
        text: 'WPA3 (latest)',
        statement: 'WiFi Security: WPA3 (excellent)',
        statusCategory: 'shields-up',
        facts: { "wifi_security": "wpa3" },
        points: 10,
        feedback: 'Perfect! WPA3 provides the strongest WiFi security.'
      },
      { 
        id: 'wpa2',
        text: 'WPA2',
        statement: 'WiFi Security: WPA2 (good)',
        statusCategory: 'shields-up',
        facts: { "wifi_security": "wpa2" },
        points: 8,
        feedback: 'Good! WPA2 is still secure, but consider upgrading to WPA3.'
      },
      { 
        id: 'wpa',
        text: 'WPA (older)',
        statement: 'WiFi Security: WPA (outdated)',
        statusCategory: 'room-for-improvement',
        facts: { "wifi_security": "wpa" },
        points: 3,
        feedback: 'WPA is outdated. Upgrade to WPA2 or WPA3 immediately.'
      },
      { 
        id: 'open',
        text: 'Open (no password)',
        statement: 'WiFi Security: Open network (dangerous)',
        statusCategory: 'room-for-improvement',
        facts: { "wifi_security": "open" },
        points: 0,
        feedback: 'This is very dangerous! Anyone can access your network and data.'
      },
      { 
        id: 'unknown',
        text: 'I don\'t know',
        statement: 'WiFi Security: Unknown configuration',
        statusCategory: 'to-do',
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
    tags: ['email', 'phishing', 'probe'],
    difficulty: 'beginner',
    effort: 'Ongoing habit',
    options: [
      { 
        id: 'never_open',
        text: 'Never open them',
        statement: 'Email Attachments: Never open unknown',
        statusCategory: 'shields-up',
        facts: { "email_safety": "cautious" },
        points: 10,
        feedback: 'Excellent! This prevents most email-based attacks.'
      },
      { 
        id: 'scan_first',
        text: 'Scan with antivirus first',
        statement: 'Email Attachments: Scan before opening',
        statusCategory: 'shields-up',
        facts: { "email_safety": "scan" },
        points: 7,
        feedback: 'Good practice! But some threats can still get through.'
      },
      { 
        id: 'sometimes_open',
        text: 'Open them if they seem legitimate',
        statement: 'Email Attachments: Open if legitimate',
        statusCategory: 'room-for-improvement',
        facts: { "email_safety": "risky" },
        points: 2,
        feedback: 'This is risky - attackers are very good at seeming legitimate.'
      },
      { 
        id: 'always_open',
        text: 'Open them without hesitation',
        statement: 'Email Attachments: Open without checking',
        statusCategory: 'room-for-improvement',
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
    tags: ['browser', 'extensions', 'probe'],
    difficulty: 'beginner',
    effort: '10 minutes to audit',
    options: [
      { 
        id: 'very_selective',
        text: 'Only install well-known, necessary extensions',
        statement: 'Browser Extensions: Very selective',
        statusCategory: 'shields-up',
        facts: { "browser_safety": "cautious" },
        points: 8,
        feedback: 'Great approach! Extensions can be a security risk.'
      },
      { 
        id: 'research_first',
        text: 'Research extensions before installing',
        statement: 'Browser Extensions: Research first',
        statusCategory: 'shields-up',
        facts: { "browser_safety": "research" },
        points: 6,
        feedback: 'Good! Always check reviews and permissions.'
      },
      { 
        id: 'install_freely',
        text: 'Install extensions that look useful',
        statement: 'Browser Extensions: Install freely',
        statusCategory: 'room-for-improvement',
        facts: { "browser_safety": "risky" },
        points: 2,
        feedback: 'Be more careful - malicious extensions can steal your data.'
      },
      { 
        id: 'no_extensions',
        text: 'I don\'t use any extensions',
        statement: 'Browser Extensions: None installed',
        statusCategory: 'to-do',
        facts: { "browser_safety": "minimal" },
        points: 5,
        feedback: 'Safe approach! Some extensions can improve security though.'
      }
    ]
  }
];
