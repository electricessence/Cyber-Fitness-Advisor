# Question Authoring Guide

## Overview

Questions are the heart of the Cyber Fitness Advisor experience. This guide covers how to create engaging, impactful security assessment questions that follow our "quick wins first" philosophy and support conditional visibility through the gate system.

## Question Schema v2

### Basic Structure
```json
{
  "id": "unique_identifier",
  "type": "YN" | "SCALE",
  "weight": 1-10,
  "text": "Your question here?",
  "quickWin": boolean (optional),
  "timeEstimate": "2 minutes" (optional),
  "explanation": "Why this matters..." (optional),
  "actionHint": "How to do this..." (optional),
  "gates": [ // NEW: Conditional visibility gates
    {
      "all": [{"questionId": "prereq", "when": "equals", "value": "yes"}],
      "show": ["follow_up_question"],
      "hide": ["basic_question"],
      "patch": {"target_q": {"text": "Modified question text"}},
      "unlockSuites": ["advanced_suite"]
    }
  ]
}
```

## Gate System

### Gate Structure
Each gate can contain:
- **Conditions**: `all`, `any`, `none` arrays with logic operators
- **Actions**: `show`, `hide`, `patch`, `unlockSuites` to take when gate passes

### Comparators
- **`equals`** / **`not_equals`**: Exact value matching
- **`in`** / **`not_in`**: Value in array: `{"values": ["yes", "maybe"]}`
- **`contains`** / **`not_contains`**: Substring or array element matching
- **`exists`** / **`not_exists`**: Check if answer exists
- **`greater_than`** / **`less_than`** / **`greater_equal`** / **`less_equal`**: Numeric comparisons
- **`truthy`** / **`falsy`**: Boolean evaluation (useful for any non-empty value)

### Visibility Rules
1. **Default**: Questions without gates are always visible
2. **Any Gate Passes**: Question is visible if ANY gate passes
3. **Hide Overrides Show**: Hide actions always take precedence over show actions
4. **Deterministic**: Conflicts resolved by question ID alphabetical order

### Field Definitions

#### `id` (required)
- **Format**: Lowercase, underscore-separated
- **Pattern**: `{domain}_{concept}` or `{domain}_{concept}_{variant}`
- **Examples**: `acct_mfa`, `device_encryption`, `backup_frequency`
- **Must be globally unique across all domains**

#### `type` (required)
- **`"YN"`**: Yes/No questions for binary security practices
- **`"SCALE"`**: 1-5 scale for behavioral/frequency questions
- **Choose YN for**: "Do you use X?", "Is Y enabled?"
- **Choose SCALE for**: "How often do you...?", "How careful are you...?"

#### `weight` (required)
- **Range**: 1-10 (integers only)
- **Guidelines**:
  - **9-10**: Critical security fundamentals (MFA on banking, password manager, backups)
  - **7-8**: Important security practices (device encryption, antivirus, regular updates)
  - **5-6**: Good security hygiene (unique passwords, safe browsing)
  - **3-4**: Advanced or situational practices (VPN usage, network segmentation)
  - **1-2**: Minor improvements or very specific scenarios

#### `quickWin` (optional)
- **When to use**: High security impact + Low effort/time + Immediate benefit
- **Criteria for Quick Win**:
  - ✅ Can be completed in 10 minutes or less
  - ✅ Provides substantial security improvement
  - ✅ Uses built-in tools or free services
  - ✅ Doesn't require technical expertise
  - ❌ Avoid for: Complex configurations, paid services, organizational changes

#### `timeEstimate` (optional but recommended for Quick Wins)
- **Format**: Natural language time descriptions
- **Examples**: "1 minute", "5 minutes", "10 minutes", "30 seconds"
- **Guidelines**:
  - Be realistic - test the time estimate yourself
  - Include time to find the setting, not just to toggle it
  - Round up rather than down to avoid frustration

#### `explanation` (optional but recommended)
- **Purpose**: Help users understand WHY this matters
- **Length**: 1-2 sentences maximum
- **Focus on**: Risk mitigation, real-world impact, peace of mind
- **Examples**:
  - ✅ "Prevents unauthorized access if you walk away from your device"
  - ✅ "Your email is the key to password resets for all other accounts"
  - ❌ "According to NIST framework 2.0 authentication guidelines..."

