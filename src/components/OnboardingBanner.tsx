import { useAssessmentStore } from '../features/assessment/state/store';

export function OnboardingBanner() {
  const pendingCount = useAssessmentStore(state => state.getOnboardingPendingCount?.() || 0);
  const isComplete = useAssessmentStore(state => state.isOnboardingComplete?.() || true);
  
  // Only show banner when onboarding is incomplete
  if (isComplete || pendingCount === 0) {
    return null;
  }
  
  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">
            Setup in Progress
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>
              Complete {pendingCount} more setup question{pendingCount !== 1 ? 's' : ''} to personalize your security recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
