/**
 * Badge Engine - Evaluates badge unlock conditions and tracks progress
 * 
 * This engine monitors user progress and determines when badges should be unlocked.
 * It supports various condition types and provides progress tracking.
 */

import type { Answer } from '../assessment/engine/schema';
import type { DeviceProfile } from '../assessment/engine/deviceScenarios';
import { ACHIEVEMENT_BADGES, type Badge, type BadgeProgress, type BadgeCondition } from './badgeDefinitions';

export interface BadgeEvaluationContext {
  answers: Record<string, Answer>;
  currentScore: number;
  currentLevel: number;
  deviceProfile: DeviceProfile;
  quickWinsCompleted: number;
  streakData?: StreakData;
  sessionStartTime?: Date;
  earnedBadges: string[]; // Previously earned badge IDs
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: Date;
  streakHistory: Date[]; // Array of dates when user was active
}

export interface BadgeUnlockEvent {
  badge: Badge;
  isNewlyUnlocked: boolean;
  progress: BadgeProgress;
  context: BadgeEvaluationContext;
}

export class BadgeEngine {
  /**
   * Evaluate all badges and return current progress and newly unlocked badges
   */
  public evaluateAllBadges(context: BadgeEvaluationContext): {
    allProgress: BadgeProgress[];
    newlyUnlocked: BadgeUnlockEvent[];
    totalBadgesEarned: number;
  } {
    const allProgress: BadgeProgress[] = [];
    const newlyUnlocked: BadgeUnlockEvent[] = [];
    
    for (const badge of ACHIEVEMENT_BADGES) {
      const progress = this.evaluateBadgeProgress(badge, context);
      allProgress.push(progress);
      
      // Check if this badge was just unlocked
      if (progress.isUnlocked && !context.earnedBadges.includes(badge.id)) {
        newlyUnlocked.push({
          badge,
          isNewlyUnlocked: true,
          progress,
          context
        });
      }
    }
    
    return {
      allProgress,
      newlyUnlocked,
      totalBadgesEarned: allProgress.filter(p => p.isUnlocked).length
    };
  }

  /**
   * Evaluate progress for a specific badge
   */
  public evaluateBadgeProgress(badge: Badge, context: BadgeEvaluationContext): BadgeProgress {
    const progress = this.calculateConditionProgress(badge.unlockCondition, context);
    
    return {
      badgeId: badge.id,
      progress: Math.min(progress.progress, 1), // Cap at 100%
      isUnlocked: progress.progress >= 1,
      unlockedAt: progress.progress >= 1 ? new Date() : undefined,
      currentValue: progress.currentValue,
      targetValue: progress.targetValue,
      description: this.getProgressDescription(badge, progress)
    };
  }

  /**
   * Calculate progress for a specific condition
   */
  private calculateConditionProgress(condition: BadgeCondition, context: BadgeEvaluationContext): {
    progress: number;
    currentValue?: number;
    targetValue?: number;
  } {
    switch (condition.type) {
      case 'answers_count':
        return this.evaluateAnswersCount(condition.params, context);
      
      case 'domain_mastery':
        return this.evaluateDomainMastery(condition.params, context);
      
      case 'quick_wins':
        return this.evaluateQuickWins(condition.params, context);
      
      case 'score_threshold':
        return this.evaluateScoreThreshold(condition.params, context);
      
      case 'level_reached':
        return this.evaluateLevelReached(condition.params, context);
      
      case 'streak_days':
        return this.evaluateStreakDays(condition.params, context);
      
      case 'perfect_domain':
        return this.evaluatePerfectDomain(condition.params, context);
      
      case 'speed_completion':
        return this.evaluateSpeedCompletion(condition.params, context);
      
      case 'composite':
        return this.evaluateComposite(condition.params, context);
      
      default:
        return { progress: 0 };
    }
  }

  /**
   * Evaluate answers count condition
   */
  private evaluateAnswersCount(params: any, context: BadgeEvaluationContext) {
    const { count, requireDiversity } = params;
    const answers = Object.values(context.answers);
    
    let validAnswers = answers.length;
    
    if (requireDiversity) {
      // Count unique categories/domains
      const domains = new Set(answers.map(a => this.getQuestionDomain(a.questionId)));
      validAnswers = Math.min(validAnswers, domains.size * 3); // Require distribution
    }
    
    return {
      progress: validAnswers / count,
      currentValue: validAnswers,
      targetValue: count
    };
  }

  /**
   * Evaluate domain mastery condition
   */
  private evaluateDomainMastery(params: any, context: BadgeEvaluationContext) {
    const { domain, threshold } = params;
    
    // Calculate domain-specific progress
    const domainAnswers = Object.values(context.answers).filter(
      answer => this.getQuestionDomain(answer.questionId) === domain
    );
    
    if (domainAnswers.length === 0) {
      return { progress: 0, currentValue: 0, targetValue: 100 };
    }
    
    // Simple domain progress calculation
    const domainScore = domainAnswers.reduce((sum, answer) => sum + (answer.pointsEarned || 0), 0);
    const maxPossibleScore = domainAnswers.length * 25; // Assume 25 points max per question
    const domainProgress = Math.min(domainScore / maxPossibleScore, 1);
    
    return {
      progress: domainProgress >= threshold ? 1 : domainProgress / threshold,
      currentValue: Math.round(domainProgress * 100),
      targetValue: Math.round(threshold * 100)
    };
  }

  /**
   * Evaluate quick wins condition
   */
  private evaluateQuickWins(params: any, context: BadgeEvaluationContext) {
    const { count } = params;
    
    return {
      progress: context.quickWinsCompleted / count,
      currentValue: context.quickWinsCompleted,
      targetValue: count
    };
  }

