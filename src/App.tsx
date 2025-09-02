import { useEffect, useState } from 'react';
import { Shield, RotateCcw, FileDown, FileUp, Menu, X } from 'lucide-react';
import { useAssessmentStore, initializeStore } from './features/assessment/state/store';
import { ScoreBar } from './components/ScoreBar';
import { QuestionCard } from './components/QuestionCard';
import { Recommendations } from './components/Recommendations';
import { Celebration } from './components/Celebration';

function App() {
  const [currentDomain, setCurrentDomain] = useState<string>('quickwins');
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    questionBank,
    answers,
    overallScore,
    domainScores,
    currentLevel: userLevel,
    quickWinsCompleted,
    totalQuickWins,
    nextLevelProgress,
    showCelebration,
    lastScoreIncrease,
    answerQuestion,
    resetAssessment,
    getRecommendations,
    dismissCelebration,
  } = useAssessmentStore();

  // Initialize store on app load
  useEffect(() => {
    initializeStore();
  }, []);

  const currentDomainData = questionBank.domains.find(d => d.id === currentDomain);
  const currentLevelData = currentDomainData?.levels.find(l => l.level === currentLevel);
  
  const recommendations = getRecommendations();
  const totalQuestions = questionBank.domains.reduce(
    (total, domain) => total + domain.levels.reduce(
      (levelTotal, level) => levelTotal + level.questions.length, 0
    ), 0
  );
  const answeredQuestions = Object.keys(answers).length;

  const exportData = () => {
    const data = JSON.stringify({ answers, timestamp: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cyber-fitness-assessment.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.answers) {
          // Import answers one by one to trigger score recalculation
          Object.entries(data.answers as typeof answers).forEach(([questionId, answer]) => {
            answerQuestion(questionId, (answer as any).value);
          });
        }
      } catch (error) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const navigateToQuestion = (questionId: string) => {
    // Find which domain and level contains this question
    for (const domain of questionBank.domains) {
      for (const level of domain.levels) {
        if (level.questions.some(q => q.id === questionId)) {
          setCurrentDomain(domain.id);
          setCurrentLevel(level.level);
          setMobileMenuOpen(false);
          // Scroll to question after navigation
          setTimeout(() => {
            const element = document.getElementById(`question-${questionId}`);
            element?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
          return;
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Celebration 
        show={showCelebration}
        scoreIncrease={lastScoreIncrease}
        level={userLevel}
        onDismiss={dismissCelebration}
      />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Cyber Fitness Advisor
              </h1>
            </div>
            
            <div className="hidden sm:flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {answeredQuestions}/{totalQuestions} questions answered
              </div>
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                title="Export your progress"
              >
                <FileDown className="w-4 h-4" />
                Export
              </button>
              <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
                <FileUp className="w-4 h-4" />
                Import
                <input type="file" accept=".json" onChange={importData} className="hidden" />
              </label>
              <button
                onClick={resetAssessment}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-gray-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className={`lg:col-span-1 ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
              <h3 className="font-bold text-gray-800 mb-4">Assessment Sections</h3>
              
              {questionBank.domains.map((domain) => (
                <div key={domain.id} className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">
                    {domain.title}
                    {domainScores[domain.id] && (
                      <span className="ml-2 text-sm text-blue-600 font-bold">
                        {Math.round(domainScores[domain.id])}%
                      </span>
                    )}
                  </h4>
                  
                  {domain.levels.map((level) => {
                    const isActive = currentDomain === domain.id && currentLevel === level.level;
                    const levelAnswered = level.questions.every(q => answers[q.id]);
                    
                    return (
                      <button
                        key={`${domain.id}-${level.level}`}
                        onClick={() => {
                          setCurrentDomain(domain.id);
                          setCurrentLevel(level.level);
                          setMobileMenuOpen(false);
                        }}
                        className={`
                          w-full text-left px-3 py-2 rounded-md text-sm mb-1 transition-colors
                          ${isActive 
                            ? 'bg-blue-100 text-blue-800 font-medium' 
                            : levelAnswered 
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-600 hover:bg-gray-50'
                          }
                        `}
                      >
                        Level {level.level} {levelAnswered && '✓'}
                        <div className="text-xs text-gray-500">
                          {level.questions.length} questions
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Score Bar */}
            <ScoreBar
              score={overallScore}
              level={userLevel}
              nextLevelProgress={nextLevelProgress}
              quickWinsCompleted={quickWinsCompleted}
              totalQuickWins={totalQuickWins}
            />

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="mt-6">
                <Recommendations
                  recommendations={recommendations}
                  onQuestionClick={navigateToQuestion}
                />
              </div>
            )}

            {/* Current Level Questions */}
            {currentLevelData && (
              <div className="mt-6">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {currentDomainData?.title} - Level {currentLevel}
                  </h2>
                  <p className="text-gray-600">
                    {currentLevel === 0 ? 'Start with these essential security basics!' :
                     currentLevel === 1 ? 'Build on your foundation with these improvements!' :
                     'Advanced security measures for comprehensive protection!'}
                  </p>
                </div>

                <div className="space-y-6">
                  {currentLevelData.questions.map((question) => (
                    <div key={question.id} id={`question-${question.id}`}>
                      <QuestionCard
                        question={question}
                        answer={answers[question.id]?.value}
                        onAnswer={(value) => answerQuestion(question.id, value)}
                        domainTitle={currentDomainData?.title || ''}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              🛡️ Cyber Fitness Advisor - Your personal cybersecurity coach
            </p>
            <p className="text-sm text-gray-500">
              Start with quick wins, build momentum, stay secure. 
              No data leaves your browser.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
