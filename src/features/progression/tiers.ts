/**
 * Tier System Engine
 * 
 * Manages progression through security tiers based on established facts.
 * Tiers unlock when prerequisite facts are satisfied, not by score.
 */

import type { FactsProfile } from '../assessment/facts/types';

export interface Tier {
  id: string;
  name: string;
  description: string;
  order: number;
  prerequisites: {
    gates: TierGate[];
  };
  scoring?: {
    contributesToScore: boolean;
    description: string;
  };
  unlocks: {
    content: string[];
    features: string[];
  };
  badgeInfo?: {
    icon: string;
    title: string;
  };
}

export interface TierGate {
  all?: FactCondition[];
  any?: FactCondition[];
  none?: FactCondition[];
}

export interface FactCondition {
  fact: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains' | 'not_contains' | 'exists' | 'not_exists' | 'greater_than' | 'less_than';
  value?: any;
  values?: any[];
}

export interface UnlockedTier extends Tier {
  unlockedAt: Date;
  unlockedBy: string[]; // List of facts that satisfied the prerequisites
}

export interface TierProgressInfo {
  currentTier: UnlockedTier;
  nextTier?: Tier;
  allUnlockedTiers: UnlockedTier[];
  progressToNext?: {
    missingFacts: string[];
    satisfiedFacts: string[];
    progressPercentage: number;
  };
}

export class TierEngine {
  private tiers: Tier[] = [];

  constructor(tiersConfig: { tiers: Tier[] }) {
    this.tiers = tiersConfig.tiers.sort((a, b) => a.order - b.order);
  }

  /**
   * Evaluate which tiers are unlocked based on current facts
   */
  public evaluateTierProgression(factsProfile: FactsProfile): TierProgressInfo {
    const unlockedTiers: UnlockedTier[] = [];
    let currentTier: UnlockedTier | null = null;
    let nextTier: Tier | null = null;

    for (const tier of this.tiers) {
      const isUnlocked = this.evaluateTierPrerequisites(tier, factsProfile);
      
      if (isUnlocked) {
        const unlockedTier: UnlockedTier = {
          ...tier,
          unlockedAt: new Date(), // In practice, this should be persisted
          unlockedBy: this.getUnlockingFacts(tier, factsProfile)
        };
        unlockedTiers.push(unlockedTier);
        currentTier = unlockedTier; // Last unlocked tier is current
      } else {
        // First locked tier is the next target
        if (!nextTier) {
          nextTier = tier;
        }
        break; // Tiers must be unlocked in order
      }
    }

    // Default to tier 0 if nothing is unlocked
    if (!currentTier && this.tiers.length > 0) {
      currentTier = {
        ...this.tiers[0],
        unlockedAt: new Date(),
        unlockedBy: []
      };
      unlockedTiers.push(currentTier);
    }

    const progressToNext = nextTier ? this.calculateProgressToNextTier(nextTier, factsProfile) : undefined;

    return {
      currentTier: currentTier!,
      nextTier: nextTier || undefined,
      allUnlockedTiers: unlockedTiers,
      progressToNext
    };
  }

  /**
   * Check if a specific tier is unlocked
   */
  public isTierUnlocked(tierId: string, factsProfile: FactsProfile): boolean {
    const tier = this.tiers.find(t => t.id === tierId);
    if (!tier) return false;
    
    return this.evaluateTierPrerequisites(tier, factsProfile);
  }

  /**
   * Get all content and features unlocked by current tier progression
   */
  public getUnlockedContent(factsProfile: FactsProfile): {
    content: string[];
    features: string[];
    badgeIcons: string[];
  } {
    const progression = this.evaluateTierProgression(factsProfile);
    const content = new Set<string>();
    const features = new Set<string>();
    const badgeIcons: string[] = [];

    for (const unlockedTier of progression.allUnlockedTiers) {
      unlockedTier.unlocks.content.forEach(c => content.add(c));
      unlockedTier.unlocks.features.forEach(f => features.add(f));
      if (unlockedTier.badgeInfo) {
        badgeIcons.push(unlockedTier.badgeInfo.icon);
      }
    }

    return {
      content: Array.from(content),
      features: Array.from(features),
      badgeIcons
    };
  }

  /**
   * Evaluate if tier prerequisites are satisfied
   */
  private evaluateTierPrerequisites(tier: Tier, factsProfile: FactsProfile): boolean {
    for (const gate of tier.prerequisites.gates) {
      if (this.evaluateTierGate(gate, factsProfile)) {
        return true; // Any gate passing unlocks the tier
      }
    }
    return tier.prerequisites.gates.length === 0; // No gates = always unlocked
  }

