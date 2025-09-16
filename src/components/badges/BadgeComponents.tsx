/**
 * Badge Display Components
 * 
 * UI components for displaying badges, progress, and achievements
 */

import { Star, Lock, Trophy, Zap } from 'lucide-react';
import type { Badge, BadgeProgress } from '../../features/badges/badgeDefinitions';
import { BADGE_RARITY_STYLES } from '../../features/badges/badgeDefinitions';

interface BadgeCardProps {
  badge: Badge;
  progress: BadgeProgress;
  showProgress?: boolean;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

export function BadgeCard({ 
  badge, 
  progress, 
  showProgress = true, 
  size = 'medium',
  onClick 
}: BadgeCardProps) {
  const styles = BADGE_RARITY_STYLES[badge.rarity];
  const isUnlocked = progress.isUnlocked;
  
  const sizeClasses = {
    small: 'p-3 min-h-[120px]',
    medium: 'p-4 min-h-[140px]',
    large: 'p-6 min-h-[160px]'
  };
  
  const iconSizes = {
    small: 'text-2xl',
    medium: 'text-3xl',
    large: 'text-4xl'
  };

  return (
    <div 
      className={`
        relative rounded-lg border-2 transition-all duration-200 cursor-pointer hover:scale-105
        ${styles.border} ${styles.bg} ${isUnlocked ? styles.glow : 'opacity-60'}
        ${sizeClasses[size]}
        ${onClick ? 'hover:shadow-lg' : ''}
      `}
      onClick={onClick}
    >
      {/* Rarity Indicator */}
      <div className="absolute top-2 right-2">
        {badge.rarity === 'legendary' && <Star className="w-4 h-4 text-yellow-500" />}
        {badge.rarity === 'rare' && <Trophy className="w-4 h-4 text-blue-500" />}
        {badge.rarity === 'uncommon' && <Zap className="w-4 h-4 text-green-500" />}
      </div>

      {/* Lock Overlay for Unearned Badges */}
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-lg">
          <Lock className="w-6 h-6 text-gray-400" />
        </div>
      )}
      
      {/* Badge Content */}
      <div className="flex flex-col items-center text-center h-full">
        {/* Badge Icon */}
        <div className={`${iconSizes[size]} mb-2 ${isUnlocked ? '' : 'grayscale'}`}>
          {badge.icon}
        </div>
        
        {/* Badge Name */}
        <h3 className={`font-bold mb-1 ${styles.text} ${size === 'small' ? 'text-sm' : 'text-base'}`}>
          {badge.name}
        </h3>
        
        {/* Badge Description */}
        <p className={`text-xs text-gray-600 mb-2 flex-1 ${size === 'small' ? 'hidden' : ''}`}>
          {badge.description}
        </p>
        
        {/* Progress Bar (if not unlocked and showProgress) */}
        {!isUnlocked && showProgress && progress.progress > 0 && (
          <div className="w-full mt-auto">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress.progress * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {progress.description}
            </p>
          </div>
        )}
        
        {/* Points Reward */}
        {badge.pointsReward && isUnlocked && (
          <div className="text-xs text-green-600 font-medium mt-1">
            +{badge.pointsReward} points
          </div>
        )}
      </div>
    </div>
  );
}

interface BadgeGridProps {
  badges: Badge[];
  progress: BadgeProgress[];
  title?: string;
  showUnlocked?: boolean;
  showProgress?: boolean;
  maxDisplay?: number;
  onBadgeClick?: (badge: Badge) => void;
}

