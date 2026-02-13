import { useState, useEffect, useMemo, type ComponentType } from 'react';
import {
  ShieldCheck,
  QrCode,
  Sparkles,
  LockKeyhole,
  Smartphone,
  Info,
  ArrowRight,
  Clock3,
  ShieldHalf,
  RotateCcw,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
import { useAssessmentStore } from '../../features/assessment/state/store';
import type { AnswerOption, Question } from '../../features/assessment/engine/schema';

interface QuestionVisual {
  icon: ComponentType<{ className?: string }>;
  gradient: string;
  label: string;
  accent: string;
  tint: string;
  promptBg: string;
}

type JourneyIntent = 'onboarding' | 'probe' | 'action-guided' | 'action-critical' | 'checklist' | 'insight';

const CARD_THEMES: Record<string, QuestionVisual> = {
  password: {
    icon: LockKeyhole,
    gradient: 'from-purple-500 via-indigo-500 to-blue-500',
    label: 'Password Safety',
    accent: 'text-purple-600',
    tint: 'bg-purple-50',
    promptBg: 'bg-purple-100/60'
  },
  privacy: {
    icon: ShieldHalf,
    gradient: 'from-emerald-500 via-green-500 to-lime-500',
    label: 'Privacy Basics',
    accent: 'text-emerald-600',
    tint: 'bg-emerald-50',
    promptBg: 'bg-emerald-100/60'
  },
  browser: {
    icon: QrCode,
    gradient: 'from-sky-500 via-cyan-500 to-teal-500',
    label: 'Browser Care',
    accent: 'text-sky-600',
    tint: 'bg-sky-50',
    promptBg: 'bg-sky-100/60'
  },
  device: {
    icon: Smartphone,
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    label: 'Device Health',
    accent: 'text-orange-600',
    tint: 'bg-amber-50',
    promptBg: 'bg-amber-100/70'
  },
  action: {
    icon: Sparkles,
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    label: 'Action Step',
    accent: 'text-rose-600',
    tint: 'bg-rose-50',
    promptBg: 'bg-rose-100/60'
  },
  default: {
    icon: ShieldCheck,
    gradient: 'from-slate-600 via-slate-500 to-slate-400',
    label: 'Security Check',
    accent: 'text-slate-600',
    tint: 'bg-slate-50',
    promptBg: 'bg-slate-100/60'
  }
};

const INTENT_META: Record<JourneyIntent, { label: string; description: string; chipClass: string; borderClass: string; textClass: string }> = {
  onboarding: {
    label: 'Orientation',
    description: 'These cards confirm basics so we can personalize later steps.',
    chipClass: 'bg-amber-100 text-amber-900 border border-amber-200',
    borderClass: 'border-amber-200',
    textClass: 'text-amber-700'
  },
  probe: {
    label: 'Daily Habits',
    description: 'Quick questions about how you normally handle things online.',
    chipClass: 'bg-sky-100 text-sky-900 border border-sky-200',
    borderClass: 'border-sky-200',
    textClass: 'text-sky-700'
  },
  'action-guided': {
    label: 'Guided Action',
    description: 'A short task with coaching baked in. Take it when you have a minute.',
    chipClass: 'bg-indigo-100 text-indigo-900 border border-indigo-200',
    borderClass: 'border-indigo-200',
    textClass: 'text-indigo-700'
  },
  'action-critical': {
    label: 'Critical Action',
    description: 'High-impact fix that closes a major gap. Worth pausing for.',
    chipClass: 'bg-rose-100 text-rose-900 border border-rose-200',
    borderClass: 'border-rose-200',
    textClass: 'text-rose-700'
  },
  checklist: {
    label: 'Checklist Item',
    description: 'A quick verification that keeps your setup in good shape.',
    chipClass: 'bg-emerald-100 text-emerald-900 border border-emerald-200',
    borderClass: 'border-emerald-200',
    textClass: 'text-emerald-700'
  },
  insight: {
    label: 'Insight Check',
    description: 'Learn something about your coverage and surface new recommendations.',
    chipClass: 'bg-slate-100 text-slate-800 border border-slate-200',
    borderClass: 'border-slate-200',
    textClass: 'text-slate-600'
  }
};

function getVisuals(question: Question): QuestionVisual {
  const tag = question.tags?.find((t) => CARD_THEMES[t]) ?? question.category ?? question.type ?? 'default';
  return CARD_THEMES[tag] || CARD_THEMES.default;
}

function deriveJourneyIntent(question: Question): JourneyIntent {
  if (question.journeyIntent) return question.journeyIntent;
  if (question.phase === 'onboarding') return 'onboarding';
  const tags = new Set(question.tags ?? []);

  if (tags.has('checklist')) return 'checklist';
  if (tags.has('probe') || tags.has('novice') || tags.has('daily')) return 'probe';
  if (tags.has('action')) {
    return tags.has('critical') ? 'action-critical' : 'action-guided';
  }
  if (tags.has('critical')) return 'action-critical';
  if (tags.has('browser') && tags.has('security')) return 'checklist';

  const priority = question.priority || 0;
  if (priority >= 9000) return 'action-critical';
  if (priority >= 6500) return 'action-guided';
  return 'insight';
}

function normalizeOptions(question: Question): AnswerOption[] {
  if (question.options?.length) {
    return question.options;
  }

  if (question.actionOptions?.length) {
    return question.actionOptions.map((option: any, index: number) => ({
      id: option.id || `${question.id}-action-${index}`,
      text: option.text,
      points: option.points,
      icon: option.icon,
      feedback: option.impact || option.description,
    }));
  }

  if (question.type === 'YN') {
    return [
      { id: 'yes', text: 'Yes, already set', points: question.weight },
      { id: 'no', text: 'Not yet', points: 0 }
    ];
  }

  return [
    { id: 'yes', text: 'Yes', points: question.weight },
    { id: 'unsure', text: 'Not sure', points: Math.floor((question.weight || 0) * 0.3) },
    { id: 'no', text: 'No', points: 0 }
  ];
}

export function QuestionDeck() {
  const {
    getOrderedAvailableQuestions,
    answerQuestion,
    answers,
    questionBank,
    percentage,
    removeAnswer,
  } = useAssessmentStore();

  const availableQuestions = getOrderedAvailableQuestions?.() ?? [];
  const totalCards = availableQuestions.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showReviewAnswers, setShowReviewAnswers] = useState(false);

  useEffect(() => {
    if (activeIndex >= totalCards) {
      setActiveIndex(totalCards > 0 ? totalCards - 1 : 0);
    }
  }, [activeIndex, totalCards]);

  useEffect(() => {
    setShowDetails(false);
  }, [activeIndex]);

  const currentQuestion = totalCards > 0 ? availableQuestions[activeIndex] : null;

  const options = useMemo(() => {
    return currentQuestion ? normalizeOptions(currentQuestion) : [];
  }, [currentQuestion]);

  const questionVisuals = currentQuestion ? getVisuals(currentQuestion) : CARD_THEMES.default;
  const journeyIntent: JourneyIntent = currentQuestion ? deriveJourneyIntent(currentQuestion) : 'insight';
  const intentMeta = INTENT_META[journeyIntent];

  const handleAnswer = (optionId: string) => {
    if (!currentQuestion) return;
    answerQuestion(currentQuestion.id, optionId);
  };

  if (!currentQuestion) {
    // Build improvement recommendations from answered questions
    const improvementItems: Array<{
      questionId: string;
      text: string;
      currentAnswer: string;
      currentOptionText: string;
      bestOptionText: string;
      potentialGain: number;
      priority: number;
    }> = [];

    for (const domain of questionBank.domains) {
      for (const level of domain.levels) {
        for (const question of level.questions) {
          const answer = answers[question.id];
          if (!answer) continue;

          const opts = question.options?.length ? question.options : [];
          if (opts.length === 0) continue;

          const currentOpt = opts.find(o => o.id === answer.value);
          const currentPoints = currentOpt?.points ?? 0;
          const bestOpt = opts.reduce((best, o) => ((o.points ?? 0) > (best.points ?? 0) ? o : best), opts[0]);
          const bestPoints = bestOpt?.points ?? 0;
          const gap = bestPoints - currentPoints;

          if (gap > 0) {
            improvementItems.push({
              questionId: question.id,
              text: question.text,
              currentAnswer: answer.value as string,
              currentOptionText: currentOpt?.text ?? String(answer.value),
              bestOptionText: bestOpt?.text ?? '',
              potentialGain: gap,
              priority: question.priority || 0,
            });
          }
        }
      }
    }

    // Sort by potential gain (highest impact first), break ties by priority
    improvementItems.sort((a, b) => b.potentialGain - a.potentialGain || b.priority - a.priority);

    const topAction = improvementItems[0];
    const answeredCount = Object.keys(answers).length;

    return (
      <section aria-label="Assessment complete" className="flex flex-col gap-4 h-full">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col gap-5">
          {/* Score summary */}
          <div className="text-center">
            <div className="text-4xl mb-2">{percentage >= 80 ? '🛡️' : percentage >= 50 ? '🔧' : '⚠️'}</div>
            <h3 className="text-xl font-semibold text-gray-900">
              {percentage >= 80 ? 'Strong protection' : percentage >= 50 ? 'Good foundation' : 'Room to strengthen'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {answeredCount} questions answered • {Math.round(percentage)}% coverage
            </p>
          </div>

          {/* Top recommended action */}
          {topAction && (
            <div className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
                    Next most impactful action
                  </p>
                  <p className="text-base font-medium text-gray-900 leading-snug">
                    {topAction.text}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <span className="text-gray-500">
                      Currently: <span className="font-medium text-orange-600">{topAction.currentOptionText}</span>
                    </span>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <span className="font-medium text-green-600">{topAction.bestOptionText}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAnswer(topAction.questionId)}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Change this answer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* More improvement opportunities */}
          {improvementItems.length > 1 && (
            <div>
              <button
                type="button"
                onClick={() => setShowReviewAnswers(!showReviewAnswers)}
                className="w-full flex items-center justify-between px-1 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  {improvementItems.length - 1} more area{improvementItems.length > 2 ? 's' : ''} to improve
                </span>
                {showReviewAnswers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showReviewAnswers && (
                <div className="mt-2 space-y-2">
                  {improvementItems.slice(1, 6).map(item => (
                    <div
                      key={item.questionId}
                      className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 rounded-xl"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.text}</p>
                        <p className="text-xs text-gray-500">
                          <span className="text-orange-600">{item.currentOptionText}</span>
                          {' → '}
                          <span className="text-green-600">{item.bestOptionText}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAnswer(item.questionId)}
                        className="flex-shrink-0 p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        aria-label={`Change answer for: ${item.text}`}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {improvementItems.length > 6 && (
                    <p className="text-xs text-gray-400 text-center pt-1">
                      +{improvementItems.length - 6} more
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* All clear state */}
          {improvementItems.length === 0 && (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-sm text-gray-600">
                All answers are at their strongest settings. Excellent security posture!
              </p>
            </div>
          )}
        </div>
      </section>
    );
  }

  const { icon: Icon, gradient, label, accent, tint, promptBg } = questionVisuals;

  return (
    <section id="question-deck" aria-label="Security question deck" className="flex flex-col gap-4 h-full">
      <div className="flex-1">
        <div className={`relative bg-white rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col gap-6 border ${intentMeta.borderClass}`}>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center shadow-md`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${intentMeta.chipClass}`}>
                  {intentMeta.label}
                </span>
                <p className={`text-xs font-semibold uppercase tracking-wide ${accent}`}>{label}</p>
              </div>
              <div className={`rounded-xl px-4 py-3 ${tint}`}>
                {currentQuestion.statement && (
                  <p className="text-base sm:text-lg font-medium text-slate-800 leading-snug">
                    {currentQuestion.statement}
                  </p>
                )}
                <h3 className="mt-2">
                  <span className={`inline-flex px-3 py-1 rounded-xl ${promptBg} ${accent} font-bold text-sm sm:text-base`}>
                    {currentQuestion.text}
                  </span>
                </h3>
                {currentQuestion.timeEstimate && (
                  <div className="inline-flex items-center gap-1 text-xs text-gray-600 bg-white/70 rounded-full px-2 py-1 mt-3">
                    <Clock3 className="w-3 h-3" />
                    {currentQuestion.timeEstimate}
                  </div>
                )}
              </div>
            </div>
          </div>

          {(currentQuestion.description || currentQuestion.explanation) && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowDetails((prev) => !prev)}
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600"
              >
                <Info className="w-4 h-4" />
                {showDetails ? 'Hide context' : 'Why this matters'}
              </button>
              {showDetails && (
                <p className="mt-2 text-sm text-gray-600 bg-blue-50 rounded-xl p-4">
                  {currentQuestion.description || currentQuestion.explanation}
                </p>
              )}
            </div>
          )}

          <div className="pt-4 space-y-3">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                className="w-full border-2 border-gray-200 rounded-2xl p-4 text-left hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      {option.icon && <span className="text-xl" aria-hidden="true">{option.icon}</span>}
                      {option.text}
                    </div>
                    {option.feedback && (
                      <p className="text-sm text-gray-500 mt-1">{option.feedback}</p>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
