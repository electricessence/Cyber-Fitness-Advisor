import { Clock, X, RotateCcw } from 'lucide-react';
import type { Question } from '../features/assessment/engine/schema';
import { useAssessmentStore } from '../features/assessment/state/store';

export function RoomForImprovementSection() {
  const { getRoomForImprovementTasks, taskResponses, handleTaskResponse } = useAssessmentStore();
  
  const improvementTasks = getRoomForImprovementTasks();

  if (improvementTasks.length === 0) {
    return null;
  }

  const handleReconsider = (questionId: string) => {
    const taskResponse = {
      questionId,
      status: 'pending' as const,
      timestamp: new Date()
    };
    handleTaskResponse(questionId, taskResponse);
  };

  const getTaskStatus = (question: Question) => {
    const response = taskResponses[question.id];
    if (!response) return null;

    if (response.status === 'dismissed') {
      return {
        icon: <X className="w-4 h-4 text-gray-500" />,
        label: 'Skipped',
        description: 'You chose not to do this task'
      };
    }

    if (response.status === 'snoozed') {
      const dueDate = response.snoozeUntil ? new Date(response.snoozeUntil).toLocaleDateString() : 'Soon';
      return {
        icon: <Clock className="w-4 h-4 text-yellow-500" />,
        label: 'Snoozed',
        description: `Reminder set for ${dueDate}`
      };
    }

    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Room for Improvement
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        These security tasks could help improve your protection level when you're ready.
      </p>

      <div className="space-y-4">
        {improvementTasks.map((question) => {
          const status = getTaskStatus(question);
          
          return (
            <div
              key={question.id}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 mb-1">
                    {question.text}
                  </h4>
                  {question.explanation && (
                    <p className="text-sm text-gray-600">{question.explanation}</p>
                  )}
                </div>
                
                {status && (
                  <div className="flex items-center gap-2 text-sm">
                    {status.icon}
                    <span className="font-medium">{status.label}</span>
                  </div>
                )}
              </div>

              {status && (
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    {status.description}
                  </p>
                  
                  <button
                    onClick={() => handleReconsider(question.id)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reconsider
                  </button>
                </div>
              )}

              {/* Show potential points */}
              {question.actionOptions && question.actionOptions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-2">Potential security improvements:</div>
                  <div className="flex flex-wrap gap-2">
                    {question.actionOptions.map((action) => (
                      <div
                        key={action.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                      >
                        <span>{action.text}</span>
                        <span className="font-medium">+{action.points}pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
