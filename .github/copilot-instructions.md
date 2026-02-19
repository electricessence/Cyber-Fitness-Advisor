# Copilot Instructions for Cyber Fitness Advisor

## Project Overview
The Cyber Fitness Advisor is a privacy-first cybersecurity assessment tool built with React 19, TypeScript, and Zustand. It helps users improve their digital security through gamified assessments and personalized recommendations.

## Core Architecture Principles

### 1. Privacy-First Design
- **All processing happens locally** - no data leaves the browser
- Use `localStorage` for persistence, never external APIs for user data
- No tracking, analytics, or data collection
- Make privacy guarantees explicit in UI components

### 2. Hunt-to-Help: Flow-Based Value Delivery
**This is the core product philosophy.** The app's job is a race to find how it can help.

- **Every question is a search probe** — "Can I help you here?" — not an interrogation
- **Flows** are small, purpose-driven missions (2-3 questions max) with a clear goal
- **Ordering by value speed**: minimum info → immediate quick win → earn trust → go deeper
- **"Maybe later" = move to todo**, not failure. Pivot to the next flow.
- **The true metric**: total points accumulated across all users (adoption × trust × completion)
- **Flows are driven by question data**, not custom UI logic — `priority`, `journeyIntent`, and `tags` on a Question drive flow grouping and labels

#### What's a Flow?
A flow is just a short sequence of questions (1-3) that leads to an outcome. Not a framework, not a phase system — just questions grouped because they serve the same goal. The probe asks "is there a gap here?", and if yes, the follow-up closes it. If no, the flow is done and we move on.

#### Flow Design Rules:
1. Each flow has a **goal** (e.g., "user has an adblocker installed")
2. Start with minimum info needed to unlock the goal
3. If the probe reveals a gap → pivot to the action card immediately
4. If no gap → flow completes, move to next
5. Never ask info-gathering questions unless they unlock an action
6. Personalization questions (tech_comfort, usage_context) come AFTER the first action wins

#### Pacing: Breathe Between Wins
When a user completes a flow's action (they actually did the thing), the next prompt is a breather — not another probe:
> "Great work! That was a big win. Would you like to keep going, or take a break?"

- **Celebrate the effort** — acknowledge the user did real work
- **Give permission to stop** — normalize breaks, reduce assessment fatigue
- Pacing only kicks in after the user **does work** (e.g., installs something), not after confirming they already had it
- Flows (bounded, purposeful) + pacing (breathe after effort) = helpful friend, not security audit

#### Flow Sequence (Hunt Pattern):
1. **Welcome** — "Data stays local" (1 tap, trust)
2. **Your Setup** — OS + browser confirm (2 taps, enables actions)
3. **Ad Protection** — probe → YES: done → NO: install now (FIRST WIN)
4. **Password Safety** — probe → YES: what kind? → NO: what's the barrier? (SECOND WIN)
5. **Account Security** — probe → YES: what method? → NO: which account first? (THIRD WIN)
6. **About You** — earned the right to personalize (tech comfort, concerns, mobile)
7. **Daily Habits** — routine probes (updates, screen lock, phishing)
8. *(no stint)* — everything else via gates, power users go deep

### 3. Test File Organization Policy
- **`.spec.ts` files**: True spec files that are paired with their source file and live in the same directory
- **`.test.ts` files**: Broader integration tests, utilities, or non-paired tests that live in the `tests/` folder
- **Rule**: If it's not a direct unit test of a specific source file, it belongs in `tests/` as `.test.ts`

### 4. Modular Component Architecture
**Lesson Learned**: As SPAs grow from "simple concepts" to "serious applications," modular architecture becomes essential from the start.

#### Key Guidelines:
- **Extract components when files become unwieldy** - If you're scrolling extensively to find code, it's time to break it apart
- **Separate concerns by responsibility** - Layout, business logic, state management, and utilities should live in distinct modules
- **Create custom hooks for reusable logic** - Complex state logic and cross-component concerns benefit from extraction
- **Use TypeScript interfaces consistently** - Define clear contracts for all component props and state shapes
- **Group related components together** - Organize by feature or responsibility rather than arbitrary structure

### 5. State Management with Zustand
- Use Zustand for global application state
- Implement localStorage persistence for user data
- Keep state updates immutable and predictable
- Add logging for debugging state changes

### 6. Testing Strategy
- Maintain test coverage focused on **critical business logic**
- Test state management thoroughly (store functions, data persistence)
- Use integration tests for user workflows
- Don't over-test simple UI components - focus on behavior

