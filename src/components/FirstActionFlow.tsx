/**
 * First Action Flow - The Critical "Immediate Value" Experience
 * 
 * Triggers right after onboarding to:
 * 1. Give context: "Most people start at 0"
 * 2. Show ONE high-impact action
 * 3. Celebrate completion with visible progress
 * 4. Build momentum: "Want to do another?"
 * 
 * This is the make-or-break moment for user engagement.
 */

import { useState } from 'react';
import { Shield, TrendingUp, CheckCircle } from 'lucide-react';
import { useAssessmentStore } from '../features/assessment/state/store';
import { UniversalCard } from './UniversalCard';

interface FirstActionFlowProps {
  onComplete: () => void;
}

export function FirstActionFlow({ onComplete }: FirstActionFlowProps) {
  const [step, setStep] = useState<'intro' | 'action' | 'celebration'>('intro');
  const [actionCompleted, setActionCompleted] = useState(false);
  
  const { 
    getOrderedAvailableQuestions,
    answerQuestion,
    overallScore 
  } = useAssessmentStore();

  // Get the absolute highest priority question
  const topQuestion = getOrderedAvailableQuestions?.()?.[0];

  const handleStartAction = () => {
    setStep('action');
  };

  const handleAnswer = (questionId: string, answer: string) => {
    answerQuestion(questionId, answer);
    setActionCompleted(true);
    setStep('celebration');
  };

  const handleContinue = () => {
    onComplete();
  };

  // Intro Screen - Set expectations
  if (step === 'intro') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-4 sm:p-8 animate-in fade-in duration-300 max-h-[90vh] overflow-y-auto">
          <div className="text-center space-y-4 sm:space-y-6">
            {/* Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>

            {/* Headline */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
                Let's Get You Protected
              </h2>
              <p className="text-base sm:text-lg text-gray-600">
                Most people start at <span className="font-semibold text-red-500">0/100</span> security score.
                <br />
                Let's change that right now.
              </p>
            </div>

            {/* Value Proposition */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-200">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">
                    Just ONE action can make a huge difference
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700">
                    We've identified the single highest-impact security improvement for your {' '}
                    <span className="font-medium">specific device setup</span>. 
                    It takes about 2 minutes and could prevent a real attack.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleStartAction}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              Show Me My #1 Security Action →
            </button>

            <p className="text-xs text-gray-500">
              No signup required • Everything stays private on your device
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Action Screen - Show the ONE most important question
  if (step === 'action' && topQuestion) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 my-8">
          {/* Header */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                #1
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Your Top Priority
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  Highest Impact Security Action
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              This single action provides the most security improvement for your device setup.
            </p>
          </div>

          {/* The Question Card */}
          <div className="space-y-4">
            <UniversalCard
              mode="question"
              id={topQuestion.id}
              title={topQuestion.text}
              category="Security Priority"
              priority={topQuestion.weight || topQuestion.priority}
              isQuickWin={topQuestion.quickWin}
              timeEstimate={topQuestion.timeEstimate || "2 minutes"}
              impact="high"
              detailedGuidance={topQuestion.explanation}
              actionHint={topQuestion.actionHint}
              options={topQuestion.options || []}
              onAnswer={(answer) => handleAnswer(topQuestion.id, answer)}
            />
          </div>

          {/* Skip Option */}
          <div className="mt-6 text-center">
            <button
              onClick={handleContinue}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              I'll do this later
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Celebration Screen - Show progress and offer momentum
  if (step === 'celebration' && actionCompleted) {
    // Calculate meaningful comparison
    const scoreValue = Math.round(overallScore);
    let comparisonText = '';
    let comparisonEmoji = '';
    
    if (scoreValue >= 20) {
      comparisonText = 'You\'re ahead of most people already!';
      comparisonEmoji = '🚀';
    } else if (scoreValue >= 10) {
      comparisonText = 'You\'re on the right track!';
      comparisonEmoji = '📈';
    } else {
      comparisonText = 'Great first step!';
      comparisonEmoji = '✨';
    }
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-4 sm:p-8 animate-in fade-in duration-300 max-h-[90vh] overflow-y-auto">
          <div className="text-center space-y-4 sm:space-y-6">
            {/* Success Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>

            {/* Celebration Message */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
                {comparisonEmoji} Great Job!
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-3 sm:mb-4">
                {comparisonText}
              </p>
            </div>

            {/* Progress Stats */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border border-green-200">
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-1">
                    {Math.round(overallScore)}
                    <span className="text-lg sm:text-xl text-gray-500">/100</span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Your Security Score</div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-1">
                    Level 1
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Security level reached</div>
                </div>
              </div>
            </div>

            {/* Momentum Message */}
            <div className="text-left bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-200">
              <p className="text-sm sm:text-base text-gray-700 mb-2 sm:mb-3">
                <span className="font-semibold">You're off to a great start!</span> Small actions like this one add up to serious protection.
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                The next few questions will help you reach even higher security levels. Each one builds on the last.
              </p>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <button
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Continue Building My Security →
              </button>
              
              <button
                onClick={handleContinue}
                className="w-full bg-white text-gray-700 font-medium py-3 px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                Take a Break (Progress Saved)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
