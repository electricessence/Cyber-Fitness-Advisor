import { useEffect, useState } from 'react';
import { DEFAULT_LEVEL_THRESHOLDS } from '../features/assessment/engine/schema';

interface ScoreBarProps {
  score: number;
  level: number;
  nextLevelProgress: {
    currentLevel: number;
    nextLevel: number | null;
    pointsNeeded: number;
    progress: number;
  };
  quickWinsCompleted: number;
  totalQuickWins: number;
  showAnimation?: boolean;
}

const LEVEL_COLORS = {
  0: 'from-red-500 to-red-600',
  1: 'from-orange-500 to-orange-600', 
  2: 'from-yellow-500 to-yellow-600',
  3: 'from-green-500 to-green-600',
  4: 'from-blue-500 to-blue-600',
  5: 'from-purple-500 to-purple-600',
} as const;

const LEVEL_NAMES = {
  0: 'Getting Started',
  1: 'Basic Protection',
  2: 'Good Habits',
  3: 'Security Conscious', 
  4: 'Well Protected',
  5: 'Cyber Ninja',
} as const;

export function ScoreBar({ 
  score, 
  level, 
  nextLevelProgress, 
  quickWinsCompleted, 
  totalQuickWins,
  showAnimation = true 
}: ScoreBarProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate score changes
  useEffect(() => {
    if (!showAnimation) {
      setDisplayScore(score);
      return;
    }

    setIsAnimating(true);
    const duration = 1000; // 1 second
    const steps = 60;
    const increment = (score - displayScore) / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setDisplayScore(prev => {
        const newScore = prev + increment;
        if (currentStep >= steps) {
          clearInterval(timer);
          setIsAnimating(false);
          return score;
        }
        return newScore;
      });
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score, showAnimation]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sticky top-4 z-50 border-l-4 border-l-blue-500">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-gray-800">
            {Math.round(displayScore)}
            <span className="text-sm text-gray-500 font-normal">/100</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${LEVEL_COLORS[level as keyof typeof LEVEL_COLORS]}`}>
            Level {level}: {LEVEL_NAMES[level as keyof typeof LEVEL_NAMES]}
          </div>
        </div>
        
        {quickWinsCompleted > 0 && (
          <div className="text-right">
            <div className="text-sm font-medium text-green-600">
              🚀 {quickWinsCompleted}/{totalQuickWins} Quick Wins
            </div>
            <div className="text-xs text-gray-500">
              Easy wins completed!
            </div>
          </div>
        )}
      </div>

      {/* Main progress bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${LEVEL_COLORS[level as keyof typeof LEVEL_COLORS]} transition-all duration-1000 ease-out rounded-full relative`}
            style={{ width: `${Math.min(displayScore, 100)}%` }}
          >
            {isAnimating && (
              <div className="absolute inset-0 bg-white opacity-30 animate-pulse rounded-full" />
            )}
          </div>
        </div>
        
        {/* Level markers */}
        <div className="absolute -top-1 left-0 w-full h-5 pointer-events-none">
          {Object.entries(DEFAULT_LEVEL_THRESHOLDS).map(([levelNum, threshold]) => (
            <div
              key={levelNum}
              className="absolute w-0.5 h-5 bg-gray-400"
              style={{ left: `${threshold}%` }}
            />
          ))}
        </div>
      </div>

      {/* Next level progress */}
      {nextLevelProgress.nextLevel !== null && (
        <div className="mt-3 text-sm text-gray-600">
          <div className="flex justify-between items-center">
            <span>Progress to Level {nextLevelProgress.nextLevel}</span>
            <span className="font-medium">
              {Math.round(nextLevelProgress.progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(nextLevelProgress.progress, 100)}%` }}
            />
          </div>
          {nextLevelProgress.pointsNeeded > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(nextLevelProgress.pointsNeeded)} points needed
            </div>
          )}
        </div>
      )}
    </div>
  );
}
