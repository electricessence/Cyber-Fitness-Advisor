/**
 * Unified Onboarding Component
 * Uses the main assessment system for onboarding questions
 * - Uses main question bank (phase: 'onboarding')
 * - Uses main condition engine
 * - Integrates with main facts system
 */

import { useState, useEffect } from 'react';
import { Monitor } from 'lucide-react';
import { detectCurrentDevice } from '../features/device/deviceDetection';
import { useAssessmentStore } from '../features/assessment/state/store';
import { getOnboardingQuestions } from '../features/assessment/data/contentService';
import type { DeviceProfile } from '../features/assessment/engine/deviceScenarios';

interface UnifiedOnboardingProps {
  onComplete: (profile: DeviceProfile) => void;
}

export function UnifiedOnboarding({ onComplete }: UnifiedOnboardingProps) {
  const { 
    answers,
    factsProfile,
    answerQuestion,
    setDeviceProfile
  } = useAssessmentStore();
  
  const [detectedDevice, setDetectedDevice] = useState(detectCurrentDevice());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResponse, setShowResponse] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<{ 
    text: string; 
    tip?: string 
  }>({ text: '' });

  // Get onboarding questions from the main question bank
  const onboardingQuestions = getOnboardingQuestions();

  // Filter onboarding questions using the same facts-based logic as the store
  // This ensures consistent visibility logic with the main assessment
  const facts = factsProfile.facts;
  const visibleOnboardingQuestions = onboardingQuestions.filter(question => {
    let isVisible = true;
    
    // Check include conditions - question is visible if ALL facts match (AND logic)
    if (question.conditions?.include) {
      let includeMatches = true; // Start with true, require ALL to match
      for (const [factId, expectedValue] of Object.entries(question.conditions.include)) {
        const fact = facts[factId];
        if (!fact || fact.value !== expectedValue) {
          includeMatches = false;
          break; // Any mismatch makes question invisible
        }
      }
      if (!includeMatches) {
        isVisible = false;
      }
    }
    
    // Check exclude conditions - question is hidden if facts match
    if (question.conditions?.exclude && isVisible) {
      for (const [factId, expectedValue] of Object.entries(question.conditions.exclude)) {
        const fact = facts[factId];
        if (fact && fact.value === expectedValue) {
          isVisible = false;
          break;
        }
      }
    }
    
    return isVisible;
  });

  const currentQuestion = visibleOnboardingQuestions[currentQuestionIndex];

  useEffect(() => {
    setDetectedDevice(detectCurrentDevice());
  }, []);

  const handleAnswer = (optionValue: string) => {
    if (!currentQuestion) return;
    
    const option = currentQuestion.options?.find(opt => opt.id === optionValue);
    if (!option) return;
    
    // Answer the question using the main assessment store
    answerQuestion(currentQuestion.id, optionValue);
    
    // Show response feedback using the option's feedback if available
    setCurrentResponse({
      text: option.feedback || `✅ You selected: ${option.text}`,
      tip: (option as any).tip
    });
    setShowResponse(true);
    
    // Auto-advance after showing response
    setTimeout(() => {
      setShowResponse(false);
      
      // Check if there are more questions to show
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex >= visibleOnboardingQuestions.length) {
        completeOnboarding();
      } else {
        setCurrentQuestionIndex(nextIndex);
      }
    }, 2000);
  };

  const completeOnboarding = () => {
    // Create device profile from current answers and detected device
    const deviceProfile: DeviceProfile = {
      currentDevice: detectedDevice,
      otherDevices: {
        hasWindows: detectedDevice.os === 'windows' || answers.windows_confirmation?.value === 'yes',
        hasMac: detectedDevice.os === 'mac' || answers.mac_confirmation?.value === 'yes',
        hasLinux: answers.linux_confirmation?.value === 'yes',
        hasIPhone: detectedDevice.os === 'ios' || answers.ios_confirmation?.value === 'yes',
        hasAndroid: detectedDevice.os === 'android' || answers.android_confirmation?.value === 'yes',
        hasIPad: false
      },
      primaryDesktop: detectedDevice.type === 'desktop' ? detectedDevice.os as any : undefined,
      primaryMobile: detectedDevice.type === 'mobile' ? detectedDevice.os as any : undefined
    };

    // Set device profile in the store
    setDeviceProfile(deviceProfile);
    
    onComplete(deviceProfile);
  };

  // If no questions are available, complete immediately
  if (!currentQuestion) {
    completeOnboarding();
    return null;
  }

  // Response/Feedback Screen (no points popup)
  if (showResponse) {
    return (
      <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 min-h-[500px] flex flex-col justify-center">
        <div className="max-w-lg mx-auto w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <Monitor className="w-8 h-8 text-blue-600" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {currentResponse.text}
              </h3>
              {currentResponse.tip && (
                <div className="text-sm text-blue-600 bg-blue-50 rounded-lg p-3">
                  💡 {currentResponse.tip}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Question Screen
  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-[500px]">
      <div className="max-w-2xl mx-auto">
        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Debug: Show detected device info */}
          <div className="mb-4 p-3 bg-gray-100 rounded-lg text-sm">
            <strong>Detected:</strong> {detectedDevice.browser} on {detectedDevice.os} ({detectedDevice.type})
            <br />
            <strong>Current Question:</strong> {currentQuestion.id}
            <br />
            <strong>Visible Questions:</strong> {visibleOnboardingQuestions.length}
          </div>
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Monitor className="w-8 h-8 text-blue-600" />
            </div>
            
            {/* Question display */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {currentQuestion.statement && (
                <>
                  <div className="text-gray-700 font-normal mb-2">{currentQuestion.statement}</div>
                  {currentQuestion.text}
                </>
              ) || currentQuestion.text}
            </h2>
            
            <p className="text-gray-600">
              Device and browser detection for personalized recommendations.
            </p>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 group-hover:text-blue-700">
                      {option.text}
                    </div>
                  </div>
                  <div className="text-blue-300 group-hover:text-blue-500 font-bold text-xl">
                    →
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
