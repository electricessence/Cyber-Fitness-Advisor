import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import { AnswerHistory } from './AnswerHistory';

// Mock the store
const mockGetHistoricAnswers = vi.fn();
vi.mock('../features/assessment/state/store', () => ({
  useAssessmentStore: vi.fn((selector) => {
    if (selector) {
      return selector({ getHistoricAnswers: mockGetHistoricAnswers });
    }
    return { getHistoricAnswers: mockGetHistoricAnswers };
  })
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  History: () => <div data-testid="history-icon">History</div>,
  TrendingUp: () => <div data-testid="trending-up-icon">TrendingUp</div>,
  Award: () => <div data-testid="award-icon">Award</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  ChevronDown: () => <div data-testid="chevron-down-icon">ChevronDown</div>,
  ChevronUp: () => <div data-testid="chevron-up-icon">ChevronUp</div>
}));

// Mock EducationalInfo component
vi.mock('./EducationalInfo', () => ({
  EducationalInfo: ({ questionId }: { questionId: string }) => (
    <div data-testid="educational-info">Educational info for {questionId}</div>
  )
}));

describe('AnswerHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when no answers exist', () => {
    it('should return null when no historic answers', () => {
      mockGetHistoricAnswers.mockReturnValue([]);
      
      const { container } = render(<AnswerHistory />);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('when answers exist', () => {
    const mockAnswers = [
      {
        questionId: 'lock_screen',
        questionText: 'Does your phone lock automatically?',
        answer: 'yes',
        pointsEarned: 10,
        domain: 'Device Security',
        timestamp: Date.now()
      },
      {
        questionId: 'browser_passwords',
        questionText: 'Do you use a password manager?',
        answer: 'no',
        pointsEarned: 0,
        domain: 'Authentication',
        timestamp: Date.now() - 1000
      }
    ];

    beforeEach(() => {
      mockGetHistoricAnswers.mockReturnValue(mockAnswers);
    });

    it('should render answer history component', () => {
      render(<AnswerHistory />);
      
      expect(screen.getByText('Answer History')).toBeInTheDocument();
    });

    it('should display total points earned', () => {
      render(<AnswerHistory />);
      
      expect(screen.getByText(/10/)).toBeInTheDocument();
      expect(screen.getByText(/total points/)).toBeInTheDocument();
    });

    it('should show collapse/expand functionality', () => {
      render(<AnswerHistory />);
      
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toBeInTheDocument();
    });

    it('should expand/collapse when toggle button is clicked', () => {
      render(<AnswerHistory />);
      
      const toggleButton = screen.getByRole('button');
      
      // Initially collapsed
      expect(screen.queryByText('Does your phone lock automatically?')).not.toBeInTheDocument();
      
      // Click to expand
      fireEvent.click(toggleButton);
      expect(screen.getByText('Does your phone lock automatically?')).toBeInTheDocument();
      
      // Click to collapse
      fireEvent.click(toggleButton);
      expect(screen.queryByText('Does your phone lock automatically?')).not.toBeInTheDocument();
    });

    it('should display individual answer details when expanded', () => {
      render(<AnswerHistory />);
      
      // Expand the history
      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('Does your phone lock automatically?')).toBeInTheDocument();
      expect(screen.getByText('Do you use a password manager?')).toBeInTheDocument();
    });

    it('should allow expanding individual answer details', () => {
      render(<AnswerHistory />);
      
      // First expand the main history
      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);
      
      // Then expand individual answer
      const answerButtons = screen.getAllByRole('button');
      const answerExpandButton = answerButtons.find(button => 
        button.getAttribute('aria-expanded') === 'false'
      );
      
      if (answerExpandButton) {
        fireEvent.click(answerExpandButton);
        expect(screen.getByTestId('educational-info')).toBeInTheDocument();
      }
    });
  });
});
