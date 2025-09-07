import { useState, useEffect } from 'react';
import { Shield, Smartphone, Monitor, Zap } from 'lucide-react';
import type { DeviceProfile } from '../features/assessment/engine/deviceScenarios';
import { detectCurrentDevice, getDeviceAssumptions } from '../features/assessment/engine/deviceScenarios';
import { saveOnboardingAnswers } from '../features/onboarding/personalizedQuestionBank';
import type { DeviceOnboardingQuestion } from '../features/onboarding/deviceOnboarding';

interface DeviceOnboardingProps {
  onComplete: (profile: DeviceProfile) => void;
}

// Device-focused onboarding questions (no points, just profiling)
const DEVICE_QUESTIONS: DeviceOnboardingQuestion[] = [
  {
    id: 'current_device_confirmation',
    text: 'I detected you\'re using a {{deviceType}} device running {{os}}. Is that correct?',
    context: 'This helps us show you relevant security advice for your specific device.',
    type: 'confirmation',
    options: [
      { value: 'yes', text: '✅ Yes, that\'s correct' },
      { value: 'no', text: '❌ No, let me specify' }
    ]
  },
  {
    id: 'primary_mobile',
    text: 'What type of mobile device do you primarily use?',
    context: 'Mobile devices have unique security features and vulnerabilities.',
    type: 'selection',
    options: [
      { value: 'iphone', text: '📱 iPhone', description: 'Any iPhone model' },
      { value: 'android', text: '🤖 Android phone', description: 'Samsung, Google Pixel, etc.' },
      { value: 'other_smartphone', text: '📞 Other smartphone', description: 'BlackBerry, Windows Phone, etc.' },
      { value: 'basic_phone', text: '📟 Basic/flip phone', description: 'Calls and texts only' },
      { value: 'no_mobile', text: '❌ I don\'t have a mobile device', description: 'No phone or mobile device' }
    ],
    skipIf: (profile) => profile.currentDevice?.type === 'mobile'
  },
  {
    id: 'primary_desktop',
    text: 'What\'s your primary desktop/laptop computer?',
    context: 'Desktop computers have different security considerations than mobile devices.',
    type: 'selection',
    options: [
      { value: 'windows', text: '🪟 Windows PC', description: 'Windows 10, 11, or earlier' },
      { value: 'mac', text: '🍎 Mac (macOS)', description: 'MacBook, iMac, Mac Mini, etc.' },
      { value: 'linux', text: '🐧 Linux', description: 'Ubuntu, Fedora, or other Linux distribution' },
      { value: 'chromebook', text: '📚 Chromebook', description: 'Chrome OS device' },
      { value: 'none', text: '📱 Mobile only', description: 'I don\'t use a desktop/laptop' }
    ],
    skipIf: (profile) => profile.currentDevice?.type !== 'mobile'
  },
  {
    id: 'tech_comfort',
    text: 'How comfortable are you with technology settings?',
    context: 'This helps us give you appropriately detailed instructions.',
    type: 'selection',
    options: [
      { value: 'expert', text: '🧠 Very comfortable', description: 'I can handle technical instructions' },
      { value: 'intermediate', text: '⚡ Somewhat comfortable', description: 'I can follow detailed step-by-step guides' },
      { value: 'beginner', text: '🌱 Not very comfortable', description: 'I prefer simple, visual instructions' },
      { value: 'cautious', text: '⚠️ Cautious', description: 'I want to understand before I change anything' }
    ]
  }
];

