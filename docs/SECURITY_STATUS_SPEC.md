# Security Status Component Specification

## Overview
A collapsible accordion-style "shopping cart" of answered questions in the right sidebar. Each answer gets tagged/categorized based on the user's commitment level and shows up in the appropriate bucket for easy review and reset.

## Core Requirements

### 1. Three Accordion Categories
- **🛡️ Shields Up** (Green) - "Good job!" answers that don't need revisiting
- **📋 To Do** (Yellow) - "Will do later/future" answers user is willing to revisit  
- **🎯 Room for Improvement** (Red) - "Won't do" answers that shouldn't be ignored

### 2. Answer Tagging Logic
Each question answer gets automatically tagged based on user response:
- **Green Tag**: "Yes, already doing this" → Shields Up
- **Yellow Tag**: "Will do later", "Planning to", "Maybe" → To Do  
- **Red Tag**: "No", "Won't do", "Not interested" → Room for Improvement

### 3. Accordion Behavior
- **Collapsible sections**: Click to expand/collapse each category
- **Count badges**: Show number of items in each category
- **Default state**: Can start collapsed or expanded
- **Independent**: Each section toggles independently

## User Interface Design

### Accordion Layout
```
┌─ Security Status ──────────────┐
│                                │
│ ▼ 🛡️ Shields Up (3)            │
│   ✅ Has password manager      │
│      "Yes, I use one"          │
│      [Change Answer]           │
│                                │
│   ✅ Auto-updates enabled      │
│      "Already enabled"         │
│      [Change Answer]           │
│                                │
│ ▶ 📋 To Do (2)                 │
│                                │
│ ▼ 🎯 Room for Improvement (1)  │
│   🟡 No password manager       │
│      "Will do later"           │
│      [Set Reminder] [Change Answer] │
│                                │
│   🔴 No antivirus              │
│      "Don't want to install"   │
│      [How to Fix] [Change Answer] │
│                                │
│ [Clear All Answers]            │
└────────────────────────────────┘
```

### State Indicators & Actions

#### Green (Shields Up) - [check] severity
- **✅ Green checkmark** - "Complete/Done" - strong confirmation, no more action needed
- **Simple action**: [Change Answer] only
- **User confidence**: They're doing well, just option to modify

#### Yellow (To Do) - [plan] severity  
- **🟡 Yellow circle** - "More action needed" - planned for future
- **Reminder actions**: [Set Reminder] [Change Answer]
- **User intent**: Will do later, needs gentle nudging

#### Red (Room for Improvement) - [warn] severity
- **🔴 Red circle** - "More action needed" - concerning state
- **Help actions**: [How to Fix] [Change Answer]
- **User resistance**: Won't do it, needs education/motivation

## Functional Behavior

### 1. Answer Categorization Logic
```typescript
const categorizeAnswer = (answer: Answer, question: Question): 'shields-up' | 'to-do' | 'room-for-improvement' => {
  // High positive answers (8+ points) = Shields Up
  if (answer.pointsEarned >= 8) return 'shields-up';
  
  // Medium/future answers (3-7 points) = To Do  
  if (answer.pointsEarned >= 3) return 'to-do';
  
  // Low/concerning answers (0-2 points) = Room for Improvement
  return 'room-for-improvement';
}

const getVisualIndicator = (category: string) => {
  switch (category) {
    case 'shields-up': return { icon: '✅', severity: 'check' };
    case 'to-do': return { icon: '🟡', severity: 'plan' };
    case 'room-for-improvement': return { icon: '🔴', severity: 'warn' };
  }
}
```

### 2. Reset Action
1. User clicks [Change Answer] next to any question
2. Answer is removed from store via `removeAnswer(questionId)`
3. Question disappears from accordion
4. Question becomes available in assessment again
5. Scores and badges recalculate automatically

### 3. Accordion State
- **Default**: All sections expanded on first load
- **Persistence**: Remember collapsed/expanded state in localStorage
- **Independent**: Each section toggles independently
- **Count badges**: Show live count of items in each category

## Data Flow

### Store Integration
```typescript
// Use existing store methods:
- answers: Record<string, Answer>
- getHistoricAnswers() // Get formatted answer data
- answerQuestion(questionId, value) // For re-answering
- resetAssessment() // For clear all

// New method needed:
- removeAnswer(questionId: string) // Remove single answer
```

### Component State
```typescript
interface SecurityStatusState {
  expandedSections: {
    'shields-up': boolean;
    'to-do': boolean; 
    'room-for-improvement': boolean;
  };
  showConfirmClear: boolean;
}
```

## Implementation

### Single Component Structure
```typescript
// SecurityStatus.tsx
export function SecurityStatus() {
  // Get categorized answers
  const categorizedAnswers = useMemo(() => {
    const historic = getHistoricAnswers();
    return {
      'shields-up': historic.filter(a => categorizeAnswer(a, a.question) === 'shields-up'),
      'to-do': historic.filter(a => categorizeAnswer(a, a.question) === 'to-do'),
      'room-for-improvement': historic.filter(a => categorizeAnswer(a, a.question) === 'room-for-improvement')
    };
  }, [answers]);

  // Render accordion sections
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3>Security Status</h3>
      
      <AccordionSection 
        title="🛡️ Shields Up" 
        items={categorizedAnswers['shields-up']}
        color="green"
      />
      <AccordionSection 
        title="📋 To Do" 
        items={categorizedAnswers['to-do']}
        color="yellow"
      />
      <AccordionSection 
        title="🎯 Room for Improvement" 
        items={categorizedAnswers['room-for-improvement']}
        color="red"
      />
      
      <button onClick={handleClearAll}>Clear All Answers</button>
    </div>
  );
}
```

## Functional Behavior

### 1. Auto-categorization
```typescript
// Based on answer value and points earned
if (pointsEarned >= 8) category = "Good"
else if (pointsEarned >= 4) category = "Okay"  
else category = "Needs Work"
```

### 2. Reset Action
1. User clicks [×] next to any question
2. Answer is removed from store
3. Question disappears from list
4. Question becomes available in assessment again
5. Scores recalculate automatically

### 3. Clear All
1. User clicks "Clear All" button
2. Confirmation: "Reset all answers? This will clear your entire assessment."
3. If confirmed, all answers removed and assessment resets

## Data Flow

### Store Integration
```typescript
// Use existing store methods:
- answers: Record<string, Answer>
- answerQuestion(questionId, value) // For any edits needed
- resetAssessment() // For clear all

// Simple categorization logic:
const categorizeAnswer = (answer: Answer) => {
  if (answer.pointsEarned >= 8) return 'good'
  if (answer.pointsEarned >= 4) return 'okay'
  return 'needs-work'
}
```

## Implementation

### Single Component
```typescript
// SecurityStatus.tsx - one simple component
- Map through answers
- Categorize by points
- Group into 3 lists
- Render with reset buttons
- Handle reset action
```

### No Complex Features
- ❌ No search or filtering
- ❌ No editing answers inline  
- ❌ No bulk operations
- ❌ No timestamps or details
- ❌ No expiration tracking
- ❌ No recommendations

### Just Simple Tracking
- ✅ Show answered questions in 3 buckets
- ✅ Let users reset individual answers
- ✅ Let users clear everything
- ✅ Update in real-time as questions are answered

## Success Criteria
1. ✅ Questions appear in sidebar when answered
2. ✅ Questions are correctly categorized  
3. ✅ Reset buttons work and questions return to assessment
4. ✅ Clear all works with confirmation
5. ✅ Component is visually simple and clean

---

This is much simpler - just a basic 3-bucket list where answered questions show up and can be reset. Does this match what you had in mind?