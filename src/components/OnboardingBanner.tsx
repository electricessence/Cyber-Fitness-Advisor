import { useAssessmentStore } from '../features/assessment/state/store';

export function OnboardingBanner() {
  const pendingCount = useAssessmentStore(state => state.getOnboardingPendingCount?.() || 0);
  const isComplete = useAssessmentStore(state => state.isOnboardingComplete?.() || true);
  
  if (isComplete || pendingCount === 0) {
    return null;
  }
  
  return (
    <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 sm:p-5 mb-5 flex flex-col gap-3" aria-live="polite">
      <div className="flex items-start gap-3">
        <svg className="h-6 w-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <div className="flex-1 space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-500">Let’s finish setup</p>
          <h3 className="text-base sm:text-lg font-semibold text-blue-900">
            {pendingCount} starter card{pendingCount !== 1 ? 's' : ''} waiting
          </h3>
          <p className="text-sm text-blue-800">
            We only show one card at a time. Tap the deck below when you are ready and we will keep it simple.
          </p>
        </div>
      </div>
      <div>
        <a
          href="#question-deck"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Jump to cards
        </a>
      </div>
    </section>
  );
}
