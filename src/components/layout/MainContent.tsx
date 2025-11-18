import { OnboardingBanner } from '../OnboardingBanner';
import { QuestionDeck } from '../questions/QuestionDeck';

interface MainContentProps {
  // Props available for future use - currently using store state directly
}

export function MainContent(_props: MainContentProps) {
  return (
    <div className="lg:col-span-3">
      <OnboardingBanner />
      <div className="mt-6">
        <QuestionDeck />
      </div>
    </div>
  );
}
