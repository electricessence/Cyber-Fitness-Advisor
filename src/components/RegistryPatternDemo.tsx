/**
 * Registry Pattern Migration Demo Component
 * 
 * Demonstrates how components can use the simplified Registry methods
 * instead of the complex facts system.
 */

import { useEffect, useState } from 'react';
import { useAssessmentStore } from '../features/assessment/state/store';
import { Activity, User, Monitor } from 'lucide-react';

export function RegistryPatternDemo() {
  const { setFact, getFact, hasFact } = useAssessmentStore();
  const [sessionStarted, setSessionStarted] = useState(false);

  // Initialize session tracking using simple Registry methods
  useEffect(() => {
    if (!sessionStarted) {
      // MIGRATION DEMO: Simple fact tracking
      setFact('session_start_time', new Date().toISOString());
      setFact('component_loads', (getFact('component_loads') || 0) + 1);
      setFact('user_active', true);
      setSessionStarted(true);
    }

    // Track session duration
    const interval = setInterval(() => {
      const startTime = getFact('session_start_time');
      if (startTime) {
        const duration = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
        setFact('session_duration_seconds', duration);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      setFact('user_active', false);
    };
  }, [sessionStarted, setFact, getFact]);

  // Simple user behavior tracking
  const handleUserAction = (action: string) => {
    setFact(`last_${action}_time`, new Date().toISOString());
    setFact(`${action}_count`, (getFact(`${action}_count`) || 0) + 1);
    setFact('last_interaction', action);
  };

  // Get device facts (set during app initialization)
  const deviceOS = getFact('os_detected');
  const deviceBrowser = getFact('browser_detected');
  const deviceType = getFact('device_type');

  // Format session duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-600" />
        Registry Pattern Demo
      </h3>
      
      <div className="space-y-4">
        {/* Device Information (from Registry) */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Device Facts
          </h4>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-gray-600">OS:</span>
              <span className="ml-2 font-medium">{deviceOS || 'Unknown'}</span>
            </div>
            <div>
              <span className="text-gray-600">Browser:</span>
              <span className="ml-2 font-medium">{deviceBrowser || 'Unknown'}</span>
            </div>
            <div>
              <span className="text-gray-600">Type:</span>
              <span className="ml-2 font-medium">{deviceType || 'Unknown'}</span>
            </div>
          </div>
        </div>

        {/* Session Tracking (simple Registry operations) */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
            <User className="w-4 h-4" />
            Session Analytics
          </h4>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-gray-600">Session Time:</span>
              <span className="ml-2 font-medium">
                {formatDuration(getFact('session_duration_seconds') || 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Component Loads:</span>
              <span className="ml-2 font-medium">{getFact('component_loads') || 0}</span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span className={`ml-2 font-medium ${getFact('user_active') ? 'text-green-600' : 'text-gray-500'}`}>
                {getFact('user_active') ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* User Interaction Tracking */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">User Actions</h4>
          <div className="space-y-2">
            <button
              onClick={() => handleUserAction('click')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm transition-colors"
            >
              Track Click ({getFact('click_count') || 0})
            </button>
            <button
              onClick={() => handleUserAction('interaction')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm transition-colors"
            >
              Track Interaction ({getFact('interaction_count') || 0})
            </button>
            {hasFact('last_interaction') && (
              <div className="text-xs text-gray-600 mt-2">
                Last action: {getFact('last_interaction')}
              </div>
            )}
          </div>
        </div>

        {/* Code Example */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Migration Example</h4>
          <div className="text-xs font-mono space-y-1">
            <div className="text-red-600">{'// OLD: Complex facts system'}</div>
            <div className="text-gray-600">{'// store.factsActions.injectFact(...)'}</div>
            <div className="text-green-600 mt-2">{'// NEW: Simple Registry'}</div>
            <div className="text-gray-800">setFact('user_pref', value)</div>
            <div className="text-gray-800">const value = getFact('user_pref')</div>
          </div>
        </div>
      </div>
    </div>
  );
}