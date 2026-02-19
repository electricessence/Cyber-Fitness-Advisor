# Architecture Documentation

## Overview

Cyber Fitness Advisor is a client-side web application built with modern web technologies that provides a gamified cybersecurity assessment experience. The architecture prioritizes simplicity, performance, and privacy.

## Core Design Principles

### 1. Hunt-to-Help: Stint-Based Value Delivery

The app's job is NOT to interrogate the user. It is a **race to find how we can help**.

Every question is a search probe — "Can I help you here?" — and the moment the
answer reveals a gap, the app pivots into an actionable quick win. The entire
flow is a funnel from minimum viable info → immediate value → earn trust → go
deeper.

#### Stints (Short Question Sequences → Outcome)

A **stint** is just a short sequence of questions that leads to an outcome.
That's it. Not a framework, not a phase system — just 1-3 questions grouped
because they serve the same goal. The probe asks "is there a gap here?", and
if yes, the follow-up closes it. If no, the stint is done and we move on.

Questions are grouped into stints, and each stint is a **hunt**: probe for a
gap, and if found, pivot to the action that closes it.

| # | Stint | Goal | Hunt Pattern | Max Qs |
| --- | ------- | ------ | ------------- | -------- |
| 1 | **Welcome** | User trusts the app | "Your data stays local" → acknowledged | 1 |
| 2 | **Your Setup** | Know OS + browser | Auto-detect → confirm (2 taps) | 2 |
| 3 | **Ad Protection** | User has an adblocker | "Do you have one?" → YES: done, move on → NO: "Install uBlock Origin now — 30 seconds" | 2 |
| 4 | **Password Safety** | User has a password manager, or knows the first step | "Do you use one?" → YES: "What kind?" (quick info) → NO: "What's holding you back?" (identify barrier, suggest next step) | 2 |
| 5 | **Account Security** | User has 2FA on their most important account, or knows which one to start with | "Do you use 2FA?" → YES: "What method?" → PARTIAL/NO: "Which account would you protect first?" (action) | 2 |
| 6 | **About You** | Tailor the rest of the journey | Only asked after 3 action stints — earned the right. Tech comfort + main concern + mobile context. | 3 |
| 7 | **Daily Habits** | Surface gaps in routine security | Updates, screen lock, phishing awareness — each is a probe that may reveal a quick fix | 3 |
| — | *(no stint)* | Ongoing depth | Everything else: browser-specific deep dives, mobile security, advanced 2FA, breach checks, etc. Flows via gates, no progress bar needed | — |

Stints are **data on the question**, not custom UI logic. The `stint` property
on a Question tells the UI what label to show and which step the user is on.

#### The Hunt in Practice

```text
User arrives
  └─ Welcome: "Your data stays local" .................. 1 tap, trust established
  └─ Your Setup: "Windows + Chrome? Correct?" .......... 2 taps, platform known
  └─ Ad Protection: "Do you have an adblocker?"
       ├─ YES → stint complete, hunt moves on .......... 0 effort
       └─ NO → "Install uBlock Origin" ................. 30 sec, FIRST WIN 🎯
  └─ Password Safety: "Do you use a password manager?"
       ├─ YES → "What kind?" (quick categorize) ........ earned the right to ask
       └─ NO → "What's the barrier?" → suggest action .. SECOND WIN opportunity
  └─ Account Security: "Do you use 2FA?"
       ├─ YES → "What method?" ......................... quick check
       └─ NO → "Which account first?" .................. THIRD WIN opportunity
  └─ About You: "How comfortable with tech?" ........... they're invested now
  └─ Daily Habits: updates, screen lock, phishing ...... ongoing awareness
  └─ Everything else: gate-driven, no interrogation .... power users go deep
```

Each stint either **delivers a win** or **confirms the user is already good**.
Neither outcome wastes their time.

#### Pacing: Breathe Between Wins

When a user completes a stint's action — they actually installed the adblocker,
they actually set up a password manager — the next prompt is **not** another
probe. It's a breather:

> "Great work! That was a big win. Would you like to keep going, or take a break?"

This does two things:

1. **Celebrates the effort** — the user just did a real thing, acknowledge it
2. **Gives permission to stop** — normalizes breaks, reduces assessment fatigue

If the user already had the thing ("Yes, I have an adblocker"), no pause is
needed — confirming you're already safe isn't tiring. Pacing kicks in after
the user **does work**, not after every stint.

The combination of stints (bounded, purposeful) + pacing (breathe after effort)
is what makes the experience feel like a helpful friend, not a security audit.

#### "Maybe Later" = Move to Todo

Skipping a question is not failure. It means "find me something I *can* do."
The app should pivot to the next stint, and the skipped action goes to the
todo/improvement section.

#### Success Metric

The true metric is **total points accumulated across all users combined**.
That means maximizing:

- **Adoption** — people start using it
- **Trust** — they don't drop off during interrogation
- **Completion** — they finish stints and take actions
- **Depth** — power users voluntarily go further

A casual user who installs an adblocker and leaves is a success.
A power user who completes every deep-dive is also a success.
The system serves both because it delivers value *before* demanding investment.

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

```text
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

```text
User Answer → Store Action → Scoring Engine → State Update → UI Re-render
                    ↓
              LocalStorage Persist → Celebration Check → UI Feedback
```

### 2. Score Calculation Flow

```text
Raw Answers → Normalization → Weight Application → Quick Win Bonus → 
Domain Scores → Overall Score → Level Calculation → Progress Metrics
```

### 3. Recommendation Flow

```text
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

```text
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

```text
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