export function BadgeGrid({ 
  badges, 
  progress, 
  title,
  showUnlocked = true,
  showProgress = true,
  maxDisplay,
  onBadgeClick 
}: BadgeGridProps) {
  // Filter badges based on unlock status
  let displayBadges = badges;
  if (!showUnlocked) {
    const unlockedIds = new Set(progress.filter(p => p.isUnlocked).map(p => p.badgeId));
    displayBadges = badges.filter(badge => !unlockedIds.has(badge.id));
  }
  
  // Limit display count if specified
  if (maxDisplay) {
    displayBadges = displayBadges.slice(0, maxDisplay);
  }

  if (displayBadges.length === 0) {
    return null;
  }

  return (
    <div>
      {title && (
        <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {displayBadges.map(badge => {
          const badgeProgress = progress.find(p => p.badgeId === badge.id) || {
            badgeId: badge.id,
            progress: 0,
            isUnlocked: false,
            description: 'Not started'
          };
          
          return (
            <BadgeCard
              key={badge.id}
              badge={badge}
              progress={badgeProgress}
              showProgress={showProgress}
              onClick={() => onBadgeClick?.(badge)}
            />
          );
        })}
      </div>
    </div>
  );
}

interface BadgeCounterProps {
  totalEarned: number;
  totalAvailable: number;
  showDetails?: boolean;
}

export function BadgeCounter({ totalEarned, totalAvailable, showDetails = false }: BadgeCounterProps) {
  const percentage = totalAvailable > 0 ? Math.round((totalEarned / totalAvailable) * 100) : 0;
  
  return (
    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
      <Trophy className="w-8 h-8 text-yellow-600" />
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl font-bold text-gray-800">
            {totalEarned}/{totalAvailable}
          </span>
          <span className="text-sm text-yellow-700 font-medium">
            Achievement Badges
          </span>
        </div>
        
        {showDetails && (
          <div className="w-full bg-yellow-200 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </div>
      
      <div className="text-right">
        <div className="text-2xl font-bold text-yellow-600">
          {percentage}%
        </div>
        {showDetails && (
          <div className="text-xs text-gray-600">
            Complete
          </div>
        )}
      </div>
    </div>
  );
}

interface RecentBadgesProps {
  recentBadges: Array<{ badge: Badge; unlockedAt: Date }>;
  maxDisplay?: number;
}

export function RecentBadges({ recentBadges, maxDisplay = 3 }: RecentBadgesProps) {
  const displayBadges = recentBadges.slice(0, maxDisplay);
  
  if (displayBadges.length === 0) {
    return null;
  }

  return (
    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
      <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2">
        <Zap className="w-5 h-5" />
        Recently Earned
      </h3>
      
      <div className="space-y-2">
        {displayBadges.map(({ badge, unlockedAt }) => (
          <div key={badge.id} className="flex items-center gap-3 p-2 bg-white rounded border">
            <div className="text-2xl">{badge.icon}</div>
            <div className="flex-1">
              <div className="font-medium text-gray-800">{badge.name}</div>
              <div className="text-sm text-gray-600">
                {new Date(unlockedAt).toLocaleDateString()}
              </div>
            </div>
            {badge.pointsReward && (
              <div className="text-sm text-green-600 font-medium">
                +{badge.pointsReward}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface NextBadgesProps {
  nextBadges: Badge[];
  progress: BadgeProgress[];
  maxDisplay?: number;
}

export function NextBadges({ nextBadges, progress, maxDisplay = 3 }: NextBadgesProps) {
  const displayBadges = nextBadges.slice(0, maxDisplay);
  
  if (displayBadges.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
      <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
        <Star className="w-5 h-5" />
        Next Achievements
      </h3>
      
      <div className="space-y-3">
        {displayBadges.map(badge => {
          const badgeProgress = progress.find(p => p.badgeId === badge.id);
          
          return (
            <div key={badge.id}>
              <div className="flex items-center gap-3 p-3 bg-white rounded border">
                <div className="text-2xl opacity-60">{badge.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{badge.name}</div>
                  <div className="text-sm text-gray-600 mb-1">{badge.description}</div>
                  {badgeProgress && (
                    <div className="text-xs text-blue-600">{badgeProgress.description}</div>
                  )}
                </div>
                {badge.pointsReward && (
                  <div className="text-sm text-blue-600 font-medium">
                    +{badge.pointsReward}
                  </div>
                )}
              </div>
              
              {badge.hint && (
                <div className="mt-2 p-2 bg-blue-100 rounded text-sm text-blue-700">
                  💡 {badge.hint}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}