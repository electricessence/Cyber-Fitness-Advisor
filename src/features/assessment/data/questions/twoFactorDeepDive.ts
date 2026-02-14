// Two-Factor Authentication Deep-Dive Questions
// Follow-up branches that unlock after the user answers the core two_factor_auth question.
// Content philosophy: explain the security hierarchy of 2FA methods with factual
// comparisons, teach evaluation criteria, never endorse specific commercial apps.

import type { Question } from '../../engine/schema';
import { ASSESSMENT_PRIORITIES } from './priorities.js';

export const twoFactorDeepDiveQuestions: Question[] = [
  // ── Branch A: user uses 2FA (fully or partially) ─────────────────────

  {
    id: 'tfa_method',
    text: 'What type of two-factor authentication do you primarily use?',
    priority: ASSESSMENT_PRIORITIES.TFA_METHOD,
    tags: ['authentication', 'probe'],
    difficulty: 'beginner',
    effort: 'Quick reflection',
    journeyIntent: 'probe',
    description: 'Not all 2FA is equal. The method you use determines how well it protects you against different attack types.',
    conditions: {
      include: { two_factor: ['yes', 'partial'] }
    },
    options: [
      {
        id: 'hardware_key',
        text: '🔑 Hardware security key (USB/NFC device)',
        statement: '2FA Method: Hardware security key',
        statusCategory: 'shields-up',
        facts: { tfa_method: 'hardware_key' },
        points: 10,
        feedback: 'Hardware keys are the gold standard — they\'re phishing-proof because they cryptographically verify the website\'s identity before responding. Even if you\'re tricked into visiting a fake site, the key simply won\'t authenticate. They use the FIDO2/WebAuthn standard supported by all major browsers.'
      },
      {
        id: 'authenticator_app',
        text: '📱 Authenticator app (generates 6-digit codes)',
        statement: '2FA Method: Authenticator app (TOTP)',
        statusCategory: 'shields-up',
        facts: { tfa_method: 'authenticator_app' },
        points: 8,
        feedback: 'TOTP authenticator apps are a strong choice. The codes are generated locally on your device and change every 30 seconds, so they can\'t be intercepted like SMS. The key advantage: they work offline and aren\'t tied to your phone number. Look for apps that support encrypted backups of your TOTP seeds.'
      },
      {
        id: 'sms',
        text: '💬 SMS text message codes',
        statement: '2FA Method: SMS codes',
        statusCategory: 'to-do',
        facts: { tfa_method: 'sms' },
        points: 4,
        feedback: 'SMS 2FA is significantly better than no 2FA, but it has known weaknesses. Attackers can intercept SMS through SIM-swapping (convincing your carrier to transfer your number) or SS7 network vulnerabilities. For critical accounts like email and banking, consider upgrading to an authenticator app — the switch usually takes under 5 minutes per account.'
      },
      {
        id: 'email',
        text: '📧 Email verification codes',
        statement: '2FA Method: Email codes',
        statusCategory: 'to-do',
        facts: { tfa_method: 'email' },
        points: 3,
        feedback: 'Email-based codes add a layer of protection, but they\'re only as secure as your email account. If an attacker compromises your email, they get access to both your password reset links AND your 2FA codes — defeating the whole purpose. Prioritize securing your email with a stronger 2FA method, then use it as backup for less critical accounts.'
      },
      {
        id: 'mixed',
        text: '🔀 A mix of different methods',
        statement: '2FA Method: Mixed approaches',
        statusCategory: 'shields-up',
        facts: { tfa_method: 'mixed' },
        points: 7,
        feedback: 'Using different methods for different accounts is smart! The best approach: strongest protection (hardware key or authenticator app) on your most critical accounts (email, banking, cloud storage), and simpler methods where the risk is lower. This balances security with convenience.'
      }
    ]
  },

  {
    id: 'tfa_backup_codes',
    text: 'Have you saved the backup/recovery codes for your 2FA-protected accounts?',
    priority: ASSESSMENT_PRIORITIES.TFA_BACKUP_CODES,
    tags: ['authentication', 'critical', 'action'],
    difficulty: 'beginner',
    effort: '15 minutes',
    journeyIntent: 'probe',
    description: 'If you lose your phone or 2FA device, backup codes are your only way back in. Without them, you can be permanently locked out of your own accounts.',
    conditions: {
      include: { two_factor: ['yes', 'partial'] }
    },
    options: [
      {
        id: 'yes_secure',
        text: '✅ Yes, stored securely offline',
        statement: '2FA Backup Codes: Securely stored',
        statusCategory: 'shields-up',
        facts: { tfa_backup: 'secure' },
        points: 10,
        feedback: 'Perfect! Storing backup codes offline (printed, in a safe, or on an encrypted USB) means they\'re available even if all your devices fail. This is exactly the right approach — you\'re protected against both attackers AND accidents.'
      },
      {
        id: 'yes_digital',
        text: '⚠️ Yes, saved in a file or note on my device',
        statement: '2FA Backup Codes: Stored digitally',
        statusCategory: 'to-do',
        facts: { tfa_backup: 'digital' },
        points: 6,
        feedback: 'Having them saved is better than not, but digital storage has risks: if your device is compromised or lost, so are your codes. Consider printing them and storing the printout somewhere safe — a locked drawer, a home safe, or with other important documents. If you keep them digital, at minimum store them in an encrypted file.'
      },
      {
        id: 'somewhere',
        text: '⚠️ I think so, but I\'m not sure where',
        statement: '2FA Backup Codes: Location unknown',
        statusCategory: 'to-do',
        facts: { tfa_backup: 'lost' },
        points: 3,
        feedback: 'Backup codes you can\'t find are backup codes you don\'t have. Most services let you regenerate them (which invalidates the old ones). Take 15 minutes to log into your critical accounts, generate fresh codes, and store them in one consistent, secure location.'
      },
      {
        id: 'no',
        text: '❌ No, I haven\'t saved any',
        statement: '2FA Backup Codes: None saved',
        statusCategory: 'room-for-improvement',
        facts: { tfa_backup: 'none' },
        points: 0,
        feedback: 'This is a ticking time bomb — if your phone breaks, gets stolen, or you switch devices, you could lose access to every 2FA-protected account simultaneously. Most services show backup codes when you first enable 2FA, and let you regenerate them anytime in security settings. Do this today for at least your email and banking.'
      }
    ]
  },

  // ── Branch B: user does NOT use 2FA or only partially ─────────────────

  {
    id: 'tfa_priority_accounts',
    text: 'If you were going to enable 2FA on just one account first, which type would you prioritize?',
    priority: ASSESSMENT_PRIORITIES.TFA_PRIORITY_ACCOUNTS,
    tags: ['authentication', 'action', 'quickwin'],
    difficulty: 'beginner',
    effort: '5 minutes',
    journeyIntent: 'action-guided',
    description: 'You don\'t need to secure everything at once. Starting with your most critical account gives you the biggest security improvement for the least effort.',
    conditions: {
      include: { two_factor: ['partial', 'no'] }
    },
    options: [
      {
        id: 'email',
        text: '📧 My primary email account',
        statement: '2FA Priority: Email first',
        statusCategory: 'shields-up',
        facts: { tfa_priority: 'email' },
        points: 8,
        feedback: 'Excellent instinct! Email is the master key to your digital life — password resets for almost every other account go through it. If an attacker controls your email, they can reset passwords to your banking, shopping, social media, and everything else. Securing email first creates a protective foundation for all your other accounts.'
      },
      {
        id: 'banking',
        text: '🏦 Banking and financial accounts',
        statement: '2FA Priority: Banking first',
        statusCategory: 'shields-up',
        facts: { tfa_priority: 'banking' },
        points: 7,
        feedback: 'Smart choice — financial accounts have the most direct impact if compromised. Most banks now offer app-based 2FA. Pro tip: after securing your bank, secure your email next — because email password resets can bypass even the strongest bank security.'
      },
      {
        id: 'social',
        text: '📱 Social media accounts',
        statement: '2FA Priority: Social media first',
        statusCategory: 'to-do',
        facts: { tfa_priority: 'social' },
        points: 5,
        feedback: 'Social media accounts are common targets, and a hijacked account can damage your reputation or be used for scams against your contacts. Good place to start! After that, prioritize your email — it\'s the key that unlocks everything else through password resets.'
      },
      {
        id: 'work',
        text: '💼 Work or professional accounts',
        statement: '2FA Priority: Work accounts first',
        statusCategory: 'shields-up',
        facts: { tfa_priority: 'work' },
        points: 7,
        feedback: 'Professional accounts often contain sensitive data and affect more than just you. Many workplaces are also beginning to require 2FA. If yours doesn\'t yet, you\'re ahead of the curve by enabling it voluntarily.'
      },
      {
        id: 'unsure',
        text: '❓ I\'m not sure where to start',
        statement: '2FA Priority: Needs guidance',
        statusCategory: 'to-do',
        facts: { tfa_priority: 'unsure' },
        points: 2,
        feedback: 'Here\'s the priority order security experts recommend: (1) Email — it\'s the master key to everything else, (2) Banking — direct financial risk, (3) Cloud storage — your files and photos, (4) Social media. Start with email and you\'ll have the biggest impact from a single change.'
      }
    ]
  },

  {
    id: 'tfa_barrier',
    text: 'What\'s the main reason you haven\'t enabled 2FA on more accounts?',
    priority: ASSESSMENT_PRIORITIES.TFA_BARRIER,
    tags: ['authentication', 'probe'],
    difficulty: 'beginner',
    effort: 'Quick reflection',
    journeyIntent: 'insight',
    description: 'Understanding what holds people back from 2FA helps find the right approach. Most barriers are smaller than they seem.',
    conditions: {
      include: { two_factor: ['partial', 'no'] }
    },
    options: [
      {
        id: 'inconvenient',
        text: 'It\'s too inconvenient — I don\'t want extra login steps',
        statement: '2FA Barrier: Convenience concerns',
        statusCategory: 'to-do',
        facts: { tfa_barrier: 'inconvenient' },
        points: 2,
        feedback: 'The inconvenience is real but smaller than most people expect. Modern 2FA often only triggers on new devices or after 30 days — not every login. And the "inconvenience" of 2FA is nothing compared to the days or weeks spent recovering a compromised account. Many services also support "trusted devices" that skip the second step on your personal computer.'
      },
      {
        id: 'confusing',
        text: 'I don\'t understand how it works',
        statement: '2FA Barrier: Understanding gap',
        statusCategory: 'to-do',
        facts: { tfa_barrier: 'confusing' },
        points: 2,
        feedback: 'The concept is actually simple: after your password (something you know), you prove you have your phone (something you have). You\'ll get a 6-digit code via text or app, type it in, and you\'re done. It takes about 10 extra seconds per login. Most accounts walk you through setup step by step in their security settings.'
      },
      {
        id: 'lockout_fear',
        text: 'I\'m afraid of getting locked out of my accounts',
        statement: '2FA Barrier: Lockout fear',
        statusCategory: 'to-do',
        facts: { tfa_barrier: 'lockout_fear' },
        points: 3,
        feedback: 'This is a legitimate concern — and the solution is backup codes. When you enable 2FA, most services give you a set of one-time-use backup codes. Print them and store them somewhere safe. With backup codes saved, losing your phone becomes an inconvenience rather than a crisis.'
      },
      {
        id: 'not_available',
        text: 'My accounts don\'t seem to offer it',
        statement: '2FA Barrier: Availability unknown',
        statusCategory: 'to-do',
        facts: { tfa_barrier: 'not_available' },
        points: 2,
        feedback: 'More services support 2FA than you might think — it\'s usually buried in Settings → Security or Account → Privacy. The website twofactorauth.org (now 2fa.directory) maintains a searchable list of services that support 2FA and what methods they offer. You might be surprised how many of your accounts already have it available.'
      },
      {
        id: 'no_reason',
        text: 'I just haven\'t gotten around to it',
        statement: '2FA Barrier: Procrastination',
        statusCategory: 'to-do',
        facts: { tfa_barrier: 'procrastination' },
        points: 1,
        feedback: 'No pressure — but here\'s a motivating fact: enabling 2FA on your email takes about 5 minutes and blocks over 99% of automated account attacks. That\'s possibly the highest security-per-minute investment you can make. When you\'re ready, just search "[your email provider] enable 2FA" and follow the steps.'
      }
    ]
  }
];
