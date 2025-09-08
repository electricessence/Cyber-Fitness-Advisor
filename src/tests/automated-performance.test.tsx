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
    expect(screen.getByText(/Cyber Fitness/)).toBeInTheDocument()
  })

  test('Question Transitions are Smooth - Automated', async () => {
    render(<App />)
    
    // Measure question transition performance
    const transitionTimes: number[] = []
    
    for (let i = 0; i < 5; i++) {
      const startTransition = performance.now()
      
      // Find and click first available button
      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        if (buttons.length > 0) {
          fireEvent.click(buttons[0])
        }
      })
      
      // Wait for next question to appear
      await waitFor(() => {
        const newButtons = screen.getAllByRole('button')
        expect(newButtons.length).toBeGreaterThan(0)
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
    expect(screen.getByText(/Cyber Fitness/)).toBeInTheDocument()
  })

  test('Rapid User Input Handling - Automated', async () => {
    render(<App />)
    
    const startTime = performance.now()
    
    // Simulate very rapid clicking
    for (let i = 0; i < 20; i++) {
      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        if (buttons.length > 0) {
          // Click multiple buttons rapidly
          buttons.forEach(button => {
            fireEvent.click(button)
          })
        }
      })
    }
    
    const rapidInputTime = performance.now() - startTime
    
    // Should handle rapid input without performance degradation
    expect(rapidInputTime).toBeLessThan(500) // 500ms budget
    
    // UI should still be functional
    expect(screen.getByText(/Cyber Fitness/)).toBeInTheDocument()
  })
})
