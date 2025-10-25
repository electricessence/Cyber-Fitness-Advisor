/**
 * Security Status Dashboard - Clear overview of user's security posture
 * 
 * Provides visual, actionable security status with:
 * - Overall security level and score
 * - Domain breakdown with progress
 * - Top priorities and quick wins
 * - Recent achievements and progress
 */

import { Shield, TrendingUp, Target, Clock, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import { useAssessmentStore } from '../../features/assessment/state/store';
import { SECURITY_LEVELS } from '../../features/progression/securityLevels';
import { BadgeCounter, RecentBadges } from '../badges/BadgeComponents';
import { ScoreBar } from '../ScoreBar';

export function SecurityStatusDashboard() {
  const {
    overallScore,
    percentage,
    currentLevel,
    nextLevelProgress,
    domainScores,
    quickWinsCompleted,
    totalQuickWins,
    earnedBadges,
    recentBadgeUnlocks,
    questionBank,
    answers
  } = useAssessmentStore();

  // Get current security level info
  const securityLevel = SECURITY_LEVELS.find(level => level.id === getSecurityLevelId(currentLevel)) || SECURITY_LEVELS[0];
  
  // Calculate domain progress
  const domainProgress = questionBank.domains.map(domain => {
    const domainScore = domainScores[domain.id] || 0;
    const totalQuestions = domain.levels.reduce((sum, level) => sum + level.questions.length, 0);
    const answeredQuestions = domain.levels.reduce((sum, level) => 
      sum + level.questions.filter(q => answers[q.id]).length, 0
    );
    
    return {
      id: domain.id,
      title: domain.title,
      score: domainScore,
      progress: totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0,
      status: domainScore >= 80 ? 'excellent' : domainScore >= 60 ? 'good' : domainScore >= 40 ? 'fair' : 'needs-work'
    };
  });

  // Calculate total questions across all domains
  const allTotalQuestions = questionBank.domains.reduce((sum, d) => 
    sum + d.levels.reduce((levelSum, level) => levelSum + level.questions.length, 0), 0
  );
  const allAnsweredQuestions = Object.keys(answers).length;

  // Get top 3 areas that need attention
  const priorityAreas = domainProgress
    .filter(domain => domain.progress < 100 && domain.score < 80)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  // Recent activity summary
  const recentAnswers = Object.values(answers)
    .filter(answer => answer.timestamp)
    .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header with Overall Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Security Status
          </h2>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-800">{Math.round(overallScore)}</div>
            <div className="text-sm text-gray-600">Security Score</div>
          </div>
        </div>

        {/* Security Level Display */}
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl">{securityLevel.badge}</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800">{securityLevel.title}</h3>
            <p className="text-gray-600">{securityLevel.description}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <ScoreBar
          percentage={percentage}
          answeredCount={allAnsweredQuestions}
          totalCount={allTotalQuestions}
          quickWinsCompleted={quickWinsCompleted}
          totalQuickWins={totalQuickWins}
          score={overallScore}
          showAnimation={true}
        />
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress Summary */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h3 className="font-bold text-gray-800">Progress</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Questions Answered</span>
              <span className="font-medium">{Object.keys(answers).length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Quick Wins</span>
              <span className="font-medium text-green-600">{quickWinsCompleted}/{totalQuickWins}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Achievement Badges</span>
              <span className="font-medium text-yellow-600">{earnedBadges.length}</span>
            </div>
          </div>
        </div>

        {/* Current Focus */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-6 h-6 text-blue-600" />
            <h3 className="font-bold text-gray-800">Current Focus</h3>
          </div>
          {nextLevelProgress.nextLevel ? (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Next Level</div>
              <div className="font-medium">Security Level {nextLevelProgress.nextLevel}</div>
              <div className="text-sm text-blue-600">
                {nextLevelProgress.pointsNeeded} points needed
              </div>
            </div>
          ) : (
            <div className="text-sm text-green-600">
              🎉 Maximum security level achieved!
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-6 h-6 text-purple-600" />
            <h3 className="font-bold text-gray-800">Recent Activity</h3>
          </div>
          <div className="space-y-1">
            {recentAnswers.length > 0 ? (
              recentAnswers.slice(0, 3).map((_, index) => (
                <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="truncate">Security improvement</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">
                Start answering questions to see activity
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Domain Progress */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          Security Domains
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {domainProgress.map(domain => (
            <div key={domain.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800">{domain.title}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-600">
                    {Math.round(domain.score)}%
                  </span>
                  {domain.status === 'excellent' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {domain.status === 'needs-work' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    domain.status === 'excellent' ? 'bg-green-500' :
                    domain.status === 'good' ? 'bg-blue-500' :
                    domain.status === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(domain.progress, 100)}%` }}
                />
              </div>
              
              <div className="text-xs text-gray-500">
                {Math.round(domain.progress)}% questions answered
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Areas */}
      {priorityAreas.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-orange-600" />
            Areas for Improvement
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {priorityAreas.map(area => (
              <div key={area.id} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                <h4 className="font-medium text-gray-800 mb-2">{area.title}</h4>
                <div className="text-sm text-gray-600 mb-2">
                  Current score: {Math.round(area.score)}%
                </div>
                <div className="text-xs text-orange-700">
                  Focus here for biggest security improvements
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Badge Counter */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-600" />
            Achievement Progress
          </h3>
          <BadgeCounter 
            totalEarned={earnedBadges.length}
            totalAvailable={16} // Total badges available
            showDetails={true}
          />
        </div>

        {/* Recent Badges */}
        {recentBadgeUnlocks.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <RecentBadges 
              recentBadges={recentBadgeUnlocks.map(unlock => ({
                badge: unlock.badge,
                unlockedAt: new Date() // Use current date for demo
              }))}
              maxDisplay={3}
            />
          </div>
        )}
      </div>

      {/* Security Benefits */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Your Security Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {securityLevel.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">{benefit}</span>
            </div>
          ))}
        </div>
        {securityLevel.nextLevelHint && (
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <div className="text-sm text-blue-800">
              💡 <strong>Next Level Tip:</strong> {securityLevel.nextLevelHint}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to map level number to security level ID
function getSecurityLevelId(level: number): string {
  const levelMap: Record<number, string> = {
    0: 'getting_started',
    1: 'security_aware', 
    2: 'well_protected',
    3: 'security_savvy',
    4: 'security_expert'
  };
  return levelMap[level] || 'getting_started';
}