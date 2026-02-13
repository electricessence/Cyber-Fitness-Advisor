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
  ChevronLeft,
  ChevronRight,
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

const CATEGORY_STYLE: Record<string, { bg: string; border: string; label: string; icon: string }> = {
  'to-do': { bg: 'bg-amber-50', border: 'border-amber-200', label: 'To-Do', icon: '📋' },
  'room-for-improvement': { bg: 'bg-blue-50', border: 'border-blue-200', label: 'Room to Grow', icon: '🔧' },
  'shields-up': { bg: 'bg-green-50', border: 'border-green-200', label: 'Good', icon: '🛡️' },
};

interface ImprovementItem {
  questionId: string;
  text: string;
  currentOptionText: string;
  currentFeedback: string;
  statusCategory: string;
  statement: string;
  potentialGain: number;
  priority: number;
  description?: string;
  explanation?: string;
}

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
  const [slideIndex, setSlideIndex] = useState(0);

  // Build improvement items from answered questions (needed for slideIndex clamping)
  const improvementItems = useMemo<ImprovementItem[]>(() => {
    const items: ImprovementItem[] = [];
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
          const gap = (bestOpt?.points ?? 0) - currentPoints;
          if (gap > 0) {
            items.push({
              questionId: question.id,
              text: question.text,
              currentOptionText: currentOpt?.text ?? String(answer.value),
              currentFeedback: currentOpt?.feedback ?? '',
              statusCategory: currentOpt?.statusCategory ?? 'room-for-improvement',
              statement: currentOpt?.statement ?? '',
              potentialGain: gap,
              priority: question.priority || 0,
              description: question.description,
              explanation: question.explanation,
            });
          }
        }
      }
    }
    items.sort((a, b) => b.potentialGain - a.potentialGain || b.priority - a.priority);
    return items;
  }, [questionBank, answers]);

  useEffect(() => {
    if (activeIndex >= totalCards) {
      setActiveIndex(totalCards > 0 ? totalCards - 1 : 0);
    }
  }, [activeIndex, totalCards]);

  // Clamp slideIndex when improvement items shrink (e.g. after revisit round-trip)
  useEffect(() => {
    if (slideIndex >= improvementItems.length && improvementItems.length > 0) {
      setSlideIndex(improvementItems.length - 1);
    }
  }, [slideIndex, improvementItems.length]);

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
    const answeredCount = Object.keys(answers).length;
    const totalSlides = improvementItems.length;
    const clampedIndex = Math.min(slideIndex, Math.max(0, totalSlides - 1));
    const currentSlide = improvementItems[clampedIndex];
    const cat = currentSlide
      ? (CATEGORY_STYLE[currentSlide.statusCategory] ?? CATEGORY_STYLE['room-for-improvement'])
      : null;

    return (
      <section aria-label="Assessment complete" className="flex flex-col gap-6 h-full">
        {/* Score summary — breathing room */}
        <div className="bg-white rounded-3xl shadow-xl px-6 py-8 sm:px-10 sm:py-10 text-center">
          <div className="text-5xl mb-3">{percentage >= 80 ? '🛡️' : percentage >= 50 ? '🔧' : '⚠️'}</div>
          <h3 className="text-2xl font-bold text-gray-900">
            {percentage >= 80 ? 'Strong protection' : percentage >= 50 ? 'Good foundation' : 'Room to strengthen'}
          </h3>
          <p className="text-base text-gray-500 mt-2">
            {answeredCount} questions answered &middot; {Math.round(percentage)}% coverage
          </p>
          {totalSlides > 0 && (
            <p className="text-sm text-gray-400 mt-3">
              {totalSlides} area{totalSlides !== 1 ? 's' : ''} where you can level up
            </p>
          )}
        </div>

        {/* Slide: one improvement area at a time */}
        {currentSlide && cat && (
          <div
            className={`bg-white rounded-3xl shadow-xl flex flex-col ${cat.border} border-2`}
            aria-live="polite"
          >
            {/* Card header */}
            <div className={`${cat.bg} px-6 py-4 sm:px-10 sm:py-5 rounded-t-3xl`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600 tracking-wide uppercase">
                  {cat.icon} {cat.label}
                </span>
                <span className="text-xs text-gray-400 font-medium tabular-nums">
                  {clampedIndex + 1} of {totalSlides}
                </span>
              </div>
            </div>

            {/* Card body — educational content */}
            <div className="px-6 py-6 sm:px-10 sm:py-8 flex flex-col gap-5">
              {/* The question */}
              <h4 className="text-lg font-semibold text-gray-900 leading-snug">
                {currentSlide.text}
              </h4>

              {/* Current answer label — prefer statement (e.g. "Password Manager: Not used") over raw option text */}
              <p className="text-sm text-gray-500">
                {currentSlide.statement || currentSlide.currentOptionText}
              </p>

              {/* Educational feedback — the "why" */}
              {currentSlide.currentFeedback && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl px-5 py-4">
                  <p className="text-sm font-semibold text-indigo-700 mb-1.5">Why this matters</p>
                  <p className="text-base text-gray-800 leading-relaxed">
                    {currentSlide.currentFeedback}
                  </p>
                </div>
              )}

              {/* Extra context from question description/explanation (if available) */}
              {(currentSlide.description || currentSlide.explanation) && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {currentSlide.description || currentSlide.explanation}
                </p>
              )}

              {/* Revisit action */}
              <button
                type="button"
                onClick={() => removeAnswer(currentSlide.questionId)}
                className="self-start inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors mt-1"
              >
                <RotateCcw className="w-4 h-4" />
                Revisit this question
              </button>
            </div>

            {/* Slide navigation */}
            {totalSlides > 1 && (
              <div className="px-6 pb-5 sm:px-10 sm:pb-7 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSlideIndex(Math.max(0, clampedIndex - 1))}
                  disabled={clampedIndex === 0}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <span className="text-sm text-gray-400 font-medium tabular-nums">
                  {clampedIndex + 1} / {totalSlides}
                </span>

                <button
                  type="button"
                  onClick={() => setSlideIndex(Math.min(totalSlides - 1, clampedIndex + 1))}
                  disabled={clampedIndex === totalSlides - 1}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* All-clear trophy state */}
        {improvementItems.length === 0 && (
          <div className="bg-white rounded-3xl shadow-xl px-6 py-10 sm:px-10 text-center">
            <div className="text-5xl mb-3">🏆</div>
            <p className="text-lg font-semibold text-gray-800">All answers are at their strongest</p>
            <p className="text-sm text-gray-500 mt-2">
              Excellent security posture — keep it up!
            </p>
          </div>
        )}
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
