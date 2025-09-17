/**
 * Enhanced Daily Task Engine
 * 
 * Implements the facts-first, tier-gated daily task selection algorithm
 * as specified in the Developer Guide.
 */

import type { Question } from '../assessment/engine/schema';
import type { FactsProfile } from '../assessment/facts/types';
import { TierEngine, type Tier } from '../progression/tiers';
import { TIME_CONSTANTS, SCORE_CONSTANTS } from '../../utils/constants';
import type { DeviceProfile } from '../assessment/engine/deviceScenarios';

export interface DailyTaskCandidate extends Question {
  heuristicScore: number;
  impactScore: number;
  difficultyScore: number;
  estimatedMinutes: number;
  tierUnlockBonus: number;
  unlockedTier?: Tier;
  metadata: {
    isVisible: boolean;
    isCompleted: boolean;
    isExpired: boolean;
    isOnCooldown: boolean;
    daysSinceLastCompletion?: number;
  };
}

export interface DailyTaskResult {
  task: DailyTaskCandidate | null;
  reason: string;
  alternatives: DailyTaskCandidate[];
  nextAvailableAt?: Date;
  tierProgress?: {
    currentTier: string;
    nextTier?: string;
    progressPercentage: number;
  };
}

export interface DailyTaskConfig {
  cooldownDays: number;
  maxEstimatedMinutes: number;
  tierUnlockBonusMultiplier: number;
  minImpactScore: number;
}

export class DailyTaskEngine {
  private tierEngine: TierEngine;
  private config: DailyTaskConfig;

  constructor(tierEngine: TierEngine, config?: Partial<DailyTaskConfig>) {
    this.tierEngine = tierEngine;
    this.config = {
      cooldownDays: 1,
      maxEstimatedMinutes: 15,
      tierUnlockBonusMultiplier: 50,
      minImpactScore: 30,
      ...config
    };
  }

  /**
   * Select today's daily task based on the Developer Guide algorithm:
   * - Must be visible, not completed, not expired, not on cooldown
   * - Scored by heuristic: impact + (1/difficulty) + (1/estMinutes)
   * - Bonus if it unlocks a tier
   */
  public selectDailyTask(
    questions: Question[],
    factsProfile: FactsProfile,
    deviceProfile: DeviceProfile,
    completionHistory: Record<string, { completedAt: Date; isExpired?: boolean }>,
    currentAnswers: Record<string, any>
  ): DailyTaskResult {
    
    // 1. Filter questions to eligible candidates
    const candidates = this.filterEligibleQuestions(
      questions,
      factsProfile,
      deviceProfile,
      completionHistory,
      currentAnswers
    );

    if (candidates.length === 0) {
      return {
        task: null,
        reason: "No eligible tasks available right now. Check back tomorrow!",
        alternatives: [],
        nextAvailableAt: new Date(Date.now() + TIME_CONSTANTS.ONE_DAY)
      };
    }

    // 2. Calculate heuristic scores and tier bonuses
    const scoredCandidates = this.scoreTaskCandidates(candidates, factsProfile, deviceProfile);

    // 3. Sort by heuristic score (highest first)
    scoredCandidates.sort((a, b) => b.heuristicScore - a.heuristicScore);

    // 4. Select the highest-scoring task
    const selectedTask = scoredCandidates[0];
    const alternatives = scoredCandidates.slice(1, 4); // Top 3 alternatives

    // 5. Generate explanation
    const reason = this.generateTaskReason(selectedTask);

    // 6. Get tier progress info
    const tierProgress = this.getTierProgressInfo(factsProfile);

    return {
      task: selectedTask,
      reason,
      alternatives,
      tierProgress
    };
  }

  /**
   * Filter questions to only those eligible for daily task selection
   */
  private filterEligibleQuestions(
    questions: Question[],
    factsProfile: FactsProfile,
    deviceProfile: DeviceProfile,
    completionHistory: Record<string, { completedAt: Date; isExpired?: boolean }>,
    currentAnswers: Record<string, any>
  ): DailyTaskCandidate[] {
    
    return questions
      .map(question => this.createTaskCandidate(question, factsProfile, deviceProfile, completionHistory, currentAnswers))
      .filter(candidate => 
        candidate.metadata.isVisible &&
        !candidate.metadata.isCompleted &&
        !candidate.metadata.isExpired &&
        !candidate.metadata.isOnCooldown &&
        candidate.estimatedMinutes <= this.config.maxEstimatedMinutes
      );
  }

