import { useState, useEffect } from 'react';
import { Shield, Plus, Zap } from 'lucide-react';
import { ScoreBar } from './ScoreBar';
import { SmartText } from './SmartText';

interface GameQuestion {
  id: string;
  text: string;
  context?: string; // Explains why this matters
  options: {
    value: string;
    points: number;
    response: string; // Immediate helpful response
    tip?: string; // Optional quick tip
  }[];
}

interface GameifiedOnboardingProps {
  onComplete: (profile: {
    totalScore: number;
    answeredQuestions: Record<string, { value: string; points: number }>;
    detectedInfo: {
      platform: string;
      browser: string;
    };
  }) => void;
}

// Questions that immediately give points and feedback
const GAME_QUESTIONS: GameQuestion[] = [
  {
    id: 'platform_confirmation',
    text: 'I detected you\'re using {{platform}}.\nIs that&nbsp;correct?',
    context: 'Knowing your platform helps us give you specific, actionable advice.',
    options: [
      { 
        value: 'yes', 
        points: 5, 
        response: '✅ Great! We can give you platform-specific security tips.',
        tip: 'Platform-specific advice is always more effective!'
      },
      { 
        value: 'no', 
        points: 3, 
        response: '👍 Thanks for the correction! What platform are you using?',
        tip: 'Being accurate helps us help you better.'
      }
    ]
  },
  {
    id: 'virus_scan_recent',
    text: 'When did you last run a&nbsp;virus&nbsp;scan?',
    context: 'Regular scans catch threats before they cause damage.\nWindows has a built-in scanner!',
    options: [
      { 
        value: 'today', 
        points: 20, 
        response: '🏆 Excellent! You\'re already protecting yourself actively!',
        tip: 'Daily scans are the gold standard for security!'
      },
      { 
        value: 'this_week', 
        points: 15, 
        response: '⭐ Great job! Regular scanning keeps you safe.',
        tip: 'Weekly scans are a solid security habit!'
      },
      { 
        value: 'this_month', 
        points: 10, 
        response: '👌 Not bad! Let\'s help you scan more frequently.',
        tip: 'Monthly is OK, but weekly is even better!'
      },
      { 
        value: 'longer', 
        points: 5, 
        response: '📈 Let\'s get you up to speed! I\'ll show you the easy way.',
        tip: 'No worries - we\'ll get your scanning game strong!'
      },
      { 
        value: 'never', 
        points: 5, 
        response: '🚀 Perfect opportunity to boost your security!\nIt\'s easier than you think.',
        tip: 'Everyone starts somewhere - let\'s get you scanning!'
      }
    ]
  },
  {
    id: 'password_strength',
    text: 'Do you use the same password for\nmultiple important accounts?',
    context: 'Unique passwords prevent one breach from affecting all your accounts.',
    options: [
      { 
        value: 'all_unique', 
        points: 25, 
        response: '🌟 Outstanding! You\'re following the #1 security best practice!',
        tip: 'Unique passwords are your best defense against breaches!'
      },
      { 
        value: 'mostly_unique', 
        points: 15, 
        response: '✨ You\'re on the right track!\nLet\'s secure those remaining accounts.',
        tip: 'You\'re 80% there - let\'s finish the job!'
      },
      { 
        value: 'some_same', 
        points: 10, 
        response: '💪 Good awareness! Password managers make unique passwords easy.',
        tip: 'A password manager can generate unique passwords for you!'
      },
      { 
        value: 'mostly_same', 
        points: 5, 
        response: '🎯 Great opportunity for a big security boost!\nI\'ll show you how.',
        tip: 'This is the #1 thing you can fix for huge security gains!'
      }
    ]
  },
  {
    id: 'software_updates',
    text: 'How do you handle software updates\non your device?',
    context: 'Updates patch security holes that hackers try to exploit.',
    options: [
      { 
        value: 'automatic', 
        points: 20, 
        response: '🌟 Gold Star! You\'ve got the ultimate "set and forget" security!',
        tip: 'Automatic updates are the lazy person\'s path to great security!'
      },
      { 
        value: 'install_quickly', 
        points: 20, 
        response: '🌟 Gold Star! Your quick update habits are excellent security!',
        tip: 'You\'ve got great instincts - staying current is key!'
      },
      { 
        value: 'install_eventually', 
        points: 15, 
        response: '👍 You\'re updating, which puts you ahead of most people!',
        tip: 'Consider: auto-updates OR weekly reminders to stay current?'
      },
      { 
        value: 'rarely_update', 
        points: 5, 
        response: '📱 Let\'s make this super easy for you!',
        tip: 'Try: enable auto-updates OR set a monthly "update day" reminder?'
      }
    ]
  }
];