#### `actionHint` (optional but recommended)
- **Purpose**: Tell users HOW to implement this
- **Format**: Specific, actionable steps
- **Be platform-agnostic when possible**
- **Examples**:
  - ✅ "Go to Settings > Update & Security > Turn on automatic updates"
  - ✅ "Install uBlock Origin from your browser's extension store"
  - ❌ "Configure your security settings appropriately"

## Writing Effective Questions

### Question Text Guidelines

#### 1. Be Clear and Direct
```json
// ✅ Good
"Do you have automatic updates enabled on your devices?"

// ❌ Too vague  
"Are your systems configured for optimal patch management?"
```

#### 2. Use Everyday Language
```json
// ✅ Good
"Do you use different passwords for different accounts?"

// ❌ Too technical
"Have you implemented unique credential policies across authentication domains?"
```

#### 3. Focus on Behavior, Not Knowledge
```json
// ✅ Good - tests actual behavior
"Do you check for the lock icon (HTTPS) when entering sensitive information?"

// ❌ Knowledge test
"Do you know what HTTPS means?"
```

#### 4. Make the Scope Clear
```json
// ✅ Good - specific scope
"Is 2FA enabled on your main email account?"

// ❌ Too broad
"Do you use 2FA?"
```

### Scale Questions (1-5)

For SCALE questions, define the scale clearly:

#### Frequency Scales
```json
{
  "text": "How often do you backup important data? (1=Never, 5=Daily/Automatic)",
  "type": "SCALE"
}
```

#### Behavior Scales  
```json
{
  "text": "How careful are you with email attachments? (1=Open everything, 5=Very cautious)",
  "type": "SCALE"
}
```

#### Quality/Compliance Scales
```json
{
  "text": "What percentage of your accounts use unique passwords? (1=None, 5=All)",
  "type": "SCALE"
}
```

## Question Organization

### Domain Structure

Each domain should progress logically through security maturity:

#### Level 0: Essential Basics
- Focus on **quick wins** with maximum impact
- Built-in tools and free services
- 2-10 minute time commitments
- Universal applicability

#### Level 1: Building Good Habits  
- Slightly more effort or time investment
- May require downloading free tools
- 10-30 minute time commitments
- Reinforces Level 0 practices

#### Level 2: Advanced Protection
- Specialized tools or configurations
- May require some technical comfort
- 30+ minute time commitments  
- Situational based on user needs

### Example Domain Progression

**Account Security Domain:**
```json
{
  "id": "account",
  "title": "Account Security",
  "levels": [
    {
      "level": 0,
      "questions": [
        {
          "id": "email_mfa",
          "type": "YN", 
          "weight": 10,
          "quickWin": true,
          "timeEstimate": "5 minutes",
          "text": "Is two-factor authentication enabled on your main email?"
        },
        {
          "id": "browser_passwords", 
          "type": "YN",
          "weight": 8,
          "quickWin": true,
          "timeEstimate": "3 minutes",
          "text": "Do you let your browser save and generate passwords?"
        }
      ]
    },
    {
      "level": 1,
      "questions": [
        {
          "id": "password_uniqueness",
          "type": "SCALE",
          "weight": 7, 
          "text": "What percentage of accounts use unique passwords? (1=None, 5=All)",
          "actionHint": "Use your browser's password generator for new accounts"
        }
      ]
    }
  ]
}
```

## Quick Win Identification

### Quick Win Checklist
For a question to qualify as a Quick Win, it should meet ALL criteria:

- [ ] **Impact**: Weight of 6 or higher
- [ ] **Time**: Completable in 10 minutes or less  
- [ ] **Cost**: Free or uses existing tools
- [ ] **Skill**: No specialized technical knowledge required
- [ ] **Immediate**: Provides instant security improvement
- [ ] **Universal**: Applicable to most users

### Quick Win Examples

#### ✅ Excellent Quick Wins
- Enable automatic updates (built-in, 2 minutes)
- Turn on screen lock (built-in, 1 minute)  
- Use browser password manager (built-in, 3 minutes)
- Enable 2FA on email using phone (SMS, 5 minutes)
- Install ad blocker (free extension, 2 minutes)

#### ❌ Not Quick Wins
- Set up hardware security key (requires purchase)
- Configure VPN (requires service, setup time)
- Set up NAS backup system (expensive, complex)
- Network segmentation (requires networking knowledge)
- Enterprise password manager (requires paid service)

## Testing Your Questions

### User Testing Checklist
Before submitting new questions:

