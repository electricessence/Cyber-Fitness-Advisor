import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import { Recommendations } from './Recommendations';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  TrendingUp: () => <div data-testid="trending-up-icon">TrendingUp</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  Zap: () => <div data-testid="zap-icon">Zap</div>
}));

describe('Recommendations', () => {
  const mockRecommendations = [
    {
      question: {
        id: 'lock_screen',
        text: 'Does your phone lock automatically?',
        quickWin: true,
        timeEstimate: '2 minutes',
        actionHint: 'Check your settings',
        weight: 8.5
      },
      domain: 'Device Security',
      potentialPoints: 10,
      impact: 'high' as const
    },
    {
      question: {
        id: 'browser_passwords',
        text: 'Do you use a password manager?',
        quickWin: false,
        timeEstimate: '5 minutes',
        weight: 7.2
      },
      domain: 'Authentication',
      potentialPoints: 15,
      impact: 'medium' as const
    }
  ];

  const mockOnQuestionClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when rendering recommendations', () => {
    it('should render recommendations list', () => {
      render(
        <Recommendations 
          recommendations={mockRecommendations}
          onQuestionClick={mockOnQuestionClick}
        />
      );
      
      expect(screen.getByText('Your Next Security Wins')).toBeInTheDocument();
      expect(screen.getByText('Does your phone lock automatically?')).toBeInTheDocument();
      expect(screen.getByText('Do you use a password manager?')).toBeInTheDocument();
    });

    it('should display impact levels correctly', () => {
      render(
        <Recommendations 
          recommendations={mockRecommendations}
          onQuestionClick={mockOnQuestionClick}
        />
      );
      
      expect(screen.getByText('High Impact')).toBeInTheDocument();
      expect(screen.getByText('Good Impact')).toBeInTheDocument();
    });

    it('should show quick win indicators', () => {
      render(
        <Recommendations 
          recommendations={mockRecommendations}
          onQuestionClick={mockOnQuestionClick}
        />
      );
      
      expect(screen.getByText('Quick Win')).toBeInTheDocument();
    });

    it('should display time estimates when provided', () => {
      render(
        <Recommendations 
          recommendations={mockRecommendations}
          onQuestionClick={mockOnQuestionClick}
        />
      );
      
      expect(screen.getByText('2 minutes')).toBeInTheDocument();
      expect(screen.getByText('5 minutes')).toBeInTheDocument();
    });

    it('should show potential points', () => {
      render(
        <Recommendations 
          recommendations={mockRecommendations}
          onQuestionClick={mockOnQuestionClick}
        />
      );
      
      expect(screen.getByText('+10')).toBeInTheDocument();
      expect(screen.getByText('+15')).toBeInTheDocument();
    });

    it('should display domain information', () => {
      render(
        <Recommendations 
          recommendations={mockRecommendations}
          onQuestionClick={mockOnQuestionClick}
        />
      );
      
      expect(screen.getByText('Device Security')).toBeInTheDocument();
      expect(screen.getByText('Authentication')).toBeInTheDocument();
    });
  });

  describe('when interacting with recommendations', () => {
    it('should call onQuestionClick when recommendation is clicked', () => {
      render(
        <Recommendations 
          recommendations={mockRecommendations}
          onQuestionClick={mockOnQuestionClick}
        />
      );
      
      const firstRecommendation = screen.getByText('Does your phone lock automatically?').closest('div');
      if (firstRecommendation) {
        fireEvent.click(firstRecommendation);
        expect(mockOnQuestionClick).toHaveBeenCalledWith('lock_screen');
      }
    });

    it('should handle missing onQuestionClick callback gracefully', () => {
      expect(() => {
        render(<Recommendations recommendations={mockRecommendations} />);
      }).not.toThrow();
    });
  });

  describe('when no recommendations provided', () => {
    it('should render empty state gracefully', () => {
      render(
        <Recommendations 
          recommendations={[]}
          onQuestionClick={mockOnQuestionClick}
        />
      );
      
      expect(screen.getByText('🎉 Outstanding security posture!')).toBeInTheDocument();
      // Should not crash with empty recommendations
    });
  });

  describe('impact color styling', () => {
    it('should apply correct color classes for different impact levels', () => {
      const lowImpactRecommendation = [{
        ...mockRecommendations[0],
        impact: 'low' as const
      }];

      render(
        <Recommendations 
          recommendations={lowImpactRecommendation}
          onQuestionClick={mockOnQuestionClick}
        />
      );
      
      expect(screen.getByText('Small Impact')).toBeInTheDocument();
    });
  });
});
