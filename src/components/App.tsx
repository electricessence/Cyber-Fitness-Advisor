import { useState } from 'react';
import { DeviceOnboarding } from './DeviceOnboarding';
import { PrioritizedMainContent } from './layout/PrioritizedMainContent';
import { useAssessmentStore } from '../features/assessment/state/store';
import type { DeviceProfile } from '../features/assessment/engine/deviceScenarios';

export function App() {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [currentDomain, setCurrentDomain] = useState('');
  const [currentLevel] = useState(0);
  
  const setDeviceProfile = useAssessmentStore(state => state.setDeviceProfile);
  const deviceProfile = useAssessmentStore(state => state.deviceProfile);
  const questionBank = useAssessmentStore(state => state.questionBank);

  const handleOnboardingComplete = (profile: DeviceProfile) => {
    console.log('Onboarding complete with profile:', profile);
    setDeviceProfile(profile);
    setOnboardingComplete(true);
    
    // Set initial domain to first available domain
    if (questionBank.domains.length > 0) {
      setCurrentDomain(questionBank.domains[0].id);
    }
  };

  // If we already have a device profile (from localStorage), skip onboarding
  if (deviceProfile && onboardingComplete) {
    return <PrioritizedMainContent currentDomain={currentDomain} currentLevel={currentLevel} />;
  }

  // If we have a stored profile but haven't completed onboarding this session
  if (deviceProfile && !onboardingComplete) {
    setOnboardingComplete(true);
    // Set initial domain
    if (questionBank.domains.length > 0 && !currentDomain) {
      setCurrentDomain(questionBank.domains[0].id);
    }
    return <PrioritizedMainContent currentDomain={currentDomain || questionBank.domains[0]?.id || ''} currentLevel={currentLevel} />;
  }

  // Show onboarding for new users
  return <DeviceOnboarding onComplete={handleOnboardingComplete} />;
}
