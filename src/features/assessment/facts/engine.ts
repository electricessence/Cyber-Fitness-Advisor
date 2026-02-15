/**
 * Facts-Based Architecture: Core Engine
 * 
 * This module implements the core facts extraction engine that converts
 * answers into domain facts following the architecture documented in
 * ARCHITECTURE_FACTS_SYSTEM.md
 */

import type { 
  Fact, 
  FactsProfile, 
  AnswerFactMapping, 
  FactExtractionResult,
  FactConflict,
  FactQuery
} from './types';
import type { Answer } from '../engine/schema';

export class FactsEngine {
  private mappings: Map<string, AnswerFactMapping[]> = new Map();
  
  constructor() {
    this.initializeCoreMappings();
  }
  
  /**
   * Process an answer and extract facts from it
   */
  public extractFactsFromAnswer(
    answer: Answer, 
    existingProfile: FactsProfile
  ): FactExtractionResult {
    const result: FactExtractionResult = {
      factsEstablished: [],
      factsUpdated: [],
      factsInvalidated: [],
      conflicts: []
    };
    
    const mappings = this.mappings.get(answer.questionId) || [];
    
    for (const mapping of mappings) {
      // Check if mapping conditions are met
      if (!this.mappingApplies(mapping, answer, existingProfile)) {
        continue;
      }
      
      try {
        const newFacts = mapping.extractFacts(answer.value, existingProfile);
        
        for (const fact of newFacts) {
          const existingFact = existingProfile.facts[fact.id];
          
          if (existingFact) {
            // Handle fact updates and conflicts
            const conflict = this.detectFactConflict(fact, existingFact);
            if (conflict) {
              result.conflicts.push(conflict);
              // Apply conflict resolution
              const resolvedFact = this.resolveFactConflict(fact, existingFact, conflict.resolution);
              if (resolvedFact) {
                result.factsUpdated.push(resolvedFact);
              }
            } else {
              result.factsUpdated.push(fact);
            }
          } else {
            result.factsEstablished.push(fact);
          }
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn(`Failed to extract facts from answer ${answer.questionId}:`, error);
        }
      }
    }
    
    return result;
  }
  
  /**
   * Query facts from a profile
   */
  public queryFacts(profile: FactsProfile, query: FactQuery): Fact[] {
    const facts = Object.values(profile.facts);
    
    return facts.filter(fact => {
      // Category filter
      if (query.category && fact.category !== query.category) {
        return false;
      }
      
      // ID filter
      if (query.ids && !query.ids.includes(fact.id)) {
        return false;
      }
      
      // Name pattern filter
      if (query.namePattern && !query.namePattern.test(fact.name)) {
        return false;
      }
      
      // Confidence filter
      if (query.minConfidence && fact.confidence < query.minConfidence) {
        return false;
      }
      
      // Validity filter (check expiration)
      if (query.onlyValid && fact.expiresAt && fact.expiresAt < new Date()) {
        return false;
      }
      
      return true;
    });
  }
  
  /**
   * Register a new answer-to-facts mapping
   */
  public registerMapping(mapping: AnswerFactMapping): void {
    if (!this.mappings.has(mapping.questionId)) {
      this.mappings.set(mapping.questionId, []);
    }
    this.mappings.get(mapping.questionId)!.push(mapping);
  }
  
  /**
   * Create an empty facts profile
   */
  public createEmptyProfile(): FactsProfile {
    return {
      facts: {},
      lastUpdated: new Date(),
      version: '1.0.0'
    };
  }
  
