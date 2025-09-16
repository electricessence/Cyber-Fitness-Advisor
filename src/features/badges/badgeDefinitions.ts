/**
 * Achievement Badge System
 * 
 * Defines all available badges, their unlock conditions, and rewards.
 * Badges provide positive reinforcement and track meaningful milestones.
 */

// Types will be imported when needed by badge engine

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or icon class
  category: 'foundation' | 'domain' | 'streak' | 'milestone' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  pointsReward?: number; // Bonus points for earning
  unlockCondition: BadgeCondition;
  hint?: string; // Hint shown before unlocking
}

export interface BadgeCondition {
  type: 'answers_count' | 'domain_mastery' | 'quick_wins' | 'score_threshold' | 
        'streak_days' | 'level_reached' | 'perfect_domain' | 'speed_completion' | 'composite';
  // Flexible parameters for different condition types
  params: Record<string, any>;
}

export interface BadgeProgress {
  badgeId: string;
  progress: number; // 0-1 (0% to 100%)
  isUnlocked: boolean;
  unlockedAt?: Date;
  currentValue?: number;
  targetValue?: number;
  description: string;
}

// Core achievement badges aligned with roadmap
export const ACHIEVEMENT_BADGES: Badge[] = [
  // Foundation Badges (Common)
  {
    id: 'quick_starter',
    name: 'Quick Starter',
    description: 'Complete your first 3 quick wins',
    icon: '🚀',
    category: 'foundation',
    rarity: 'common',
    pointsReward: 5,
    unlockCondition: {
      type: 'quick_wins',
      params: { count: 3 }
    },
    hint: 'Complete quick wins to get started!'
  },
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Answer your first 5 questions',
    icon: '👣',
    category: 'foundation',
    rarity: 'common',
    pointsReward: 3,
    unlockCondition: {
      type: 'answers_count',
      params: { count: 5 }
    }
  },
  {
    id: 'security_curious',
    name: 'Security Curious',
    description: 'Answer 15 questions across different domains',
    icon: '🤔',
    category: 'foundation',
    rarity: 'common',
    pointsReward: 5,
    unlockCondition: {
      type: 'answers_count',
      params: { count: 15, requireDiversity: true }
    }
  },

  // Domain Mastery Badges (Uncommon)
  {
    id: 'password_master',
    name: 'Password Master',
    description: 'Achieve excellence in password security',
    icon: '🔐',
    category: 'domain',
    rarity: 'uncommon',
    pointsReward: 10,
    unlockCondition: {
      type: 'domain_mastery',
      params: { domain: 'password', threshold: 0.8 }
    },
    hint: 'Focus on password manager and unique passwords'
  },
  {
    id: 'update_ninja',
    name: 'Update Ninja',
    description: 'Master device and software updates',
    icon: '🔄',
    category: 'domain',
    rarity: 'uncommon',
    pointsReward: 10,
    unlockCondition: {
      type: 'domain_mastery',
      params: { domain: 'updates', threshold: 0.8 }
    },
    hint: 'Enable automatic updates everywhere'
  },
  {
    id: 'privacy_guardian',
    name: 'Privacy Guardian',
    description: 'Excel at protecting your personal data',
    icon: '🛡️',
    category: 'domain',
    rarity: 'uncommon',
    pointsReward: 10,
    unlockCondition: {
      type: 'domain_mastery',
      params: { domain: 'privacy', threshold: 0.8 }
    },
    hint: 'Focus on browser privacy and data protection'
  },
  {
    id: 'backup_hero',
    name: 'Backup Hero',
    description: 'Complete all backup and recovery measures',
    icon: '💾',
    category: 'domain',
    rarity: 'uncommon',
    pointsReward: 10,
    unlockCondition: {
      type: 'domain_mastery',
      params: { domain: 'backup', threshold: 1.0 }
    },
    hint: 'Set up automated backups for all important data'
  },

  // Level Milestone Badges (Uncommon to Rare)
  {
    id: 'security_conscious',
    name: 'Security Conscious',
    description: 'Reach Security Level 3',
    icon: '⚡',
    category: 'milestone',
    rarity: 'uncommon',
    pointsReward: 15,
    unlockCondition: {
      type: 'level_reached',
      params: { level: 3 }
    }
  },
  {
    id: 'well_protected',
    name: 'Well Protected',
    description: 'Reach Security Level 4',
    icon: '🔒',
    category: 'milestone',
    rarity: 'rare',
    pointsReward: 20,
    unlockCondition: {
      type: 'level_reached',
      params: { level: 4 }
    }
  },
  {
    id: 'cyber_ninja',
    name: 'Cyber Ninja',
    description: 'Reach the highest security level',
    icon: '🥷',
    category: 'milestone',
    rarity: 'legendary',
    pointsReward: 30,
    unlockCondition: {
      type: 'level_reached',
      params: { level: 5 }
    }
  },

  // Perfect Score Badges (Rare)
  {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Achieve 100% security score',
    icon: '💯',
    category: 'milestone',
    rarity: 'rare',
    pointsReward: 25,
    unlockCondition: {
      type: 'score_threshold',
      params: { score: 100 }
    }
  },
  {
    id: 'domain_perfectionist',
    name: 'Domain Perfectionist',
    description: 'Get perfect scores in any 3 security domains',
    icon: '🎯',
    category: 'domain',
    rarity: 'rare',
    pointsReward: 20,
    unlockCondition: {
      type: 'perfect_domain',
      params: { count: 3 }
    }
  },

  // Streak Badges (Common to Rare)
  {
    id: 'consistency_champion',
    name: 'Consistency Champion',
    description: 'Make security improvements 7 days in a row',
    icon: '🔥',
    category: 'streak',
    rarity: 'uncommon',
    pointsReward: 15,
    unlockCondition: {
      type: 'streak_days',
      params: { days: 7 }
    },
    hint: 'Visit daily and answer at least one question'
  },
  {
    id: 'dedication_master',
    name: 'Dedication Master',
    description: 'Maintain a 30-day improvement streak',
    icon: '🏆',
    category: 'streak',
    rarity: 'rare',
    pointsReward: 30,
    unlockCondition: {
      type: 'streak_days',
      params: { days: 30 }
    }
  },

  // Speed & Efficiency Badges (Uncommon)
  {
    id: 'speed_runner',
    name: 'Speed Runner',
    description: 'Complete 10 questions in under 10 minutes',
    icon: '⏱️',
    category: 'special',
    rarity: 'uncommon',
    pointsReward: 10,
    unlockCondition: {
      type: 'speed_completion',
      params: { questions: 10, timeMinutes: 10 }
    }
  },

  // Special Achievement Badges (Rare to Legendary)
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'One of the first users of Cyber Fitness Advisor',
    icon: '🌟',
    category: 'special',
    rarity: 'legendary',
    pointsReward: 50,
    unlockCondition: {
      type: 'composite',
      params: { 
        conditions: [
          { type: 'answers_count', params: { count: 10 } },
          { type: 'score_threshold', params: { score: 50 } }
        ],
        beforeDate: '2024-12-31' // Example cutoff
      }
    }
  },
  {
    id: 'security_mentor',
    name: 'Security Mentor',
    description: 'Master all aspects of digital security',
    icon: '👑',
    category: 'milestone',
    rarity: 'legendary',
    pointsReward: 100,
    unlockCondition: {
      type: 'composite',
      params: {
        conditions: [
          { type: 'level_reached', params: { level: 5 } },
          { type: 'perfect_domain', params: { count: 5 } },
          { type: 'streak_days', params: { days: 14 } }
        ]
      }
    }
  }
];

// Badge rarity styling
export const BADGE_RARITY_STYLES = {
  common: {
    border: 'border-gray-300',
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    glow: ''
  },
  uncommon: {
    border: 'border-green-300',
    bg: 'bg-green-50',
    text: 'text-green-700',
    glow: 'shadow-green-200'
  },
  rare: {
    border: 'border-blue-300',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    glow: 'shadow-blue-200'
  },
  legendary: {
    border: 'border-yellow-300',
    bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    text: 'text-yellow-700',
    glow: 'shadow-yellow-200 shadow-lg'
  }
} as const;