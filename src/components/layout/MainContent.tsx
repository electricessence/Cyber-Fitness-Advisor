import { UniversalCard } from '../UniversalCard';
import { useAssessmentStore } from '../../features/assessment/state/store';
import { OnboardingBanner } from '../OnboardingBanner';

interface MainContentProps {
  // Props available for future use - currently using store state directly
}

export function MainContent(_props: MainContentProps) {
  const { 
    answers, 
    answerQuestion,
    getOrderedAvailableQuestions
  } = useAssessmentStore();

  // Get available questions with proper ordering (onboarding first)
  const availableQuestions = getOrderedAvailableQuestions?.() || [];

  if (availableQuestions.length === 0) {
    return (
      <div className="lg:col-span-3">
        <div className="text-center py-8 text-gray-600 bg-white rounded-lg shadow-md">
          <p className="text-lg">🎉 All available questions completed!</p>
          <p className="text-sm mt-2">Great progress! Keep exploring other areas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-3">
      <OnboardingBanner />
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Your Security Assessment
        </h2>
        <p className="text-gray-600">
          Each question helps strengthen your digital security. Answer at your own pace to build better protection habits.
        </p>
      </div>
      
      <div className="space-y-6">
        {availableQuestions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Assessment Complete!</h3>
            <p className="text-gray-600">You've answered all available questions for your current security level.</p>
            <p className="text-sm text-gray-500 mt-3">Check your Security Status panel to see all your improvements!</p>
          </div>
        ) : (
          availableQuestions.map((question) => (
            <div key={question.id} id={`question-${question.id}`}>
              <UniversalCard
                mode="question"
                id={question.id}
                title={question.text}
                category="Assessment"
                priority={question.weight || question.priority}
                isQuickWin={question.quickWin}
                timeEstimate={question.timeEstimate}
                impact={(question.weight || 0) >= 8 ? 'high' : (question.weight || 0) >= 5 ? 'medium' : 'low'}
                currentAnswer={answers[question.id]?.value as string}
                detailedGuidance={question.explanation}
                actionHint={question.actionHint}
                options={question.options || [
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
                    points: Math.floor((question.weight || 0) * 0.3),
                    target: 'todo' as const,
                  },
                  {
                    id: 'no',
                    text: '❌ No',
                    displayText: 'No',
                    points: 0,
                    target: 'todo' as const,
                    advice: question.explanation
                  }
                ]}
                onAnswer={(answer) => answerQuestion(question.id, answer)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