1. **Time Test**: Actually perform the action and measure time
2. **Clarity Test**: Can a non-technical person understand the question?
3. **Action Test**: Are the instructions clear and accurate?
4. **Impact Test**: Does completing this meaningfully improve security?
5. **Frustration Test**: Will users get stuck or confused?

### Question Quality Criteria

#### Excellent Questions
- Clear, specific, actionable
- Appropriate weight for security impact  
- Helpful explanations and hints
- Realistic time estimates
- Positive user experience

#### Poor Questions  
- Vague or confusing language
- Weight doesn't match impact
- Missing context or instructions
- Unrealistic expectations
- Technical jargon

## Common Pitfalls

### 1. The "Perfect Security" Trap
❌ Don't ask about enterprise-grade security for home users
❌ Don't require paid services or specialized hardware
✅ Focus on practical, achievable improvements

### 2. The "Knowledge Test" Trap
❌ "Do you know what phishing is?"
✅ "How often do you verify sender identity before clicking email links?"

### 3. The "Overwhelm" Trap  
❌ Don't start with complex, time-intensive tasks
✅ Build momentum with quick, satisfying wins

### 4. The "Guilt Trip" Trap
❌ "Are you recklessly endangering your data by not using enterprise backup solutions?"
✅ "Do you backup important files like photos and documents?"

## Browser Security Questions

### Browser-Specific Security Features

Our assessment includes browser-specific security questions that leverage native security features unique to each browser. These questions are contextually shown based on user's detected browser or manual selection.

#### Edge SmartScreen Questions
```json
{
  "id": "edge_smartscreen",
  "phase": "assessment", 
  "priority": 500,
  "statement": "Edge SmartScreen Protection Enabled",
  "text": "Is Microsoft Defender SmartScreen enabled in Edge?",
  "tags": ["browser", "security", "edge", "microsoft"],
  "options": [
    {
      "id": "yes",
      "text": "✅ Yes, SmartScreen is enabled",
      "points": 8,
      "facts": { "edge_smartscreen": true, "browser_security": "high" }
    }
  ]
}
```

#### Safari Intelligent Tracking Prevention
```json
{
  "id": "safari_itp", 
  "phase": "assessment",
  "priority": 500,
  "statement": "Safari ITP Privacy Protection",
  "text": "Is Intelligent Tracking Prevention enabled in Safari?",
  "tags": ["browser", "privacy", "safari", "apple"],
  "facts": { "safari_itp": true, "privacy_protection": "enhanced" }
}
```

#### Firefox Enhanced Tracking Protection
```json
{
  "id": "firefox_tracking_protection",
  "phase": "assessment", 
  "priority": 500,
  "statement": "Firefox Enhanced Tracking Protection",
  "text": "Is Enhanced Tracking Protection enabled in Firefox?",
  "tags": ["browser", "privacy", "firefox", "mozilla"],
  "facts": { "firefox_etp": true, "privacy_protection": "enhanced" }
}
```

### Browser Security Tags

**Browser-specific tags:**
- `edge` - Microsoft Edge specific features
- `safari` - Safari/WebKit specific features  
- `firefox` - Firefox/Gecko specific features
- `chrome` - Chrome/Chromium specific features

**Security feature tags:**
- `smartscreen` - Microsoft Defender SmartScreen
- `itp` - Intelligent Tracking Prevention
- `etp` - Enhanced Tracking Protection
- `password_manager` - Browser password management
- `browser_security` - General browser security features

### Browser Detection Integration

Browser security questions use conditional visibility based on:
1. **Auto-detection** from browser user agent
2. **Manual confirmation** through onboarding questions
3. **Cross-platform support** for users with multiple browsers

Questions include appropriate `gates` to show only relevant browser features to users.

## Contribution Process

### Adding New Questions
1. **Research**: Verify security impact and implementation effort
2. **Draft**: Write questions following this guide
3. **Test**: Validate time estimates and instructions  
4. **Review**: Check against quality criteria
5. **Submit**: Create pull request with clear rationale

### Updating Existing Questions
- Preserve question `id` to maintain user progress
- Update `weight` if security landscape changes
- Refresh `actionHint` if tools/methods improve
- Add `quickWin` flag if processes become easier

### Question Retirement
- Mark as deprecated rather than deleting
- Provide migration path for user progress
- Document reason for retirement

Remember: Great questions balance security impact with user experience. They should make users feel empowered and successful, not overwhelmed or inadequate.