  /**
   * Create a daily task candidate with metadata
   */
  private createTaskCandidate(
    question: Question,
    _factsProfile: FactsProfile,
    _deviceProfile: DeviceProfile,
    completionHistory: Record<string, { completedAt: Date; isExpired?: boolean }>,
    currentAnswers: Record<string, any>
  ): DailyTaskCandidate {
    
    const completion = completionHistory[question.id];
    const currentAnswer = currentAnswers[question.id];
    
    // Calculate metadata
    const isCompleted = !!currentAnswer && !currentAnswer.isExpired;
    const isExpired = !!currentAnswer?.isExpired;
    const daysSinceCompletion = completion 
      ? Math.floor((Date.now() - completion.completedAt.getTime()) / TIME_CONSTANTS.ONE_DAY)
      : undefined;
    const isOnCooldown = daysSinceCompletion !== undefined && daysSinceCompletion < this.config.cooldownDays;
    
    // Estimate difficulty and time (simplified)
    const tags = question.tags || [];
    let difficultyScore = 1;
    let estimatedMinutes = 2;
    
    if (tags.includes('complex')) difficultyScore += 2;
    if (tags.includes('technical')) difficultyScore += 1;
    if (tags.includes('action')) {
      estimatedMinutes = difficultyScore * 3;
    }
    
    // Calculate impact score from priority and tags
    let impactScore = Math.min(SCORE_CONSTANTS.MAX_IMPACT_SCORE, question.priority / 10);
    if (tags.includes('critical')) impactScore += 30;
    if (tags.includes('high-impact')) impactScore += 20;
    if (tags.includes('quickwin')) impactScore += 15;

    return {
      ...question,
      heuristicScore: 0, // Will be calculated later
      impactScore,
      difficultyScore,
      estimatedMinutes,
      tierUnlockBonus: 0, // Will be calculated later
      metadata: {
        isVisible: true, // Defaults to visible; gate-based visibility handled elsewhere
        isCompleted,
        isExpired,
        isOnCooldown,
        daysSinceLastCompletion: daysSinceCompletion
      }
    };
  }

  /**
   * Score task candidates using the heuristic algorithm
   */
  private scoreTaskCandidates(
    candidates: DailyTaskCandidate[],
    factsProfile: FactsProfile,
    _deviceProfile: DeviceProfile
  ): DailyTaskCandidate[] {
    
    return candidates.map(candidate => {
      // Calculate tier unlock bonus
      const tierUnlockBonus = this.calculateTierUnlockBonus(candidate, factsProfile);
      
      // Apply the heuristic: impact + (1/difficulty) + (1/estMinutes) + tierBonus
      const difficultyComponent = candidate.difficultyScore > 0 ? (10 / candidate.difficultyScore) : 0;
      const timeComponent = candidate.estimatedMinutes > 0 ? (30 / candidate.estimatedMinutes) : 0;
      
      const heuristicScore = 
        candidate.impactScore + 
        difficultyComponent + 
        timeComponent + 
        tierUnlockBonus;

      return {
        ...candidate,
        heuristicScore,
        tierUnlockBonus
      };
    });
  }

  /**
   * Calculate bonus points if completing this task would unlock a tier
   */
  private calculateTierUnlockBonus(candidate: DailyTaskCandidate, factsProfile: FactsProfile): number {
    const currentProgression = this.tierEngine.evaluateTierProgression(factsProfile);
    
    if (!currentProgression.nextTier) {
      return 0; // Already at max tier
    }

    // Simulate completing this task by checking what facts it would establish
    // This is a simplified check - in practice, you'd need to simulate fact extraction
    const potentialFacts = this.simulateFactsFromCompletion(candidate);
    
    // Check if adding these facts would unlock the next tier
    const simulatedProfile = {
      ...factsProfile,
      facts: { ...factsProfile.facts, ...potentialFacts }
    };
    
    const newProgression = this.tierEngine.evaluateTierProgression(simulatedProfile);
    
    if (newProgression.currentTier.id !== currentProgression.currentTier.id) {
      // This task would unlock a tier!
      candidate.unlockedTier = newProgression.currentTier;
      return this.config.tierUnlockBonusMultiplier;
    }
    
    return 0;
  }

  /**
   * Simulate what facts would be established by completing this task
   */
  private simulateFactsFromCompletion(candidate: DailyTaskCandidate): Record<string, any> {
    // This is a simplified simulation - in practice, this would use the FactsEngine
    const simulatedFacts: Record<string, any> = {};
    
    // Add some basic fact simulation based on question content
    if (candidate.id.includes('password_manager')) {
      simulatedFacts['behavior.password_manager.usage'] = { value: true };
    }
    if (candidate.id.includes('mfa') || candidate.id.includes('two_factor')) {
      simulatedFacts['behavior.mfa.enabled'] = { value: true };
    }
    if (candidate.id.includes('backup')) {
      simulatedFacts['behavior.backup.strategy'] = { value: 'basic' };
    }
    if (candidate.id.includes('ad_blocker') || candidate.id.includes('ublock')) {
      simulatedFacts['browser.ad_blocker'] = { value: true };
    }
    
    return simulatedFacts;
  }

  /**
   * Generate a contextual reason for why this task was selected
   */
  private generateTaskReason(task: DailyTaskCandidate): string {
    if (task.unlockedTier) {
      return `🎉 Great choice! Completing this will unlock ${task.unlockedTier.name} and open up new security features.`;
    }
    
    if (task.tierUnlockBonus > 0) {
      return `🎯 This task brings you closer to unlocking your next security tier!`;
    }
    
    const tags = task.tags || [];
    if (tags.includes('critical')) {
      return `🚨 This addresses a critical security gap - worth prioritizing today.`;
    }
    
    if (task.estimatedMinutes <= 5) {
      return `⚡ Quick win! This takes just ${task.estimatedMinutes} minutes but makes a real difference.`;
    }
    
    if (task.impactScore >= 70) {
      return `🛡️ High-impact security improvement - your digital safety will thank you!`;
    }
    
    return `✨ A solid security step that's worth tackling today.`;
  }

  /**
   * Get current tier progression information
   */
  private getTierProgressInfo(factsProfile: FactsProfile) {
    const progression = this.tierEngine.evaluateTierProgression(factsProfile);
    
    return {
      currentTier: progression.currentTier.name,
      nextTier: progression.nextTier?.name,
      progressPercentage: progression.progressToNext?.progressPercentage || 100
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<DailyTaskConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}