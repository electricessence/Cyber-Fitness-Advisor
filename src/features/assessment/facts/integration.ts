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
        
        // Log any conflicts for debugging
        if (result.conflicts.length > 0) {
          console.warn('Fact conflicts detected:', result.conflicts);
        }
        
        console.log(`Facts updated from answer ${answer.questionId}:`, {
          established: result.factsEstablished.length,
          updated: result.factsUpdated.length,
          conflicts: result.conflicts.length,
          totalFacts: Object.keys(factsProfile.facts).length
        });
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
        console.log('Importing legacy data into facts system...');
        
        // Process each answer to extract facts
        for (const answer of Object.values(answers)) {
          try {
            factsEngine.extractFactsFromAnswer(answer, factsProfile);
          } catch (error) {
            console.warn(`Failed to import answer ${answer.questionId}:`, error);
          }
        }
        
        console.log(`Facts imported from ${Object.keys(answers).length} answers:`, {
          totalFacts: Object.keys(factsProfile.facts).length,
          categories: [...new Set(Object.values(factsProfile.facts).map(f => f.category))]
        });
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
        
        factsProfile.facts[factId] = fact;
        console.log(`Injected fact: ${factId} = ${value}`);
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
