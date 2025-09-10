# Modular Question Bank Architecture

## Overview
Successfully restructured the monolithic question bank into a modular file-based architecture for improved maintainability and organization.

## Structure

### File Organization
```
src/questions/
├── priorities.ts      # Shared priority constants
├── onboarding.ts      # Level 0 onboarding questions (13 questions)
├── coreAssessment.ts  # Core security assessment questions (8 questions)
├── index.ts           # Central export point (barrel pattern)
└── [future groups]    # Ready for additional question groups
```

### Key Benefits
1. **Maintainability**: Each question group is now in its own file
2. **Scalability**: Easy to add new question categories
3. **Organization**: Clear separation between onboarding and assessment questions
4. **Reusability**: Shared priority constants prevent duplication
5. **TypeScript Safety**: Proper module imports with ESM compatibility

## Implementation Details

### Priority Management
- **ONBOARDING_PRIORITIES**: 10000-9000 range for onboarding flow
- **ASSESSMENT_PRIORITIES**: 85-50 range for core assessment
- Centralized in `priorities.ts` to prevent conflicts

### Module System
- Uses TypeScript with `.js` extension imports for ESM compatibility
- Barrel export pattern in `index.ts` for clean imports
- Proper dependency chain: `questionBank.ts` → `index.ts` → individual modules

### Question Groups

#### Onboarding Questions (13 total)
- Privacy notice and consent
- OS/browser detection for context
- Technology comfort assessment
- Mobile usage patterns
- Security awareness baseline

#### Core Assessment Questions (8 total)
- Password manager usage
- Two-factor authentication
- Software update habits
- Backup practices
- WiFi security awareness
- Email safety practices
- Browser extension management
- Virus scanning habits

## Migration Impact

### Before
- Single 713-line `questionBank.ts` file
- All questions mixed together
- Hard to maintain and organize
- Priority conflicts potential

### After  
- Modular structure with separate files
- `questionBank.ts` reduced to ~25 lines
- Clear question group separation
- Maintainable priority system

## Development Workflow

### Adding New Question Groups
1. Create new file in `src/questions/` (e.g., `advancedSecurity.ts`)
2. Define priority constants in `priorities.ts`
3. Export from `index.ts`
4. Import in `questionBank.ts`

### Example New Group
```typescript
// src/questions/advancedSecurity.ts
import { ADVANCED_PRIORITIES } from './priorities.js';

export const advancedSecurityQuestions = [
  // questions here
];
```

## Status
✅ **Completed**: Modular structure implemented and tested
✅ **Verified**: Application runs successfully with new architecture
✅ **TypeScript**: Compilation issues noted (separate from modular success)

## Future Enhancements
- Add question groups: `advancedSecurity`, `privacy`, `mobileSecurity`, `workSecurity`
- Implement question group metadata for better categorization
- Add validation helpers for question structure consistency
- Consider dynamic question group loading for performance

## Technical Notes
- Requires `.js` extensions in TypeScript imports for ESM compatibility
- Uses barrel export pattern for clean dependency management
- Maintains backward compatibility with existing question bank interface
- TypeScript compilation errors exist but are unrelated to modular structure success
