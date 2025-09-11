/**
 * Diagnostics Panel Component
 * 
 * Provides runtime diagnostics for cycle/patch conflict detection,
 * facts validation, and system health monitoring.
 */

import { useState, useEffect } from 'react';
import { useAssessmentStore } from '../../features/assessment/state/store';
import { detectCycles } from '../../features/assessment/engine/conditions';
import { AlertTriangle, CheckCircle, Info, X, RefreshCw } from 'lucide-react';

interface DiagnosticResult {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  category: 'cycle' | 'patch' | 'facts' | 'gates' | 'performance';
  message: string;
  details?: string;
  suggestion?: string;
}

interface FactsHealth {
  totalFacts: number;
  expiredFacts: number;
  conflictingFacts: number;
  categoriesRepresented: string[];
}

interface SystemHealth {
  questionsLoaded: number;
  suitesLoaded: number;
  factsStoreStatus: 'healthy' | 'degraded' | 'error';
  gateEngineStatus: 'healthy' | 'degraded' | 'error';
  tierEngineStatus: 'healthy' | 'degraded' | 'error';
}

export function DiagnosticsPanel() {
  const store = useAssessmentStore();
  const [isOpen, setIsOpen] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [factsHealth, setFactsHealth] = useState<FactsHealth | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runDiagnostics = () => {
    const results: DiagnosticResult[] = [];

    try {
      // 1. Cycle Detection
      const allQuestions = [];
      for (const domain of store.questionBank.domains) {
        for (const level of domain.levels) {
          allQuestions.push(...level.questions);
        }
      }

      const suites = (store.questionBank.suites || []).map(suite => ({
        ...suite,
        questionIds: suite.questions.map(q => q.id) // Convert to expected format
      }));
      
      try {
        const cycles = detectCycles(allQuestions, suites);
        if (cycles.length > 0) {
          results.push({
            id: 'cycles-detected',
            type: 'error',
            category: 'cycle',
            message: `${cycles.length} dependency cycle(s) detected`,
            details: cycles.join(', '),
            suggestion: 'Review question gates to remove circular dependencies'
          });
        } else {
          results.push({
            id: 'no-cycles',
            type: 'success',
            category: 'cycle', 
            message: 'No dependency cycles detected'
          });
        }
      } catch (error) {
        results.push({
          id: 'cycle-check-error',
          type: 'error',
          category: 'cycle',
          message: 'Error checking for dependency cycles',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // 2. Facts System Health
      try {
        const factsProfile = store.factsProfile;
        const allFacts = Object.values(factsProfile.facts);
        const now = new Date();

        const expiredFacts = allFacts.filter(fact => 
          fact.expiresAt && fact.expiresAt < now
        ).length;

        const categoriesRepresented = [...new Set(allFacts.map(fact => fact.category))];

        const factsHealthData: FactsHealth = {
          totalFacts: allFacts.length,
          expiredFacts,
          conflictingFacts: 0, // TODO: Implement conflict detection
          categoriesRepresented
        };

        setFactsHealth(factsHealthData);

        if (expiredFacts > 0) {
          results.push({
            id: 'expired-facts',
            type: 'warning',
            category: 'facts',
            message: `${expiredFacts} expired fact(s) detected`,
            suggestion: 'Consider refreshing expired facts through re-assessment'
          });
        }

        if (allFacts.length === 0) {
          results.push({
            id: 'no-facts',
            type: 'warning',
            category: 'facts',
            message: 'No facts established yet',
            suggestion: 'Complete onboarding to establish initial facts'
          });
        } else {
          results.push({
            id: 'facts-healthy',
            type: 'success',
            category: 'facts',
            message: `${allFacts.length} facts established across ${categoriesRepresented.length} categories`
          });
        }
      } catch (error) {
        results.push({
          id: 'facts-error',
          type: 'error',
          category: 'facts',
          message: 'Error analyzing facts system',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // 3. Gate Engine Health
      try {
        const conditionEngine = store.conditionEngine;
        const testContext = { answers: {} };
        const gateResult = conditionEngine.evaluate(testContext);
        
        results.push({
          id: 'gates-functional',
          type: 'success',
          category: 'gates',
          message: `Gate engine functional, ${gateResult.visibleQuestionIds.length} questions visible`
        });
      } catch (error) {
        results.push({
          id: 'gates-error',
          type: 'error',
          category: 'gates',
          message: 'Gate engine error',
          details: error instanceof Error ? error.message : 'Unknown error',
          suggestion: 'Check question gates for syntax errors'
        });
      }

      // 4. Patch Conflicts Detection
      // TODO: Implement proper patch conflict detection
      results.push({
        id: 'patch-conflicts',
        type: 'info',
        category: 'patch',
        message: 'Patch conflict detection not yet implemented',
        suggestion: 'Manual review recommended for overlapping question patches'
      });

      // 5. System Health Summary
      const systemHealthData: SystemHealth = {
        questionsLoaded: allQuestions.length,
        suitesLoaded: suites.length,
        factsStoreStatus: results.some(r => r.category === 'facts' && r.type === 'error') ? 'error' : 'healthy',
        gateEngineStatus: results.some(r => r.category === 'gates' && r.type === 'error') ? 'error' : 'healthy',
        tierEngineStatus: 'healthy' // TODO: Add tier engine diagnostics
      };

      setSystemHealth(systemHealthData);

      // 6. Performance Checks
      const answersCount = Object.keys(store.answers).length;
      if (answersCount > 1000) {
        results.push({
          id: 'large-answers',
          type: 'warning',
          category: 'performance',
          message: `Large number of answers stored (${answersCount})`,
          suggestion: 'Consider implementing answer archiving for better performance'
        });
      }

    } catch (error) {
      results.push({
        id: 'diagnostic-error',
        type: 'error',
        category: 'cycle',
        message: 'Critical error during diagnostics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setDiagnostics(results);
    setLastRun(new Date());
  };

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  const getIcon = (type: DiagnosticResult['type']) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getBadgeColor = (type: DiagnosticResult['type']) => {
    switch (type) {
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'info': return 'bg-blue-100 text-blue-800';
    }
  };

  const errorCount = diagnostics.filter(d => d.type === 'error').length;
  const warningCount = diagnostics.filter(d => d.type === 'warning').length;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 p-3 rounded-full shadow-lg transition-colors ${
          errorCount > 0 
            ? 'bg-red-500 hover:bg-red-600' 
            : warningCount > 0 
            ? 'bg-yellow-500 hover:bg-yellow-600'
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white`}
        title="Open Diagnostics Panel"
      >
        <AlertTriangle className="w-5 h-5" />
        {(errorCount > 0 || warningCount > 0) && (
          <span className="absolute -top-1 -right-1 bg-white text-xs font-bold text-gray-900 rounded-full w-5 h-5 flex items-center justify-center">
            {errorCount + warningCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-900">System Diagnostics</h2>
            {lastRun && (
              <span className="text-sm text-gray-500">
                Last run: {lastRun.toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={runDiagnostics}
              className="p-2 text-gray-500 hover:text-gray-700 rounded"
              title="Refresh diagnostics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* System Health Overview */}
          {systemHealth && (
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">System Health</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-2xl font-bold text-gray-900">{systemHealth.questionsLoaded}</div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-2xl font-bold text-gray-900">{systemHealth.suitesLoaded}</div>
                  <div className="text-sm text-gray-600">Suites</div>
                </div>
                {factsHealth && (
                  <>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-2xl font-bold text-gray-900">{factsHealth.totalFacts}</div>
                      <div className="text-sm text-gray-600">Facts</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-2xl font-bold text-gray-900">{factsHealth.categoriesRepresented.length}</div>
                      <div className="text-sm text-gray-600">Categories</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Diagnostic Results */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3">Diagnostic Results</h3>
            <div className="space-y-3">
              {diagnostics.map((diagnostic) => (
                <div 
                  key={diagnostic.id}
                  className={`p-4 rounded-lg border ${
                    diagnostic.type === 'error' ? 'border-red-200 bg-red-50' :
                    diagnostic.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                    diagnostic.type === 'success' ? 'border-green-200 bg-green-50' :
                    'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {getIcon(diagnostic.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getBadgeColor(diagnostic.type)}`}>
                          {diagnostic.category}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {diagnostic.message}
                      </div>
                      {diagnostic.details && (
                        <div className="text-sm text-gray-600 mb-2">
                          {diagnostic.details}
                        </div>
                      )}
                      {diagnostic.suggestion && (
                        <div className="text-sm text-gray-700 bg-white bg-opacity-50 p-2 rounded">
                          💡 {diagnostic.suggestion}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}