  /**
   * Evaluate score threshold condition
   */
  private evaluateScoreThreshold(params: any, context: BadgeEvaluationContext) {
    const { score } = params;
    
    return {
      progress: context.currentScore / score,
      currentValue: Math.round(context.currentScore),
      targetValue: score
    };
  }

  /**
   * Evaluate level reached condition
   */
  private evaluateLevelReached(params: any, context: BadgeEvaluationContext) {
    const { level } = params;
    
    return {
      progress: context.currentLevel >= level ? 1 : context.currentLevel / level,
      currentValue: context.currentLevel,
      targetValue: level
    };
  }

  /**
   * Evaluate streak days condition
   */
  private evaluateStreakDays(params: any, context: BadgeEvaluationContext) {
    const { days } = params;
    const currentStreak = context.streakData?.currentStreak || 0;
    
    return {
      progress: currentStreak / days,
      currentValue: currentStreak,
      targetValue: days
    };
  }

  /**
   * Evaluate perfect domain condition
   */
  private evaluatePerfectDomain(params: any, context: BadgeEvaluationContext) {
    const { count } = params;
    
    // Count domains with perfect scores
    const domains = ['password', 'updates', 'privacy', 'backup', 'network'];
    let perfectDomains = 0;
    
    for (const domain of domains) {
      const domainAnswers = Object.values(context.answers).filter(
        answer => this.getQuestionDomain(answer.questionId) === domain
      );
      
      if (domainAnswers.length > 0) {
        const domainScore = domainAnswers.reduce((sum, answer) => sum + (answer.pointsEarned || 0), 0);
        const maxPossibleScore = domainAnswers.length * 25;
        if (domainScore >= maxPossibleScore) {
          perfectDomains++;
        }
      }
    }
    
    return {
      progress: perfectDomains / count,
      currentValue: perfectDomains,
      targetValue: count
    };
  }

  /**
   * Evaluate speed completion condition
   */
  private evaluateSpeedCompletion(params: any, context: BadgeEvaluationContext) {
    const { questions, timeMinutes } = params;
    
    // This would require session tracking - simplified for now
    const answersInSession = Object.values(context.answers).filter(
      answer => context.sessionStartTime && answer.timestamp && answer.timestamp >= context.sessionStartTime
    );
    
    if (answersInSession.length >= questions && context.sessionStartTime) {
      const sessionDuration = (Date.now() - context.sessionStartTime.getTime()) / (1000 * 60);
      return {
        progress: sessionDuration <= timeMinutes ? 1 : 0,
        currentValue: answersInSession.length,
        targetValue: questions
      };
    }
    
    return {
      progress: answersInSession.length / questions,
      currentValue: answersInSession.length,
      targetValue: questions
    };
  }

  /**
   * Evaluate composite condition (multiple conditions required)
   */
  private evaluateComposite(params: any, context: BadgeEvaluationContext) {
    const { conditions, beforeDate } = params;
    
    // Check date constraint first
    if (beforeDate && new Date() > new Date(beforeDate)) {
      return { progress: 0 };
    }
    
    let totalProgress = 0;
    let completedConditions = 0;
    
    for (const condition of conditions) {
      const result = this.calculateConditionProgress(condition, context);
      totalProgress += result.progress;
      if (result.progress >= 1) completedConditions++;
    }
    
    // All conditions must be met for composite badges
    const allMet = completedConditions === conditions.length;
    
    return {
      progress: allMet ? 1 : totalProgress / conditions.length,
      currentValue: completedConditions,
      targetValue: conditions.length
    };
  }

  /**
   * Get domain from question ID (simplified mapping)
   */
  private getQuestionDomain(questionId: string): string {
    if (questionId.includes('password')) return 'password';
    if (questionId.includes('update') || questionId.includes('patch')) return 'updates';
    if (questionId.includes('privacy') || questionId.includes('browser')) return 'privacy';
    if (questionId.includes('backup') || questionId.includes('recovery')) return 'backup';
    if (questionId.includes('network') || questionId.includes('wifi')) return 'network';
    return 'general';
  }

  /**
   * Generate human-readable progress description
   */
  private getProgressDescription(badge: Badge, progress: { progress: number; currentValue?: number; targetValue?: number }): string {
    if (progress.progress >= 1) {
      return `🎉 ${badge.name} unlocked!`;
    }
    
    const { currentValue, targetValue } = progress;
    if (currentValue !== undefined && targetValue !== undefined) {
      return `${currentValue}/${targetValue} - ${Math.round(progress.progress * 100)}% complete`;
    }
    
    return `${Math.round(progress.progress * 100)}% complete`;
  }

  /**
   * Get badges by category for display organization
   */
  public getBadgesByCategory(): Record<string, Badge[]> {
    const categories: Record<string, Badge[]> = {};
    
    for (const badge of ACHIEVEMENT_BADGES) {
      if (!categories[badge.category]) {
        categories[badge.category] = [];
      }
      categories[badge.category].push(badge);
    }
    
    return categories;
  }

  /**
   * Get next recommended badges based on current progress
   */
  public getNextRecommendedBadges(context: BadgeEvaluationContext): Badge[] {
    const allProgress = this.evaluateAllBadges(context).allProgress;
    
    return allProgress
      .filter(p => !p.isUnlocked && p.progress > 0.1) // At least 10% progress
      .sort((a, b) => b.progress - a.progress) // Sort by progress descending
      .slice(0, 3) // Top 3 recommendations
      .map(p => ACHIEVEMENT_BADGES.find(b => b.id === p.badgeId)!)
      .filter(Boolean);
  }
}