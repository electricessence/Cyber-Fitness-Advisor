import { QuestionDeck } from '../questions/QuestionDeck';

interface MainContentProps {
  // Props available for future use - currently using store state directly
}

export function MainContent(_props: MainContentProps) {
  return (
    <div className="lg:col-span-3">
      <div className="mt-6">
        <QuestionDeck />
      </div>
    </div>
  );
}
