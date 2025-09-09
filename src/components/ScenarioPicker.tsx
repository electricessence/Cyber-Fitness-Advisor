/**
 * Scenario Picker Component - Task E: UX Polish
 * Provides quick access to curated security scenarios for different user types
 */

import { useState } from 'react';
import { Briefcase, Home, Smartphone, Shield, Zap, Users } from 'lucide-react';

interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  estimatedTime: string;
  questionIds: string[];
  priority: 'high' | 'medium' | 'low';
}

const SECURITY_SCENARIOS: Scenario[] = [
  {
    id: 'quick_wins',
    title: 'Quick Security Wins',
    description: 'Get the biggest security improvements in under 10 minutes',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    estimatedTime: '5-10 min',
    questionIds: ['browser_passwords', 'banking_mfa', 'windows_updates', 'antivirus', 'backup_frequency'],
    priority: 'high'
  },
  {
    id: 'work_from_home',
    title: 'Work From Home Security',
    description: 'Secure your home office and remote work setup',
    icon: Briefcase,
    color: 'from-blue-500 to-indigo-500',
    estimatedTime: '10-15 min',
    questionIds: ['home_wifi_password', 'vpn_usage', 'disk_encryption', 'lock_screen', 'backup_testing'],
    priority: 'high'
  },
  {
    id: 'mobile_security',
    title: 'Mobile Device Protection',
    description: 'Lock down your smartphone and tablet security',
    icon: Smartphone,
    color: 'from-green-500 to-teal-500',
    estimatedTime: '8-12 min',
    questionIds: ['phone_backup', 'lock_screen', 'banking_mfa', 'email_mfa', 'social_media_mfa'],
    priority: 'medium'
  },
  {
    id: 'family_security',
    title: 'Family Cyber Safety',
    description: 'Protect your household and teach good security habits',
    icon: Users,
    color: 'from-purple-500 to-pink-500',
    estimatedTime: '15-20 min',
    questionIds: ['router_default_password', 'home_wifi_password', 'important_files', 'backup_frequency', 'email_attachments'],
    priority: 'medium'
  },
  {
    id: 'essential_basics',
    title: 'Security Essentials',
    description: 'Cover the absolute must-have security fundamentals',
    icon: Shield,
    color: 'from-red-500 to-rose-500',
    estimatedTime: '12-18 min',
    questionIds: ['password_reuse', 'browser_passwords', 'windows_updates', 'antivirus', 'firewall'],
    priority: 'high'
  },
  {
    id: 'home_network',
    title: 'Home Network Security',
    description: 'Secure your WiFi, router, and connected devices',
    icon: Home,
    color: 'from-emerald-500 to-green-500',
    estimatedTime: '10-15 min',
    questionIds: ['router_default_password', 'home_wifi_password', 'public_wifi_caution', 'vpn_usage'],
    priority: 'medium'
  }
];

interface ScenarioPickerProps {
  onScenarioSelect: (scenario: Scenario) => void;
  className?: string;
}

export function ScenarioPicker({ onScenarioSelect, className = "" }: ScenarioPickerProps) {
  const [hoveredScenario, setHoveredScenario] = useState<string | null>(null);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">🎯 Quick Start Scenarios</h3>
        <p className="text-gray-600 text-sm">
          Choose a focused security scenario to get started quickly. Each covers the most important questions for your situation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SECURITY_SCENARIOS.map((scenario) => {
          const Icon = scenario.icon;
          const isHovered = hoveredScenario === scenario.id;
          
          return (
            <button
              key={scenario.id}
              onClick={() => onScenarioSelect(scenario)}
              onMouseEnter={() => setHoveredScenario(scenario.id)}
              onMouseLeave={() => setHoveredScenario(null)}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all duration-300 
                ${isHovered 
                  ? 'border-blue-300 shadow-lg scale-105 transform' 
                  : 'border-gray-200 hover:border-blue-200 hover:shadow-md'
                }
              `}
            >
              {/* Priority indicator */}
              {scenario.priority === 'high' && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              )}
              
              {/* Header with icon and title */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${scenario.color} text-white flex-shrink-0 ${isHovered ? 'scale-110' : ''} transition-transform duration-200`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                    {scenario.title}
                  </h4>
                  <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                    <span>{scenario.estimatedTime}</span>
                    <span>•</span>
                    <span>{scenario.questionIds.length} questions</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                {scenario.description}
              </p>

              {/* Call to action */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-blue-600">
                  Start Assessment
                </span>
                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center 
                  ${isHovered ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
                  transition-all duration-200
                `}>
                  <span className={`text-xs ${isHovered ? 'text-white' : 'text-gray-400'}`}>
                    →
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Usage tip */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <span className="font-medium">💡 Pro tip:</span> You can always explore all questions later, 
          but scenarios help you start with what matters most for your situation.
        </p>
      </div>
    </div>
  );
}
