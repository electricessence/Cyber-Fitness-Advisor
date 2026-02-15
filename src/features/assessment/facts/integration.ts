/**
 * Facts-Based Architecture: Store Integration
 * 
 * This module integrates the facts system with the existing Zustand store,
 * providing a bridge between the current answer-based system and the new
 * facts-based architecture.
 */

import type { FactsProfile, Fact } from './types';
import { FactsEngine } from './engine';
import type { Answer } from '../engine/schema';

export interface FactsStoreState {
  /** Current facts profile for the user */
  factsProfile: FactsProfile;
  
  /** Facts engine instance */
  factsEngine: FactsEngine;
  
  /** Actions for managing facts */
  factsActions: {
    /** Process an answer and update facts */
    processAnswer: (answer: Answer) => void;
    
    /** Get facts matching a query */
    getFacts: (query?: { category?: string; ids?: string[] }) => Fact[];
    
    /** Get a specific fact by ID */
    getFact: (factId: string) => Fact | null;
    
    /** Check if a fact exists and has a specific value */
    hasFactValue: (factId: string, value: any) => boolean;
    
    /** Reset all facts (for testing/debugging) */
    resetFacts: () => void;
    
    /** Import facts from legacy data */
    importLegacyData: (answers: Record<string, Answer>) => void;
    
    /** Directly inject a fact (for device detection, etc.) */
    injectFact: (factId: string, value: any, metadata?: { source?: string; confidence?: number }) => void;
  };
}

/**
 * Create the facts store slice for integration with main assessment store
 */
export function createFactsStoreSlice(): FactsStoreState {
  const factsEngine = new FactsEngine();
  let factsProfile = factsEngine.createEmptyProfile();
  
  return {
    factsProfile,
    factsEngine,
    
    factsActions: {
      processAnswer: (answer: Answer) => {
        const result = factsEngine.extractFactsFromAnswer(answer, factsProfile);
        
        // Apply the results to update the facts profile
        const updatedFacts = { ...factsProfile.facts };
        
        // Add new facts
        for (const fact of result.factsEstablished) {
          updatedFacts[fact.id] = fact;
        }
        
        // Update existing facts
        for (const fact of result.factsUpdated) {
          updatedFacts[fact.id] = fact;
        }
        
        // Remove invalidated facts
        for (const factId of result.factsInvalidated) {
          delete updatedFacts[factId];
        }
        
        // Update the profile
        factsProfile = {
          ...factsProfile,
          facts: updatedFacts,
          lastUpdated: new Date()
        };
        
        // Log any conflicts for debugging (only warnings)
        if (import.meta.env.DEV && result.conflicts.length > 0) {
          console.warn('Fact conflicts detected:', result.conflicts);
        }
      },
      
      getFacts: (query = {}) => {
        return factsEngine.queryFacts(factsProfile, {
          category: query.category as any,
          ids: query.ids,
          onlyValid: true
        });
      },
      
      getFact: (factId: string) => {
        return factsProfile.facts[factId] || null;
      },
      
      hasFactValue: (factId: string, value: any) => {
        const fact = factsProfile.facts[factId];
        return fact ? fact.value === value : false;
      },
      
      resetFacts: () => {
        factsProfile = factsEngine.createEmptyProfile();
      },
      
      importLegacyData: (answers: Record<string, Answer>) => {
        // Process each answer to extract facts
        for (const answer of Object.values(answers)) {
          try {
            factsEngine.extractFactsFromAnswer(answer, factsProfile);
          } catch (error) {
            if (import.meta.env.DEV) {
              console.warn(`Failed to import answer ${answer.questionId}:`, error);
            }
          }
        }
      },
      
      injectFact: (factId: string, value: any, metadata = {}) => {
        const fact: Fact = {
          id: factId,
          name: factId.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          category: factId.includes('device') || factId.includes('os') || factId.includes('browser') ? 'device' : 'behavior',
          value,
          establishedAt: new Date(),
          establishedBy: { questionId: 'device-detection', answerValue: value },
          confidence: metadata.confidence || 0.95,
          metadata: { source: metadata.source || 'auto-detection', ...metadata }
        };
        
        // Update facts profile immutably (same pattern as processAnswer)
        const updatedFacts = { ...factsProfile.facts };
        updatedFacts[factId] = fact;
        
        factsProfile = {
          ...factsProfile,
          facts: updatedFacts,
          lastUpdated: new Date()
        };
        
        // Facts injected successfully
      }
    }
  };
}

/**
 * Helper functions for common fact queries used throughout the app
 */
export const FactsQueries = {
  /** Get the user's primary operating system */
  getPrimaryOS: (factsProfile: FactsProfile): string | null => {
    const osFact = factsProfile.facts['device.os.primary'];
    return osFact ? osFact.value as string : null;
  },
  
  /** Check if user uses browser password manager */
  usesBrowserPasswordManager: (factsProfile: FactsProfile): boolean => {
    const fact = factsProfile.facts['behavior.password_manager.browser'];
    return fact ? fact.value as boolean : false;
  },
  
  /** Get password reuse frequency level */
  getPasswordReuseLevel: (factsProfile: FactsProfile): string | null => {
    const fact = factsProfile.facts['behavior.password_reuse.frequency'];
    return fact ? fact.value as string : null;
  },
  
  /** Get all device-related facts */
  getDeviceFacts: (factsProfile: FactsProfile): Fact[] => {
    return Object.values(factsProfile.facts).filter(fact => fact.category === 'device');
  },
  
  /** Get all behavior-related facts */
  getBehaviorFacts: (factsProfile: FactsProfile): Fact[] => {
    return Object.values(factsProfile.facts).filter(fact => fact.category === 'behavior');
  },
  
  /** Check if facts are sufficient for assessment */
  hasMinimumFacts: (factsProfile: FactsProfile): boolean => {
    const deviceFacts = FactsQueries.getDeviceFacts(factsProfile);
    const behaviorFacts = FactsQueries.getBehaviorFacts(factsProfile);
    
    // Minimum: know the OS and at least one behavior fact
    return deviceFacts.length > 0 && behaviorFacts.length > 0;
  }
};
