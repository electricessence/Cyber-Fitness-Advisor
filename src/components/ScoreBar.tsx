import { useEffect, useState } from 'react';
import ExplainPopover from './development/ExplainPopover';

interface ScoreBarProps {
  score: number;
  percentage: number;
  answeredCount: number;
  totalCount: number;
  quickWinsCompleted: number;
  totalQuickWins: number;
  showAnimation?: boolean;
}

// Simple color zones based on percentage
function getPercentageColor(percentage: number): string {
  if (percentage >= 75) return 'from-green-500 to-green-600';
  if (percentage >= 50) return 'from-yellow-500 to-yellow-600';
  if (percentage >= 25) return 'from-orange-500 to-orange-600';
  return 'from-red-500 to-red-600';
}

function getPercentageLabel(percentage: number): string {
  if (percentage >= 75) return 'Strong Protection';
  if (percentage >= 50) return 'Good Progress';
  if (percentage >= 25) return 'Getting Started';
  return 'Needs Attention';
}

export function ScoreBar({ 
  percentage, 
  answeredCount,
  totalCount,
  quickWinsCompleted, 
  totalQuickWins,
  showAnimation = true 
}: ScoreBarProps) {
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousMilestone, setPreviousMilestone] = useState(0);
  const [showMilestone, setShowMilestone] = useState(false);

  // Enhanced smooth percentage animation with easing
  useEffect(() => {
    if (!showAnimation) {
      setDisplayPercentage(percentage);
      return;
    }

    if (Math.abs(percentage - displayPercentage) < 0.1) {
      setDisplayPercentage(percentage);
      return;
    }

    setIsAnimating(true);
    const duration = 1200;
    const startPercentage = displayPercentage;
    const percentageDifference = percentage - startPercentage;
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
      const newPercentage = startPercentage + (percentageDifference * easedProgress);
      
      setDisplayPercentage(newPercentage);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayPercentage(percentage);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [percentage, showAnimation, displayPercentage]);

  // Milestone detection (25%, 50%, 75%, 100%)
  useEffect(() => {
    const currentMilestone = Math.floor(percentage / 25) * 25;
    const prevMilestone = Math.floor(previousMilestone / 25) * 25;
    
    if (currentMilestone > prevMilestone && currentMilestone > 0) {
      setShowMilestone(true);
      setTimeout(() => setShowMilestone(false), 3000);
    }
    setPreviousMilestone(percentage);
  }, [percentage, previousMilestone]);

  const currentColor = getPercentageColor(displayPercentage);
  const currentLabel = getPercentageLabel(displayPercentage);

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 sticky top-4 z-10 border-l-4 border-l-blue-500 relative overflow-hidden">
      {/* Milestone Animation Overlay */}
      {showMilestone && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 animate-pulse pointer-events-none rounded-lg">
          <div className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-bounce">
            🎉 Great Progress!
          </div>
        </div>
      )}
      
      {/* Mobile Layout - Stacked */}
      <div className="sm:hidden space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-gray-800">
            {Math.round(displayPercentage)}%
            <span className="text-sm text-gray-500 font-normal ml-1">Protected</span>
          </div>
          {quickWinsCompleted > 0 && (
            <div className="text-sm font-medium text-green-600">
              🚀 {quickWinsCompleted}/{totalQuickWins}
            </div>
          )}
        </div>
        <ExplainPopover
          title="Your Security Progress"
          semantics={{
            version: "3.0.0",
            behavior: "Percentage reflects completion of security actions relevant to YOUR specific setup",
            rules: [
              "100% = All recommended actions for YOUR devices/apps completed",
              "Different users have different totals based on their scenario",
              "Progress is relative to your threat model, not absolute"
            ],
            implementation: "Percentage = (answered questions / total relevant questions) × 100"
          }}
          debug={{
            componentState: { 
              percentage: Math.round(displayPercentage),
              answeredCount,
              totalCount,
              quickWins: `${quickWinsCompleted}/${totalQuickWins}`
            },
            dataFlow: [
              "User answers questions → Progress calculated",
              "Percentage based on YOUR scenario", 
              "Color changes based on completion",
              "UI shows thermometer visualization"
            ]
          }}
        >
          <div className={`px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${currentColor} w-fit`}>
            {currentLabel}
          </div>
        </ExplainPopover>
        <div className="text-xs text-gray-600">
          {answeredCount} of {totalCount} actions for YOUR setup
        </div>
      </div>

      {/* Desktop Layout - Side by Side */}
      <div className="hidden sm:flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-gray-800">
            {Math.round(displayPercentage)}%
            <span className="text-sm text-gray-500 font-normal ml-1">Protected</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${currentColor}`}>
            {currentLabel}
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

      {/* Main progress bar - thermometer style */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
          <div 
            className={`h-full bg-gradient-to-r ${currentColor} transition-all duration-1200 ease-out rounded-full relative`}
            style={{ 
              width: `${Math.min(displayPercentage, 100)}%`,
              transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)' 
            }}
          >
            {/* Animated shimmer effect during changes */}
            {isAnimating && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer rounded-full" />
            )}
            
            {/* Subtle pulsing effect on active progress */}
            <div className="absolute inset-0 bg-white/10 animate-pulse rounded-full opacity-50" />
          </div>
        </div>
        
        {/* Milestone markers (25%, 50%, 75%, 100%) */}
        <div className="absolute -top-1 left-0 w-full h-5 pointer-events-none">
          {[25, 50, 75].map((milestone) => (
            <div
              key={milestone}
              className="absolute w-0.5 h-5 bg-gray-400"
              style={{ left: `${milestone}%` }}
              title={`${milestone}%`}
            />
          ))}
        </div>
      </div>

      {/* Progress context message */}
      <div className="hidden sm:block mt-2 text-xs text-gray-600">
        {answeredCount} of {totalCount} security actions completed for your specific setup
      </div>
    </div>
  );
}
