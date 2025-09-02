# Architecture Documentation

## Overview

Cyber Fitness Advisor is a client-side web application built with modern web technologies that provides a gamified cybersecurity assessment experience. The architecture prioritizes simplicity, performance, and privacy.

## Core Design Principles

### 1. Quick Wins First Philosophy
- **25% score bonus** for questions marked as `quickWin: true`
- **Progressive difficulty** - complex questions unlock after basics are mastered
- **Impact-based recommendations** prioritize high-value, low-effort actions

### 2. Zero-Backend Architecture
- All logic runs client-side in the browser
- Data persisted to browser's LocalStorage
- No server dependencies, perfect for GitHub Pages
- Export/import for data portability

### 3. Real-Time Gamification
- Live score calculations with animated feedback
- Level progression system with celebration triggers
- Badge achievements for milestone completions

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
├─────────────────────────────────────────────────────────────┤
│  React Components (UI Layer)                               │
│  ├── ScoreBar (animated progress)                          │
│  ├── QuestionCard (individual questions)                   │
│  ├── Recommendations (smart next steps)                    │
│  └── Celebration (progress rewards)                        │
├─────────────────────────────────────────────────────────────┤
│  Zustand Store (State Management)                          │
│  ├── Assessment state (answers, scores, progress)          │
│  ├── UI state (celebrations, navigation)                   │
│  └── LocalStorage persistence                              │
├─────────────────────────────────────────────────────────────┤
│  Assessment Engine (Pure Functions)                        │
│  ├── scoring.ts (score calculations)                       │
│  ├── schema.ts (TypeScript interfaces)                     │
│  └── questions.json (question bank)                        │
├─────────────────────────────────────────────────────────────┤
│  Browser APIs                                              │
│  ├── LocalStorage (persistence)                            │
│  ├── JSON import/export (data portability)                 │
│  └── File API (data import/export)                         │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Question Answering Flow
```
User Answer → Store Action → Scoring Engine → State Update → UI Re-render
                    ↓
              LocalStorage Persist → Celebration Check → UI Feedback
```

### 2. Score Calculation Flow
```
Raw Answers → Normalization → Weight Application → Quick Win Bonus → 
Domain Scores → Overall Score → Level Calculation → Progress Metrics
```

### 3. Recommendation Flow
```
Current State → Unanswered Questions → Impact Analysis → 
Priority Sorting → Top 3 Recommendations → UI Display
```

## Component Architecture

### ScoreBar Component
**Purpose**: Real-time progress visualization with animations
- Animated score counter with easing
- Level progression indicators
- Quick wins completion tracking
- Next level progress visualization

**State Dependencies**:
- `overallScore` - current total score
- `currentLevel` - user's current level
- `nextLevelProgress` - progress to next level
- `quickWinsCompleted` - count of completed quick wins

### QuestionCard Component  
**Purpose**: Interactive question presentation with contextual help
- Supports Y/N and 1-5 scale question types
- Visual indicators for quick wins and time estimates
- Contextual explanations and action hints
- Immediate feedback on answer selection

**Props**:
- `question` - question data including text, type, weight
- `answer` - current user answer (if any)
- `onAnswer` - callback for answer changes
- `domainTitle` - context for question categorization

### Recommendations Component
**Purpose**: Smart next steps based on impact analysis
- Prioritizes unanswered high-impact questions
- Shows potential point values and time estimates
- Provides actionable guidance for each recommendation
- Enables quick navigation to recommended questions

### Celebration Component
**Purpose**: Progress rewards and motivation
- Triggers on significant score increases (5+ points)
- Special animations for level-ups
- Auto-dismissing with manual override
- Different celebration types based on achievement level

## State Management

