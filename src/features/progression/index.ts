/**
 * Facts-First Tier and Daily Task System
 * 
 * Main exports for the tier-gated, facts-based progression system
 */

// Tier System
export { TierEngine, type Tier, type TierGate, type FactCondition, type UnlockedTier, type TierProgressInfo } from './tiers';

// Daily Task Engine  
export { DailyTaskEngine, type DailyTaskCandidate, type DailyTaskResult, type DailyTaskConfig } from '../tasks/dailyTaskEngine';

// Helper function to load tiers from JSON
export async function loadTiersConfig(): Promise<{ tiers: any[] }> {
  try {
    const tiersModule = await import('../../data/tiers.json');
    return tiersModule.default;
  } catch (error) {
    console.warn('Failed to load tiers.json, using empty config:', error);
    return { tiers: [] };
  }
}

// Factory function to create a fully configured tier engine
export async function createTierEngine(): Promise<import('./tiers').TierEngine> {
  const tiersConfig = await loadTiersConfig();
  const { TierEngine } = await import('./tiers');
  return new TierEngine(tiersConfig);
}

// Factory function to create a daily task engine with tier support
export async function createDailyTaskEngine(): Promise<import('../tasks/dailyTaskEngine').DailyTaskEngine> {
  const tierEngine = await createTierEngine();
  const { DailyTaskEngine } = await import('../tasks/dailyTaskEngine');
  return new DailyTaskEngine(tierEngine);
}