// Shared Priority Constants
// Used across all question groups for consistent ordering
//
// Stint ordering (Hunt-to-Help philosophy):
//   Stint 3: Ad Protection (95–92) — FIRST WIN
//   Stint 4: Password Safety (90–86)
//   Stint 5: Account Security (85–81)
//   Stint 6: About You (78–77) — earned after 3 action stints
//   Stint 7: Daily Habits (75–70)
//   No stint: everything else (68–38)

// Onboarding Flow Priorities (10000–9000 range)
export const ONBOARDING_PRIORITIES = {
  PRIVACY_NOTICE: 10000,
  OS_DETECTION: 9550,
  OS_SELECTION: 9500,
  BROWSER_DETECTION: 9450,
  BROWSER_SELECTION: 9400
} as const;

// Assessment Priorities (95–38 range)
export const ASSESSMENT_PRIORITIES = {
  // Stint 3: Ad Protection — first action win, easiest + fastest
  AD_BLOCKER: 95,
  AD_BLOCK_DESKTOP: 94,            // Browser-specific uBO/content-blocker install prompts
  AD_BLOCK_SECONDARY: 93,          // SponsorBlock bonus, Chrome PM warning, mobile flows
  AD_BLOCK_FOLLOWUP: 92,           // Browser-switch progress check-in
  // Stint 4: Password Safety
  PASSWORD_MANAGER: 90,
  PM_TYPE: 89,
  PM_MASTER_PASSWORD: 88,
  PM_CURRENT_METHOD: 87,
  PM_BARRIER: 86,
  // Stint 5: Account Security
  TWO_FACTOR_AUTH: 85,
  TFA_METHOD: 84,
  TFA_BACKUP_CODES: 83,
  TFA_PRIORITY_ACCOUNTS: 82,
  TFA_BARRIER: 81,
  // Stint 6: About You — personalization after earning trust
  ABOUT_YOU_TECH_COMFORT: 78,
  ABOUT_YOU_USAGE_CONTEXT: 77,
  // Stint 7: Daily Habits
  SOFTWARE_UPDATES: 75,
  PHISHING_AWARENESS: 72,
  SCREEN_LOCK: 70,
  // No stint: deeper assessment
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
