import { UniversalCard } from '../UniversalCard';
import { useAssessmentStore } from '../../features/assessment/state/store';
import { getRecommendedActions } from '../../data/secureActions';

interface RecommendationsProps {
  answeredQuestions: number;
  getBrowserInfo: () => any;
  getUserProfile: () => any;
}

export function Recommendations({ 
  answeredQuestions, 
  getBrowserInfo, 
  getUserProfile 
}: RecommendationsProps) {
  const { answers, answerQuestion } = useAssessmentStore();

  if (answeredQuestions === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">High-Impact Security Actions</h2>
      <div className="space-y-4">
        {getRecommendedActions(getBrowserInfo(), getUserProfile(), 6)
          .filter(action => !answers[action.id]) // Filter out already answered actions
          .slice(0, 3) // Limit to 3 after filtering
          .map((action) => (
          <UniversalCard
            key={action.id}
            mode="question"
            id={action.id}
            title={`Do you have ${action.title}?`}
            category="Security Actions"
            priority={action.impact === 'high' ? 9 : action.impact === 'medium' ? 6 : 3}
            isQuickWin={action.difficulty === 'easy'}
            timeEstimate={action.timeEstimate}
            impact={action.impact}
            detailedGuidance={action.description}
            actionHint={`Search for: ${action.searchTerm}`}
            options={[
              {
                id: 'yes',
                text: '✅ Yes, I have this',
                displayText: `${action.title} - Enabled`,
                points: action.impact === 'high' ? 10 : action.impact === 'medium' ? 6 : 3,
                target: 'shields-up',
                impact: 'Great security practice!'
              },
              {
                id: 'no',
                text: '❌ No, I need to set this up',
                displayText: `${action.title} - To Do`,
                points: 0,
                target: 'todo',
                advice: `${action.description}\n\nSearch for: ${action.searchTerm}`,
                followUp: action.installSteps ? {
                  modifyQuestions: {
                    [`${action.id}_setup`]: {
                      text: `Follow these steps to set up ${action.title}`,
                      explanation: action.installSteps?.join('\n')
                    }
                  }
                } : undefined
              }
            ]}
            onAnswer={(answer) => {
              console.log(`Action ${action.id} answered:`, answer);
              // Actually call the store function to save the answer
              answerQuestion(action.id, answer);
            }}
          />
        ))}
      </div>
    </div>
  );
}
