import { CheckCircle, Clock, Target, Zap } from 'lucide-react';
import type { TodaysTask } from '../features/prioritization/questionPriority';

interface TodaysTaskCardProps {
  todaysTask: TodaysTask;
  onComplete: (questionId: string, value: string) => void;
}

export function TodaysTaskCard({ todaysTask, onComplete }: TodaysTaskCardProps) {
  const { question, reason, estimatedTime } = todaysTask;

  const handleAnswer = (value: string) => {
    onComplete(question.id, value);
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Today's Task</h2>
          <div className="flex items-center gap-2 text-blue-100">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{estimatedTime}</span>
            <Zap className="w-4 h-4 ml-2" />
            <span className="text-sm">High Impact</span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">{question.text}</h3>
        <p className="text-blue-100 text-sm">{reason}</p>
      </div>

      {question.type === 'YN' && (
        <div className="flex gap-3">
          <button
            onClick={() => handleAnswer('yes')}
            className="flex-1 bg-white/20 hover:bg-white/30 transition-colors duration-200 rounded-lg p-3 flex items-center justify-center gap-2 font-medium"
          >
            <CheckCircle className="w-5 h-5" />
            Yes
          </button>
          <button
            onClick={() => handleAnswer('no')}
            className="flex-1 bg-white/20 hover:bg-white/30 transition-colors duration-200 rounded-lg p-3 flex items-center justify-center gap-2 font-medium"
          >
            No
          </button>
        </div>
      )}

      {question.type === 'ACTION' && question.actionOptions && (
        <div className="space-y-2">
          {question.actionOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleAnswer(option.id)}
              className="w-full bg-white/20 hover:bg-white/30 transition-colors duration-200 rounded-lg p-3 text-left font-medium"
            >
              {option.text}
            </button>
          ))}
        </div>
      )}

      {question.type === 'SCALE' && (
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-blue-100">
            <span>Low</span>
            <span>High</span>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handleAnswer((i + 1).toString())}
                className="flex-1 bg-white/20 hover:bg-white/30 transition-colors duration-200 rounded-lg p-2 text-center font-medium"
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
