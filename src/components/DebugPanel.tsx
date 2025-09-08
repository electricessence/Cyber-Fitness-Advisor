import { useAssessmentStore } from '../features/assessment/state/store';

export function DebugPanel() {
  const { 
    getAvailableQuestions, 
    getVisibleQuestionIds, 
    getUnlockedSuiteIds,
    answers 
  } = useAssessmentStore();
  
  const availableQuestions = getAvailableQuestions();
  const visibleQuestionIds = getVisibleQuestionIds();
  const unlockedSuiteIds = getUnlockedSuiteIds();
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid red', 
      padding: '10px', 
      zIndex: 9999,
      fontSize: '12px',
      maxWidth: '300px'
    }}>
      <h3>🐛 Debug Panel</h3>
      <p><strong>Available Questions:</strong> {availableQuestions.length}</p>
      <p><strong>Visible Question IDs:</strong> {visibleQuestionIds.length}</p>
      <p><strong>Unlocked Suites:</strong> {unlockedSuiteIds.length}</p>
      <p><strong>Answers:</strong> {Object.keys(answers).length}</p>
      <details>
        <summary>Question IDs</summary>
        <pre>{JSON.stringify(availableQuestions.map(q => q.id), null, 2)}</pre>
      </details>
    </div>
  );
}
