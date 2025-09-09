/**
 * Facts-Based Architecture: Main Module
 * 
 * This is the main entry point for the facts-based assessment system.
 * It exports all the core components needed to integrate facts into the application.
 */

// Core types
export type { 
  Fact, 
  FactsProfile, 
  FactCategory, 
  FactValue, 
  AnswerFactMapping,
  FactExtractionResult,
  FactConflict,
  FactQuery
} from './types';

// Core engine
export { FactsEngine } from './engine';

// Store integration
export { 
  createFactsStoreSlice, 
  FactsQueries,
  type FactsStoreState 
} from './integration';

// Condition system
export { 
  FactsConditionEngine, 
  FactConditions, 
  ConditionMigration,
  type FactGate,
  type HybridCondition
} from './conditions';

/**
 * Quick start guide for using the facts system:
 * 
 * 1. Add facts to your store:
 *    const factsSlice = createFactsStoreSlice();
 * 
 * 2. Process answers to extract facts:
 *    factsSlice.factsActions.processAnswer(answer);
 * 
 * 3. Query facts for conditions:
 *    const hasBrowserPM = factsSlice.factsActions.hasFactValue('behavior.password_manager.browser', true);
 * 
 * 4. Use fact-based conditions:
 *    const condition = FactConditions.hasOS('windows');
 *    const engine = new FactsConditionEngine();
 *    const result = engine.evaluateCondition(condition, factsProfile);
 */