export function GameifiedOnboarding({ onComplete }: GameifiedOnboardingProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { value: string; points: number }>>({});
  const [showResponse, setShowResponse] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<{ text: string; points: number; tip?: string }>({ text: '', points: 0 });
  const [detectedPlatform, setDetectedPlatform] = useState('');
  const [detectedBrowser, setDetectedBrowser] = useState('');

  useEffect(() => {
    // Detect platform and browser
    const userAgent = navigator.userAgent.toLowerCase();
    
    let platform = 'Unknown';
    if (userAgent.includes('win')) platform = 'Windows';
    else if (userAgent.includes('mac')) platform = 'Mac';
    else if (userAgent.includes('linux')) platform = 'Linux';
    else if (userAgent.includes('android')) platform = 'Android';
    else if (userAgent.includes('iphone') || userAgent.includes('ipad')) platform = 'iOS';
    
    let browser = 'Unknown';
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) browser = 'Chrome';
    else if (userAgent.includes('firefox')) browser = 'Firefox';
    else if (userAgent.includes('safari') && !userAgent.includes('chrome')) browser = 'Safari';
    else if (userAgent.includes('edg')) browser = 'Edge';

    setDetectedPlatform(platform);
    setDetectedBrowser(browser);
  }, []);

  const handleAnswer = (option: GameQuestion['options'][0]) => {
    const question = GAME_QUESTIONS[currentQuestion];
    
    // Record the answer
    setAnswers(prev => ({
      ...prev,
      [question.id]: { value: option.value, points: option.points }
    }));

    // Update score
    setScore(prev => prev + option.points);
    
    // Show response
    setCurrentResponse({
      text: option.response,
      points: option.points,
      tip: option.tip
    });
    setShowResponse(true);

    // Auto-advance after showing response
    setTimeout(() => {
      setShowResponse(false);
      if (currentQuestion < GAME_QUESTIONS.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        // Complete onboarding
        onComplete({
          totalScore: score + option.points,
          answeredQuestions: {
            ...answers,
            [question.id]: { value: option.value, points: option.points }
          },
          detectedInfo: {
            platform: detectedPlatform,
            browser: detectedBrowser
          }
        });
      }
    }, 2500);
  };

  const question = GAME_QUESTIONS[currentQuestion];
  const questionText = question.text.replace('{{platform}}', detectedPlatform);
  const progress = ((currentQuestion + 1) / GAME_QUESTIONS.length) * 100;

  if (showResponse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          {/* Score Bar */}
          <div className="mb-6">
            <ScoreBar
              score={score}
              level={Math.floor(score / 25)}
              nextLevelProgress={{
                currentLevel: Math.floor(score / 25),
                nextLevel: Math.floor(score / 25) + 1,
                pointsNeeded: (Math.floor(score / 25) + 1) * 25 - score,
                progress: (score % 25) / 25
              }}
              quickWinsCompleted={Object.keys(answers).length}
              totalQuickWins={GAME_QUESTIONS.length}
            />
          </div>

          {/* Response Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-6 animate-bounce-in">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-green-600" />
            </div>
            
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                +{currentResponse.points} points!
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                <SmartText text={currentResponse.text} />
              </h3>
              {currentResponse.tip && (
                <div className="text-sm text-blue-600 bg-blue-50 rounded-lg p-3">
                  <SmartText text={`💡 ${currentResponse.tip}`} />
                </div>
              )}
            </div>

            <div className="text-sm text-gray-500">
              {currentQuestion < GAME_QUESTIONS.length - 1 ? 'Next question coming up...' : 'Calculating your security fitness...'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Score Bar */}
        <div className="mb-6">
          <ScoreBar
            score={score}
            level={Math.floor(score / 25)}
            nextLevelProgress={{
              currentLevel: Math.floor(score / 25),
              nextLevel: Math.floor(score / 25) + 1,
              pointsNeeded: (Math.floor(score / 25) + 1) * 25 - score,
              progress: (score % 25) / 25
            }}
            quickWinsCompleted={Object.keys(answers).length}
            totalQuickWins={GAME_QUESTIONS.length}
          />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Progress */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Question {currentQuestion + 1} of {GAME_QUESTIONS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Question */}
          <div className="text-center">
            <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              <SmartText text={questionText} highlightQuestions={true} />
            </h2>
            {question.context && (
              <SmartText 
                text={question.context} 
                className="text-gray-600 text-sm"
                highlightQuestions={false}
              />
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 group-hover:text-blue-900">
                    {option.value === 'yes' ? '✅ Yes, that\'s correct' :
                     option.value === 'no' ? '❌ No, that\'s wrong' :
                     option.value === 'today' ? '🏆 Today' :
                     option.value === 'this_week' ? '⭐ This week' :
                     option.value === 'this_month' ? '📅 This month' :
                     option.value === 'longer' ? '⏰ Longer than a month' :
                     option.value === 'never' ? '🆕 Never (or not sure)' :
                     option.value === 'all_unique' ? '🌟 All unique passwords' :
                     option.value === 'mostly_unique' ? '✨ Mostly unique' :
                     option.value === 'some_same' ? '🔄 Some are the same' :
                     option.value === 'mostly_same' ? '🔁 Mostly the same' :
                     option.value === 'automatic' ? '🔥 Automatic updates' :
                     option.value === 'install_quickly' ? '⚡ Install them quickly' :
                     option.value === 'install_eventually' ? '👍 Install them eventually' :
                     option.value === 'rarely_update' ? '😅 I rarely update' :
                     option.value}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">+{option.points}</span>
                    <Zap className="w-4 h-4 text-yellow-500" />
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center text-xs text-gray-500">
            Every answer helps build your security fitness score!
          </div>
        </div>
      </div>
    </div>
  );
}
