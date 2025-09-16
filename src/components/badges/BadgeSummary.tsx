/**
 * Badge Summary - Compact badge display for sidebar or main dashboard
 */

import { Trophy, Star, Zap } from 'lucide-react';
import { useAssessmentStore } from '../../features/assessment/state/store';
import { ACHIEVEMENT_BADGES } from '../../features/badges/badgeDefinitions';

export function BadgeSummary() {
  const { 
    earnedBadges,
    badgeProgress,
    recentBadgeUnlocks,
    getNextRecommendedBadges
  } = useAssessmentStore();

  const totalBadges = ACHIEVEMENT_BADGES.length;
  const earnedCount = earnedBadges.length;
  const progressPercentage = totalBadges > 0 ? Math.round((earnedCount / totalBadges) * 100) : 0;
  
  // Get recent achievements for display
  const recentAchievements = recentBadgeUnlocks.slice(0, 2);
  
  // Get next recommended badges
  const nextBadges = getNextRecommendedBadges().slice(0, 2);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Achievements
        </h3>
        <div className="text-sm font-bold text-gray-600">
          {earnedCount}/{totalBadges}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Recent Unlocks */}
      {recentAchievements.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
            <Zap className="w-4 h-4" />
            Just Earned!
          </h4>
          <div className="space-y-1">
            {recentAchievements.map(unlock => (
              <div key={unlock.badge.id} className="flex items-center gap-2 text-sm">
                <span className="text-lg">{unlock.badge.icon}</span>
                <span className="text-gray-700">{unlock.badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Achievements */}
      {nextBadges.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-1">
            <Star className="w-4 h-4" />
            Next Up
          </h4>
          <div className="space-y-2">
            {nextBadges.map(badge => {
              const progress = badgeProgress.find(p => p.badgeId === badge.id);
              return (
                <div key={badge.id} className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="opacity-60">{badge.icon}</span>
                    <span className="text-gray-700 flex-1">{badge.name}</span>
                  </div>
                  {progress && progress.progress > 0 && (
                    <div className="ml-6">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-blue-400 h-1 rounded-full"
                          style={{ width: `${Math.min(progress.progress * 100, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {progress.description}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No badges yet */}
      {earnedCount === 0 && nextBadges.length === 0 && (
        <div className="text-center text-gray-500 text-sm py-4">
          <div className="text-2xl mb-2">🎯</div>
          <div>Answer questions to start earning achievement badges!</div>
        </div>
      )}
    </div>
  );
}