  /**
   * Check if a mapping applies to a given answer
   */
  private mappingApplies(
    mapping: AnswerFactMapping,
    answer: Answer,
    profile: FactsProfile
  ): boolean {
    if (!mapping.conditions) {
      return true;
    }
    
    const { answerValue, optionId, requiresFacts } = mapping.conditions;
    
    // Check answer value condition
    if (answerValue !== undefined && answer.value !== answerValue) {
      return false;
    }
    
    // Check option ID condition (for multiple choice answers)
    if (optionId !== undefined && answer.value !== optionId) {
      return false;
    }
    
    // Check required facts condition
    if (requiresFacts) {
      for (const factId of requiresFacts) {
        if (!profile.facts[factId]) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  /**
   * Detect conflicts between new and existing facts
   */
  private detectFactConflict(newFact: Fact, existingFact: Fact): FactConflict | null {
    // Same fact ID with different values indicates a conflict
    if (newFact.id === existingFact.id && newFact.value !== existingFact.value) {
      return {
        factIds: [newFact.id],
        description: `Fact ${newFact.id} has conflicting values: ${existingFact.value} vs ${newFact.value}`,
        resolution: newFact.confidence > existingFact.confidence ? 'keep-newest' : 'keep-highest-confidence'
      };
    }
    
    return null;
  }
  
  /**
   * Resolve a fact conflict according to the specified strategy
   */
  private resolveFactConflict(
    newFact: Fact, 
    existingFact: Fact, 
    resolution: FactConflict['resolution']
  ): Fact | null {
    switch (resolution) {
      case 'keep-newest':
        return newFact.establishedAt > existingFact.establishedAt ? newFact : existingFact;
      
      case 'keep-highest-confidence':
        return newFact.confidence > existingFact.confidence ? newFact : existingFact;
      
      case 'manual-review':
        // For now, keep the existing fact and log for manual review
        if (import.meta.env.DEV) {
          console.warn(`Manual review required for fact conflict: ${newFact.id}`);
        }
        return existingFact;
      
      default:
        return newFact;
    }
  }
  
  /**
   * Initialize core answer-to-facts mappings
   */
  private initializeCoreMappings(): void {
    // Device OS Detection (from onboarding)
    this.registerMapping({
      questionId: 'windows_confirmation',
      extractFacts: (value: boolean) => {
        if (value) {
          return [{
            id: 'device.os.primary',
            name: 'Primary Operating System',
            category: 'device',
            value: 'windows',
            establishedAt: new Date(),
            establishedBy: { questionId: 'windows_confirmation', answerValue: value },
            confidence: 0.9,
            metadata: { source: 'onboarding-confirmation' }
          }];
        }
        return [];
      },
      conditions: { answerValue: true }
    });
    
    this.registerMapping({
      questionId: 'mac_confirmation',
      extractFacts: (value: boolean) => {
        if (value) {
          return [{
            id: 'device.os.primary',
            name: 'Primary Operating System',
            category: 'device',
            value: 'macos',
            establishedAt: new Date(),
            establishedBy: { questionId: 'mac_confirmation', answerValue: value },
            confidence: 0.9,
            metadata: { source: 'onboarding-confirmation' }
          }];
        }
        return [];
      },
      conditions: { answerValue: true }
    });
    
    // Browser Password Manager Usage
    this.registerMapping({
      questionId: 'browser_passwords',
      extractFacts: (value: boolean) => [{
        id: 'behavior.password_manager.browser',
        name: 'Uses Browser Password Manager',
        category: 'behavior',
        value: value,
        establishedAt: new Date(),
        establishedBy: { questionId: 'browser_passwords', answerValue: value },
        confidence: 0.95,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        metadata: { 
          securityImpact: value ? 'positive' : 'negative',
          recommendationPriority: value ? 'low' : 'high'
        }
      }]
    });
    
    // Password Reuse Behavior (Scale 1-5)
    this.registerMapping({
      questionId: 'password_reuse',
      extractFacts: (value: number) => {
        const reuseLevel = this.mapPasswordReuseLevel(value);
        return [{
          id: 'behavior.password_reuse.frequency',
          name: 'Password Reuse Frequency',
          category: 'behavior',
          value: reuseLevel,
          establishedAt: new Date(),
          establishedBy: { questionId: 'password_reuse', answerValue: value },
          confidence: 0.85,
          expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
          metadata: {
            numericScore: value,
            riskLevel: value >= 4 ? 'low' : value >= 3 ? 'medium' : 'high'
          }
        }];
      }
    });
  }
  
  /**
   * Helper to map numeric password reuse score to semantic level
   */
  private mapPasswordReuseLevel(score: number): string {
    switch (score) {
      case 5: return 'never';
      case 4: return 'rarely';
      case 3: return 'sometimes';
      case 2: return 'often';
      case 1: return 'always';
      default: return 'unknown';
    }
  }
}
