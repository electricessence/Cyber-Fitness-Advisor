import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useAssessmentStore } from '../features/assessment/state/store'
import App from '../App'

describe('Automated UI Journey Testing', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAssessmentStore.getState().resetAssessment()
  })

  test('Complete Windows User Journey - Fully Automated', async () => {
    render(<App />)
    
    // 1. Verify initial state - look for actual UI elements
    expect(screen.getByText(/Are you using a Windows computer/)).toBeInTheDocument()
    
    // 2. Automated onboarding flow
    // First question should be Windows confirmation (which we can see)
    await waitFor(() => {
      expect(screen.getByText(/Are you using a Windows computer/)).toBeInTheDocument()
    })
    
    // Auto-answer: Yes to Windows
    fireEvent.click(screen.getByText(/Yes, I'm using Windows/))
    
    // 3. Verify progression - next question should appear
    // (The exact question depends on the unified system logic)
    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    }, { timeout: 2000 })
    
    // Auto-answer: No to Mac
    fireEvent.click(screen.getByText('No'))
    
    // 4. Continue automated journey through all onboarding
    // Linux confirmation
    await waitFor(() => {
      expect(screen.getByText(/Linux computer/)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('No'))
    
    // OS Selection
    await waitFor(() => {
      expect(screen.getByText(/What operating system/)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Windows'))
    
    // Browser confirmation - Chrome
    await waitFor(() => {
      expect(screen.getByText(/Google Chrome/)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Yes'))
    
    // 5. Verify assessment questions begin
    await waitFor(() => {
      const questions = screen.queryAllByRole('button')
      expect(questions.length).toBeGreaterThan(0)
    })
    
    // 6. Automated good security practices
    const securityAnswers = [
      { pattern: /lock automatically/, answer: 'Yes' },
      { pattern: /browser save.*password/, answer: 'Yes' },
      { pattern: /antivirus software/, answer: 'Yes' },
      { pattern: /firewall.*turned on/, answer: 'Yes' }
    ]
    
    for (const { pattern, answer } of securityAnswers) {
      await waitFor(() => {
        if (screen.queryByText(pattern)) {
          fireEvent.click(screen.getByText(answer))
        }
      })
    }
    
    // 7. Verify score progression
    await waitFor(() => {
      const store = useAssessmentStore.getState()
      expect(store.overallScore).toBeGreaterThan(0)
      expect(store.currentLevel).toBeGreaterThanOrEqual(0)
    })
  })

  test('Mobile iOS User Journey - Fully Automated', async () => {
    render(<App />)
    
    // Simulate mobile device detection
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      configurable: true
    })
    
    // 1. Should see iOS confirmation first
    await waitFor(() => {
      expect(screen.getByText(/iPhone or iPad/)).toBeInTheDocument()
    })
    
    // Auto-answer: Yes to iOS
    fireEvent.click(screen.getByText('Yes'))
    
    // 2. Should skip Windows/Mac/Linux confirmations
    await waitFor(() => {
      // Should not see desktop OS questions
      expect(screen.queryByText(/Windows computer/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Mac computer/)).not.toBeInTheDocument()
    })
    
    // 3. Should see mobile-specific questions
    await waitFor(() => {
      if (screen.queryByText(/backup.*phone/)) {
        fireEvent.click(screen.getByText('Yes'))
      }
    })
  })

  test('Poor Security Practices Journey - Automated Remediation Path', async () => {
    render(<App />)
    
    // Skip onboarding quickly
    const onboardingAnswers = ['Yes', 'No', 'No', 'Windows', 'Yes', 'No', 'Chrome']
    
    for (const answer of onboardingAnswers) {
      await waitFor(() => {
        const buttons = screen.queryAllByText(answer)
        if (buttons.length > 0) {
          fireEvent.click(buttons[0])
        }
      })
    }
    
    // Provide poor security answers
    const poorAnswers = [
      { pattern: /lock automatically/, answer: 'No' },
      { pattern: /antivirus software/, answer: 'No' },
      { pattern: /firewall.*turned on/, answer: 'No' },
      { pattern: /backup.*important/, answer: 'No' }
    ]
    
    for (const { pattern, answer } of poorAnswers) {
      await waitFor(() => {
        if (screen.queryByText(pattern)) {
          fireEvent.click(screen.getByText(answer))
        }
      })
    }
    
    // Verify recommendations appear
    await waitFor(() => {
      expect(screen.getByText(/Recommendations/)).toBeInTheDocument()
    })
    
    // Should see urgent security recommendations
    expect(screen.getByText(/Enable automatic screen lock/)).toBeInTheDocument()
  })

  test('Assessment Completion Flow - Automated', async () => {
    render(<App />)
    
    // Use store directly to answer all questions quickly
    const store = useAssessmentStore.getState()
    const availableQuestions = store.getOrderedAvailableQuestions?.() || []
    
    // Automated answering of all questions
    availableQuestions.forEach(question => {
      // Choose optimal answers automatically - use 'yes' as safe default
      store.answerQuestion(question.id, 'yes')
    })
    
    // Verify completion state
    await waitFor(() => {
      const currentQuestions = store.getOrderedAvailableQuestions?.() || []
      expect(currentQuestions.length).toBe(0) // All questions answered
    })
    
    // Verify final score and level
    expect(store.overallScore).toBeGreaterThan(0)
    expect(Object.keys(store.answers).length).toBe(availableQuestions.length)
  })
})
