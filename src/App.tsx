import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useAssessmentStore, initializeStore } from './features/assessment/state/store';
import { ScoreBar } from './components/ScoreBar';
import { AppLayout } from './components/layout/AppLayout';
import { ResetModal } from './components/layout/ResetModal';
import { useNavigation } from './hooks/useNavigation';
import { useAppState } from './hooks/useAppState';
import { QuestionDeck } from './components/questions/QuestionDeck';
import { SecurityStatus } from './components/layout/SecurityStatus';
import { BadgeSummary } from './components/badges/BadgeSummary';
import { ConnectedRecommendations } from './components/ConnectedRecommendations';
import { Menu, X, Download, Upload, RefreshCw, Github, Shield, Trophy, Lightbulb } from 'lucide-react';
// Initialize semantic version for global access
import './features/assessment/engine/semantics';
import { CFASemantics } from './utils/semantics';
// Development tools — only loaded in dev mode (tree-shaken from prod build)
const AuthoringDiagnostics = import.meta.env.DEV
  ? lazy(() => import('./components/development/AuthoringDiagnostics'))
  : null;
import { removeStorage } from './utils/safeStorage';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scoreDetailsOpen, setScoreDetailsOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [badgesOpen, setBadgesOpen] = useState(false);
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use custom hooks for state management
  const navigation = useNavigation();
  const appState = useAppState();

  const {
    questionBank,
    answers,
    percentage,
    coveragePercentage,
    scoreConfidence,
    currentLevel: userLevel,
    quickWinsCompleted,
    totalQuickWins,
    nextLevelProgress,
    answerQuestion,
    resetAssessment,
    answeredQuestionCount,
    totalRelevantQuestions,
  } = useAssessmentStore();

  // Initialize store on app load
  useEffect(() => {
    // Initialize store and device detection facts
    initializeStore();

    // Expose semantics globally for debugging (dev only)
    if (import.meta.env.DEV) {
      window.__cfaSemantics = CFASemantics;
    }
  }, []); // Only run once on mount

  useEffect(() => {
    navigation.setCurrentLevel(userLevel);
  }, [userLevel, navigation]);

  // Close any open modal/panel on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (menuOpen) setMenuOpen(false);
      else if (scoreDetailsOpen) setScoreDetailsOpen(false);
      else if (statusOpen) setStatusOpen(false);
      else if (badgesOpen) setBadgesOpen(false);
      else if (recommendationsOpen) setRecommendationsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [menuOpen, scoreDetailsOpen, statusOpen, badgesOpen, recommendationsOpen]);
  
  const fallbackTotalQuestions = questionBank.domains.reduce(
    (total, domain) => total + domain.levels.reduce(
      (levelTotal, level) => levelTotal + level.questions.length, 0
    ), 0
  );
  const totalQuestions = totalRelevantQuestions > 0 ? totalRelevantQuestions : fallbackTotalQuestions;
  const answeredFromState = answeredQuestionCount > 0 ? answeredQuestionCount : Object.keys(answers).length;
  const answeredQuestions = totalQuestions > 0 ? Math.min(answeredFromState, totalQuestions) : answeredFromState;
  const exportData = () => {
    const data = JSON.stringify({ answers, timestamp: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cyber-fitness-assessment.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid file structure');
        }

        // Import answers
        if (data.answers && typeof data.answers === 'object') {
          Object.entries(data.answers).forEach(([questionId, answerData]) => {
            if (answerData && typeof answerData === 'object') {
              answerQuestion(questionId, answerData as any);
            }
          });
          
          setImportStatus({ type: 'success', message: 'Data imported successfully!' });
          setTimeout(() => setImportStatus(null), 4000);
          
          // Reset file input
          if (event.target) {
            event.target.value = '';
          }
        } else {
          throw new Error('No valid answers found in file');
        }
      } catch (error) {
        setImportStatus({ type: 'error', message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
        setTimeout(() => setImportStatus(null), 6000);
        if (event.target) {
          event.target.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    // Clear assessment data
    resetAssessment();
    
    // Clear all related storage items (v1 keys)
    removeStorage('cyber-fitness-answers');
    removeStorage('cyber-fitness-onboarding-completed');
    removeStorage('cyber-fitness-privacy-dismissed');
    removeStorage('cyber-fitness-tech-comfort');
    removeStorage('cyber-fitness-main-concerns');
    
    // Clear v2 storage items
    // Reset component state
    navigation.setCurrentDomain('quickwins');
    navigation.setCurrentLevel(0);
    
    // Force a page reload to ensure clean state
    setTimeout(() => window.location.reload(), 100);
  };
  
  return (
    <AppLayout>
      <>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={importData}
          />
          <div className="min-h-screen bg-slate-950 text-white">
            <div className="flex flex-col min-h-screen mx-auto w-full max-w-xl px-4 pb-8">
              <header className="flex items-center justify-between py-4">
                {importStatus && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`absolute top-2 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-sm font-medium shadow-lg transition-opacity duration-300 ${
                      importStatus.type === 'success'
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-red-500/90 text-white'
                    }`}
                  >
                    {importStatus.message}
                  </div>
                )}
                <div>
                  <p className="text-[11px] uppercase tracking-[0.4em] text-slate-500">Cyber</p>
                  <p className="text-sm font-semibold text-white">Fitness Advisor</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setScoreDetailsOpen(true)}
                    className="flex flex-col px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-left min-w-[100px]"
                    aria-label="Open score details"
                  >
                    <span className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Score</span>
                    <span className="text-2xl font-bold text-white leading-none">
                      {Math.round(percentage)}
                      <span className="text-base text-slate-400 align-top ml-1">%</span>
                    </span>
                    <div className="w-full bg-white/10 rounded-full h-1.5 mt-1.5 overflow-hidden" role="progressbar" aria-valuenow={Math.round(percentage)} aria-valuemin={0} aria-valuemax={100} aria-label={`Protection score ${Math.round(percentage)} percent`}>
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(Math.max(percentage, 2), 100)}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1">{answeredQuestions}/{totalQuestions} cards</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(true)}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10"
                    aria-label="Open quick menu"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                </div>
              </header>

              <div className="flex-1 flex flex-col py-2">
                <div className="flex-1 flex flex-col justify-center">
                  <QuestionDeck />
                </div>
              </div>
            </div>
          </div>

          {menuOpen && (
            <div className="fixed inset-0 z-40">
              <button
                type="button"
                className="absolute inset-0 bg-black/60"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-slate-900/95 text-white backdrop-blur-sm p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Quick menu</p>
                    <p className="text-lg font-semibold">Control Center</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close menu"
                    className="p-2 rounded-full bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      exportData();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium"><Download className="w-4 h-4" /> Export answers</span>
                    <span className="text-xs text-slate-400">JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium"><Upload className="w-4 h-4" /> Import answers</span>
                    <span className="text-xs text-slate-400">JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setStatusOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium"><Shield className="w-4 h-4" /> Security status</span>
                    <span className="text-xs text-slate-400">Your answers</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setBadgesOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium"><Trophy className="w-4 h-4" /> Achievements</span>
                    <span className="text-xs text-slate-400">Badges earned</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setRecommendationsOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium"><Lightbulb className="w-4 h-4" /> Recommended actions</span>
                    <span className="text-xs text-slate-400">Next steps</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      appState.setShowResetModal(true);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-red-200"><RefreshCw className="w-4 h-4" /> Reset progress</span>
                    <span className="text-xs text-slate-400">Start over</span>
                  </button>
                  <a
                    href="https://github.com/electricessence/Cyber-Fitness-Advisor"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium"><Github className="w-4 h-4" /> View on GitHub</span>
                    <span className="text-xs text-slate-400">Opens new tab</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {scoreDetailsOpen && (
            <div className="fixed inset-0 z-40">
              <button
                type="button"
                className="absolute inset-0 bg-black/60"
                aria-label="Close score panel"
                onClick={() => setScoreDetailsOpen(false)}
              />
              <div className="relative z-50 mx-auto my-10 w-full max-w-md px-4">
                <div className="bg-white rounded-3xl shadow-2xl p-6 text-slate-900">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Scoreboard</p>
                      <h2 className="text-xl font-semibold">Your protection progress</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setScoreDetailsOpen(false)}
                      className="p-2 rounded-full bg-slate-100"
                      aria-label="Close details"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <ScoreBar
                    percentage={percentage}
                    rawPercentage={coveragePercentage}
                    scoreConfidence={scoreConfidence}
                    answeredCount={answeredQuestions}
                    totalCount={totalQuestions}
                    quickWinsCompleted={quickWinsCompleted}
                    totalQuickWins={totalQuickWins}
                    level={userLevel}
                    nextLevelProgress={nextLevelProgress}
                  />
                  <p className="mt-4 text-sm text-slate-600 text-center">
                    This number moves every time you finish the card in front of you. It naturally slows as you cover more ground.
                  </p>
                </div>
              </div>
            </div>
          )}

          {statusOpen && (
            <div className="fixed inset-0 z-40">
              <button
                type="button"
                className="absolute inset-0 bg-black/60"
                aria-label="Close security status"
                onClick={() => setStatusOpen(false)}
              />
              <div className="relative z-50 mx-auto my-6 w-full max-w-lg px-4 max-h-[90vh] overflow-y-auto">
                <div className="mb-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStatusOpen(false)}
                    className="p-2 rounded-full bg-white shadow-lg"
                    aria-label="Close security status"
                  >
                    <X className="w-5 h-5 text-slate-700" />
                  </button>
                </div>
                <SecurityStatus />
              </div>
            </div>
          )}

          {badgesOpen && (
            <div className="fixed inset-0 z-40">
              <button
                type="button"
                className="absolute inset-0 bg-black/60"
                aria-label="Close achievements"
                onClick={() => setBadgesOpen(false)}
              />
              <div className="relative z-50 mx-auto my-10 w-full max-w-md px-4">
                <div className="mb-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setBadgesOpen(false)}
                    className="p-2 rounded-full bg-white shadow-lg"
                    aria-label="Close achievements"
                  >
                    <X className="w-5 h-5 text-slate-700" />
                  </button>
                </div>
                <BadgeSummary />
              </div>
            </div>
          )}

          {recommendationsOpen && (
            <div className="fixed inset-0 z-40">
              <button
                type="button"
                className="absolute inset-0 bg-black/60"
                aria-label="Close recommendations"
                onClick={() => setRecommendationsOpen(false)}
              />
              <div className="relative z-50 mx-auto my-6 w-full max-w-lg px-4 max-h-[90vh] overflow-y-auto">
                <div className="mb-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setRecommendationsOpen(false)}
                    className="p-2 rounded-full bg-white shadow-lg"
                    aria-label="Close recommendations"
                  >
                    <X className="w-5 h-5 text-slate-700" />
                  </button>
                </div>
                <ConnectedRecommendations />
              </div>
            </div>
          )}
      </>

      {/* Reset Modal */}
      <ResetModal
        showResetModal={appState.showResetModal}
        setShowResetModal={appState.setShowResetModal}
        onReset={handleReset}
      />

      {/* Development Tools (Task C: Diagnostics & transparency) */}
      {AuthoringDiagnostics && (
        <Suspense fallback={null}>
          <AuthoringDiagnostics />
        </Suspense>
      )}
    </AppLayout>
  );
}

export default App;
