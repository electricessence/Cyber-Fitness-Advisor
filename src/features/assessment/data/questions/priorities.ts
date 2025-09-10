// Shared Priority Constants
// Used across all question groups for consistent ordering

// Onboarding Flow Priorities (10000-9000 range)
export const ONBOARDING_PRIORITIES = {
  PRIVACY_NOTICE: 10000,
  OS_DETECTION: 9500,
  OS_SELECTION: 9400,
  BROWSER_DETECTION: 9300,
  BROWSER_SELECTION: 9250,
  TECH_COMFORT: 9200,
  MOBILE_CONTEXT: 9100,
  USAGE_CONTEXT: 9000
} as const;

// Assessment Priorities (90-50 range) 
export const ASSESSMENT_PRIORITIES = {
  PASSWORD_MANAGER: 85,
  TWO_FACTOR_AUTH: 80,
  SOFTWARE_UPDATES: 75,
  VIRUS_SCANNING: 70,
  BACKUP_FREQUENCY: 65,
  WIFI_SECURITY: 60,
  EMAIL_ATTACHMENTS: 55,
  BROWSER_EXTENSIONS: 50
} as const;

// Suite-specific priorities can be added here as needed
// export const ADVANCED_SECURITY_PRIORITIES = { ... };
// export const PRIVACY_PRIORITIES = { ... };
