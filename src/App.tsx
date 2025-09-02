import { useEffect, useState } from 'react';
import { Shield, RotateCcw, FileDown, FileUp, Menu, X, Github } from 'lucide-react';
import { useAssessmentStore, initializeStore } from './features/assessment/state/store';
import { ScoreBar } from './components/ScoreBar';
import { QuestionCard } from './components/QuestionCard';
import { Recommendations } from './components/Recommendations';
import { ActionRecommendations } from './components/ActionRecommendations';
import { Celebration } from './components/Celebration';
import { GameifiedOnboarding } from './components/GameifiedOnboarding';
import { PrivacyNotice } from './components/PrivacyNotice';
import { AnswerHistory } from './components/AnswerHistory';
import { VersionBadge } from './components/VersionBadge';

function App() {
  const [currentDomain, setCurrentDomain] = useState<string>('quickwins');
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    // Show onboarding if it's a new user (no answers in localStorage)
    const hasAnswers = localStorage.getItem('cyber-fitness-answers');
    const hasSeenOnboarding = localStorage.getItem('cyber-fitness-onboarding-completed');
    return !hasAnswers && !hasSeenOnboarding;
  });
  const [showPrivacyNotice, setShowPrivacyNotice] = useState<boolean>(() => {
    // Show privacy notice if user hasn't dismissed it permanently
    return !localStorage.getItem('cyber-fitness-privacy-dismissed');
  });
  const [showResetModal, setShowResetModal] = useState(false);
  const [privacyNoticeMinimized, setPrivacyNoticeMinimized] = useState<boolean>(false);

  const {
    questionBank,
    answers,
    overallScore,
    domainScores,
    currentLevel: userLevel,
    quickWinsCompleted,
    totalQuickWins,
    nextLevelProgress,
    showCelebration,
    lastScoreIncrease,
    answerQuestion,
    getRecommendations,
    dismissCelebration,
  } = useAssessmentStore();

  // Initialize store on app load
  useEffect(() => {
    initializeStore();
  }, []);

  const currentDomainData = questionBank.domains.find(d => d.id === currentDomain);
  const currentLevelData = currentDomainData?.levels.find(l => l.level === currentLevel);
  
  const recommendations = getRecommendations();
  const totalQuestions = questionBank.domains.reduce(
    (total, domain) => total + domain.levels.reduce(
      (levelTotal, level) => levelTotal + level.questions.length, 0
    ), 0
  );
  const answeredQuestions = Object.keys(answers).length;

  // Simple browser/platform detection for action recommendations
  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    let browser = 'unknown';
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) browser = 'chrome';
    else if (userAgent.includes('firefox')) browser = 'firefox';
    else if (userAgent.includes('safari') && !userAgent.includes('chrome')) browser = 'safari';
    else if (userAgent.includes('edg')) browser = 'edge';
    
    let platform = 'unknown';
    if (userAgent.includes('win')) platform = 'windows';
    else if (userAgent.includes('mac')) platform = 'mac';
    else if (userAgent.includes('linux')) platform = 'linux';
    else if (userAgent.includes('android')) platform = 'android';
    else if (userAgent.includes('iphone') || userAgent.includes('ipad')) platform = 'ios';
    
    return { browser, platform };
  };

  const getUserProfile = () => {
    const techComfort = localStorage.getItem('cyber-fitness-tech-comfort') as 'beginner' | 'comfortable' | 'advanced' || 'beginner';
    const mainConcerns = JSON.parse(localStorage.getItem('cyber-fitness-main-concerns') || '["general"]');
    return { techComfort, mainConcerns };
  };

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
        
        if (data.answers && typeof data.answers === 'object') {
          // Import answers one by one to trigger score recalculation
          Object.entries(data.answers as Record<string, { questionId: string; value: boolean | number }>).forEach(([questionId, answer]) => {
            if (answer && typeof answer === 'object' && 'value' in answer) {
              const value = answer.value;
              if (typeof value === 'boolean' || (typeof value === 'number' && value >= 1 && value <= 5)) {
                answerQuestion(questionId, value);
              }
            }
          });
          alert('Assessment data imported successfully!');
        } else {
          throw new Error('No valid answers found in file');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert(error instanceof Error ? error.message : 'Invalid file format');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const navigateToQuestion = (questionId: string) => {
    // Find which domain and level contains this question
    for (const domain of questionBank.domains) {
      for (const level of domain.levels) {
        if (level.questions.some(q => q.id === questionId)) {
          setCurrentDomain(domain.id);
          setCurrentLevel(level.level);
          // Scroll to question
          setTimeout(() => {
            const element = document.getElementById(`question-${questionId}`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
          break;
        }
      }
    }
  };

  const resetOnboardingForTesting = () => {
    console.log('Reset button clicked - clearing localStorage...');
    
    // Clear all onboarding-related data
    localStorage.removeItem('cyber-fitness-onboarding-completed');
    localStorage.removeItem('cyber-fitness-privacy-dismissed');
    localStorage.removeItem('cyber-fitness-onboarding-score');
    localStorage.removeItem('cyber-fitness-onboarding-answers');
    localStorage.removeItem('cyber-fitness-detected-platform');
    localStorage.removeItem('cyber-fitness-detected-browser');
    
    // Legacy onboarding data
    localStorage.removeItem('cyber-fitness-primary-device');
    localStorage.removeItem('cyber-fitness-tech-comfort');
    localStorage.removeItem('cyber-fitness-main-concerns');
    localStorage.removeItem('cyber-fitness-confidence-goal');
    
    // Clear assessment data too for complete reset
    localStorage.removeItem('cyber-fitness-answers');
    localStorage.removeItem('cyber-fitness-completed-actions');
    
    console.log('LocalStorage cleared, refreshing page...');
    
    // Force page refresh to reset all state
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleResetToBeginning = () => {
    // Clear everything - both onboarding and assessment data
    resetOnboardingForTesting();
    setShowResetModal(false);
  };

  const handleResetCurrentLevel = () => {
    // Only reset assessment answers, keep onboarding completion
    const store = useAssessmentStore.getState();
    store.resetAssessment();
    setShowResetModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Onboarding Flow */}
      {showOnboarding && (
        <GameifiedOnboarding 
          onComplete={(result) => {
            localStorage.setItem('cyber-fitness-onboarding-completed', 'true');
            // Store the results from gamified onboarding
            localStorage.setItem('cyber-fitness-onboarding-score', result.totalScore.toString());
            localStorage.setItem('cyber-fitness-onboarding-answers', JSON.stringify(result.answeredQuestions));
            localStorage.setItem('cyber-fitness-detected-platform', result.detectedInfo.platform);
            localStorage.setItem('cyber-fitness-detected-browser', result.detectedInfo.browser);
            
            setShowOnboarding(false);
            // Show privacy notice after gamified onboarding
            setPrivacyNoticeMinimized(false);
            
            // Force reinitialize the store to pick up onboarding data
            setTimeout(() => {
              initializeStore();
            }, 100);
          }}
        />
      )}

      {/* Privacy Notice */}
      {showPrivacyNotice && !showOnboarding && (
        <PrivacyNotice 
          onDismiss={() => {
            localStorage.setItem('cyber-fitness-privacy-dismissed', 'true');
            setShowPrivacyNotice(false);
          }}
          isMinimized={privacyNoticeMinimized}
        />
      )}

      <Celebration 
        show={showCelebration}
        scoreIncrease={lastScoreIncrease}
        level={userLevel}
        onDismiss={dismissCelebration}
      />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Cyber Fitness Advisor
              </h1>
            </div>
            
            <div className="hidden sm:flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {answeredQuestions}/{totalQuestions} questions answered
              </div>
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                title="Export your progress"
              >
                <FileDown className="w-4 h-4" />
                Export
              </button>
              <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
                <FileUp className="w-4 h-4" />
                Import
                <input type="file" accept=".json" onChange={importData} className="hidden" />
              </label>
              <button
                onClick={() => setShowResetModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <a
                href="https://github.com/electricessence/Cyber-Fitness-Advisor"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                title="View source code, report issues, or suggest improvements on GitHub"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-gray-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className={`lg:col-span-1 ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
              <h3 className="font-bold text-gray-800 mb-4">Assessment Sections</h3>
              
              {questionBank.domains.map((domain) => (
                <div key={domain.id} className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">
                    {domain.title}
                    {domainScores[domain.id] && (
                      <span className="ml-2 text-sm text-blue-600 font-bold">
                        {Math.round(domainScores[domain.id])}%
                      </span>
                    )}
                  </h4>
                  
                  {domain.levels.map((level) => {
                    const isActive = currentDomain === domain.id && currentLevel === level.level;
                    const levelAnswered = level.questions.every(q => answers[q.id]);
                    
                    return (
                      <button
                        key={`${domain.id}-${level.level}`}
                        onClick={() => {
                          setCurrentDomain(domain.id);
                          setCurrentLevel(level.level);
                          setMobileMenuOpen(false);
                        }}
                        className={`
                          w-full text-left px-3 py-2 rounded-md text-sm mb-1 transition-colors
                          ${isActive 
                            ? 'bg-blue-100 text-blue-800 font-medium' 
                            : levelAnswered 
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-600 hover:bg-gray-50'
                          }
                        `}
                      >
                        Level {level.level} {levelAnswered && '✓'}
                        <div className="text-xs text-gray-500">
                          {level.questions.length} questions
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Score Bar */}
            <ScoreBar
              score={overallScore}
              level={userLevel}
              nextLevelProgress={nextLevelProgress}
              quickWinsCompleted={quickWinsCompleted}
              totalQuickWins={totalQuickWins}
            />

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="mt-6">
                <Recommendations
                  recommendations={recommendations}
                  onQuestionClick={navigateToQuestion}
                />
              </div>
            )}

            {/* Action Recommendations - High-Impact Security Actions */}
            {!showOnboarding && answeredQuestions > 0 && (
              <div className="mt-6">
                <ActionRecommendations
                  browserInfo={getBrowserInfo()}
                  userProfile={getUserProfile()}
                  onActionComplete={(actionId) => {
                    // You could potentially award bonus points for completing actions
                    console.log('Action completed:', actionId);
                  }}
                />
              </div>
            )}

            {/* Answer History */}
            {!showOnboarding && answeredQuestions > 0 && (
              <div className="mt-6">
                <AnswerHistory />
              </div>
            )}

            {/* Current Level Questions */}
            {currentLevelData && (
              <div className="mt-6">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {currentDomainData?.title} - Level {currentLevel}
                  </h2>
                  <p className="text-gray-600">
                    {currentLevel === 0 ? 'Start with these essential security basics!' :
                     currentLevel === 1 ? 'Build on your foundation with these improvements!' :
                     'Advanced security measures for comprehensive protection!'}
                  </p>
                </div>

                <div className="space-y-6">
                  {currentLevelData.questions.map((question) => (
                    <div key={question.id} id={`question-${question.id}`}>
                      <QuestionCard
                        question={question}
                        answer={answers[question.id]?.value}
                        onAnswer={(value) => answerQuestion(question.id, value)}
                        domainTitle={currentDomainData?.title || ''}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              🛡️ Cyber Fitness Advisor - Your personal cybersecurity coach
            </p>
            <p className="text-sm text-gray-500 mb-3">
              Start with quick wins, build momentum, stay secure. 
              No data leaves your browser.
            </p>
            
            {/* Version Badge */}
            <div className="mb-4">
              <VersionBadge />
            </div>
            
            {/* Security Policy Statement */}
            <div className="max-w-2xl mx-auto p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
              <div className="flex items-start gap-2 text-left">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">🔒 Secure App Policy: No External Links</p>
                  <p>
                    This app follows security best practices by never redirecting you to external sites. 
                    We provide search terms and instructions instead, so you can verify sources yourself 
                    and avoid tracking, malicious redirects, or compromised links. This builds good security habits!
                  </p>
                </div>
              </div>
            </div>

            {/* GitHub Community Section */}
            <div className="max-w-2xl mx-auto p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
              <div className="flex items-start gap-3 text-left">
                <Github className="w-5 h-5 text-gray-700 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium text-gray-900 mb-2">Help Improve Cyber Fitness Advisor</p>
                  <p className="mb-3">
                    This is an open-source project! Your feedback and contributions make it better for everyone.
                  </p>
                  <div className="space-y-1 text-xs">
                    <p>🐛 <span className="font-medium">Found a bug?</span> Submit an issue on GitHub</p>
                    <p>💡 <span className="font-medium">Have suggestions?</span> Request features or improvements</p>
                    <p>🔧 <span className="font-medium">Want to contribute?</span> Check out the source code</p>
                  </div>
                  <div className="mt-3">
                    <a
                      href="https://github.com/electricessence/Cyber-Fitness-Advisor"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-md hover:bg-gray-700 transition-colors"
                    >
                      <Github className="w-3 h-3" />
                      View on GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>
            {/* Developer testing option */}
            {window.location.hostname === 'localhost' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    console.log('Reset button clicked!');
                    resetOnboardingForTesting();
                  }}
                  className="bg-red-100 text-red-600 px-3 py-2 rounded text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  🔄 [Dev] Reset Onboarding & Start Over
                </button>
                <p className="text-xs text-gray-400 mt-1">
                  This will clear all data and restart the onboarding flow
                </p>
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <RotateCcw className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Reset Options</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              What would you like to reset?
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleResetToBeginning}
                className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors text-left"
              >
                <div className="font-medium">Reset to Very Beginning</div>
                <div className="text-red-100 text-sm">Clear everything and start fresh with onboarding</div>
              </button>
              
              <button
                onClick={handleResetCurrentLevel}
                className="w-full bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors text-left"
              >
                <div className="font-medium">Reset Current Assessment</div>
                <div className="text-orange-100 text-sm">Keep onboarding progress, reset only security questions</div>
              </button>
              
              <button
                onClick={() => setShowResetModal(false)}
                className="w-full bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
