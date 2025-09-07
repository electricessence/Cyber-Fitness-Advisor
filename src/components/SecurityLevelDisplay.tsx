import { Star, Shield, Crown, Zap } from 'lucide-react';
import type { ProgressionInfo } from '../features/progression/securityLevels';

interface SecurityLevelDisplayProps {
  progression: ProgressionInfo;
  showSuggestions?: boolean;
}

export function SecurityLevelDisplay({ progression, showSuggestions = true }: SecurityLevelDisplayProps) {
  const { currentLevel, nextLevel, pointsToNextLevel, recentAchievements, suggestedActions } = progression;

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'getting_started': return <Shield className="w-6 h-6" />;
      case 'security_aware': return <Shield className="w-6 h-6" />;
      case 'well_protected': return <Shield className="w-6 h-6 text-green-600" />;
      case 'security_savvy': return <Star className="w-6 h-6 text-purple-600" />;
      case 'security_expert': return <Crown className="w-6 h-6 text-yellow-600" />;
      default: return <Shield className="w-6 h-6" />;
    }
  };

  const getLevelColor = (color: string) => {
    const colors = {
      gray: 'from-gray-400 to-gray-600',
      blue: 'from-blue-400 to-blue-600',
      green: 'from-green-400 to-green-600',
      purple: 'from-purple-400 to-purple-600',
      gold: 'from-yellow-400 to-yellow-600'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="space-y-4">
      {/* Current Level Display */}
      <div className={`bg-gradient-to-r ${getLevelColor(currentLevel.color)} text-white rounded-xl p-6 shadow-lg`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full">
            {getLevelIcon(currentLevel.id)}
          </div>
          <div>
            <h3 className="text-xl font-bold">{currentLevel.badge} {currentLevel.title}</h3>
            <p className="text-white/90 text-sm">{currentLevel.description}</p>
          </div>
        </div>

        {/* Level Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          {currentLevel.benefits.map((benefit: string, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm text-white/90">
              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              {benefit}
            </div>
          ))}
        </div>

        {/* Next Level Progress */}
        {nextLevel && pointsToNextLevel !== undefined && (
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Next: {nextLevel.title}</span>
              <span className="text-sm">+{pointsToNextLevel} points to level up</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white/80 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.max(10, Math.min(90, ((progression.currentScore - currentLevel.minScore) / (nextLevel.minScore - currentLevel.minScore)) * 100))}%`
                }}
              ></div>
            </div>
            {currentLevel.nextLevelHint && (
              <p className="text-xs text-white/80 mt-2">{currentLevel.nextLevelHint}</p>
            )}
          </div>
        )}
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            Recent Achievements
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {recentAchievements.map((achievement: string, index: number) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                {achievement}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Next Actions */}
      {showSuggestions && suggestedActions.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-3">Level Up Faster</h4>
          <div className="space-y-2">
            {suggestedActions.map((action: string, index: number) => (
              <div key={index} className="flex items-center gap-3 text-sm text-blue-700">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                {action}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
