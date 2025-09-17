/**
 * Content Migration System
 * Handles versioning and migration of user data and content schemas
 */

export interface MigrationContext {
  fromVersion: string;
  toVersion: string;
  userData: any;
  contentData: any;
}

export interface Migration {
  version: string;
  description: string;
  migrate: (context: MigrationContext) => any;
}

// Current content version
export const CURRENT_CONTENT_VERSION = '1.0.0';

// Migration registry for future content version upgrades
const migrations: Migration[] = [
  // Future migrations will be added here as content evolves
];

/**
 * Migrates user data from one content version to another
 */
export function migrateUserData(
  userData: any, 
  fromVersion: string, 
  toVersion: string = CURRENT_CONTENT_VERSION
): any {
  // For v1.0.0, this is a no-op
  if (fromVersion === toVersion) {
    return userData;
  }

  // Apply any necessary migrations in sequence
  let migratedData = { ...userData };
  
  for (const migration of migrations) {
    if (shouldApplyMigration(migration, fromVersion, toVersion)) {
      migratedData = migration.migrate({
        fromVersion,
        toVersion,
        userData: migratedData,
        contentData: null // Will be populated when needed
      });
    }
  }
  
  return migratedData;
}

/**
 * Checks if a migration should be applied
 */
function shouldApplyMigration(migration: Migration, from: string, to: string): boolean {
  // Simple version comparison - in practice you'd use semver
  return migration.version > from && migration.version <= to;
}

/**
 * Gets the content version from localStorage or defaults to current
 */
export function getStoredContentVersion(): string {
  const stored = localStorage.getItem('cfa:v2:contentVersion');
  return stored || CURRENT_CONTENT_VERSION;
}

/**
 * Sets the content version in localStorage
 */
export function setStoredContentVersion(version: string = CURRENT_CONTENT_VERSION): void {
  localStorage.setItem('cfa:v2:contentVersion', version);
}
