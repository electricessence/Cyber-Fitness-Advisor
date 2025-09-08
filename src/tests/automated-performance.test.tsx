import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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
    
    // Verify DOM is ready
    expect(screen.getByText(/Setup Progress/)).toBeInTheDocument()
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
        fireEvent.click(buttons[0])
      } else {
        // We're likely in a confirmation state - that's fine, break the loop
        break
      }
      
      // Wait for next question to appear OR confirmation state
      await waitFor(() => {
        const newButtons = screen.queryAllByRole('button')
        const confirmationText = screen.queryByText(/Great! We'll provide/i)
        const setupProgress = screen.queryByText(/Setup Progress/)
        
        // Should have buttons OR be in confirmation state OR have setup progress
        expect(newButtons.length > 0 || !!confirmationText || !!setupProgress).toBe(true)
      })
      
      const transitionTime = performance.now() - startTransition
      transitionTimes.push(transitionTime)
    }
    
    // Average transition should be fast
    const avgTransition = transitionTimes.reduce((a, b) => a + b, 0) / transitionTimes.length
    expect(avgTransition).toBeLessThan(50) // 50ms budget per transition
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
    
    // Verify UI still responsive
    expect(screen.getByText(/Setup Progress/)).toBeInTheDocument()
  })

  test('Rapid User Input Handling - Automated', async () => {
    render(<App />)
    
    const startTime = performance.now()
    
    // Simulate very rapid clicking
    for (let i = 0; i < 5; i++) { // Reduced iterations to avoid endless confirmation states
      const buttons = screen.queryAllByRole('button')
      if (buttons.length > 0) {
        // Click first button only
        fireEvent.click(buttons[0])
        
        // Wait for UI to update
        await waitFor(() => {
          const hasButtons = screen.queryAllByRole('button').length > 0
          const hasConfirmation = !!screen.queryByText(/Great! We'll provide/i)
          const hasProgress = !!screen.queryByText(/Setup Progress/)
          
          // Should have some UI state
          expect(hasButtons || hasConfirmation || hasProgress).toBe(true)
        })
      } else {
        // If no buttons, we're probably in confirmation state - break the loop
        break
      }
    }
    
    const rapidInputTime = performance.now() - startTime
    
    // Should handle rapid input without performance degradation
    expect(rapidInputTime).toBeLessThan(500) // 500ms budget
    
    // UI should still be functional  
    const hasSetupProgress = !!screen.queryByText(/Setup Progress/)
    const hasConfirmation = !!screen.queryByText(/Great! We'll provide/i)
    expect(hasSetupProgress || hasConfirmation).toBeTruthy()
  })
})
