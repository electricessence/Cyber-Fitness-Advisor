import { useEffect } from 'react';
import { useAssessmentStore, initializeStore } from './features/assessment/state/store';
import { ScoreBar } from './components/ScoreBar';
import { Celebration } from './components/Celebration';
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
// Initialize semantic version for global access
import './features/assessment/engine/semantics';
import { CFASemantics } from './utils/semantics';
import AuthoringDiagnostics from './components/development/AuthoringDiagnostics';

function App() {
  // No device onboarding modal - just use fact-based questions
  
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
    // Initialize store and device detection facts
    initializeStore();

    // Expose semantics globally for debugging (Task A: Lock & verify semantics)
    window.__cfaSemantics = CFASemantics;
  }, []); // Only run once on mount

  useEffect(() => {
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

  // No device onboarding modal - questions show based on facts

  return (
    <AppLayout>
      {/* Onboarding Modal - Removed redundant modal version */}
      {/* Device onboarding is handled separately above */}

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
                <Recommendations
                  answeredQuestions={answeredQuestions}
                  getBrowserInfo={getBrowserInfo}
                  getUserProfile={getUserProfile}
                />

                {/* Current Level Questions */}
                <MainContent />
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

      {/* Development Tools (Task C: Diagnostics & transparency) */}
      <AuthoringDiagnostics />
    </AppLayout>
  );
}

export default App;