export function DeviceOnboarding({ onComplete }: DeviceOnboardingProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [detectedDevice, setDetectedDevice] = useState<DeviceProfile['currentDevice'] | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const detected = detectCurrentDevice();
    setDetectedDevice(detected);
  }, []);

  const currentQ = DEVICE_QUESTIONS[currentQuestion];
  
  // Skip questions based on profile
  const partialProfile: Partial<DeviceProfile> = {
    currentDevice: detectedDevice || undefined,
    otherDevices: {
      hasWindows: false,
      hasMac: false,
      hasLinux: false,
      hasIPhone: false,
      hasAndroid: false,
      hasIPad: false
    }
  };

  const shouldSkipQuestion = currentQ?.skipIf && currentQ.skipIf(partialProfile);

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < DEVICE_QUESTIONS.length - 1) {
      // Move to next question (or skip if needed)
      let nextIndex = currentQuestion + 1;
      while (nextIndex < DEVICE_QUESTIONS.length) {
        const nextQ = DEVICE_QUESTIONS[nextIndex];
        if (!nextQ.skipIf || !nextQ.skipIf(partialProfile)) {
          break;
        }
        nextIndex++;
      }
      
      if (nextIndex >= DEVICE_QUESTIONS.length) {
        completeOnboarding(newAnswers);
      } else {
        setCurrentQuestion(nextIndex);
      }
    } else {
      completeOnboarding(newAnswers);
    }
  };

  const completeOnboarding = (finalAnswers: Record<string, string>) => {
    if (!detectedDevice) return;

    // Process answers to create device profile
    const assumptions = getDeviceAssumptions(detectedDevice);
    
    const profile: DeviceProfile = {
      currentDevice: detectedDevice!,
      otherDevices: {
        hasWindows: detectedDevice.os === 'windows' || finalAnswers.primary_desktop === 'windows',
        hasMac: detectedDevice.os === 'mac' || finalAnswers.primary_desktop === 'mac',
        hasLinux: finalAnswers.primary_desktop === 'linux',
        hasIPhone: detectedDevice.os === 'ios' || finalAnswers.primary_mobile === 'iphone',
        hasAndroid: detectedDevice.os === 'android' || finalAnswers.primary_mobile === 'android',
        hasIPad: false, // Could be enhanced later
        ...assumptions
      },
      primaryDesktop: finalAnswers.primary_desktop as any || 
                     (detectedDevice.type === 'desktop' ? detectedDevice.os as any : undefined),
      primaryMobile: finalAnswers.primary_mobile === 'iphone' ? 'ios' :
                    finalAnswers.primary_mobile === 'android' ? 'android' : 
                    (detectedDevice.type === 'mobile' ? detectedDevice.os as any : undefined)
    };

    setShowWelcome(true);
    setTimeout(() => onComplete(profile), 2000);
  };

  if (shouldSkipQuestion) {
    // Auto-skip this question
    useEffect(() => {
      const timer = setTimeout(() => {
        handleAnswer('skipped');
      }, 100);
      return () => clearTimeout(timer);
    }, [currentQuestion]);
    return <div>Processing...</div>;
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Created!</h2>
          <p className="text-gray-600 mb-6">
            Perfect! I'll now customize your security assessment based on your devices.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!detectedDevice || !currentQ) {
    return <div>Loading...</div>;
  }

  // Replace template variables in question text
  let questionText = currentQ.text;
  if (detectedDevice) {
    questionText = questionText
      .replace('{{deviceType}}', detectedDevice.type)
      .replace('{{os}}', detectedDevice.os);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-2xl w-full">
        {/* Progress bar */}
        <div className="bg-gray-100 h-2">
          <div 
            className="bg-blue-500 h-2 transition-all duration-300 ease-out"
            style={{ width: `${((currentQuestion + 1) / DEVICE_QUESTIONS.length) * 100}%` }}
          />
        </div>

        <div className="p-8">
          {/* Question header */}
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              {currentQ.id.includes('mobile') ? 
                <Smartphone className="w-6 h-6 text-blue-600" /> :
                <Monitor className="w-6 h-6 text-blue-600" />
              }
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Device Setup
              </h2>
              <p className="text-gray-600">
                Question {currentQuestion + 1} of {DEVICE_QUESTIONS.length}
              </p>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              {questionText}
            </h3>
            <p className="text-gray-600">
              {currentQ.context}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-800 group-hover:text-blue-700">
                      {option.text}
                    </div>
                    {option.description && (
                      <div className="text-sm text-gray-500 mt-1">
                        {option.description}
                      </div>
                    )}
                  </div>
                  <Zap className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                </div>
              </button>
            ))}
          </div>

          {/* Step indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {DEVICE_QUESTIONS.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  index <= currentQuestion ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
