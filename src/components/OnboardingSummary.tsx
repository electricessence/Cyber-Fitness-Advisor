/**
 * Onboarding Summary Component - Task E: UX Polish  
 * Shows a comprehensive summary of user's setup and security readiness
 */

import { useState } from 'react';
import { CheckCircle, AlertTriangle, Info, ChevronRight, Shield, Smartphone, Monitor } from 'lucide-react';

interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
}

interface SecurityInsight {
  category: string;
  status: 'good' | 'warning' | 'info';
  message: string;
  actionHint?: string;
}

interface OnboardingSummaryProps {
  deviceInfo: DeviceInfo;
  answeredQuestions: number;
  totalQuestions: number;
  initialScore: number;
  insights: SecurityInsight[];
  onContinue: () => void;
  onReviewAnswers?: () => void;
  className?: string;
}

export function OnboardingSummary({
  deviceInfo,
  answeredQuestions,
  totalQuestions,
  initialScore,
  insights,
  onContinue,
  onReviewAnswers,
  className = ""
}: OnboardingSummaryProps) {
  const [showDetailedInsights, setShowDetailedInsights] = useState(false);

  const getDeviceIcon = () => {
    switch (deviceInfo.type) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Smartphone;
      default:
        return Monitor;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const completionPercentage = Math.round((answeredQuestions / totalQuestions) * 100);
  const DeviceIcon = getDeviceIcon();

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 max-w-2xl mx-auto ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🎉 Setup Complete!
        </h2>
        <p className="text-gray-600">
          Here's what we learned about your security setup
        </p>
      </div>

      {/* Device Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <DeviceIcon className="w-5 h-5 text-gray-700" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Your Device</h3>
            <p className="text-sm text-gray-600">
              {deviceInfo.os} • {deviceInfo.browser} • {deviceInfo.type}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Initial Assessment</span>
          <span className="text-sm text-gray-600">
            {answeredQuestions}/{totalQuestions} questions
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Setup Progress: {completionPercentage}%</span>
          <span className="text-sm font-semibold text-gray-900">
            Starting Score: {initialScore}/100
          </span>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Security Insights</h4>
        <div className="space-y-2">
          {insights.slice(0, showDetailedInsights ? insights.length : 3).map((insight, index) => {
            const StatusIcon = getStatusIcon(insight.status);
            return (
              <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${getStatusColor(insight.status)}`}>
                <StatusIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{insight.category}</p>
                  <p className="text-xs opacity-90">{insight.message}</p>
                  {insight.actionHint && (
                    <p className="text-xs mt-1 font-medium">
                      💡 {insight.actionHint}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {insights.length > 3 && (
          <button
            onClick={() => setShowDetailedInsights(!showDetailedInsights)}
            className="text-sm text-blue-600 hover:text-blue-700 mt-2 flex items-center gap-1"
          >
            {showDetailedInsights ? 'Show less' : `Show ${insights.length - 3} more insights`}
            <ChevronRight className={`w-3 h-3 transition-transform ${showDetailedInsights ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          Continue to Assessment
          <ChevronRight className="w-4 h-4" />
        </button>
        
        {onReviewAnswers && (
          <button
            onClick={onReviewAnswers}
            className="w-full border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-2 px-6 rounded-lg transition-all duration-200"
          >
            Review My Answers
          </button>
        )}
      </div>

      {/* Encouragement Message */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Great start! You've taken the first step toward better cybersecurity. 
          Let's continue building your digital defenses.
        </p>
      </div>
    </div>
  );
}
