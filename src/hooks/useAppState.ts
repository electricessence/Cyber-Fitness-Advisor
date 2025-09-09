import { useState } from 'react';

export function useAppState() {
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    // Show onboarding if it's a new user (no answers in localStorage)
    const hasAnswers = localStorage.getItem('cfa:v2:answers');
    const hasSeenOnboarding = localStorage.getItem('cfa:v2:onboardingVersion');
    return !hasAnswers && !hasSeenOnboarding;
  });

  const [showPrivacyNotice, setShowPrivacyNotice] = useState<boolean>(() => {
    // Show privacy notice if user hasn't dismissed it permanently
    return !localStorage.getItem('cfa:v2:privacy-dismissed');
  });

  const [showResetModal, setShowResetModal] = useState(false);
  const [privacyNoticeMinimized, setPrivacyNoticeMinimized] = useState<boolean>(false);

  return {
    showOnboarding,
    setShowOnboarding,
    showPrivacyNotice,
    setShowPrivacyNotice,
    showResetModal,
    setShowResetModal,
    privacyNoticeMinimized,
    setPrivacyNoticeMinimized,
  };
}