  /**
   * Evaluate a single tier gate
   */
  private evaluateTierGate(gate: TierGate, factsProfile: FactsProfile): boolean {
    let allPassed = true;
    let anyPassed = false;
    let nonePassed = true;

    // Evaluate 'all' conditions (AND logic)
    if (gate.all) {
      for (const condition of gate.all) {
        if (!this.evaluateFactCondition(condition, factsProfile)) {
          allPassed = false;
          break;
        }
      }
    }

    // Evaluate 'any' conditions (OR logic)
    if (gate.any) {
      anyPassed = false;
      for (const condition of gate.any) {
        if (this.evaluateFactCondition(condition, factsProfile)) {
          anyPassed = true;
          break;
        }
      }
    } else {
      anyPassed = true; // No 'any' conditions means this part passes
    }

    // Evaluate 'none' conditions (NOT logic)
    if (gate.none) {
      for (const condition of gate.none) {
        if (this.evaluateFactCondition(condition, factsProfile)) {
          nonePassed = false;
          break;
        }
      }
    }

    return allPassed && anyPassed && nonePassed;
  }

  /**
   * Evaluate a single fact condition
   */
  private evaluateFactCondition(condition: FactCondition, factsProfile: FactsProfile): boolean {
    const fact = factsProfile.facts[condition.fact];

    switch (condition.operator) {
      case 'exists':
        return !!fact;
      
      case 'not_exists':
        return !fact;
      
      case 'equals':
        return fact ? fact.value === condition.value : false;
      
      case 'not_equals':
        return fact ? fact.value !== condition.value : true;
      
      case 'in':
        return fact && condition.values ? condition.values.includes(fact.value) : false;
      
      case 'not_in':
        return fact && condition.values ? !condition.values.includes(fact.value) : true;
      
      case 'contains':
        if (!fact) return false;
        if (Array.isArray(fact.value)) {
          return fact.value.includes(condition.value);
        }
        if (typeof fact.value === 'string') {
          return fact.value.includes(condition.value as string);
        }
        return false;
      
      case 'not_contains':
        if (!fact) return true;
        if (Array.isArray(fact.value)) {
          return !fact.value.includes(condition.value);
        }
        if (typeof fact.value === 'string') {
          return !fact.value.includes(condition.value as string);
        }
        return true;
      
      case 'greater_than':
        return fact && typeof fact.value === 'number' && fact.value > (condition.value as number);
      
      case 'less_than':
        return fact && typeof fact.value === 'number' && fact.value < (condition.value as number);
      
      default:
        console.warn(`Unknown tier condition operator: ${condition.operator}`);
        return false;
    }
  }

  /**
   * Get the facts that caused a tier to unlock
   */
  private getUnlockingFacts(tier: Tier, factsProfile: FactsProfile): string[] {
    const unlockingFacts: string[] = [];
    
    for (const gate of tier.prerequisites.gates) {
      if (this.evaluateTierGate(gate, factsProfile)) {
        // Collect facts from the successful gate
        if (gate.all) {
          unlockingFacts.push(...gate.all.map(c => c.fact));
        }
        if (gate.any) {
          // Only include facts that actually passed
          for (const condition of gate.any) {
            if (this.evaluateFactCondition(condition, factsProfile)) {
              unlockingFacts.push(condition.fact);
            }
          }
        }
        break; // Only need facts from the first passing gate
      }
    }
    
    return [...new Set(unlockingFacts)]; // Remove duplicates
  }

  /**
   * Calculate progress toward the next tier
   */
  private calculateProgressToNextTier(nextTier: Tier, factsProfile: FactsProfile): {
    missingFacts: string[];
    satisfiedFacts: string[];
    progressPercentage: number;
  } {
    const allRequiredFacts = new Set<string>();
    const satisfiedFacts = new Set<string>();

    // Collect all facts mentioned in prerequisites
    for (const gate of nextTier.prerequisites.gates) {
      if (gate.all) gate.all.forEach(c => allRequiredFacts.add(c.fact));
      if (gate.any) gate.any.forEach(c => allRequiredFacts.add(c.fact));
      if (gate.none) gate.none.forEach(c => allRequiredFacts.add(c.fact));
    }

    // Check which facts are satisfied
    for (const factId of allRequiredFacts) {
      if (factsProfile.facts[factId]) {
        satisfiedFacts.add(factId);
      }
    }

    const progressPercentage = allRequiredFacts.size > 0 
      ? Math.round((satisfiedFacts.size / allRequiredFacts.size) * 100)
      : 0;

    return {
      missingFacts: Array.from(allRequiredFacts).filter(f => !satisfiedFacts.has(f)),
      satisfiedFacts: Array.from(satisfiedFacts),
      progressPercentage
    };
  }

  /**
   * Get tier by ID
   */
  public getTier(tierId: string): Tier | null {
    return this.tiers.find(t => t.id === tierId) || null;
  }

  /**
   * Get all tiers in order
   */
  public getAllTiers(): Tier[] {
    return [...this.tiers];
  }
}