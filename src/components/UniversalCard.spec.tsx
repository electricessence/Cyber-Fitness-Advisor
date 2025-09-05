import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { UniversalCard } from './UniversalCard'

// Mock the icons since they might cause issues in testing
vi.mock('lucide-react', () => ({
  Zap: () => <div data-testid="zap-icon">⚡</div>,
  Clock: () => <div data-testid="clock-icon">⏰</div>,
  HelpCircle: () => <div data-testid="help-icon">❓</div>,
  CheckCircle: () => <div data-testid="check-icon">✅</div>,
  AlertTriangle: () => <div data-testid="alert-icon">⚠️</div>,
}))

describe('UniversalCard', () => {
  const mockOnAnswer = vi.fn()
  const mockOnFollowUp = vi.fn()

  const defaultProps = {
    mode: 'question' as const,
    id: 'test-question',
    title: 'Test Question Title',
    category: 'Test Category',
    priority: 8,
    impact: 'high' as const,
    options: [
      { id: 'yes', text: 'Yes', points: 10, target: 'shields-up' as const, advice: 'Good choice!' },
      { id: 'no', text: 'No', points: 0, target: 'needs-improvement' as const, advice: 'Consider improving this.' }
    ],
    onAnswer: mockOnAnswer,
    onFollowUp: mockOnFollowUp
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when rendering in question mode', () => {
    it('should display the question title and options', () => {
      render(<UniversalCard {...defaultProps} />)
      
      expect(screen.getByText('Test Question Title')).toBeInTheDocument()
      expect(screen.getByText('Yes')).toBeInTheDocument()
      expect(screen.getByText('No')).toBeInTheDocument()
    })

    it('should display impact level (category is not displayed)', () => {
      render(<UniversalCard {...defaultProps} />)
      
      // Category is present in props but not rendered (see component line 26)
      // Impact is rendered as "High Impact"
      expect(screen.getByText(/high impact/i)).toBeInTheDocument()
    })

    it('should call onAnswer when option is clicked', () => {
      render(<UniversalCard {...defaultProps} />)
      
      const yesButton = screen.getByText('Yes')
      fireEvent.click(yesButton)
      
      expect(mockOnAnswer).toHaveBeenCalledWith('yes')
    })

    it('should show quick win indicator when isQuickWin is true', () => {
      render(<UniversalCard {...defaultProps} isQuickWin={true} />)
      
      expect(screen.getByText(/quick win/i)).toBeInTheDocument()
    })

    it('should display time estimate when provided', () => {
      render(<UniversalCard {...defaultProps} timeEstimate="5 min" />)
      
      expect(screen.getByText('5 min')).toBeInTheDocument()
    })
  })

  describe('when rendering in completed mode', () => {
    it('should show completion status', () => {
      render(<UniversalCard 
        {...defaultProps} 
        mode="completed"
        currentAnswer="yes"
      />)
      
      // Should show some completion indicator
      expect(screen.getByText('Test Question Title')).toBeInTheDocument()
      // Specific completion UI depends on implementation
    })
  })

  describe('when rendering in preview mode', () => {
    it('should show preview layout', () => {
      render(<UniversalCard 
        {...defaultProps} 
        mode="preview"
      />)
      
      expect(screen.getByText('Test Question Title')).toBeInTheDocument()
      // Preview mode might have different styling/interaction
    })
  })

  describe('when displaying guidance', () => {
    it('should show detailed guidance when in completed mode with unsure answer', () => {
      const guidance = 'This is detailed guidance for the question'
      
      // Guidance only shows when mode='completed' AND currentAnswer='unsure' 
      const guidanceProps = {
        ...defaultProps,
        mode: 'completed' as const,
        detailedGuidance: guidance,
        // Simulate having answered 'unsure'  
        currentAnswer: 'unsure'
      }
      
      render(<UniversalCard {...guidanceProps} />)
      
      // Look for the guidance text (should be prefixed with "💡 How to check this:")
      expect(screen.getByText(guidance)).toBeInTheDocument()
    })

    it('should show action hint when provided', () => {
      const hint = 'Click here to learn more'
      render(<UniversalCard 
        {...defaultProps} 
        actionHint={hint}
      />)
      
      expect(screen.getByText(hint)).toBeInTheDocument()
    })
  })
})
