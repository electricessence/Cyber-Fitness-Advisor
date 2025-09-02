import { useState, useEffect } from 'react';
import { Shield, Smartphone, Laptop, Tablet, ChevronRight, Eye, Database, Monitor, Globe, Lock } from 'lucide-react';
import { FirstQuestion } from './FirstQuestion';
import { ScoreBar } from './ScoreBar';

interface OnboardingProps {
  onComplete: (userProfile: UserProfile, firstAnswer?: { questionId: string; value: boolean; actionId?: string }) => void;
  currentScore?: number;
  currentLevel?: number;
  quickWinsCompleted?: number;
  totalQuickWins?: number;
  nextLevelProgress?: number;
}

export interface UserProfile {
  primaryDevice: 'windows' | 'mac' | 'iphone' | 'android' | 'ipad' | 'other';
  techComfort: 'beginner' | 'comfortable' | 'advanced';
  mainConcerns: string[];
  dismissedPrivacyNotice: boolean;
  confidenceGoal?: {
    focusArea: string;
    confidence: string;
  };
}

export function Onboarding({ 
  onComplete, 
  currentScore = 0, 
  currentLevel = 0, 
  quickWinsCompleted = 0, 
  totalQuickWins = 10, 
  nextLevelProgress = 0 
}: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [showPrivacyDetail, setShowPrivacyDetail] = useState(false);
  const [firstQuestionAnswer, setFirstQuestionAnswer] = useState<{ answer: boolean; actionId?: string } | null>(null);
  const [browserInfo, setBrowserInfo] = useState({
    name: '',
    version: '',
    os: '',
    mobile: false
  });

  useEffect(() => {
    // Detect browser information
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const screenWidth = screen.width;
    const screenHeight = screen.height;

    // Detect browser
    let browser = 'Unknown';
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edg')) browser = 'Edge';

    // Detect device type
    let deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown' = 'unknown';
    if (/Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/iPad|Android.*Tablet/i.test(userAgent) || (screenWidth >= 768 && screenWidth <= 1024)) {
      deviceType = 'tablet';
    } else if (screenWidth > 1024) {
      deviceType = 'desktop';
    }

    setBrowserInfo({
      platform: platform.includes('Win') ? 'Windows' : 
                platform.includes('Mac') ? 'macOS' : 
                platform.includes('Linux') ? 'Linux' : platform,
      browser,
      language,
      timeZone,
      screenSize: `${screenWidth}×${screenHeight}`,
      deviceType
    });
  }, []);

  const steps = [
    'welcome',
    'privacy-trust',
    'device-detection', 
    'tech-comfort',
    'main-concerns',
    'confidence-goal'
  ];

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...updates, ...prev }));
  };

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(profile as UserProfile);
    }
  };

  const skipToEnd = () => {
    // Set reasonable defaults
    const defaultProfile: UserProfile = {
      primaryDevice: 'windows',
      techComfort: 'comfortable',
      mainConcerns: ['passwords', 'updates'],
      dismissedPrivacyNotice: true,
      ...profile
    };
    onComplete(defaultProfile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {step === 0 && (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="flex justify-center">
              <Shield className="w-16 h-16 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome to Cyber Fitness! 🛡️
            </h1>
            <p className="text-xl text-gray-600 max-w-lg mx-auto">
              Here's what we can see from your browser (no servers involved):
            </p>
            
            {/* Browser Detection Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left max-w-md mx-auto">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Browser Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Device:</span>
                  <span className="font-medium text-gray-900">{browserInfo.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Browser:</span>
                  <span className="font-medium text-gray-900">{browserInfo.browser}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900 capitalize">{browserInfo.deviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium text-gray-900">{browserInfo.language}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-800 mb-1">
                    Your Privacy is Sacred
                  </h3>
                  <p className="text-green-700 text-sm">
                    This info helps us give you better advice, but it never leaves your browser. 
                    No servers, no data collection, no tracking.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={nextStep}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              Get Started <ChevronRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={skipToEnd}
              className="text-gray-500 text-sm hover:text-gray-700"
            >
              Skip setup (start with defaults)
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🔒 Trust & Privacy First
              </h2>
              <p className="text-lg text-gray-600">
                Before we begin, let's talk about trust...
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Database className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-800">❌ Most Apps</h3>
                  <p className="text-sm text-gray-600">Collect your data, send to servers, track you</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-800">✅ This App</h3>
                  <p className="text-sm text-gray-600">Zero servers, zero tracking, zero data collection</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-800">🔍 You Verify</h3>
                  <p className="text-sm text-gray-600">Check the code, no network requests</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  🎓 Security Lesson #1: Always Be Skeptical
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  ANY app asking for security information should be questioned. Even this one! 
                  The difference? You can verify this app runs locally.
                </p>
                
                {!showPrivacyDetail ? (
                  <button
                    onClick={() => setShowPrivacyDetail(true)}
                    className="text-blue-600 text-sm font-medium hover:text-blue-700"
                  >
                    How can I verify this? →
                  </button>
                ) : (
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>✅ <strong>Check Network Tab:</strong> Open browser dev tools, see zero requests to external servers</p>
                    <p>✅ <strong>Disconnect Internet:</strong> The app still works completely offline</p>
                    <p>✅ <strong>Check Source:</strong> All code is open source on GitHub</p>
                    <p>✅ <strong>Local Storage Only:</strong> Data saved in your browser, not uploaded anywhere</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(step - 1)}
                  className="text-gray-600 hover:text-gray-700"
                >
                  ← Back
                </button>
                <button
                  onClick={() => {
                    updateProfile({ dismissedPrivacyNotice: true });
                    nextStep();
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  I Understand <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                📱 What's Your Main Device?
              </h2>
              <p className="text-lg text-gray-600">
                We'll customize advice for your specific setup
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { id: 'windows', icon: Laptop, label: 'Windows PC', desc: 'Desktop/Laptop' },
                { id: 'mac', icon: Laptop, label: 'Mac', desc: 'MacBook/iMac' },
                { id: 'iphone', icon: Smartphone, label: 'iPhone', desc: 'iOS Device' },
                { id: 'android', icon: Smartphone, label: 'Android', desc: 'Android Phone' },
                { id: 'ipad', icon: Tablet, label: 'iPad', desc: 'Tablet Device' },
                { id: 'other', icon: Laptop, label: 'Other/Mixed', desc: 'Multiple devices' },
              ].map(({ id, icon: Icon, label, desc }) => (
                <button
                  key={id}
                  onClick={() => {
                    updateProfile({ primaryDevice: id as any });
                    setTimeout(nextStep, 300);
                  }}
                  className={`
                    p-6 rounded-lg border-2 transition-all hover:shadow-lg hover:scale-105
                    ${profile.primaryDevice === id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                    }
                  `}
                >
                  <Icon className="w-8 h-8 mx-auto mb-3 text-gray-700" />
                  <h3 className="font-medium text-gray-800">{label}</h3>
                  <p className="text-sm text-gray-600">{desc}</p>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(step - 1)}
                className="text-gray-600 hover:text-gray-700"
              >
                ← Back
              </button>
              {profile.primaryDevice && (
                <button
                  onClick={nextStep}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Continue →
                </button>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🎯 How Tech-Savvy Are You?
              </h2>
              <p className="text-lg text-gray-600">
                No wrong answers! We'll match the advice to your comfort level.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { 
                  id: 'beginner', 
                  label: 'Just Getting Started', 
                  desc: 'I prefer simple, step-by-step instructions with screenshots',
                  emoji: '🌱'
                },
                { 
                  id: 'comfortable', 
                  label: 'Pretty Comfortable', 
                  desc: 'I can find settings and follow instructions, but avoid complex stuff',
                  emoji: '🚀'
                },
                { 
                  id: 'advanced', 
                  label: 'Tech-Savvy', 
                  desc: 'I\'m comfortable with advanced settings and technical solutions',
                  emoji: '🔧'
                },
              ].map(({ id, label, desc, emoji }) => (
                <button
                  key={id}
                  onClick={() => {
                    updateProfile({ techComfort: id as any });
                    setTimeout(nextStep, 300);
                  }}
                  className={`
                    w-full p-6 rounded-lg border-2 text-left transition-all hover:shadow-lg
                    ${profile.techComfort === id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <h3 className="font-medium text-gray-800 text-lg">{label}</h3>
                      <p className="text-gray-600">{desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(step - 1)}
                className="text-gray-600 hover:text-gray-700"
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🎯 What Worries You Most?
              </h2>
              <p className="text-lg text-gray-600">
                Pick your top concerns - we'll prioritize these areas first
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'passwords', label: 'Passwords & Account Security', emoji: '🔐' },
                { id: 'updates', label: 'Keeping Software Updated', emoji: '🔄' },
                { id: 'phishing', label: 'Email Scams & Phishing', emoji: '🎣' },
                { id: 'backups', label: 'Losing Important Files', emoji: '💾' },
                { id: 'privacy', label: 'Online Privacy & Tracking', emoji: '👁️' },
                { id: 'wifi', label: 'Public WiFi Safety', emoji: '📶' },
                { id: 'phones', label: 'Mobile Device Security', emoji: '📱' },
                { id: 'general', label: 'General Security Basics', emoji: '🛡️' },
              ].map(({ id, label, emoji }) => {
                const isSelected = profile.mainConcerns?.includes(id) ?? false;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      const current = profile.mainConcerns || [];
                      const updated = isSelected 
                        ? current.filter(c => c !== id)
                        : [...current, id];
                      updateProfile({ mainConcerns: updated });
                    }}
                    className={`
                      p-4 rounded-lg border-2 text-left transition-all hover:shadow-md
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{emoji}</span>
                      <span className="font-medium text-gray-800">{label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(step - 1)}
                className="text-gray-600 hover:text-gray-700"
              >
                ← Back
              </button>
              <button
                onClick={nextStep}
                disabled={!profile.mainConcerns?.length}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-fade-in">
            <FirstQuestion
              onAnswer={(answer) => {
                const completeProfile: UserProfile = {
                  primaryDevice: profile.primaryDevice || 'other',
                  techComfort: profile.techComfort || 'comfortable', 
                  mainConcerns: profile.mainConcerns || [],
                  dismissedPrivacyNotice: profile.dismissedPrivacyNotice || false,
                  confidenceGoal: answer
                };
                onComplete(completeProfile);
              }}
            />
          </div>
        )}

        {/* Progress indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-8 rounded-full transition-colors ${
                index <= step ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