### Zustand Store Design
```typescript
interface AssessmentState {
  // Core Data
  questionBank: QuestionBank;
  answers: Record<string, Answer>;
  
  // Computed Metrics  
  overallScore: number;
  domainScores: Record<string, number>;
  currentLevel: number;
  quickWinsCompleted: number;
  
  // UI State
  showCelebration: boolean;
  lastScoreIncrease: number;
  earnedBadges: string[];
  
  // Actions
  answerQuestion: (questionId: string, value: boolean | number) => void;
  resetAssessment: () => void;
  getRecommendations: () => Recommendation[];
}
```

### Persistence Strategy
- **Selective Persistence**: Only answers and badges are persisted
- **Recomputation on Load**: Scores and metrics recalculated from persisted answers
- **Version Tolerance**: Schema changes don't break existing user data
- **Export/Import**: JSON-based data portability

## Scoring Engine

### Normalization Algorithm
```typescript
function normalizeAnswer(question: Question, value: boolean | number): number {
  if (question.type === 'YN') {
    return value as boolean ? 1 : 0;
  } else {
    // SCALE: 1-5 → 0-1 with slight boost for any effort
    return Math.max(0, (value as number - 1) / 4);
  }
}
```

### Weight System
- **Weights 1-10**: Based on security impact assessment
- **Quick Win Multiplier**: 1.25x bonus for high-impact, easy actions
- **Domain Balance**: All domains weighted equally in MVP

### Level Thresholds (Tuned for Early Wins)
```
Level 0: 0-15 points   (Getting Started)
Level 1: 15-35 points  (Basic Protection) 
Level 2: 35-60 points  (Good Security Habits)
Level 3: 60-80 points  (Well Protected)
Level 4: 80+ points    (Cyber Ninja)
```

## Security & Privacy

### Zero Data Collection
- No analytics or tracking code
- No external API calls
- No user identification or profiling
- All processing happens locally

### Data Security
- Browser-based encryption via HTTPS
- LocalStorage data stays on user's device
- Export files are JSON (human readable)
- No server-side data storage

## Performance Considerations

### Bundle Size Optimization
- **Vite tree-shaking** removes unused code
- **Component lazy loading** for optimal startup
- **Zustand** (2KB) vs Redux (60KB+) for state management
- **Lucide icons** loaded on-demand

### Runtime Performance
- **Pure functions** for scoring calculations enable easy memoization
- **Incremental updates** only recalculate changed scores
- **Debounced animations** prevent excessive re-renders
- **LocalStorage batching** reduces I/O overhead

### Accessibility
- **ARIA labels** on all interactive elements
- **Keyboard navigation** support throughout
- **Color contrast** meets WCAG AA standards
- **Screen reader** friendly content structure

## Deployment Architecture

### GitHub Pages Strategy
```
main branch → GitHub Actions → Build → gh-pages branch → GitHub Pages
```

### Build Process
1. **Dependency Installation**: pnpm install
2. **TypeScript Compilation**: Type checking and compilation
3. **Vite Build**: Bundle optimization and asset processing
4. **Static Asset Generation**: HTML, CSS, JS files for hosting
5. **Deployment**: Push to gh-pages branch

### Configuration
- **Base Path**: `/Cyber-Fitness-Advisor/` for GitHub Pages
- **Asset Optimization**: Minification, compression, source maps
- **Browser Compatibility**: ES2020+ with Vite polyfills

## Extension Points

### Adding New Question Types
1. Extend `QuestionType` union in schema.ts
2. Update normalization logic in scoring.ts
3. Add UI handling in QuestionCard component
4. Update validation and type guards

### Adding New Domains
1. Add domain definition to questions.json
2. Update domain navigation in App.tsx
3. Add domain-specific icons and theming
4. Create domain-specific recommendations

### Adding New Gamification Elements
1. Define badge conditions in scoring.ts
2. Update celebration triggers in store.ts
3. Add UI components for new reward types
4. Update persistence layer for new data

This architecture balances simplicity with extensibility, ensuring the app remains maintainable while providing rich functionality and excellent user experience.
