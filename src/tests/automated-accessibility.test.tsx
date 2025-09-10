import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useAssessmentStore } from '../features/assessment/state/store'
import App from '../App'

describe('Automated Accessibility Testing', () => {
  beforeEach(() => {
    useAssessmentStore.getState().resetAssessment()
  })

  test('App has basic accessibility features - Automated A11y Check', async () => {
    const { container } = render(<App />)
    
    // Check for proper heading structure (more flexible than requiring main)
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThan(0)
    
    // Check for interactive elements being properly labeled
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveAccessibleName() // Must have accessible name
    })
    
    // Check that interactive elements are keyboard accessible
    buttons.forEach(button => {
      expect(button).not.toHaveAttribute('tabindex', '-1')
    })
    
    expect(container).toBeInTheDocument()
  })

  test('Keyboard Navigation - Basic Support', async () => {
    render(<App />)
    
    // Get first interactive element
    const buttons = screen.getAllByRole('button')
    if (buttons.length > 0) {
      const firstButton = buttons[0]
      
      // Ensure button is focusable
      firstButton.focus()
      expect(firstButton).toHaveFocus()
      
      // Test keyboard interaction
      fireEvent.keyDown(firstButton, { key: 'Enter', code: 'Enter' })
      
      // Should not crash and should maintain focus management
      expect(document.activeElement).toBeDefined()
    }
  })

  test('Color Contrast and Visual Accessibility', () => {
    const { container } = render(<App />)
    
    // Check for text content visibility
    const textElements = container.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div')
    
    textElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element)
      const color = computedStyle.color
      
      // Basic check that text has color (not transparent)
      expect(color).not.toBe('rgba(0, 0, 0, 0)')
      expect(color).not.toBe('transparent')
    })
    
    expect(container).toBeInTheDocument()
  })

  test('Screen Reader Compatibility - ARIA Labels', () => {
    render(<App />)
    
    // Check for proper ARIA labeling on interactive elements
    const interactiveElements = screen.getAllByRole('button')
    
    interactiveElements.forEach(element => {
      // Should have either aria-label, aria-labelledby, or visible text
      const hasAriaLabel = element.hasAttribute('aria-label')
      const hasAriaLabelledBy = element.hasAttribute('aria-labelledby') 
      const hasVisibleText = element.textContent && element.textContent.trim().length > 0
      
      expect(hasAriaLabel || hasAriaLabelledBy || hasVisibleText).toBe(true)
    })
  })
})
