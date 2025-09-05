import { useEffect } from 'react';
import { useAssessmentStore, initializeStore } from './features/assessment/state/store';
import { ScoreBar } from './components/ScoreBar';
import { Celebration } from './components/Celebration';
import { GameifiedOnboarding } from './components/GameifiedOnboarding';
import { PrivacyNotice } from './components/PrivacyNotice';
import { AppHeader } from './components/AppHeader';
import { AppLayout } from './components/layout/AppLayout';
import { AppSidebar } from './components/layout/AppSidebar';
import { MainContent } from './components/layout/MainContent';
import { Recommendations } from './components/layout/Recommendations';
import { SecurityStatus } from './components/layout/SecurityStatus';
import { Footer } from './components/layout/Footer';
import { ResetModal } from './components/layout/ResetModal';
import { useNavigation } from './hooks/useNavigation';
import { useAppState } from './hooks/useAppState';
import { useBrowserDetection } from './hooks/useBrowserDetection';

function App() {
  // Use custom hooks for state management
  const navigation = useNavigation();
  const appState = useAppState();
  const { getBrowserInfo, getUserProfile } = useBrowserDetection();

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
  // Sync local currentLevel with store userLevel and add debugging
  useEffect(() => {
    console.log('App.tsx: Store userLevel changed to:', userLevel);
    console.log('App.tsx: Current local navigation.currentLevel:', navigation.currentLevel);
    console.log('App.tsx: Total answers:', Object.keys(answers).length);
    navigation.setCurrentLevel(userLevel);
  }, [userLevel, answers, navigation]);

  const currentDomainData = questionBank.domains.find(d => d.id === navigation.currentDomain);
  const currentLevelData = currentDomainData?.levels.find(l => l.level === navigation.currentLevel);
  
  console.log('App.tsx render:', {
    currentDomain: navigation.currentDomain,
    currentLevel: navigation.currentLevel,
    userLevel,
    currentLevelData: currentLevelData ? `${currentLevelData.questions.length} questions` : 'none',
    answersCount: Object.keys(answers).length
  });
  
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
    
    // Clear ALL localStorage data at once
    const keysToRemove = [
      // Onboarding data  
      'cyber-fitness-onboarding-completed',
      'cyber-fitness-privacy-dismissed', 
      'cyber-fitness-onboarding-score',
      'cyber-fitness-onboarding-answers',
      'cyber-fitness-detected-platform',
      'cyber-fitness-detected-browser',
      
      // Legacy onboarding data
      'cyber-fitness-primary-device',
      'cyber-fitness-tech-comfort',
      'cyber-fitness-main-concerns', 
      'cyber-fitness-confidence-goal',
      
      // Assessment data
      'cyber-fitness-answers',
      'cyber-fitness-completed-actions',
      
      // Zustand persist store data
      'cyber-fitness-assessment'
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('LocalStorage cleared, refreshing page...');
    
    // Force page refresh to reset all state
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleResetToBeginning = () => {
    // Clear everything - both onboarding and assessment data
    console.log('Full reset - clearing store and localStorage...');
    
    // First clear the Zustand store state
    const store = useAssessmentStore.getState();
    store.resetAssessment();
    
    // Then clear all localStorage and refresh
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

      <AppHeader
        overallScore={overallScore}
        currentLevel={userLevel}
        nextLevelProgress={nextLevelProgress}
        quickWinsCompleted={quickWinsCompleted}
        totalQuickWins={totalQuickWins}
        answeredQuestions={answeredQuestions}
        totalQuestions={totalQuestions}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onResetClick={() => setShowResetModal(true)}
        onExportData={exportData}
        onImportData={importData}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar Navigation */}
          <div className={`lg:col-span-1 ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
              <h3 className="font-bold text-gray-800 mb-4">Assessment Sections</h3>
              
              {questionBank.domains.map((domain) => (
                <div key={domain.id} className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">
                    {domain.title}
                    {domainScores[domain.id] !== undefined && domainScores[domain.id] > 0 && (
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

          {/* Right Content Area - Main Content + Security Status */}
          <div className="lg:col-span-3">
            {/* Score Bar - spans full width */}
            <ScoreBar
              score={overallScore}
              level={userLevel}
              nextLevelProgress={nextLevelProgress}
              quickWinsCompleted={quickWinsCompleted}
              totalQuickWins={totalQuickWins}
            />

            {/* Content Grid - Main Content + Security Status side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
              {/* Main Content */}
              <div className="lg:col-span-3">{/* Recommendations */}
                {recommendations.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Recommended Actions</h2>
                    <div className="space-y-4">
                      {recommendations
                        .filter(rec => !answers[rec.question.id]) // Filter out already answered questions
                        .filter(rec => {
                          // Filter out questions from current level (since they're already shown above)
                          const currentQuestions = currentLevelData?.questions.map(q => q.id) || [];
                          return !currentQuestions.includes(rec.question.id);
                        })
                        .slice(0, 3).map((rec) => (
                        <UniversalCard
                          key={rec.question.id}
                          mode="preview"
                          id={rec.question.id}
                          title={rec.question.text}
                          category={rec.domain}
                          priority={rec.question.weight}
                          isQuickWin={rec.question.quickWin}
                          timeEstimate={rec.question.timeEstimate}
                          impact={rec.impact}
                          actionHint={rec.question.actionHint}
                          options={[]} // Preview mode doesn't need options
                          onClick={() => navigateToQuestion(rec.question.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Recommendations - High-Impact Security Actions */}
                {!showOnboarding && answeredQuestions > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">High-Impact Security Actions</h2>
                    <div className="space-y-4">
                      {getRecommendedActions(getBrowserInfo(), getUserProfile(), 6)
                        .filter(action => !answers[action.id]) // Filter out already answered actions
                        .slice(0, 3) // Limit to 3 after filtering
                        .map((action) => (
                        <UniversalCard
                          key={action.id}
                          mode="question"
                          id={action.id}
                          title={`Do you have ${action.title}?`}
                          category="Security Actions"
                          priority={action.impact === 'high' ? 9 : action.impact === 'medium' ? 6 : 3}
                          isQuickWin={action.difficulty === 'easy'}
                          timeEstimate={action.timeEstimate}
                          impact={action.impact}
                          detailedGuidance={action.description}
                          actionHint={`Search for: ${action.searchTerm}`}
                          options={[
                            {
                              id: 'yes',
                              text: '✅ Yes, I have this',
                              displayText: `${action.title} - Enabled`,
                              points: action.impact === 'high' ? 10 : action.impact === 'medium' ? 6 : 3,
                              target: 'shields-up',
                              impact: 'Great security practice!'
                            },
                            {
                              id: 'no',
                              text: '❌ No, I need to set this up',
                              displayText: `${action.title} - To Do`,
                              points: 0,
                              target: 'todo',
                              advice: `${action.description}\n\nSearch for: ${action.searchTerm}`,
                              followUp: action.installSteps ? {
                                modifyQuestions: {
                                  [`${action.id}_setup`]: {
                                    text: `Follow these steps to set up ${action.title}`,
                                    explanation: action.installSteps?.join('\n')
                                  }
                                }
                              } : undefined
                            }
                          ]}
                          onAnswer={(answer) => {
                            console.log(`Action ${action.id} answered:`, answer);
                            // Actually call the store function to save the answer
                            answerQuestion(action.id, answer);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Level Questions */}
                {currentLevelData && (
                  <div>
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
                      {(() => {
                        const allQuestions = currentLevelData.questions;
                        const answeredQuestionIds = Object.keys(answers);
                        const unansweredQuestions = allQuestions.filter(question => !answers[question.id]);
                        
                        console.log('App.tsx question filtering:', {
                          totalQuestions: allQuestions.length,
                          answeredQuestionIds,
                          unansweredCount: unansweredQuestions.length,
                          unansweredIds: unansweredQuestions.map(q => q.id)
                        });
                        
                        return unansweredQuestions;
                      })().map((question) => (
                        <div key={question.id} id={`question-${question.id}`}>
                          <UniversalCard
                            mode="question"
                            id={question.id}
                            title={question.text}
                            category={currentDomainData?.title || ''}
                            priority={question.weight}
                            isQuickWin={question.quickWin}
                            timeEstimate={question.timeEstimate}
                            impact={question.weight >= 8 ? 'high' : question.weight >= 5 ? 'medium' : 'low'}
                            currentAnswer={answers[question.id]?.value as string}
                            detailedGuidance={question.explanation}
                            actionHint={question.actionHint}
                            options={(() => {
                              const opts = question.options || [
                                // Fallback for old-style questions - convert Y/N to options format
                                {
                                  id: 'yes',
                                  text: '✅ Yes',
                                  displayText: 'Yes',
                                  points: question.weight,
                                  target: 'shields-up' as const,
                                  impact: 'Good security practice!'
                                },
                                {
                                  id: 'unsure',
                                  text: '🤔 Not sure',
                                  displayText: 'Check this setting',
                                  points: Math.floor(question.weight * 0.3),
                                  target: 'todo' as const,
                                  advice: question.actionHint || 'Please verify this setting'
                                },
                                {
                                  id: 'no',
                                  text: '❌ No',
                                  displayText: 'No',
                                  points: 0,
                                  target: 'needs-improvement' as const,
                                  impact: 'This could be a security risk',
                                  advice: question.actionHint || 'Consider implementing this security measure'
                                }
                              ];
                              console.log('App.tsx passing options for question:', question.id, opts);
                              return opts;
                            })()}
                            defaultLayout={question.defaultLayout || 'buttons'}
                            onAnswer={(optionId) => {
                              console.log('App.tsx onAnswer called with:', optionId, 'for question:', question.id);
                              answerQuestion(question.id, optionId);
                            }}
                            onFollowUp={(questionId, followUpData) => {
                              console.log('Follow-up triggered:', questionId, followUpData);
                              // Handle follow-up questions or conditional logic
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Security Status Sidebar */}
              <div className="lg:col-span-2">
                <ResponseCatalog />
              </div>
            </div>
          </div>
        </div>
      </div>      {/* Footer */}
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
