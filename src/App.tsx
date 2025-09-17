import { useEffect, useState } from 'react';
import { useAssessmentStore, initializeStore } from './features/assessment/state/store';
import { UnifiedOnboarding } from './components/UnifiedOnboarding';
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
import type { DeviceProfile } from './features/assessment/engine/deviceScenarios';
// Initialize semantic version for global access
import './features/assessment/engine/semantics';
import { CFASemantics } from './utils/semantics';
import AuthoringDiagnostics from './components/development/AuthoringDiagnostics';

function App() {
  const [showDeviceOnboarding, setShowDeviceOnboarding] = useState(false);
  const deviceProfile = useAssessmentStore(state => state.deviceProfile);
  const setDeviceProfile = useAssessmentStore(state => state.setDeviceProfile);
  
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
    // IMPORTANT: Device detection MUST happen before onboarding
    console.log('🚀 App startup: Initializing store and device detection...');
    initializeStore();
    
    // Expose semantics globally for debugging (Task A: Lock & verify semantics)
    window.__cfaSemantics = CFASemantics;
    
    // Small delay to ensure device detection facts are injected before onboarding
    const timeoutId = setTimeout(() => {
      // Check if we need device onboarding AFTER device detection is complete
      if (!deviceProfile) {
        console.log('📱 Device profile not found, starting onboarding...');
        setShowDeviceOnboarding(true);
      }
    }, 50); // Small delay to ensure initializeStore() completes
    
    // Cleanup timeout on unmount
    return () => clearTimeout(timeoutId);
  }, [deviceProfile]);

  const handleDeviceOnboardingComplete = (profile: DeviceProfile) => {
    setDeviceProfile(profile);
    setShowDeviceOnboarding(false);
    
    // Mark onboarding as completed to prevent modal from showing
    appState.setShowOnboarding(false);
    localStorage.setItem('cyber-fitness-onboarding-completed', 'true');
  };

  useEffect(() => {
    navigation.setCurrentLevel(userLevel);
  }, [userLevel, navigation]);

  // Lock body scroll when device onboarding is open
  useEffect(() => {
    if (showDeviceOnboarding) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showDeviceOnboarding]);
  
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

  // Show unified onboarding for new users
  if (showDeviceOnboarding && !deviceProfile) {
    return <UnifiedOnboarding onComplete={handleDeviceOnboardingComplete} />;
  }

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
                {!showDeviceOnboarding && (
                  <Recommendations
                    answeredQuestions={answeredQuestions}
                    getBrowserInfo={getBrowserInfo}
                    getUserProfile={getUserProfile}
                  />
                )}

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
