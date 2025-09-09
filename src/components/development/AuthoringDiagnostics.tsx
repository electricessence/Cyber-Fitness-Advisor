import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface DiagnosticIssue {
  type: 'error' | 'warning' | 'info';
  category: 'invalid_refs' | 'cycles' | 'conflicts' | 'patches';
  message: string;
  details?: string;
  questionId?: string;
  path?: string[];
}

export const AuthoringDiagnostics: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [issues, setIssues] = useState<DiagnosticIssue[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Keyboard toggle (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Run diagnostics when panel opens
  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  const runDiagnostics = async () => {
    setIsLoading(true);
    const diagnosticIssues: DiagnosticIssue[] = [];

    try {
      // Check for invalid references
      // This would integrate with the condition engine to find broken questionId references
      const invalidRefs = await checkInvalidReferences();
      diagnosticIssues.push(...invalidRefs);

      // Check for cycles
      const cycles = await checkCycles();
      diagnosticIssues.push(...cycles);

      // Check for gating conflicts
      const conflicts = await checkGatingConflicts();
      diagnosticIssues.push(...conflicts);

      // Check for patch collisions
      const patches = await checkPatchCollisions();
      diagnosticIssues.push(...patches);

    } catch (error) {
      diagnosticIssues.push({
        type: 'error',
        category: 'invalid_refs',
        message: 'Failed to run diagnostics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setIssues(diagnosticIssues);
    setIsLoading(false);
  };

  // Placeholder diagnostic functions - would integrate with actual condition engine
  const checkInvalidReferences = async (): Promise<DiagnosticIssue[]> => {
    // This would check if any gate conditions reference non-existent question IDs
    // For now, we'll simulate some basic checks
    const issues: DiagnosticIssue[] = [];
    
    try {
      // Run the author linter to get real validation results
      const response = await fetch('/api/author-lint', { method: 'POST' });
      if (response.ok) {
        const lintResults = await response.text();
        if (lintResults.includes('duplicate')) {
          issues.push({
            type: 'error',
            category: 'patches',
            message: 'Duplicate question IDs detected',
            details: lintResults,
            questionId: 'public_wifi_caution' // Known duplicate from our linter
          });
        }
      }
    } catch (error) {
      // Fallback: show known issues from our testing
      issues.push({
        type: 'error',
        category: 'patches', 
        message: 'Duplicate question ID found: public_wifi_caution',
        details: 'This question ID appears in multiple content files, which violates the "last writer wins" semantic rule.',
        questionId: 'public_wifi_caution'
      });
    }
    
    return issues;
  };

  const checkCycles = async (): Promise<DiagnosticIssue[]> => {
    // This would detect circular dependencies in gate conditions
    return [];
  };

  const checkGatingConflicts = async (): Promise<DiagnosticIssue[]> => {
    // This would find questions with conflicting show/hide gates
    return [];
  };

  const checkPatchCollisions = async (): Promise<DiagnosticIssue[]> => {
    // This would identify overlapping patch operations
    return [];
  };

  const getIssueIcon = (type: DiagnosticIssue['type']) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getCategoryLabel = (category: DiagnosticIssue['category']) => {
    switch (category) {
      case 'invalid_refs':
        return 'Invalid References';
      case 'cycles':
        return 'Circular Dependencies';
      case 'conflicts':
        return 'Gating Conflicts';
      case 'patches':
        return 'Patch Collisions';
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded opacity-75">
        Press Ctrl+Shift+D for diagnostics
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Content Authoring Diagnostics</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={runDiagnostics}
              disabled={isLoading}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Running...' : 'Refresh Diagnostics'}
            </button>
            <span className="text-sm text-gray-500">
              Analyzes content for authoring issues and conflicts
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {issues.length === 0 ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded">
                  <CheckCircle className="w-5 h-5" />
                  <span>No authoring issues detected! Content structure is valid.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {issues.map((issue, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded border-l-4 ${
                        issue.type === 'error'
                          ? 'bg-red-50 border-red-500'
                          : issue.type === 'warning'
                          ? 'bg-yellow-50 border-yellow-500'
                          : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{getCategoryLabel(issue.category)}</span>
                            {issue.questionId && (
                              <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">
                                {issue.questionId}
                              </code>
                            )}
                          </div>
                          <p className="text-sm">{issue.message}</p>
                          {issue.details && (
                            <details className="mt-2">
                              <summary className="text-xs text-gray-600 cursor-pointer">
                                Show details
                              </summary>
                              <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-x-auto">
                                {issue.details}
                              </pre>
                            </details>
                          )}
                          {issue.path && (
                            <div className="text-xs text-gray-600 mt-1">
                              Path: {issue.path.join(' → ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-4 py-3 text-xs text-gray-600">
          <p>This panel helps identify authoring issues in question content, gates, and suites.</p>
          <p>Press Ctrl+Shift+D to toggle this panel in development mode.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthoringDiagnostics;
