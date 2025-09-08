/**
 * Unified Onboarding Component
 * Addresses all user feedback:
 * 1. No score accumulation - onboarding is separate from assessment
 * 2. Separate OS/browser confirmation questions
 * 3. No gamification points popup
 * 4. Statement + question format with proper styling
 */

import { useState, useEffect } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { detectCurrentDevice } from '../features/device/deviceDetection';
import { 
  UNIFIED_ONBOARDING_QUESTIONS, 
  processOnboardingAnswers
} from '../features/onboarding/unifiedOnboarding';
import type { DeviceProfile } from '../features/assessment/engine/deviceScenarios';

interface UnifiedOnboardingProps {
  onComplete: (profile: DeviceProfile) => void;
}

export function UnifiedOnboarding({ onComplete }: UnifiedOnboardingProps) {
  const [detectedDevice, setDetectedDevice] = useState(detectCurrentDevice());
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    // Find first question that should be shown based on device detection
    const device = detectCurrentDevice();
    for (let i = 0; i < UNIFIED_ONBOARDING_QUESTIONS.length; i++) {
      const question = UNIFIED_ONBOARDING_QUESTIONS[i];
      if (!question.showIf || question.showIf(device, {})) {
        return i;
      }
    }
    return 0; // fallback
  });
  const [showResponse, setShowResponse] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<{ 
    text: string; 
    tip?: string 
  }>({ text: '' });

  useEffect(() => {
    setDetectedDevice(detectCurrentDevice());
  }, []);

  const handleAnswer = (optionValue: string) => {
    const question = UNIFIED_ONBOARDING_QUESTIONS[currentQuestion];
    const option = question.options.find(opt => opt.value === optionValue)!;
    
    // Update local answers
    const newAnswers = { ...answers, [question.id]: optionValue };
    setAnswers(newAnswers);
    
    // Show response feedback (no points for onboarding)
    setCurrentResponse({
      text: option.feedback,
      tip: option.tip
    });
    setShowResponse(true);
    
    // Auto-advance after showing response
    setTimeout(() => {
      setShowResponse(false);
      
      // Find next question based on showIf conditions
      let nextIndex = currentQuestion + 1;
      while (nextIndex < UNIFIED_ONBOARDING_QUESTIONS.length) {
        const nextQ = UNIFIED_ONBOARDING_QUESTIONS[nextIndex];
        // Show the question if no showIf condition OR if showIf condition is true
        if (!nextQ.showIf || nextQ.showIf(detectedDevice, newAnswers)) {
          break;
        }
        nextIndex++;
      }
      
      if (nextIndex >= UNIFIED_ONBOARDING_QUESTIONS.length) {
        completeOnboarding(newAnswers);
      } else {
        setCurrentQuestion(nextIndex);
      }
    }, 2000);
  };

  const completeOnboarding = (finalAnswers: Record<string, string>) => {
    // Process answers to create onboarding profile
    processOnboardingAnswers(finalAnswers, detectedDevice);
    
    // Save onboarding answers to localStorage for pre-population
    console.log('Saving onboarding answers:', finalAnswers);
    localStorage.setItem('cyber-fitness-onboarding-answers', JSON.stringify(finalAnswers));
    
    // DEBUG: Let's also clear any existing assessment answers to see fresh questions
    localStorage.removeItem('cyber-fitness-assessment');
    console.log('Cleared assessment storage for fresh start');
    
    // Convert to DeviceProfile format expected by the app
    const deviceProfile: DeviceProfile = {
      currentDevice: detectedDevice,
      otherDevices: {
        hasWindows: detectedDevice.os === 'windows' || finalAnswers.primary_desktop === 'windows',
        hasMac: detectedDevice.os === 'mac' || finalAnswers.primary_desktop === 'mac', 
        hasLinux: finalAnswers.primary_desktop === 'linux',
        hasIPhone: detectedDevice.os === 'ios' || finalAnswers.primary_mobile === 'iphone',
        hasAndroid: detectedDevice.os === 'android' || finalAnswers.primary_mobile === 'android',
        hasIPad: false // Could be enhanced later
      },
      primaryDesktop: detectedDevice.type === 'desktop' ? detectedDevice.os as any : 
                     finalAnswers.primary_desktop as any || undefined,
      primaryMobile: finalAnswers.primary_mobile === 'iphone' ? 'ios' :
                    finalAnswers.primary_mobile === 'android' ? 'android' : 
                    detectedDevice.type === 'mobile' ? detectedDevice.os as any : undefined
    };

    onComplete(deviceProfile);
  };

  const currentQ = UNIFIED_ONBOARDING_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / UNIFIED_ONBOARDING_QUESTIONS.length) * 100;

  // Response/Feedback Screen (no points popup)
  if (showResponse) {
    return (
      <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 min-h-[500px] flex flex-col justify-center">
        <div className="max-w-lg mx-auto w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              {currentQ.category === 'device' && <Monitor className="w-8 h-8 text-blue-600" />}
              {currentQ.category === 'security' && <Smartphone className="w-8 h-8 text-blue-600" />}
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
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Setup Progress</span>
            <span>{currentQuestion + 1} of {UNIFIED_ONBOARDING_QUESTIONS.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
              {currentQ.category === 'device' && <Monitor className="w-8 h-8 text-blue-600" />}
              {currentQ.category === 'security' && <Smartphone className="w-8 h-8 text-blue-600" />}
            </div>
            
            {/* Question display - clean and simple */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {currentQ.question}
            </h2>
            
            <p className="text-gray-600">
              {currentQ.context}
            </p>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQ.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 group-hover:text-blue-700">
                      {option.text}
                    </div>
                    {option.description && (
                      <div className="text-sm text-gray-600 mt-1">
                        {option.description}
                      </div>
                    )}
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
