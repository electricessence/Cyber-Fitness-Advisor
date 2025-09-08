import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainContent } from '../components/layout/MainContent';
import { useAssessmentStore } from '../features/assessment/state/store';

// Mock the UniversalCard component
vi.mock('../components/UniversalCard', () => ({
  UniversalCard: ({ id, title }: any) => (
    <div data-testid={`question-${id}`}>
      <h3>{title}</h3>
    </div>
  )
}));

describe('MainContent Rendering', () => {
  beforeEach(() => {
    useAssessmentStore.getState().resetAssessment();
  });

  it('should render questions when available', () => {
    const store = useAssessmentStore.getState();
    const availableQuestions = store.getAvailableQuestions();
    
    console.log('Available questions for rendering:', availableQuestions.length);
    console.log('Sample question IDs:', availableQuestions.slice(0, 3).map(q => q.id));
    
    render(<MainContent currentDomain="all" currentLevel={0} />);
    
    // Check that questions are being rendered
    const questionElements = screen.getAllByTestId(/^question-/);
    console.log('Rendered question elements:', questionElements.length);
    
    expect(questionElements.length).toBe(availableQuestions.length);
    expect(questionElements.length).toBeGreaterThan(0);
  });

  it('should show completion message when no questions available', () => {
    // Answer all questions to make them unavailable
    const store = useAssessmentStore.getState();
    const availableQuestions = store.getAvailableQuestions();
    
    // Answer all questions including any that might be unlocked by answering others
    availableQuestions.forEach(question => {
      store.answerQuestion(question.id, 'yes');
    });
    
    // Answer the advanced_2fa question that gets unlocked by suites
    store.answerQuestion('advanced_2fa', 'yes');
    
    render(<MainContent currentDomain="all" currentLevel={0} />);
    
    expect(screen.getByText(/All available questions completed/)).toBeInTheDocument();
  });
});
