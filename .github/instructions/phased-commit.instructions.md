---
applyTo: '**/*.*`'
---


### The Phased Commit Process

#### Step A) 🎯 Stage Progress to Protect It
```bash
git add .
```
**Rationale**: Protect working progress before switching to critical review mode. Staging creates a checkpoint.

#### Step B) 🔍 Change Hats - Become a Critical Reviewer

**🚨 MANDATORY MINDSET SHIFT**: Stop being the implementer. Become a highly critical and skeptical reviewer whose job is to PROTECT THE CODEBASE from bad decisions.

**Critical Review Checklist - MUST CHECK ALL:**

**📋 Duplication & Redundancy Analysis:**
- [ ] Check for duplicate test patterns using `grep_search` across test files
- [ ] Look for similar functionality already implemented elsewhere
- [ ] Verify we're not recreating existing utilities or patterns
- [ ] Search for redundant API calls or test coverage

**📋 Architectural Violations:**
- [ ] Does this follow established naming conventions?
- [ ] Are files placed in correct directories/folders?
- [ ] Does this violate DRY (Don't Repeat Yourself) principles?
- [ ] Are we introducing inconsistent patterns?

**📋 Code Quality Anti-Patterns:**
- [ ] Look for Console.WriteLine in tests (should use proper test output)
- [ ] Check for hardcoded values that should be constants
- [ ] Verify error handling follows established patterns
- [ ] Look for overly complex parameter manipulation (code smell)

**📋 Test Organization Issues:**
- [ ] Are test files named consistently? (plural vs singular)
- [ ] Are tests in appropriate folders/namespaces?
- [ ] Do we have overlapping test coverage without justification?
- [ ] Are verify tests used appropriately vs simple assertions?

**📋 Regression & Integration Risks:**
- [ ] Does this change break existing functionality?
- [ ] **FULL regression test executed** - ALL tests passing
- [ ] Are there any obvious performance implications?
- [ ] Does this preserve the "building blocks" foundation?
- [ ] Are there any breaking API changes?
- [ ] **NO test failures** - complete test suite clean

**🚨 CRITICAL REVIEWER QUESTIONS TO ASK:**
- "Why are we adding this when X already exists?"
- "What problem does this solve that isn't already solved?"
- "Are we making the codebase better or just different?"
- "Would a new developer be confused by this organization?"
- "Is this the simplest solution that could work?"

**Files to Review**:
- All staged changes (`git diff --cached --name-only`)
- Existing similar files (`grep_search` for patterns)
- Related test files and verify existing coverage
- Any architectural documentation that might need updates

**❌ If ANY Issues Found in Review:**
1. **Switch back to developer hat immediately** 
2. **Fix all identified issues**
3. **Start relay race process over from Step A**
4. **DO NOT proceed to Step C until review is clean**

#### Step C) 🧪 **FULL** Regression Testing - **MANDATORY COMPLETE TEST SUITE**
```bash
dotnet test --verbosity minimal
```
**🚨 CRITICAL REQUIREMENT: MUST RUN ALL TESTS - NO SHORTCUTS, NO PARTIAL TESTING**

**FULL regression means**:
- **ALL test projects** must be executed
- **ALL test categories** must pass
- **NO test filtering** - run the complete test suite
- **NO "assume it's fine"** - explicit verification required

**Progressive Improvement Mindset**:
- **Large test failure counts** (50+ failures) indicate **integration challenges**, not panic situations
- **Focus on failure patterns** rather than absolute numbers
- **Methodical progress** over immediate perfection
- **Document baseline** and track **directional improvement**

**Look for**:
- New test failures (regressions) vs. existing integration challenges
- **Pattern analysis**: Are failures clustered in specific areas?
- **Directional progress**: Are we moving from 100→74→50 failures progressively?
- **Critical infrastructure**: Tokenization, basic parsing, core functionality must remain stable

**If you discover test failures during full regression:**
1. **ANALYZE PATTERNS** - categorize failures by type and component
2. **PROGRESSIVE STRATEGY** - address highest-impact areas first
3. **DOCUMENT BASELINE** - record current state for tracking progress
4. **METHODICAL FIXES** - tackle one integration area at a time
5. **VERIFY DIRECTION** - ensure changes move toward fewer, not more failures

#### Step D) 🔄 Iterate or Proceed
**❌ If Issues Found in Critical Review OR Full Regression Failures:**
- **MANDATORY**: Switch back to developer hat
- Fix ALL identified issues (duplication, naming, organization, etc.)
- Fix ALL test failures found during full regression
- **Start relay race over from Step A** (re-stage clean changes)
- **DO NOT skip the critical review** - repeat Step B with fixed changes
- **DO NOT skip full regression** - repeat Step C until all tests pass
- **Never commit known issues, violations, or failing tests**

**✅ If Critical Review is Clean AND Full Regression Passes:**
- All checklist items passed
- No duplication or anti-patterns found  
- Naming and organization consistent
- No architectural violations
- **ALL tests passing** - complete test suite clean
- Proceed to documentation and commit (Step E)

#### Step E) 📚 Document and Commit
```bash
# Stage documentation updates
git add docs/
git add .github/copilot-instructions.md

# Commit with descriptive message
git commit -m "feat: implement X - validated with Y tests passing"
```

**Commit Message Format**:
- `feat:` for new features
- `fix:` for bug fixes  
- `docs:` for documentation only
- `refactor:` for code restructuring
- Include validation info: "X tests passing" or "no regressions"

### 🚨 Critical Success Factors

1. **Never Skip Step B**: The critical review mindset is essential
2. **Stage Before Review**: Protects progress and enables clean diffs
3. **Test Before Commit**: Every commit should be regression-tested
4. **Document Wins**: Update implementation status and lessons learned
5. **Solid Handoffs**: Each commit should be production-ready

### 📈 Success Metrics

- **Reduced Backtracking**: Fewer "oops, that broke everything" moments
- **Stable Progress**: Each commit builds on solid foundation
- **Clear History**: Git log shows logical progression of solid changes
- **Maintained Velocity**: Less time spent fixing regressions means more time on features

**Example of Good Relay Handoff**:
```
feat: implement Product parser fallback - fixes 147 test regression

- Restored Try/Or pattern for single term fallback
- Verified Series extension working (23/23 tests)
- Reduced total failures from 259 to 112
- Updated parser architecture documentation
```

**Commit Message Format**:
- `feat:` for new features
- `fix:` for bug fixes  
- `docs:` for documentation only
- `refactor:` for code restructuring
- Include validation info: "X tests passing" or "no regressions"

### 🚨 Critical Success Factors

1. **Never Skip Step B**: The critical review mindset is essential
2. **Stage Before Review**: Protects progress and enables clean diffs
3. **Test Before Commit**: Every commit should be regression-tested
4. **Document Wins**: Update implementation status and lessons learned
5. **Solid Handoffs**: Each commit should be production-ready

### 📈 Success Metrics

- **Reduced Backtracking**: Fewer "oops, that broke everything" moments
- **Stable Progress**: Each commit builds on solid foundation
- **Clear History**: Git log shows logical progression of solid changes
- **Maintained Velocity**: Less time spent fixing regressions means more time on features

**Example of Good Relay Handoff**:
```
feat: implement Product parser fallback - fixes 147 test regression

- Restored Try/Or pattern for single term fallback
- Verified Series extension working (23/23 tests)
- Reduced total failures from 259 to 112
- Updated parser architecture documentation
```