### 7. Performance & UX Considerations
- **Progressive Enhancement**: App works without JavaScript for basic functionality
- **Responsive Design**: Mobile-first approach with clear desktop enhancements
- **Loading States**: Provide feedback during async operations
- **Error Boundaries**: Graceful error handling throughout the app

## Development Workflow

### When to Refactor
**Warning Signs** that indicate need for architectural improvements:
- **Files become difficult to navigate** - excessive scrolling or searching for specific functionality
- **Mixed responsibilities** - business logic, UI logic, and state management intertwined in single components
- **Repeated patterns** - similar code structures that could be abstracted
- **Testing becomes complex** - difficulty isolating units of functionality for testing
- **Team velocity decreases** - developers spend more time understanding existing code than writing new features

### Code Quality Standards
- **TypeScript strict mode** - no `any` types without explicit justification
- **ESLint compliance** - fix all linting errors before commits
- **Consistent naming**: Use descriptive names that explain intent
- **Component props**: Always define TypeScript interfaces for component props

### Security Considerations
- **Input validation** on all user data
- **Sanitize** any dynamic content before rendering
- **CSP headers** for production deployment
- **No inline scripts** - use proper event handlers

## Feature Development Guidelines

### Adding New Assessment Questions
1. Update question bank in `src/data/` directory
2. Ensure questions have proper TypeScript types
3. Add corresponding test cases
4. Update scoring algorithms if needed

### Adding New Security Recommendations
1. Add to `src/data/secureActions.ts`
2. Include browser/platform detection logic
3. Provide clear installation steps
4. Add search terms for user guidance

### UI/UX Enhancements
- Maintain **accessibility standards** (WCAG 2.1 AA)
- Keep **visual hierarchy** clear and consistent
- Use **semantic HTML** elements appropriately
- Test with **screen readers** and keyboard navigation

## Deployment & Maintenance

### Build Process
- Ensure TypeScript compilation passes without errors
- Run full test suite before deployment
- Optimize bundle size (code splitting for large features)
- Generate source maps for debugging

### Performance Monitoring
- Monitor bundle size growth
- Check for memory leaks in long-running sessions
- Validate localStorage usage doesn't exceed browser limits
- Test performance on lower-end devices

## Lessons Learned Archive

### Major Refactoring (September 2025)
**Problem**: Main application component became unmanageable and difficult to maintain
**Solution**: Extracted into modular architecture with focused, single-responsibility components and custom hooks
**Result**: Significant reduction in complexity, improved maintainability and developer experience

**Key Insight**: "Simple concepts" can quickly become "serious applications" - architect for growth from the beginning rather than reactive refactoring.

### State Management Evolution
**Problem**: Complex filtering logic scattered throughout components
**Solution**: Centralized filtering logic in Zustand store with proper logging
**Result**: Easier debugging, consistent behavior across components

### Testing Strategy Refinement
**Approach**: Focus testing efforts on business-critical logic rather than comprehensive coverage
**Result**: 46% coverage focused on assessment logic, store functions, and user workflows
**Benefit**: Faster development cycle while maintaining confidence in critical paths

### Tech Debt Elimination (September 10, 2025)
**Problem**: React act() warnings flooding test console, accessibility tests skipped due to jest-axe incompatibility
**Solution**: Console warning suppression in test setup, custom vitest-compatible accessibility tests
**Result**: Clean 149/149 tests passing, comprehensive accessibility coverage without external dependencies
**Achievement**: Stable foundation ready for feature development with optimized developer experience

---

## Quick Reference

### Common Patterns
```typescript
// Custom hook pattern
export function useFeatureName() {
  const [state, setState] = useState();
  // logic here
  return { state, setState, /* other exports */ };
}

// Component with proper TypeScript
interface ComponentProps {
  required: string;
  optional?: number;
}

export function Component({ required, optional = 0 }: ComponentProps) {
  // component logic
}

// Zustand store pattern
interface StoreState {
  data: DataType;
  actions: {
    updateData: (newData: DataType) => void;
  };
}
```

### Performance Tips
- Use `React.memo()` for expensive components
- Implement proper dependency arrays in `useEffect`
- Consider `useMemo`/`useCallback` for expensive computations
- Lazy load non-critical components with `React.lazy()`

Remember: **Maintainable code is more valuable than clever code**. Prioritize clarity and modularity over performance micro-optimizations.

