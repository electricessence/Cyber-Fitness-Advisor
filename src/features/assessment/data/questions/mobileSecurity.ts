// Mobile Security Questions
// Platform-specific (iOS, Android) and shared mobile security questions.
//
// Content philosophy:
//   - Educational, not prescriptive — explain *why*, let users decide.
//   - Specific settings paths so users can verify/act immediately.
//   - iOS and Android questions are mutually exclusive via mobile_os gates.
//   - Shared mobile questions gate on has_mobile: true (set by onboarding).
//   - Avoid brand comparisons; focus on what each platform offers.

import type { Question } from '../../engine/schema.js';
import { ASSESSMENT_PRIORITIES } from './priorities.js';

export const mobileSecurityQuestions: Question[] = [

  // ═══════════════════════════════════════════════════════════════════════
  // Shared Mobile — applies to all mobile users regardless of platform
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'mobile_screen_lock',
    text: 'How do you unlock your phone?',
    priority: ASSESSMENT_PRIORITIES.MOBILE_SCREEN_LOCK,
    tags: ['mobile', 'security', 'physical', 'quickwin'],
    journeyIntent: 'probe',
    difficulty: 'beginner',
    effort: '5 minutes',
    description: 'Your phone contains email, banking apps, photos, and personal messages. The lock screen is the first barrier if your device is lost or stolen.',
    conditions: {
      include: { "has_mobile": true }
    },
    options: [
      {
        id: 'biometric',
        text: '🔐 Biometrics (Face ID, fingerprint) + passcode',
        statement: 'Mobile Lock: Biometric + Passcode',
        statusCategory: 'shields-up',
        facts: { "mobile_screen_lock": "biometric" },
        points: 12,
        feedback: 'Biometric authentication combined with a passcode is the strongest practical setup for mobile devices — fast for you, difficult for anyone else.'
      },
      {
        id: 'pin',
        text: '🔢 PIN or passcode only',
        statement: 'Mobile Lock: PIN/Passcode',
        statusCategory: 'shields-up',
        facts: { "mobile_screen_lock": "pin" },
        points: 8,
        feedback: 'A PIN or passcode provides solid protection. If your device supports biometrics, adding Face ID or fingerprint unlock is worth considering — it\'s actually more secure than a 4-digit PIN and more convenient.'
      },
      {
        id: 'pattern',
        text: '📐 Pattern/swipe',
        statement: 'Mobile Lock: Pattern',
        statusCategory: 'room-for-improvement',
        facts: { "mobile_screen_lock": "pattern" },
        points: 4,
        feedback: 'Swipe patterns are convenient but can often be guessed from smudge marks on the screen. A 6-digit PIN or biometric lock offers meaningfully more protection for the same convenience.'
      },
      {
        id: 'none',
        text: '❌ No lock screen / swipe to unlock',
        statement: 'Mobile Lock: None',
        statusCategory: 'room-for-improvement',
        facts: { "mobile_screen_lock": "none" },
        points: 0,
        feedback: 'Without a lock screen, anyone who picks up your phone has immediate access to your email, banking apps, photos, and messages. Adding a PIN or biometric takes under a minute and is one of the highest-impact mobile security changes.'
      }
    ]
  },

  {
    id: 'mobile_os_updates',
    text: 'How do you handle software updates on your phone?',
    priority: ASSESSMENT_PRIORITIES.MOBILE_OS_UPDATES,
    tags: ['mobile', 'security', 'maintenance'],
    journeyIntent: 'probe',
    difficulty: 'beginner',
    effort: '2 minutes to enable',
    description: 'Mobile OS updates patch security vulnerabilities that attackers actively exploit. Delays in updating can leave your device exposed to known threats.',
    conditions: {
      include: { "has_mobile": true }
    },
    options: [
      {
        id: 'automatic',
        text: '✅ Automatic — installs as soon as available',
        statement: 'Mobile Updates: Automatic',
        statusCategory: 'shields-up',
        facts: { "mobile_updates": "automatic" },
        points: 10,
        feedback: 'Automatic updates ensure security patches are applied as quickly as possible — the recommended approach for most people.'
      },
      {
        id: 'prompt',
        text: '🔔 I install when prompted (within a few days)',
        statement: 'Mobile Updates: Prompt-based',
        statusCategory: 'shields-up',
        facts: { "mobile_updates": "prompt" },
        points: 7,
        feedback: 'Installing updates within a few days of the prompt is generally fine. The risk increases the longer you wait — most exploits target known vulnerabilities within weeks of disclosure.'
      },
      {
        id: 'delay',
        text: '⏳ I postpone updates for weeks or longer',
        statement: 'Mobile Updates: Delayed',
        statusCategory: 'room-for-improvement',
        facts: { "mobile_updates": "delayed" },
        points: 2,
        feedback: 'Delaying mobile updates leaves known vulnerabilities open. Attackers reverse-engineer patches to find what was fixed, then target unpatched devices. Enabling automatic updates removes this risk entirely.'
      },
      {
        id: 'unsure',
        text: '🤔 I\'m not sure',
        statement: 'Mobile Updates: Unknown',
        statusCategory: 'to-do',
        facts: { "mobile_updates": "unsure" },
        points: 0,
        feedback: 'Check your phone\'s settings — on iOS: Settings → General → Software Update → Automatic Updates. On Android: Settings → System → Software Update. Enabling automatic updates is the simplest way to stay protected.'
      }
    ]
  },

  {
    id: 'mobile_app_permissions',
    text: 'When an app asks for permissions (camera, location, contacts), what do you typically do?',
    priority: ASSESSMENT_PRIORITIES.MOBILE_APP_PERMISSIONS,
    tags: ['mobile', 'privacy', 'awareness'],
    journeyIntent: 'probe',
    difficulty: 'beginner',
    effort: '10 minutes to review',
    description: 'App permissions control what data apps can access. Over-permissive apps can track your location, read your contacts, or access your photos without a clear need.',
    conditions: {
      include: { "has_mobile": true }
    },
    options: [
      {
        id: 'review',
        text: '🔍 I review each request and only allow what makes sense',
        statement: 'App Permissions: Reviews carefully',
        statusCategory: 'shields-up',
        facts: { "app_permissions": "review" },
        points: 10,
        feedback: 'Reviewing permission requests is the best practice. A flashlight app asking for contacts or a calculator wanting your location are red flags worth paying attention to.'
      },
      {
        id: 'mostly_allow',
        text: '👍 I usually allow if the app seems legitimate',
        statement: 'App Permissions: Usually allows',
        statusCategory: 'to-do',
        facts: { "app_permissions": "mostly_allow" },
        points: 4,
        feedback: 'Even legitimate apps sometimes request more permissions than they need. Both iOS and Android let you revoke permissions after the fact — it\'s worth periodically reviewing which apps have access to your camera, microphone, and location.'
      },
      {
        id: 'always_allow',
        text: '✅ I just tap Allow to get past the prompt',
        statement: 'App Permissions: Always allows',
        statusCategory: 'room-for-improvement',
        facts: { "app_permissions": "always_allow" },
        points: 0,
        feedback: 'Blindly allowing permissions gives apps access to sensitive data they may not need. A weather app with microphone access, or a game with contact access, are signs of over-collection. Both iOS and Android make it easy to audit permissions in Settings → Privacy.'
      },
      {
        id: 'unsure',
        text: '🤔 I don\'t really pay attention to these',
        statement: 'App Permissions: Not aware',
        statusCategory: 'to-do',
        facts: { "app_permissions": "unsure" },
        points: 0,
        feedback: 'Permission prompts are easy to dismiss, but they control what apps can see and do. A quick 5-minute audit of your current app permissions can reveal surprising access you may not have intended to grant.'
      }
    ]
  },

  {
    id: 'mobile_public_wifi',
    text: 'How do you handle public WiFi on your phone (coffee shops, airports, hotels)?',
    priority: ASSESSMENT_PRIORITIES.MOBILE_PUBLIC_WIFI,
    tags: ['mobile', 'network', 'privacy'],
    journeyIntent: 'probe',
    difficulty: 'beginner',
    effort: '5 minutes',
    description: 'Public WiFi networks are inherently less secure than your home network. While HTTPS protects most web traffic, attackers on the same network can still see which sites you visit and attempt various interception techniques.',
    conditions: {
      include: { "has_mobile": true }
    },
    options: [
      {
        id: 'vpn',
        text: '🔒 I use a VPN on public WiFi',
        statement: 'Public WiFi: VPN protected',
        statusCategory: 'shields-up',
        facts: { "public_wifi": "vpn" },
        points: 10,
        feedback: 'Using a VPN on public networks encrypts all your traffic, preventing anyone on the same network from seeing what you\'re doing. This is the gold standard for public WiFi security.'
      },
      {
        id: 'careful',
        text: '⚠️ I avoid sensitive activities (banking, email) on public WiFi',
        statement: 'Public WiFi: Cautious use',
        statusCategory: 'shields-up',
        facts: { "public_wifi": "careful" },
        points: 7,
        feedback: 'Avoiding sensitive activities on public WiFi is a practical approach. Most modern sites use HTTPS, which provides encryption, but a VPN adds an extra layer when you need to access sensitive accounts on the go.'
      },
      {
        id: 'use_freely',
        text: '📶 I connect and use it normally',
        statement: 'Public WiFi: Unrestricted use',
        statusCategory: 'room-for-improvement',
        facts: { "public_wifi": "unrestricted" },
        points: 2,
        feedback: 'While HTTPS protects most web traffic, public WiFi still exposes metadata about your browsing and can be used for network-level attacks. Using mobile data for sensitive activities, or a VPN, significantly reduces risk.'
      },
      {
        id: 'avoid',
        text: '📵 I don\'t use public WiFi — I stick to mobile data',
        statement: 'Public WiFi: Avoids entirely',
        statusCategory: 'shields-up',
        facts: { "public_wifi": "avoid" },
        points: 10,
        feedback: 'Using mobile data instead of public WiFi eliminates the risk entirely. Your cellular connection is significantly harder to intercept than shared WiFi.'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════
  // iOS-Specific — gated on mobile_os: 'ios'
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'ios_find_my',
    text: 'Do you have Find My iPhone enabled?',
    priority: ASSESSMENT_PRIORITIES.MOBILE_PLATFORM,
    tags: ['mobile', 'ios', 'physical', 'quickwin'],
    journeyIntent: 'probe',
    difficulty: 'beginner',
    effort: '2 minutes',
    description: 'Find My iPhone lets you locate, lock, or erase your device remotely if it\'s lost or stolen. It also activates Activation Lock, which prevents anyone from erasing and reusing your device without your Apple ID password.',
    conditions: {
      include: { "mobile_os": "ios" }
    },
    options: [
      {
        id: 'yes',
        text: '✅ Yes, Find My is enabled',
        statement: 'Find My iPhone: Enabled',
        statusCategory: 'shields-up',
        facts: { "find_my_iphone": true },
        points: 10,
        feedback: 'Find My iPhone provides remote locate, lock, and erase capabilities — and Activation Lock means a thief can\'t simply reset and resell your device.'
      },
      {
        id: 'no',
        text: '❌ No, it\'s not enabled',
        statement: 'Find My iPhone: Disabled',
        statusCategory: 'room-for-improvement',
        facts: { "find_my_iphone": false },
        points: 0,
        feedback: 'Without Find My, a lost or stolen iPhone can\'t be located or remotely erased. Enable it in Settings → [Your Name] → Find My → Find My iPhone. It also activates Activation Lock, which is a powerful theft deterrent.'
      },
      {
        id: 'unsure',
        text: '🤔 I\'m not sure',
        statement: 'Find My iPhone: Unknown',
        statusCategory: 'to-do',
        facts: { "find_my_iphone": false },
        points: 0,
        feedback: 'Check Settings → [Your Name] → Find My → Find My iPhone. If it\'s on, you\'re protected. If not, enabling it takes about 30 seconds and provides significant protection against loss and theft.'
      }
    ]
  },

  {
    id: 'ios_icloud_backup',
    text: 'Is your iPhone backed up to iCloud?',
    priority: ASSESSMENT_PRIORITIES.MOBILE_BACKUP_PROTECT,
    tags: ['mobile', 'ios', 'backup'],
    journeyIntent: 'probe',
    difficulty: 'beginner',
    effort: '5 minutes',
    description: 'iCloud Backup automatically saves your device data, including app data, photos, and settings. If your phone is lost, stolen, or breaks, a backup lets you restore everything to a new device.',
    conditions: {
      include: { "mobile_os": "ios" }
    },
    options: [
      {
        id: 'yes_adp',
        text: '✅ Yes, with Advanced Data Protection enabled',
        statement: 'iCloud Backup: End-to-End Encrypted',
        statusCategory: 'shields-up',
        facts: { "icloud_backup": true, "icloud_adp": true },
        points: 12,
        feedback: 'Advanced Data Protection enables end-to-end encryption for your iCloud backup — meaning only your devices can decrypt the data. This is the strongest backup configuration Apple offers (available since iOS 16.2, December 2022).'
      },
      {
        id: 'yes',
        text: '✅ Yes, standard iCloud Backup',
        statement: 'iCloud Backup: Standard encryption',
        statusCategory: 'shields-up',
        facts: { "icloud_backup": true, "icloud_adp": false },
        points: 8,
        feedback: 'Standard iCloud Backup protects against data loss, though Apple holds the encryption keys. For stronger protection, consider enabling Advanced Data Protection in Settings → [Your Name] → iCloud → Advanced Data Protection.'
      },
      {
        id: 'no',
        text: '❌ No, I don\'t back up my phone',
        statement: 'iCloud Backup: Disabled',
        statusCategory: 'room-for-improvement',
        facts: { "icloud_backup": false },
        points: 0,
        feedback: 'Without a backup, a lost, stolen, or broken phone means losing all your photos, messages, and app data permanently. Enable iCloud Backup in Settings → [Your Name] → iCloud → iCloud Backup.'
      },
      {
        id: 'unsure',
        text: '🤔 Not sure',
        statement: 'iCloud Backup: Unknown',
        statusCategory: 'to-do',
        facts: { "icloud_backup": false },
        points: 0,
        feedback: 'Check Settings → [Your Name] → iCloud → iCloud Backup. If it\'s enabled, you\'ll see the last backup date. If not, turning it on is one of the most important things you can do to protect your data.'
      }
    ]
  },

  {
    id: 'ios_app_sources',
    text: 'Do you ever install apps from outside the official App Store?',
    priority: ASSESSMENT_PRIORITIES.MOBILE_APP_SOURCES,
    tags: ['mobile', 'ios', 'security'],
    journeyIntent: 'probe',
    difficulty: 'beginner',
    effort: '1 minute',
    description: 'Apple\'s App Store review process screens apps for malware and policy violations. Apps installed through enterprise certificates or other methods bypass this review, which can introduce security risks.',
    conditions: {
      include: { "mobile_os": "ios" }
    },
    options: [
      {
        id: 'app_store_only',
        text: '✅ No — App Store only',
        statement: 'iOS Apps: App Store Only',
        statusCategory: 'shields-up',
        facts: { "ios_app_sources": "app_store" },
        points: 10,
        feedback: 'Sticking to the App Store means every app you install has been reviewed by Apple for malware and policy compliance. This is the safest approach for most users.'
      },
      {
        id: 'testflight',
        text: '🧪 Only through TestFlight (beta testing)',
        statement: 'iOS Apps: App Store + TestFlight',
        statusCategory: 'shields-up',
        facts: { "ios_app_sources": "testflight" },
        points: 8,
        feedback: 'TestFlight apps still go through Apple\'s review process, just with lighter restrictions for beta software. This is generally safe, especially for apps from developers you trust.'
      },
      {
        id: 'enterprise',
        text: '⚠️ Yes — enterprise or third-party profiles',
        statement: 'iOS Apps: Enterprise/Third-party',
        statusCategory: 'room-for-improvement',
        facts: { "ios_app_sources": "enterprise" },
        points: 2,
        feedback: 'Enterprise certificates bypass App Store review and have been used to distribute malware. Unless required by your employer through a managed device, it\'s worth evaluating whether these profiles are necessary.'
      },
      {
        id: 'unsure',
        text: '🤔 I\'m not sure',
        statement: 'iOS Apps: Unknown sources',
        statusCategory: 'to-do',
        facts: { "ios_app_sources": "unsure" },
        points: 0,
        feedback: 'Check Settings → General → VPN & Device Management. If you see any profiles listed that you don\'t recognize, they may be worth investigating. No profiles listed means you\'re App Store only.'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════
  // Android-Specific — gated on mobile_os: 'android'
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'android_find_my',
    text: 'Do you have Find My Device enabled on your Android phone?',
    priority: ASSESSMENT_PRIORITIES.MOBILE_PLATFORM,
    tags: ['mobile', 'android', 'physical', 'quickwin'],
    journeyIntent: 'probe',
    difficulty: 'beginner',
    effort: '2 minutes',
    description: 'Google\'s Find My Device lets you locate, lock, or erase your Android phone remotely. It\'s built into Android and works through your Google account.',
    conditions: {
      include: { "mobile_os": "android" }
    },
    options: [
      {
        id: 'yes',
        text: '✅ Yes, Find My Device is enabled',
        statement: 'Find My Device: Enabled',
        statusCategory: 'shields-up',
        facts: { "find_my_device": true },
        points: 10,
        feedback: 'Find My Device gives you remote locate, lock, and erase capabilities through android.com/find — valuable protection against loss and theft.'
      },
      {
        id: 'no',
        text: '❌ No, it\'s not enabled',
        statement: 'Find My Device: Disabled',
        statusCategory: 'room-for-improvement',
        facts: { "find_my_device": false },
        points: 0,
        feedback: 'Enable Find My Device in Settings → Security → Find My Device (or Settings → Google → Find My Device, depending on your phone). This lets you locate, lock, or erase your phone remotely if it\'s lost or stolen.'
      },
      {
        id: 'unsure',
        text: '🤔 I\'m not sure',
        statement: 'Find My Device: Unknown',
        statusCategory: 'to-do',
        facts: { "find_my_device": false },
        points: 0,
        feedback: 'Check Settings → Security → Find My Device. On most Android phones it\'s enabled by default, but it\'s worth confirming. You can test it at android.com/find.'
      }
    ]
  },

  {
    id: 'android_play_protect',
    text: 'Is Google Play Protect enabled on your device?',
    priority: ASSESSMENT_PRIORITIES.MOBILE_BACKUP_PROTECT,
    tags: ['mobile', 'android', 'security'],
    journeyIntent: 'probe',
    difficulty: 'beginner',
    effort: '1 minute',
    description: 'Play Protect is Google\'s built-in malware scanner for Android. It automatically scans apps from the Play Store and can also scan apps installed from other sources.',
    conditions: {
      include: { "mobile_os": "android" }
    },
    options: [
      {
        id: 'yes',
        text: '✅ Yes, Play Protect is active',
        statement: 'Play Protect: Enabled',
        statusCategory: 'shields-up',
        facts: { "play_protect": true },
        points: 8,
        feedback: 'Play Protect provides continuous app scanning and is an important baseline defense. It\'s not a replacement for careful app selection, but it catches known malware effectively.'
      },
      {
        id: 'no',
        text: '❌ No, I\'ve disabled it',
        statement: 'Play Protect: Disabled',
        statusCategory: 'room-for-improvement',
        facts: { "play_protect": false },
        points: 0,
        feedback: 'Without Play Protect, your device has no automatic malware scanning. Re-enable it in Google Play Store → Profile → Play Protect → Settings → toggle "Scan apps with Play Protect" on.'
      },
      {
        id: 'unsure',
        text: '🤔 I\'m not sure',
        statement: 'Play Protect: Unknown',
        statusCategory: 'to-do',
        facts: { "play_protect": false },
        points: 0,
        feedback: 'Check by opening the Google Play Store → tap your profile icon → Play Protect. It should show a recent scan. Play Protect is on by default for most Android devices.'
      }
    ]
  },

  {
    id: 'android_unknown_sources',
    text: 'Do you install apps from outside the Google Play Store (sideloading APK files)?',
    priority: ASSESSMENT_PRIORITIES.MOBILE_APP_SOURCES,
    tags: ['mobile', 'android', 'security'],
    journeyIntent: 'probe',
    difficulty: 'beginner',
    effort: '2 minutes',
    description: 'Android allows installing apps from outside the Play Store (sideloading). While this enables access to apps not in the store, it also bypasses Play Store security screening and can expose your device to malware.',
    conditions: {
      include: { "mobile_os": "android" }
    },
    options: [
      {
        id: 'never',
        text: '✅ No — Play Store only',
        statement: 'Android Apps: Play Store Only',
        statusCategory: 'shields-up',
        facts: { "android_sideloading": "never" },
        points: 10,
        feedback: 'Sticking to the Play Store means Google\'s security screening reviews every app before you install it. Combined with Play Protect, this provides strong baseline defense against malicious apps.'
      },
      {
        id: 'trusted',
        text: '⚠️ Rarely — only from trusted sources (F-Droid, developer sites)',
        statement: 'Android Apps: Selective sideloading',
        statusCategory: 'to-do',
        facts: { "android_sideloading": "trusted" },
        points: 5,
        feedback: 'Sideloading from trusted sources like F-Droid (which builds apps from source code) carries manageable risk. Make sure "Install unknown apps" permission is only granted to specific apps you trust, not system-wide.'
      },
      {
        id: 'frequent',
        text: '📦 Frequently — I install APKs from various sources',
        statement: 'Android Apps: Frequent sideloading',
        statusCategory: 'room-for-improvement',
        facts: { "android_sideloading": "frequent" },
        points: 0,
        feedback: 'Frequent sideloading significantly increases malware risk. APKs from untrusted sites may contain trojans or spyware. Consider limiting sideloading to verified sources and keeping Play Protect enabled to scan all installed apps.'
      },
      {
        id: 'unsure',
        text: '🤔 I\'m not sure what sideloading means',
        statement: 'Android Apps: Not aware of sideloading',
        statusCategory: 'shields-up',
        facts: { "android_sideloading": "unsure" },
        points: 8,
        feedback: 'If you\'re not sure, you\'re likely only using the Play Store — which is the safest approach. Sideloading means installing APK files from websites or other sources outside the Play Store.'
      }
    ]
  }
];
