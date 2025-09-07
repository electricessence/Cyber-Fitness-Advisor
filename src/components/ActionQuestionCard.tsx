import { useState } from 'react';
import { CheckCircle, Clock, X, AlertTriangle } from 'lucide-react';
import type { Question } from '../features/assessment/engine/schema';
import { handleTaskResponse } from '../features/tasks/taskManagement';

interface ActionQuestionCardProps {
  question: Question;
  onResponse: (questionId: string, response: any) => void;
  className?: string;
}

export function ActionQuestionCard({ question, onResponse, className = '' }: ActionQuestionCardProps) {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState<string>(''); // 'complete', 'later', 'never'

  const handleActionSelect = (actionId: string) => {
    setSelectedAction(actionId);
  };

  const handleResponse = (responseType: 'complete' | 'later' | 'never') => {
    if (responseType === 'complete' && !selectedAction) {
      // Show error - must select an action to complete
      return;
    }

    const taskResponse = handleTaskResponse(
      question.id,
      responseType,
      responseType === 'complete' ? selectedAction : undefined
    );

    onResponse(question.id, taskResponse);
    setShowConfirmation('');
    setSelectedAction('');
  };

  const selectedActionObj = question.actionOptions?.find(opt => opt.id === selectedAction);

  return (
    <div className={`bg-white rounded-lg shadow-md border-l-4 border-blue-500 ${className}`}>
      <div className="p-6">
        {/* Question Header */}
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {question.text}
            </h3>
            {question.explanation && (
              <p className="text-sm text-gray-600 mb-4">{question.explanation}</p>
            )}
          </div>
        </div>

        {/* Action Options */}
        {question.actionOptions && question.actionOptions.length > 0 && (
          <div className="space-y-3 mb-6">
            <h4 className="font-medium text-gray-700">Choose an action:</h4>
            {question.actionOptions.map((action) => (
              <label
                key={action.id}
                className={`block p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedAction === action.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={`action-${question.id}`}
                  value={action.id}
                  checked={selectedAction === action.id}
                  onChange={() => handleActionSelect(action.id)}
                  className="sr-only"
                />
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-800">{action.text}</div>
                    {action.impact && (
                      <div className="text-sm text-gray-600 mt-1">{action.impact}</div>
                    )}
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    +{action.points} pts
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        {/* Response Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowConfirmation('complete')}
            disabled={!selectedAction}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedAction
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            I'll Do This
          </button>

          <button
            onClick={() => setShowConfirmation('later')}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg font-medium transition-colors"
          >
            <Clock className="w-4 h-4" />
            Remind Me Later
          </button>

          <button
            onClick={() => setShowConfirmation('never')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            <X className="w-4 h-4" />
            Not For Me
          </button>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              {showConfirmation === 'complete' && selectedActionObj && (
                <>
                  <h3 className="text-lg font-semibold mb-2">Confirm Action</h3>
                  <p className="text-gray-600 mb-4">
                    You've chosen: <strong>{selectedActionObj.text}</strong>
                  </p>
                  <p className="text-sm text-green-600 mb-4">
                    You'll earn {selectedActionObj.points} security points for this action.
                  </p>
                </>
              )}

              {showConfirmation === 'later' && (
                <>
                  <h3 className="text-lg font-semibold mb-2">Remind Later</h3>
                  <p className="text-gray-600 mb-4">
                    We'll remind you about this security task in a week.
                  </p>
                </>
              )}

              {showConfirmation === 'never' && (
                <>
                  <h3 className="text-lg font-semibold mb-2">Skip This Task</h3>
                  <p className="text-gray-600 mb-4">
                    This task will be moved to your "Room for Improvement" section. 
                    You can always revisit it later.
                  </p>
                </>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirmation('')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleResponse(showConfirmation as 'complete' | 'later' | 'never')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    showConfirmation === 'complete'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : showConfirmation === 'later'
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
