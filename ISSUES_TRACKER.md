# Post-Refactor Issues Tracker

## High Priority Fixes (Blocking Core Functionality)

### 🚨 P0: Answer Processing Facts Pipeline Broken
**Status**: Open  
**Impact**: Critical - Conditional logic not working properly
**Description**: When users answer questions, the facts from answer options aren't being processed correctly, causing questions like `os_selection` to remain visible even after `os_confirmed: true` is set.

**Root Cause**: Answer processing in `answerQuestion()` method not properly updating facts state.

**Test Case**: `os-detection-flow-debug.test.ts` - shows `os_selection` still visible after confirming Windows.

**Next Steps**: 
1. Debug `answerQuestion()` method in store
2. Verify facts extraction from answer options
3. Ensure conditional engine uses updated facts
4. Test with Windows/macOS/Linux confirmation flow

---

### 🚨 P0: Test Suite Failures (9 Failed Tests)
**Status**: Open
**Impact**: High - Prevents confident deployment
**Description**: Multiple test failures including scoring system, suite unlocking, and performance tests.

**Failed Tests**:
- Question Transitions are Smooth - Automated (2 failures)
- Component State Visual Consistency - Automated  
- OS Detection Flow Debug
- Suite Unlocking Integration (2 failures)
- Facts-Based Architecture Journey tests (3 failures)

**Next Steps**:
1. Fix answer processing facts pipeline (addresses most failures)
2. Update scoring system tests for new architecture
3. Fix React act() warnings in test suite
4. Verify suite unlocking logic with new facts system

---

## Medium Priority Cleanup

### 🧹 P1: Debug Artifacts Cleanup  
**Status**: Open
**Impact**: Medium - Code quality/professionalism
**Description**: 50+ console.log statements throughout codebase, 6 debug test files

**Items to Clean**:
- Remove console.log statements from production code
- Keep essential logging, remove development debug logs
- Organize debug test files per `.spec.ts`/`.test.ts` policy
- Remove or properly name temporary test files

**Next Steps**:
1. `grep_search` for console.log statements
2. Clean up production code logging
3. Rename/remove debug test files
4. Update test organization documentation

---

### 🧹 P1: React Testing Warnings
**Status**: Open  
**Impact**: Medium - Developer experience
**Description**: 100+ React act() warnings in test output

**Root Cause**: React state updates in tests not properly wrapped in `act()`

**Next Steps**:
1. Wrap state updates in tests with `act()`
2. Update testing utilities for proper async handling
3. Add ESLint rules to prevent future act() issues

---

## Low Priority Enhancements

### 🎯 P2: Performance Optimizations
**Status**: Future
**Impact**: Low - Performance improvements
**Description**: Optimize conditional logic evaluation, reduce unnecessary re-renders

### 🎯 P2: Enhanced Error Handling  
**Status**: Future
**Impact**: Low - Better user experience
**Description**: Add error boundaries, better error messages, graceful degradation

---

## Completed ✅

### ✅ Device Detection Facts Injection
**Status**: Complete  
**Implementation**: Store initialization now injects device detection facts at startup
**Verification**: Debug tests confirm os_detected, browser_detected, device_type facts are set

### ✅ Modular Question Bank Architecture
**Status**: Complete
**Implementation**: Questions split into priorities.ts, onboarding.ts, coreAssessment.ts with barrel exports
**Verification**: Question loading and conditional logic working with modular structure

### ✅ Facts Integration Enhancement
**Status**: Complete  
**Implementation**: Added `injectFact()` method for direct fact injection without answer processing
**Verification**: Device facts properly injected and available to conditional logic

---

## Next Session Priorities

1. **Fix answer processing facts pipeline** - Addresses most critical issues
2. **Clean up console.log statements** - Professional code quality  
3. **Resolve test failures** - Get back to green test suite
4. **React act() warnings** - Clean developer experience

**Estimated Time**: 2-3 hours for core fixes, additional time for cleanup and optimization.
