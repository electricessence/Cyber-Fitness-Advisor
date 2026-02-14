// Password Manager Deep-Dive Questions
// Follow-up branches that unlock after the user answers the core password_manager question.
// Content philosophy: categorize approaches, teach evaluation criteria, mention proven
// open-source tools (KeePass, Bitwarden) as educational references, warn about known
// compromised services (factual), never endorse commercial products.

import type { Question } from '../../engine/schema';
import { ASSESSMENT_PRIORITIES } from './priorities.js';

export const passwordManagerDeepDiveQuestions: Question[] = [
  // ── Branch A: user already uses a password manager ────────────────────

  {
    id: 'pm_type',
    text: 'What type of password manager do you use?',
    priority: ASSESSMENT_PRIORITIES.PM_TYPE,
    tags: ['password', 'probe'],
    difficulty: 'beginner',
    effort: 'Quick reflection',
    description: 'Different password manager architectures have different risk profiles. Understanding yours helps identify any gaps.',
    conditions: {
      include: { password_manager: 'yes' }
    },
    options: [
      {
        id: 'cloud',
        text: 'Cloud-synced (syncs across devices)',
        statement: 'Password Manager Type: Cloud-synced',
        statusCategory: 'shields-up',
        facts: { pm_type: 'cloud' },
        points: 8,
        feedback: 'Cloud-synced managers are convenient and can be very secure — but not all are equal. Look for "zero-knowledge" encryption (the provider can\'t read your vault) and published independent audit reports. As of early 2026, the LastPass breach (December 2022) remains a cautionary example: encrypted vault backups were stolen along with unencrypted website URLs, and the UK ICO issued a penalty notice in November 2025. Privacy Guides (privacyguides.org) maintains current recommendations with specific criteria.'
      },
      {
        id: 'local',
        text: 'Local/offline (stored on my device)',
        statement: 'Password Manager Type: Local/offline',
        statusCategory: 'shields-up',
        facts: { pm_type: 'local' },
        points: 9,
        feedback: 'Local password managers like KeePassXC keep your vault entirely on your device — no server to breach, no provider to trust. The tradeoff: syncing across devices is your responsibility, and losing the vault file without a backup means losing your passwords. As of 2025, KeePassXC passed an ANSSI CSPN security evaluation (Synacktiv, October 2025). Note that local encryption protects data at rest — it doesn\'t protect against malware on an already-compromised device (true of all password managers).'
      },
      {
        id: 'browser',
        text: 'Browser built-in (Chrome, Firefox, Safari, etc.)',
        statement: 'Password Manager Type: Browser built-in',
        statusCategory: 'to-do',
        facts: { pm_type: 'browser' },
        points: 5,
        feedback: 'Browser password managers vary more than most people realise. As of early 2026: Safari/iCloud Keychain uses end-to-end encryption by default; Firefox Sync uses end-to-end encryption (AES-256-GCM); Chrome offers on-device encryption but it\'s opt-in, not default; and Edge\'s sync encryption model is less clearly documented. It\'s worth researching how your specific browser handles this — search "[your browser] password encryption" or check privacyguides.org for a comparison.'
      },
      {
        id: 'unsure',
        text: 'I\'m not sure what type it is',
        statement: 'Password Manager Type: Unknown',
        statusCategory: 'to-do',
        facts: { pm_type: 'unknown' },
        points: 3,
        feedback: 'Knowing what type of manager you use helps you understand where your passwords actually live — on your device, on a company\'s server, or in your browser\'s sync system. Take a moment to check: is it an app you installed, a browser feature, or something your workplace provided?'
      }
    ]
  },

  {
    id: 'pm_master_password',
    text: 'How would you describe your master password — the one that unlocks your password manager?',
    priority: ASSESSMENT_PRIORITIES.PM_MASTER_PASSWORD,
    tags: ['password', 'critical', 'probe'],
    difficulty: 'beginner',
    effort: '10 minutes to improve',
    description: 'Your master password is the single key to every other password. If it\'s weak, everything inside the vault is at risk.',
    conditions: {
      include: { password_manager: 'yes' }
    },
    options: [
      {
        id: 'passphrase',
        text: '✅ A long passphrase (4+ random words)',
        statement: 'Master Password: Strong passphrase',
        statusCategory: 'shields-up',
        facts: { pm_master_strength: 'strong' },
        points: 10,
        feedback: 'Excellent! A passphrase like "correct-horse-battery-staple" is both memorable and extremely hard to crack. Length matters far more than complexity — a 4-word passphrase has more entropy than most "Tr0ub4dor&3" style passwords.'
      },
      {
        id: 'complex',
        text: '⚠️ Complex but not very long (mixed characters)',
        statement: 'Master Password: Complex but short',
        statusCategory: 'to-do',
        facts: { pm_master_strength: 'moderate' },
        points: 6,
        feedback: 'Complexity helps, but length is king. A 20-character passphrase is vastly stronger than an 8-character complex password. Consider switching to a memorable multi-word passphrase — it\'s easier to type and harder to crack.'
      },
      {
        id: 'reused',
        text: '❌ Same password I use elsewhere',
        statement: 'Master Password: Reused (critical risk)',
        statusCategory: 'room-for-improvement',
        facts: { pm_master_strength: 'reused' },
        points: 0,
        feedback: 'This is the highest-risk scenario: if that password leaks from any other site, an attacker gets access to ALL your passwords at once. Change your master password immediately to a unique passphrase you\'ve never used anywhere else.'
      },
      {
        id: 'unsure',
        text: '❓ I\'m not sure how strong it is',
        statement: 'Master Password: Uncertain strength',
        statusCategory: 'to-do',
        facts: { pm_master_strength: 'unknown' },
        points: 2,
        feedback: 'If you\'re unsure, it\'s worth reviewing. A good test: is it at least 4 unrelated words long? Could someone who knows you guess it? Have you used it on any website? If the answer to the last two is "no" and the first is "yes," you\'re in good shape.'
      }
    ]
  },

  // ── Branch B: user does NOT use a password manager ────────────────────

  {
    id: 'pm_current_method',
    text: 'How do you currently keep track of your passwords?',
    priority: ASSESSMENT_PRIORITIES.PM_CURRENT_METHOD,
    tags: ['password', 'probe'],
    difficulty: 'beginner',
    effort: 'Quick reflection',
    description: 'Understanding your current approach helps identify the specific risks you face and the best path to stronger security.',
    conditions: {
      include: { password_manager: 'no' }
    },
    options: [
      {
        id: 'memory',
        text: 'I memorize them',
        statement: 'Password Method: Memory only',
        statusCategory: 'room-for-improvement',
        facts: { pm_current_method: 'memory' },
        points: 2,
        feedback: 'Relying on memory usually means either reusing passwords or using simple ones — both are serious risks. The human brain can reliably remember about 5–7 strong, unique passwords at best. For dozens of accounts, even the sharpest memory leads to shortcuts.'
      },
      {
        id: 'written',
        text: 'I write them down (notebook, sticky notes)',
        statement: 'Password Method: Written down',
        statusCategory: 'to-do',
        facts: { pm_current_method: 'written' },
        points: 3,
        feedback: 'Physical notes can\'t be hacked remotely, which is actually better than reusing passwords. But they can be lost, stolen, or seen by anyone who walks by. If you write passwords down, store them in a locked drawer — never near your computer or under your keyboard.'
      },
      {
        id: 'reuse',
        text: 'I use the same password(s) everywhere',
        statement: 'Password Method: Reused across sites',
        statusCategory: 'room-for-improvement',
        facts: { pm_current_method: 'reuse' },
        points: 0,
        feedback: 'Password reuse is the #1 way accounts get compromised. When one site is breached (and breaches happen constantly), attackers automatically try those credentials on banking, email, and social media. A password manager makes unique passwords effortless.'
      },
      {
        id: 'browser_save',
        text: 'My browser saves them',
        statement: 'Password Method: Browser autosave',
        statusCategory: 'to-do',
        facts: { pm_current_method: 'browser' },
        points: 4,
        feedback: 'Browser-saved passwords are a step up from reusing them, but they\'re often unencrypted or weakly protected. Anyone with access to your device can usually view them in browser settings. A dedicated password manager adds a master password layer and works across all your browsers.'
      },
      {
        id: 'document',
        text: 'I keep them in a file or spreadsheet',
        statement: 'Password Method: Digital document',
        statusCategory: 'room-for-improvement',
        facts: { pm_current_method: 'document' },
        points: 1,
        feedback: 'An unencrypted file containing your passwords is one of the most dangerous options — malware specifically looks for files named "passwords.txt" or similar. If you must use a file, encrypt it. Better yet, a password manager encrypts everything automatically with no extra effort.'
      }
    ]
  },

  {
    id: 'pm_barrier',
    text: 'What\'s the main reason you haven\'t started using a password manager yet?',
    priority: ASSESSMENT_PRIORITIES.PM_BARRIER,
    tags: ['password', 'action', 'probe'],
    difficulty: 'beginner',
    effort: '20 minutes to research',
    description: 'Many people know they should use a password manager but haven\'t made the switch. Understanding what\'s holding you back helps find the right path forward.',
    conditions: {
      include: { password_manager: 'no' }
    },
    options: [
      {
        id: 'overwhelmed',
        text: 'There are too many options — I don\'t know which to pick',
        statement: 'PM Barrier: Overwhelmed by choices',
        statusCategory: 'to-do',
        facts: { pm_barrier: 'overwhelmed' },
        points: 2,
        feedback: 'The choice paralysis is real! Here\'s a simple framework: decide between cloud-synced (convenient, syncs everywhere) vs. local-only (maximum control, you manage backups). For cloud-synced, look for zero-knowledge encryption and published security audits. For local-only, KeePass and KeePassXC are well-established open-source options.'
      },
      {
        id: 'complicated',
        text: 'They seem too complicated to set up',
        statement: 'PM Barrier: Complexity concerns',
        statusCategory: 'to-do',
        facts: { pm_barrier: 'complicated' },
        points: 2,
        feedback: 'Modern password managers are simpler than you might think. Most can import your browser\'s saved passwords in one click, then auto-fill going forward. The setup is typically 15 minutes. After that, they actually make your life easier — you never need to remember or type passwords again.'
      },
      {
        id: 'trust',
        text: 'I don\'t trust putting all my passwords in one place',
        statement: 'PM Barrier: Trust concerns',
        statusCategory: 'to-do',
        facts: { pm_barrier: 'trust' },
        points: 3,
        feedback: 'This is a thoughtful concern! The key insight: your passwords are already "in one place" — your brain or wherever you store them. A password manager adds encryption. If trust is the issue, consider an open-source, locally-stored option like KeePassXC — your vault never leaves your device, the code is publicly auditable, and there\'s no company to trust.'
      },
      {
        id: 'procrastination',
        text: 'I just haven\'t gotten around to it',
        statement: 'PM Barrier: Haven\'t started yet',
        statusCategory: 'to-do',
        facts: { pm_barrier: 'procrastination' },
        points: 1,
        feedback: 'You don\'t have to migrate everything at once! Start with just your 3 most important accounts (email, banking, primary social media). Add new passwords as you create or change them. Within a month, you\'ll have most of your important accounts covered with zero stress.'
      },
      {
        id: 'cost',
        text: 'I don\'t want to pay for one',
        statement: 'PM Barrier: Cost concerns',
        statusCategory: 'to-do',
        facts: { pm_barrier: 'cost' },
        points: 2,
        feedback: 'Great news — you don\'t have to pay anything. Bitwarden offers a robust free tier, and KeePassXC is completely free and open-source. Both are well-audited and widely trusted by security professionals. Paid tiers typically add family sharing or advanced features, but the free versions cover everything most people need.'
      }
    ]
  }
];
