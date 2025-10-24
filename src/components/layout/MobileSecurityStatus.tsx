import { useState } from 'react';
import { ChevronUp, Shield, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { SecurityStatus } from './SecurityStatus';
import { useAssessmentStore } from '../../features/assessment/state/store';

/**
 * Mobile-optimized Security Status component
 * Shows as a bottom sheet that can be expanded/collapsed
 */
export function MobileSecurityStatus() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { getHistoricAnswers } = useAssessmentStore();

  // Calculate status summary
  const answers = getHistoricAnswers();
  const shieldsUp = answers.filter(a => {
    const question = a.question;
    const answerOption = question?.options?.find(opt => opt.id === a.value);
    return answerOption?.statusCategory === 'shields-up' || (a.pointsEarned || 0) >= 8;
  }).length;

  const toDo = answers.filter(a => {
    const question = a.question;
    const answerOption = question?.options?.find(opt => opt.id === a.value);
    const category = answerOption?.statusCategory;
    const points = a.pointsEarned || 0;
    return category === 'to-do' || (!category && points >= 3 && points < 8);
  }).length;

  const needsWork = answers.filter(a => {
    const question = a.question;
    const answerOption = question?.options?.find(opt => opt.id === a.value);
    const category = answerOption?.statusCategory;
    const points = a.pointsEarned || 0;
    return category === 'room-for-improvement' || (!category && points < 3);
  }).length;

  const totalAnswered = answers.length;

  if (totalAnswered === 0) {
    return null; // Don't show if no questions answered yet
  }

  return (
    <>
      {/* Bottom Sheet Overlay */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-4rem)]'
        }`}
        style={{ maxHeight: '80vh' }}
      >
        {/* Handle / Summary Bar */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between border-b border-gray-200 active:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <div className="text-sm font-semibold text-gray-900">Security Status</div>
              <div className="text-xs text-gray-500">
                {totalAnswered} {totalAnswered === 1 ? 'question' : 'questions'} answered
              </div>
            </div>
          </div>
          
          {/* Quick Status Indicators */}
          <div className="flex items-center gap-4">
            {shieldsUp > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{shieldsUp}</span>
              </div>
            )}
            {toDo > 0 && (
              <div className="flex items-center gap-1 text-yellow-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{toDo}</span>
              </div>
            )}
            {needsWork > 0 && (
              <div className="flex items-center gap-1 text-red-600">
                <XCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{needsWork}</span>
              </div>
            )}
            
            <ChevronUp
              className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                isExpanded ? 'rotate-0' : 'rotate-180'
              }`}
            />
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 4rem)' }}>
            <SecurityStatus />
          </div>
        )}
      </div>
    </>
  );
}
