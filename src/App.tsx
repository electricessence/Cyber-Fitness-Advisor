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
    currentLevel: userLevel,
    quickWinsCompleted,
    totalQuickWins,
    nextLevelProgress,
    showCelebration,
    lastScoreIncrease,
    answerQuestion,
    dismissCelebration,
    resetAssessment,
  } = useAssessmentStore();

  // Initialize store on app load
  useEffect(() => {
    initializeStore();
  }, []);
  
  useEffect(() => {
    console.log('App.tsx: Store userLevel changed to:', userLevel);
    navigation.setCurrentLevel(userLevel);
  }, [userLevel, navigation]);
  
  const totalQuestions = questionBank.domains.reduce(
    (total, domain) => total + domain.levels.reduce(
      (levelTotal, level) => levelTotal + level.questions.length, 0
    ), 0
  );
  const answeredQuestions = Object.keys(answers).length;

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
          
          alert('Data imported successfully!');
          
          // Reset file input
          if (event.target) {
            event.target.value = '';
          }
        } else {
          throw new Error('No valid answers found in file');
        }
      } catch (error) {
        alert(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    
    // Clear all related localStorage items
    localStorage.removeItem('cyber-fitness-answers');
    localStorage.removeItem('cyber-fitness-onboarding-completed');
    localStorage.removeItem('cyber-fitness-privacy-dismissed');
    localStorage.removeItem('cyber-fitness-tech-comfort');
    localStorage.removeItem('cyber-fitness-main-concerns');
    
    // Reset component state
    appState.setShowOnboarding(true);
    appState.setShowPrivacyNotice(true);
    appState.setPrivacyNoticeMinimized(false);
    navigation.setCurrentDomain('quickwins');
    navigation.setCurrentLevel(0);
    
    // Force a page reload to ensure clean state
    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <AppLayout>
      {/* Onboarding Modal */}
      {appState.showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <GameifiedOnboarding
              onComplete={() => {
                appState.setShowOnboarding(false);
                localStorage.setItem('cyber-fitness-onboarding-completed', 'true');
                appState.setPrivacyNoticeMinimized(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      {appState.showPrivacyNotice && !appState.showOnboarding && (
        <PrivacyNotice
          onDismiss={() => {
            appState.setShowPrivacyNotice(false);
            localStorage.setItem('cyber-fitness-privacy-dismissed', 'true');
          }}
          isMinimized={appState.privacyNoticeMinimized}
        />
      )}

      {/* Header */}
      <AppHeader
        overallScore={overallScore}
        currentLevel={userLevel}
        nextLevelProgress={nextLevelProgress}
        quickWinsCompleted={quickWinsCompleted}
        totalQuickWins={totalQuickWins}
        totalQuestions={totalQuestions}
        answeredQuestions={answeredQuestions}
        mobileMenuOpen={navigation.mobileMenuOpen}
        setMobileMenuOpen={navigation.setMobileMenuOpen}
        onResetClick={() => appState.setShowResetModal(true)}
        onExportData={exportData}
        onImportData={importData}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar Navigation */}
          <AppSidebar
            currentDomain={navigation.currentDomain}
            currentLevel={navigation.currentLevel}
            mobileMenuOpen={navigation.mobileMenuOpen}
            setCurrentDomain={navigation.setCurrentDomain}
            setCurrentLevel={navigation.setCurrentLevel}
            setMobileMenuOpen={navigation.setMobileMenuOpen}
          />

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
              <div className="lg:col-span-3">
                {/* Action Recommendations - High-Impact Security Actions */}
                {!appState.showOnboarding && (
                  <Recommendations
                    answeredQuestions={answeredQuestions}
                    getBrowserInfo={getBrowserInfo}
                    getUserProfile={getUserProfile}
                  />
                )}

                {/* Current Level Questions */}
                <MainContent
                  currentDomain={navigation.currentDomain}
                  currentLevel={navigation.currentLevel}
                />
              </div>

              {/* Security Status Sidebar */}
              <SecurityStatus />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Celebration Animation */}
      {showCelebration && (
        <Celebration
          show={showCelebration}
          scoreIncrease={lastScoreIncrease || 0}
          level={userLevel}
          onDismiss={dismissCelebration}
        />
      )}

      {/* Reset Modal */}
      <ResetModal
        showResetModal={appState.showResetModal}
        setShowResetModal={appState.setShowResetModal}
        onReset={handleReset}
      />
    </AppLayout>
  );
}

export default App;
