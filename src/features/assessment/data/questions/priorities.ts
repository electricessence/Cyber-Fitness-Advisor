// Shared Priority Constants
// Used across all question groups for consistent ordering
//
// Hunt-to-Help ordering — race to first action win:
//   10000  Privacy Notice (must be first)
//      98  Ad Protection probe (no OS/browser needed)
//   97–95  Browser Detection (between probe and deep-dives)
//   94–92  Ad Protection deep-dives (browser-specific install guides)
//   90–86  Password Safety
//   85–81  Account Security
//   80–79  OS Detection (deferred — just before About You)
//   78–77  About You — personalization earned after 3 action flows
//   75–70  Daily Habits
//   68–38  Everything else (deeper assessment + mobile)

// Onboarding Priorities — interleaved with assessment by need
export const ONBOARDING_PRIORITIES = {
  PRIVACY_NOTICE: 10000,
  // Browser detection — after ad_blocker probe, before deep-dives
  BROWSER_DETECTION: 97,
  BROWSER_SELECTION: 96,
  BROWSER_SELECTION_FALLBACK: 95,
  // OS detection — deferred until just before About You
  OS_DETECTION: 80,
  OS_SELECTION: 79,
  OS_NOVICE_HELP: 78.5,
} as const;

// Assessment Priorities (98–38 range)
export const ASSESSMENT_PRIORITIES = {
  // Flow 3: Ad Protection — first action win, easiest + fastest
  AD_BLOCKER: 98,
  AD_BLOCK_DESKTOP: 94,            // Browser-specific uBO/content-blocker install prompts
  AD_BLOCK_SECONDARY: 93,          // SponsorBlock bonus, Chrome PM warning, mobile flows
  AD_BLOCK_FOLLOWUP: 92,           // Browser-switch progress check-in
  // Flow 4: Password Safety
  PASSWORD_MANAGER: 90,
  PM_TYPE: 89,
  PM_MASTER_PASSWORD: 88,
  PM_CURRENT_METHOD: 87,
  PM_BARRIER: 86,
  // Flow 5: Account Security
  TWO_FACTOR_AUTH: 85,
  TFA_METHOD: 84,
  TFA_BACKUP_CODES: 83,
  TFA_PRIORITY_ACCOUNTS: 82,
  TFA_BARRIER: 81,
  // Flow 6: About You — personalization after earning trust
  ABOUT_YOU_TECH_COMFORT: 78,
  ABOUT_YOU_USAGE_CONTEXT: 77,
  // Flow 7: Daily Habits
  SOFTWARE_UPDATES: 75,
  PHISHING_AWARENESS: 72,
  SCREEN_LOCK: 70,
  // No flow label: deeper assessment
  VIRUS_SCANNING: 68,
  BREACH_CHECK: 66,
  BACKUP_FREQUENCY: 65,
  WIFI_SECURITY: 60,
  PASSWORD_REUSE: 58,
  ACCOUNT_RECOVERY: 56,
  EMAIL_ATTACHMENTS: 55,
  BROWSER_EXTENSIONS: 50,
  BROWSER_SECURITY: 48,
  BROWSER_PRIVACY: 45,
  // Mobile Security (44–38 range)
  MOBILE_SCREEN_LOCK: 44,
  MOBILE_OS_UPDATES: 43,
  MOBILE_APP_PERMISSIONS: 42,
  MOBILE_PUBLIC_WIFI: 41,
  MOBILE_PLATFORM: 40,             // Find My (iOS/Android — mutually exclusive)
  MOBILE_BACKUP_PROTECT: 39,       // iCloud backup / Play Protect (mutually exclusive)
  MOBILE_APP_SOURCES: 38           // App Store / sideloading (mutually exclusive)
} as const;

// Suite-specific priorities can be added here as needed
// export const ADVANCED_SECURITY_PRIORITIES = { ... };
// export const PRIVACY_PRIORITIES = { ... };
