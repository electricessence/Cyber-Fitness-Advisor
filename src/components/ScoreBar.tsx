import { useEffect, useMemo, useState } from 'react';
import ExplainPopover from './development/ExplainPopover';
import { SCORE_CONSTANTS } from '../utils/constants';

interface ScoreBarProps {
  percentage: number;
  rawPercentage?: number;
  scoreConfidence?: number;
  answeredCount: number;
  totalCount: number;
  quickWinsCompleted: number;
  totalQuickWins: number;
  level: number;
  nextLevelProgress?: {
    currentLevel: number;
    nextLevel: number | null;
    pointsNeeded: number;
    progress: number;
  };
  showAnimation?: boolean;
}

// Soft gradients keep the focus on the current card without screaming for attention
function getPercentageColor(percentage: number): string {
  if (percentage >= 75) return 'from-emerald-500 via-teal-500 to-blue-500';
  if (percentage >= 50) return 'from-blue-500 via-sky-500 to-cyan-500';
  if (percentage >= 25) return 'from-amber-500 via-orange-400 to-rose-400';
  return 'from-slate-400 via-slate-500 to-slate-600';
}

const STAGE_RANGES = [
  {
    min: 80,
    name: 'Tier 4 · Locked In',
    percentile: 'Ahead of 9 in 10 households',
    copy: 'Only fine-tuning remains. Expect slower gains and focus on periodic reviews.'
  },
  {
    min: 60,
    name: 'Tier 3 · Solid Habits',
    percentile: 'Ahead of 3 in 4 households',
    copy: 'Daily hygiene is paying off. The remaining cards dial in advanced coverage.'
  },
  {
    min: 40,
    name: 'Tier 2 · Momentum',
    percentile: 'Ahead of most new users',
    copy: 'You are past the basics. Keep banking high-impact fixes when the deck surfaces them.'
  },
  {
    min: 20,
    name: 'Tier 1 · Shields Up',
    percentile: 'Catching up with the average household',
    copy: 'We are closing the obvious gaps. Answer a card or two per day to stay on pace.'
  },
  {
    min: 0,
    name: 'Tier 0 · Orientation',
    percentile: 'Getting the lay of the land',
    copy: 'We are still learning about your setup. Each card unlocks smarter suggestions.'
  }
];

function getStageMeta(percentage: number) {
  const sorted = [...STAGE_RANGES].sort((a, b) => b.min - a.min);
  const current = sorted.find(stage => percentage >= stage.min) ?? sorted[sorted.length - 1];
  const index = sorted.indexOf(current);
  const nextStage = index > 0 ? sorted[index - 1] : null;
  return { current, nextStage }; 
}

export function ScoreBar({ 
  percentage, 
  rawPercentage,
  scoreConfidence = 1,
  answeredCount,
  totalCount,
  quickWinsCompleted, 
  totalQuickWins,
  level,
  nextLevelProgress,
  showAnimation = true 
}: ScoreBarProps) {
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousMilestone, setPreviousMilestone] = useState(0);
  const [showMilestone, setShowMilestone] = useState(false);

  const stageMeta = useMemo(() => getStageMeta(percentage), [percentage]);
  const baseRawPercentage = rawPercentage ?? percentage;
  const normalizedConfidence = Math.max(0, Math.min(1, scoreConfidence));
  const confidencePercent = Math.round(normalizedConfidence * 100);
  const cardsToFullConfidence = Math.max(SCORE_CONSTANTS.MIN_CONFIDENT_ANSWERS - answeredCount, 0);

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
  const currentLabel = Math.round(displayPercentage);

  return (
    <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 border border-slate-100 sticky top-3 z-10" aria-label="Protection progress">
      {showMilestone && (
        <div className="absolute inset-0 rounded-3xl bg-slate-50 animate-pulse pointer-events-none" aria-hidden="true" />
      )}

      <div className="relative flex flex-col items-center text-center space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Percent protected</p>
        <div className="text-5xl font-black text-slate-900 leading-tight">
          {currentLabel}
          <span className="text-lg font-semibold text-slate-400 align-super ml-1">%</span>
        </div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
          Score confidence · {confidencePercent}%
        </p>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">{stageMeta.current.name}</p>
          <p className="text-sm text-slate-600 max-w-xs mx-auto">{stageMeta.current.copy}</p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{stageMeta.current.percentile}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${currentColor} transition-all duration-1000 ease-out rounded-full relative`}
            style={{ width: `${Math.min(displayPercentage, 100)}%` }}
          >
            {isAnimating && (
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
            )}
          </div>
        </div>
      </div>

      {stageMeta.nextStage && (
        <div className="mt-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Next big checkpoint</p>
          <p className="text-sm text-slate-700 mt-1">
            {stageMeta.nextStage.name} unlocks when you cross roughly {stageMeta.nextStage.min}% coverage.
          </p>
        </div>
      )}

      {nextLevelProgress?.nextLevel && (
        <div className="mt-3 bg-white border border-slate-100 rounded-2xl p-4 shadow-inner">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Tier progression</p>
          <p className="text-sm text-slate-700 mt-1">
            Level {level} → {nextLevelProgress.nextLevel} in {nextLevelProgress.pointsNeeded} more impact points.
          </p>
        </div>
      )}

      <details className="mt-4 text-xs text-slate-500 [&_summary]:cursor-pointer">
        <summary className="list-none text-slate-600 font-medium inline-flex items-center gap-2 justify-center">
          How this moves
        </summary>
        <div className="mt-2 space-y-1">
          <p>Every time you finish the card in front of you we add to this percent.</p>
          <p>{answeredCount} of {totalCount} cards completed for your setup.</p>
          <p>Raw coverage sits at {Math.round(baseRawPercentage)}% with {confidencePercent}% certainty.</p>
          <p>
            Confidence tops out after roughly {Math.min(totalCount, SCORE_CONSTANTS.MIN_CONFIDENT_ANSWERS)} cards -
            {cardsToFullConfidence > 0 ? ` ${cardsToFullConfidence} more to go.` : ' you are there.'}
          </p>
          {quickWinsCompleted > 0 && (
            <p>Quick wins: {quickWinsCompleted}/{totalQuickWins} answered.</p>
          )}
          {nextLevelProgress?.nextLevel && (
            <p>Need {nextLevelProgress.pointsNeeded} more points to reach Level {nextLevelProgress.nextLevel}.</p>
          )}
        </div>
      </details>

      <div className="mt-4">
        <ExplainPopover
          title="Protection percentage"
          semantics={{
            version: '3.2.0',
            behavior: 'Represents your protection grade, weighted by how many cards we truly know about you',
            rules: [
              'Each visible card contributes up to its maximum impact points',
              'Unanswered relevant cards count as zero until confirmed',
              `Confidence grows until roughly ${SCORE_CONSTANTS.MIN_CONFIDENT_ANSWERS} cards are answered`
            ],
            implementation: 'grade = (earnedPoints / relevantMaxPoints) * confidenceFactor'
          }}
          debug={{
            componentState: {
              percentage: Math.round(displayPercentage),
              answeredCount,
              totalCount,
              rawPercentage: Math.round(baseRawPercentage),
              scoreConfidence: normalizedConfidence
            },
            dataFlow: [
              'Answer card → store result locally',
              'Recalculate relevant cards → update percentage with confidence weighting'
            ]
          }}
        >
          <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Why this matters</span>
        </ExplainPopover>
      </div>
    </section>
  );
}
