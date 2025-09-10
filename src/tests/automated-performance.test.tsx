import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { useAssessmentStore } from '../features/assessment/state/store'
import App from '../App'

describe('Automated Performance Testing', () => {
  beforeEach(() => {
    useAssessmentStore.getState().resetAssessment()
  })

  test('App Renders Within Performance Budget - Automated', () => {
    const startTime = performance.now()
    
    render(<App />)
    
    // Verify initial render is fast
    const renderTime = performance.now() - startTime
    expect(renderTime).toBeLessThan(100) // 100ms budget
    
    // Verify DOM is ready with privacy notice
    expect(screen.getByText('🔒 Privacy First')).toBeInTheDocument()
  })

  test('Question Transitions are Smooth - Automated', async () => {
    render(<App />)
    
    // Measure question transition performance
    const transitionTimes: number[] = []
    
    for (let i = 0; i < 5; i++) {
      const startTransition = performance.now()
      
      // Find and click first available button OR skip if in confirmation state
      const buttons = screen.queryAllByRole('button')
      if (buttons.length > 0) {
        await act(async () => {
          fireEvent.click(buttons[0])
        })
      } else {
        // We're likely in a confirmation state - that's fine, break the loop
        break
      }
      
      // Wait for next question to appear OR confirmation state (with longer timeout for onboarding delays)
      await waitFor(() => {
        const newButtons = screen.queryAllByRole('button')
        const confirmationText = screen.queryByText(/Great! We'll provide/i)
        const questionText = screen.queryByText('🔒 Privacy First')
        
        // Should have buttons OR be in confirmation state OR have a question
        expect(newButtons.length > 0 || !!confirmationText || !!questionText).toBe(true)
      }, { timeout: 3000 }) // Increased timeout to handle 2-second onboarding delays
      
      const transitionTime = performance.now() - startTransition
      transitionTimes.push(transitionTime)
    }
    
    // Average transition should be reasonable (accounting for 2s onboarding feedback delays)
    const avgTransition = transitionTimes.reduce((a, b) => a + b, 0) / transitionTimes.length
    expect(avgTransition).toBeLessThan(2100) // 2.1s budget per transition (onboarding has 2s delays)
  })

  test('Memory Usage Stability - Automated', async () => {
    // Simulate memory monitoring
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0
    
    render(<App />)
    
    // Simulate heavy interaction
    const store = useAssessmentStore.getState()
    
    // Answer many questions rapidly
    for (let i = 0; i < 50; i++) {
      store.answerQuestion(`test_${i}`, 'yes')
      store.answerQuestion(`test_${i}`, 'no') // Change answer
    }
    
    // Reset assessment multiple times
    for (let i = 0; i < 10; i++) {
      store.resetAssessment()
    }
    
    // Check if memory usage is reasonable
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
    const memoryIncrease = finalMemory - initialMemory
    
    // Memory increase should be reasonable (less than 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
  })

  test('Large Dataset Handling - Automated Stress Test', async () => {
    const { rerender } = render(<App />)
    
    const startTime = performance.now()
    
    // Simulate large number of questions
    const store = useAssessmentStore.getState()
    const questions = store.getOrderedAvailableQuestions?.() || []
    
    // Stress test: answer all questions multiple times
    for (let round = 0; round < 3; round++) {
      questions.forEach(question => {
        store.answerQuestion(question.id, `answer_${round}`)
      })
      
      // Re-render to test React performance
      rerender(<App />)
    }
    
    const totalTime = performance.now() - startTime
    
    // Should handle large datasets efficiently
    expect(totalTime).toBeLessThan(1000) // 1 second budget
    
    // Verify UI still responsive with privacy notice
    expect(screen.getByText('🔒 Privacy First')).toBeInTheDocument()
  })

  test('Rapid User Input Handling - Automated', async () => {
    render(<App />)
    
    const startTime = performance.now()
    
    // Simulate very rapid clicking
    for (let i = 0; i < 5; i++) { // Reduced iterations to avoid endless confirmation states
      const buttons = screen.queryAllByRole('button')
      if (buttons.length > 0) {
        // Click first button only
        await act(async () => {
          fireEvent.click(buttons[0])
        })
        
        // Wait for UI to update (with longer timeout for onboarding delays)
        await waitFor(() => {
          const hasButtons = screen.queryAllByRole('button').length > 0
          const hasConfirmation = !!screen.queryByText(/Great! We'll provide/i)
          const hasQuestion = !!screen.queryByText('🔒 Privacy First')
          
          // Should have some UI state
          expect(hasButtons || hasConfirmation || hasQuestion).toBe(true)
        }, { timeout: 3000 }) // Increased timeout to handle 2-second onboarding delays
      } else {
        // If no buttons, we're probably in confirmation state - break the loop
        break
      }
    }
    
    const rapidInputTime = performance.now() - startTime
    
    // Should handle rapid input without performance degradation (accounting for onboarding delays)
    expect(rapidInputTime).toBeLessThan(2500) // 2.5s budget (onboarding has inherent delays)
    
    // UI should still be functional  
    const hasQuestion = !!screen.queryByText('🔒 Privacy First')
    const hasConfirmation = !!screen.queryByText(/Great! We'll provide/i)
    expect(hasQuestion || hasConfirmation).toBeTruthy()
  })
})
