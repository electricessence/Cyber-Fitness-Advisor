// Shared Priority Constants
// Used across all question groups for consistent ordering

// Onboarding Flow Priorities (10000-9000 range)
export const ONBOARDING_PRIORITIES = {
  PRIVACY_NOTICE: 10000,
  OS_DETECTION: 9550,
  OS_SELECTION: 9500,
  BROWSER_DETECTION: 9450,
  BROWSER_SELECTION: 9400,
  TECH_COMFORT: 9200,
  MOBILE_CONTEXT: 9100,
  USAGE_CONTEXT: 9000
} as const;

// Assessment Priorities (90-40 range) 
export const ASSESSMENT_PRIORITIES = {
  PASSWORD_MANAGER: 85,
  // Password Manager deep-dive (slots between PM parent and 2FA)
  PM_TYPE: 84,
  PM_MASTER_PASSWORD: 83,
  PM_CURRENT_METHOD: 82,
  PM_BARRIER: 81,
  TWO_FACTOR_AUTH: 80,
  // 2FA deep-dive (slots between 2FA parent and SOFTWARE_UPDATES)
  TFA_METHOD: 79,
  TFA_BACKUP_CODES: 78,
  TFA_PRIORITY_ACCOUNTS: 77,
  TFA_BARRIER: 76,
  SOFTWARE_UPDATES: 75,
  PHISHING_AWARENESS: 72,
  SCREEN_LOCK: 70,
  VIRUS_SCANNING: 68,
  BREACH_CHECK: 66,
  BACKUP_FREQUENCY: 65,
  AD_BLOCKER: 62,
  AD_BLOCK_DESKTOP: 61,          // Browser-specific uBO/content-blocker install prompts
  AD_BLOCK_SECONDARY: 59,        // SponsorBlock bonus, Chrome PM warning, mobile flows (mutually exclusive)
  AD_BLOCK_FOLLOWUP: 57,         // Browser-switch progress check-in
  WIFI_SECURITY: 60,
  PASSWORD_REUSE: 58,
  ACCOUNT_RECOVERY: 56,
  EMAIL_ATTACHMENTS: 55,
  BROWSER_EXTENSIONS: 50,
  BROWSER_SECURITY: 48,
  BROWSER_PRIVACY: 45,
  // Mobile Security (44-38 range)
  MOBILE_SCREEN_LOCK: 44,
  MOBILE_OS_UPDATES: 43,
  MOBILE_APP_PERMISSIONS: 42,
  MOBILE_PUBLIC_WIFI: 41,
  MOBILE_PLATFORM: 40,            // Find My (iOS/Android — mutually exclusive)
  MOBILE_BACKUP_PROTECT: 39,     // iCloud backup / Play Protect (mutually exclusive)
  MOBILE_APP_SOURCES: 38         // App Store / sideloading (mutually exclusive)
} as const;

// Suite-specific priorities can be added here as needed
// export const ADVANCED_SECURITY_PRIORITIES = { ... };
// export const PRIVACY_PRIORITIES = { ... };
