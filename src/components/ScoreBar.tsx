import { useEffect, useState } from 'react';
import { DEFAULT_LEVEL_THRESHOLDS } from '../features/assessment/engine/schema';
import ExplainPopover from './development/ExplainPopover';

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
  1: 'Foundation Built',
  2: 'Making Progress',
  3: 'Security Aware', 
  4: 'Well Protected',
  5: 'Security Expert',
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
  const [previousLevel, setPreviousLevel] = useState(level);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Enhanced smooth score animation with easing
  useEffect(() => {
    if (!showAnimation) {
      setDisplayScore(score);
      return;
    }

    if (Math.abs(score - displayScore) < 0.1) {
      setDisplayScore(score);
      return;
    }

    setIsAnimating(true);
    const duration = 1200; // Slightly longer for smoother feel
    const startScore = displayScore;
    const scoreDifference = score - startScore;
    let startTime: number;

    // Smooth easing function (ease-out cubic)
    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3);
    };

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easedProgress = easeOutCubic(progress);
      const newScore = startScore + (scoreDifference * easedProgress);
      
      setDisplayScore(newScore);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayScore(score);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [score, showAnimation]);

  // Level up detection and animation
  useEffect(() => {
    if (level > previousLevel) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000); // Show for 3 seconds
    }
    setPreviousLevel(level);
  }, [level, previousLevel]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 sticky top-4 z-10 border-l-4 border-l-blue-500 relative overflow-hidden">
      {/* Level Up Animation Overlay */}
      {showLevelUp && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 animate-pulse pointer-events-none rounded-lg">
          <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-bounce">
            🎉 LEVEL UP!
          </div>
        </div>
      )}
      
      {/* Mobile Layout - Stacked */}
      <div className="sm:hidden space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-gray-800">
            {Math.round(displayScore)}
            <span className="text-sm text-gray-500 font-normal">/100</span>
          </div>
          {quickWinsCompleted > 0 && (
            <div className="text-sm font-medium text-green-600">
              🚀 {quickWinsCompleted}/{totalQuickWins}
            </div>
          )}
        </div>
        <ExplainPopover
          title="Security Level System"
          semantics={{
            version: "2.0.0",
            behavior: "Progress tracked through point-based scoring with level thresholds",
            rules: [
              "Score calculated from visible questions only (any-gate shows, hide > show)",
              "Last answer wins for duplicate questions",
              "Non-scoring questions excluded from totals"
            ],
            implementation: "Uses DEFAULT_LEVEL_THRESHOLDS for progression"
          }}
          debug={{
            componentState: { 
              currentLevel: level, 
              score, 
              nextLevelProgress: nextLevelProgress.progress,
              quickWins: `${quickWinsCompleted}/${totalQuickWins}`
            },
            dataFlow: [
              "Questions answered → Score calculated",
              "Score mapped to level thresholds", 
              "Progress calculated to next level",
              "UI updated with animations"
            ]
          }}
        >
          <div className={`px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${LEVEL_COLORS[level as keyof typeof LEVEL_COLORS]} w-fit`}>
            Level {level}: {LEVEL_NAMES[level as keyof typeof LEVEL_NAMES]}
          </div>
        </ExplainPopover>
      </div>

      {/* Desktop Layout - Side by Side */}
      <div className="hidden sm:flex items-center justify-between mb-3">
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
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
          <div 
            className={`h-full bg-gradient-to-r ${LEVEL_COLORS[level as keyof typeof LEVEL_COLORS]} transition-all duration-1200 ease-out rounded-full relative`}
            style={{ 
              width: `${Math.min(displayScore, 100)}%`,
              transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)' 
            }}
          >
            {/* Animated shimmer effect during scoring */}
            {isAnimating && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer rounded-full" />
            )}
            
            {/* Subtle pulsing effect on active progress */}
            <div className="absolute inset-0 bg-white/10 animate-pulse rounded-full opacity-50" />
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
