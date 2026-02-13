// Security Hygiene Questions
// Universal, high-impact questions that apply to nearly every user.
// These complement coreAssessment with practical everyday habits.

import type { Question } from '../../engine/schema';
import { ASSESSMENT_PRIORITIES } from './priorities.js';

export const securityHygieneQuestions: Question[] = [
  {
    id: 'screen_lock',
    text: 'Does your device lock automatically after a few minutes of inactivity?',
    priority: ASSESSMENT_PRIORITIES.SCREEN_LOCK,
    tags: ['device', 'physical', 'quickwin', 'probe'],
    difficulty: 'beginner',
    effort: '2 minutes',
    description: 'An unlocked device is an open door. Auto-lock is your first line of defense if your device is lost, stolen, or left unattended.',
    options: [
      {
        id: 'yes_short',
        text: '✅ Yes, within 5 minutes or less',
        statement: 'Screen Lock: Fast auto-lock enabled',
        statusCategory: 'shields-up',
        facts: { "screen_lock": "short" },
        points: 10,
        feedback: 'Perfect! A short lock timeout keeps your device secure even if you walk away.'
      },
      {
        id: 'yes_long',
        text: '⚠️ Yes, but it takes a while',
        statement: 'Screen Lock: Slow auto-lock',
        statusCategory: 'to-do',
        facts: { "screen_lock": "long" },
        points: 5,
        feedback: 'A long timeout still leaves your device exposed. Try reducing it to 2–5 minutes.'
      },
      {
        id: 'no',
        text: '❌ No, I don\'t use auto-lock',
        statement: 'Screen Lock: Disabled',
        statusCategory: 'room-for-improvement',
        facts: { "screen_lock": "disabled" },
        points: 0,
        feedback: 'Without auto-lock, anyone who picks up your device has full access to everything on it — email, banking, photos, messages.'
      }
    ]
  },

  {
    id: 'password_reuse_habits',
    text: 'How often do you reuse the same password across different websites?',
    priority: ASSESSMENT_PRIORITIES.PASSWORD_REUSE,
    tags: ['critical', 'password', 'probe'],
    difficulty: 'beginner',
    effort: '30 minutes to fix',
    description: 'When one site gets breached, attackers try those same passwords everywhere else. Unique passwords contain the damage to a single account.',
    options: [
      {
        id: 'never',
        text: '✅ Every account has a unique password',
        statement: 'Password Reuse: None (excellent)',
        statusCategory: 'shields-up',
        facts: { "password_reuse_habit": "none" },
        points: 10,
        feedback: 'Outstanding! Unique passwords per account is the gold standard. If one site is breached, your other accounts stay safe.'
      },
      {
        id: 'rarely',
        text: '⚠️ A few accounts share passwords',
        statement: 'Password Reuse: Some overlap',
        statusCategory: 'to-do',
        facts: { "password_reuse_habit": "some" },
        points: 5,
        feedback: 'Each shared password is a chain connecting your accounts. A breach on one site can cascade to others. Prioritize changing them on banking and email.'
      },
      {
        id: 'often',
        text: '❌ Most of my accounts use the same password',
        statement: 'Password Reuse: Widespread',
        statusCategory: 'room-for-improvement',
        facts: { "password_reuse_habit": "widespread" },
        points: 0,
        feedback: 'This is one of the most common causes of account takeovers. A single breach can give attackers access to all your accounts. A password manager makes fixing this painless.'
      }
    ]
  },

  {
    id: 'phishing_awareness',
    text: 'You get an urgent email from your bank asking you to click a link and verify your account. What do you do?',
    priority: ASSESSMENT_PRIORITIES.PHISHING_AWARENESS,
    tags: ['critical', 'phishing', 'email', 'probe'],
    difficulty: 'beginner',
    effort: 'Ongoing awareness',
    description: 'Phishing is the #1 way attackers steal credentials and install malware. Learning to spot it is one of the most valuable security skills you can develop.',
    options: [
      {
        id: 'ignore_go_direct',
        text: '✅ Ignore the link and go directly to my bank\'s website',
        statement: 'Phishing Awareness: Strong instincts',
        statusCategory: 'shields-up',
        facts: { "phishing_awareness": "strong" },
        points: 10,
        feedback: 'Exactly right! Legitimate organizations never ask you to click urgent links. Going directly to the official site bypasses any phishing trap.'
      },
      {
        id: 'check_carefully',
        text: '⚠️ Check the sender and link carefully before deciding',
        statement: 'Phishing Awareness: Cautious but at risk',
        statusCategory: 'to-do',
        facts: { "phishing_awareness": "cautious" },
        points: 5,
        feedback: 'Careful inspection helps, but modern phishing emails can perfectly mimic real ones — matching logos, domains, and even sender names. The safest habit is never clicking links in unexpected emails.'
      },
      {
        id: 'click_link',
        text: '❌ Click the link — it\'s from my bank',
        statement: 'Phishing Awareness: Vulnerable',
        statusCategory: 'room-for-improvement',
        facts: { "phishing_awareness": "vulnerable" },
        points: 0,
        feedback: 'Attackers impersonate banks, shipping companies, and even your employer with very convincing emails. Always navigate directly to websites instead of clicking email links, especially when the message creates urgency.'
      }
    ]
  },

  {
    id: 'breach_check',
    text: 'Have you ever checked if your email or passwords have appeared in a known data breach?',
    priority: ASSESSMENT_PRIORITIES.BREACH_CHECK,
    tags: ['password', 'privacy', 'action'],
    difficulty: 'beginner',
    effort: '5 minutes',
    description: 'Billions of credentials have been leaked in data breaches. Checking if yours are among them is a critical first step — you can\'t fix what you don\'t know about.',
    options: [
      {
        id: 'yes_regularly',
        text: '✅ Yes, I check periodically',
        statement: 'Breach Monitoring: Active',
        statusCategory: 'shields-up',
        facts: { "breach_check": "regular" },
        points: 10,
        feedback: 'Excellent! Regular breach checking means you can change compromised passwords before attackers use them. Services like Have I Been Pwned make this easy.'
      },
      {
        id: 'yes_once',
        text: '⚠️ I checked once a while ago',
        statement: 'Breach Monitoring: One-time check',
        statusCategory: 'to-do',
        facts: { "breach_check": "once" },
        points: 4,
        feedback: 'Good that you checked, but new breaches happen constantly. Consider setting up email alerts so you\'re notified automatically when your data appears in a breach.'
      },
      {
        id: 'no',
        text: '❌ No, I\'ve never checked',
        statement: 'Breach Monitoring: Not checked',
        statusCategory: 'room-for-improvement',
        facts: { "breach_check": "never" },
        points: 0,
        feedback: 'Your credentials may already be in the hands of attackers and you wouldn\'t know. A free check takes 30 seconds and could prevent a serious breach of your accounts.'
      }
    ]
  },

  {
    id: 'account_recovery',
    text: 'Do your most important accounts have backup recovery methods set up?',
    priority: ASSESSMENT_PRIORITIES.ACCOUNT_RECOVERY,
    tags: ['authentication', 'account', 'action'],
    difficulty: 'beginner',
    effort: '10 minutes',
    description: 'If you lose your phone or forget your password, recovery methods are your lifeline. Without them, you can be permanently locked out of your own accounts.',
    options: [
      {
        id: 'yes_multiple',
        text: '✅ Yes, recovery email + backup codes saved',
        statement: 'Account Recovery: Fully configured',
        statusCategory: 'shields-up',
        facts: { "account_recovery": "full" },
        points: 10,
        feedback: 'Well done! Having multiple recovery paths means you won\'t be locked out even if you lose a single factor. Store backup codes somewhere safe and offline.'
      },
      {
        id: 'yes_basic',
        text: '⚠️ I have a recovery email or phone set up',
        statement: 'Account Recovery: Basic setup',
        statusCategory: 'to-do',
        facts: { "account_recovery": "basic" },
        points: 5,
        feedback: 'Good start, but a single recovery method can fail — phone numbers change, email accounts get compromised. Add backup codes and store them safely for critical accounts.'
      },
      {
        id: 'no',
        text: '❌ No, I haven\'t set up recovery options',
        statement: 'Account Recovery: Not configured',
        statusCategory: 'room-for-improvement',
        facts: { "account_recovery": "none" },
        points: 0,
        feedback: 'Without recovery options, losing your phone or forgetting your password can mean permanent loss of your account — including all your data, contacts, and purchases.'
      }
    ]
  },

  {
    id: 'ad_blocker',
    text: 'Do you use an ad blocker in your browser?',
    priority: ASSESSMENT_PRIORITIES.AD_BLOCKER,
    tags: ['browser', 'privacy', 'quickwin', 'action'],
    difficulty: 'beginner',
    effort: '2 minutes',
    description: 'Malicious ads (malvertising) can install malware without you clicking anything. An ad blocker isn\'t just about convenience — it\'s a security layer.',
    options: [
      {
        id: 'yes',
        text: '✅ Yes, I use an ad blocker',
        statement: 'Ad Blocker: Active',
        statusCategory: 'shields-up',
        facts: { "ad_blocker": "yes" },
        points: 8,
        feedback: 'Great! Ad blockers protect against malvertising, reduce tracking, and make the web faster. uBlock Origin is the gold standard for privacy-focused blocking.'
      },
      {
        id: 'some_sites',
        text: '⚠️ Only on some sites',
        statement: 'Ad Blocker: Partial use',
        statusCategory: 'to-do',
        facts: { "ad_blocker": "partial" },
        points: 4,
        feedback: 'Partial blocking still leaves you exposed on unprotected sites. Consider enabling it everywhere and whitelisting sites you want to support.'
      },
      {
        id: 'no',
        text: '❌ No, I don\'t use one',
        statement: 'Ad Blocker: None',
        statusCategory: 'room-for-improvement',
        facts: { "ad_blocker": "no" },
        points: 0,
        feedback: 'Without an ad blocker, you\'re exposed to malicious ads that can redirect you to phishing sites or silently install malware. Installing one takes under 2 minutes and is one of the easiest security wins.'
      }
    ]
  }
];
