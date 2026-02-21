# User Journeys - Cyber Fitness Advisor

> Looking for the **implemented** content map (question IDs, ordering policy, branch logic)?
> Start with **docs/CONTENT_FLOW_TREE.md**.
>
> This file is useful for scenario thinking and UX intent, but parts may be more descriptive/aspirational than the current question bank.

## Overview
This document outlines expected user journeys to validate the conditional logic, facts system, and overall user experience.

## Bootstrap & Initialization

### App Startup Sequence
1. **Device Detection** (automatic, immediate) - establishes baseline facts
2. **Store Initialization** - loads/rebuilds facts from localStorage
3. **Onboarding Check** - determines if privacy notice + onboarding needed
4. **First Question Priority** - privacy notice always has priority 10000

### Detection Facts (Preserved Through Resets)
These facts are established once and survive "Start Over":
```typescript
interface DetectedFacts {
  "detected_os": "windows" | "macos" | "linux" | "unknown";
  "detected_browser": "chrome" | "firefox" | "safari" | "edge" | "unknown";
  "device_type": "desktop" | "mobile" | "tablet";
  "screen_size": "large" | "medium" | "small";
  "user_agent": string;
  "detection_timestamp": Date;
}
```

### Privacy Notice - First Question Design
**Priority**: 10000 (always shows first)
**Visual**: Full-screen modal overlay
**Purpose**: Educational privacy-first introduction
**Single Action**: "Start My Security Assessment"
**Facts Created**: `{ "privacy_notice_accepted": true, "onboarding_started": true }`

The privacy notice serves as both consent and education, explaining:
- Local-only data storage
- No tracking/analytics
- Purpose and benefits of assessment
- What to expect in the process

---

## Journey 1: New Windows User - Complete Onboarding Flow

### Initial State
- No localStorage data
- Fresh browser session
- Windows PC detected (desktop browser)

### Expected Flow

#### Phase 1: Privacy & Education (Level 0 - Onboarding Start)
1. **Privacy Notice & Education** → Full-screen modal with:
   - **Privacy Statement**: "Your data never leaves your device. Everything is stored locally in your browser."
   - **Educational Blurb**: "This assessment helps you understand your digital security posture. We'll guide you through simple improvements that make a big difference."
   - **Call to Action**: "Start Your Security Assessment" button
   - **Dismissal**: Sets `privacy-notice-dismissed` in localStorage

#### Phase 2: Device & Comfort Assessment (Level 0 - Onboarding Core)
2. **Desktop OS Detection** → "We detected Windows. Is this correct?" → User clicks "Yes"
   - **Facts Set**: `{ "os": "windows", "os.confirmed": true, "device_type": "desktop" }`
   - **Conditional Logic**: `os_selection` question should be HIDDEN

3. **Browser Detection** → "We detected Chrome. Is this correct?" → User clicks "Yes" 
   - **Facts Set**: `{ "detected_browser": "chrome", "browser.confirmed": true }`

4. **Tech Comfort Level** → "How comfortable are you with technology?"
   - Options: "Very comfortable" | "Somewhat comfortable" | "Not very comfortable" | "I prefer simple solutions"
   - **Facts Set**: `{ "tech_comfort": "advanced|intermediate|beginner|simple" }`

5. **Mobile Device Check** → "Do you also use a smartphone or tablet for important activities?"
   - Yes → Follow-up: "What type?" (iOS/Android/Both)
   - **Facts Set**: `{ "has_mobile": true, "mobile_os": "ios|android|both" }`
   - No → **Facts Set**: `{ "has_mobile": false }`

6. **Usage Context** → "What do you primarily use your devices for?" (Multi-select)
   - Work/Business | Personal/Family | Banking/Finance | Social Media | Shopping | Entertainment
   - **Facts Set**: `{ "usage_context": ["work", "personal", "banking", ...] }`

#### Phase 3: Level 1 - Browser Security Foundation (Immediate Value)

The **first Level 1 priority** focuses entirely on **browsing security** because it's:
- Easy to implement (minutes, not hours)
- High impact on daily security
- Foundation for everything else online

##### Browser Assessment & Optimization Flow

7. **Browser Confirmation & Education** → "You're using [Browser]. Let's talk about browser privacy..."
   - **Chrome Users**: Educational blurb about privacy concerns, anti-ad-block stance
     - "Chrome is widely used but has significant privacy limitations. Google profits from tracking your browsing and is actively hostile to ad-blockers. Consider Firefox, LibreWolf, or Brave for better privacy."
     - Follow-up: "Would you be interested in switching to a privacy-focused browser?" Y/N
   - **Edge Users**: Balanced assessment with Microsoft Store advantage
     - "Edge is Microsoft's improved browser - much better than Chrome for privacy, but still involves Microsoft tracking. However, Edge has a great advantage: you can easily install uBlock Origin through the Microsoft Store, making it simple and trustworthy. Even if you switch browsers later, having uBlock Origin in Edge is smart since you might use it accidentally."
     - Follow-up: "Would you like to keep using Edge with privacy improvements, or consider a more privacy-focused browser?" Keep Edge & Optimize | Consider Alternatives
   - **Firefox Users**: Positive reinforcement + optimization path
     - "Excellent choice! Firefox is privacy-focused and open source. Let's optimize your setup."
   - **Safari Users**: Privacy concerns + migration recommendation
     - "Safari has decent privacy basics on Apple devices, but we strongly recommend switching to Firefox or Brave. Apple's ecosystem lock-in and WebKit limitations reduce your privacy control options compared to more open alternatives."
     - Follow-up: "Would you be open to trying Firefox or Brave for better privacy control and more security options?" Y/N
   - **Brave/LibreWolf Users**: "Outstanding choice! You're already using a privacy-optimized browser with built-in ad-blocking."

8. **Browser Privacy Rating Education** → Interactive explanation:
   - **Tier 1 (Best)**: Firefox, LibreWolf, Brave - "Privacy by design"
     - **LibreWolf**: "Firefox hardened for privacy with uBlock Origin pre-installed"
     - **Brave**: "Privacy-focused with built-in ad-blocking and tracking protection"
     - **Firefox**: "Open source, privacy-focused, highly customizable"
   - **Tier 2 (Good with caveats)**: Edge, Safari - "Better than Chrome, but corporate limitations"
     - **Edge**: "Microsoft's improved browser, much better than Chrome, easy uBlock Origin installation through MS Store, but still Microsoft tracking"
     - **Safari**: "Apple privacy basics, but ecosystem lock-in and WebKit limitations reduce privacy control options"
   - **Tier 3 (Privacy concerns)**: Chrome, Opera - "Tracking-focused business models"
     - **Chrome**: "Google's primary data collection tool, actively hostile to ad-blockers"
     - **Opera**: "Owned by Chinese consortium, privacy concerns"
   - **Facts Set**: `{ "browser_privacy_tier": "1|2|3", "understands_browser_privacy": true }`

9. **Ad-Blocker Assessment** → "Do you use an ad-blocker?" 
   - **No** → Educational blurb: "Ad-blockers prevent malicious ads, tracking, and speed up browsing. They're essential security tools."
     - Follow-up: **"Would you be willing to install an ad-blocker?"**
       - **"Yes"** → **Task Unlocked**: "Do you want help installing uBlock Origin?"
         - "It's already installed" → **Facts Set**: `{ "ad_blocker": true, "ad_blocker_type": "ublock", "task_completed": "ublock_install" }`
         - "No, I got this" → **Facts Set**: `{ "ad_blocker_intent": true, "self_directed": true }` → **Follow-up tracking task** unlocked
         - **"Yes, I need help"** → **TASK QUESTION UNLOCKED**: Interactive installation guide
       - **"No"** → Educational content + **Facts Set**: `{ "ad_blocker_declined": true, "understands_ad_blocking": true }`
   - **Yes** → "Which ad-blocker do you use?"
     - **uBlock Origin** → "Excellent choice! The gold standard for ad-blocking."
     - **AdBlock Plus** → **Task Unlocked**: "Want help upgrading to uBlock Origin for better protection?"
     - **Built-in browser blocker** → **Task Unlocked**: "Want help installing uBlock Origin for superior protection?"
     - **Other/Not sure** → **Task Unlocked**: "Want help confirming you have the best ad-blocker setup?"

### **Task Question System Design**

#### **Task Question: uBlock Origin Installation Guide**
**Triggered by**: "Yes, I need help" installing ad-blocker
**Question Type**: `task` (different UI treatment - expandable, visual, interactive)
**Display Features**: 
- **Expandable how-to section** with browser-specific installation steps
- **Video/GIF demonstrations** for visual learners  
- **Direct links** to browser extension stores (Chrome Web Store, Firefox Add-ons, MS Store for Edge)
- **Troubleshooting section** for common issues
- **Progress indicators** showing installation steps

**Answer Options**:
- **"It's installed now!"** → **Facts Set**: `{ "ad_blocker": true, "ad_blocker_type": "ublock", "task_completed": "ublock_install", "needed_help": true }` → **🎉 Celebration/Badge unlocked**
- **"Remind me later"** → **Facts Set**: `{ "task_deferred": "ublock_install", "reminder_requested": true }` → **Scheduling system activated** (24-48 hour reminder)
- **"I'm not doing it"** → **Facts Set**: `{ "task_declined": "ublock_install", "ad_blocker_declined": true }` → **No judgment, just facts recorded**

#### **Follow-up Task Question: Installation Confirmation** (Self-directed users)
**Triggered by**: "No, I got this" users after 24-48 hours
**Question**: "How did the ad-blocker installation go?"
**Answer Options**:
- **"Successfully installed uBlock Origin"** → Same celebration as guided install + **Facts Set**: `{ "task_completed": "ublock_install", "self_directed_success": true }`
- **"Installed a different ad-blocker"** → Follow-up about which one + optimization task offers
- **"Haven't done it yet"** → **Task Re-offered**: "Want help now?" or "Remind me again later"
- **"Decided not to"** → Facts recorded, no pressure, other security measures emphasized

10. **Ad-Blocker Education & Optimization**:
    **Content adapts based on previous answers and completed tasks**
    - **Successfully installed uBlock Origin**: Advanced configuration tips, filter list recommendations
    - **Has different ad-blocker**: Educational comparison + upgrade task available
    - **Built-in (Brave/LibreWolf)**: "Perfect! Your browser comes with excellent built-in ad-blocking."
    - **Built-in (Edge/Safari)**: Task offer to supplement with uBlock Origin
    - **Declined installation**: Emphasize other security measures, gentle revisit option available later

##### Browser-Specific Optimization Paths

**Firefox Users** (Tier 1 Path):
11. **Firefox Hardening** → "Let's optimize Firefox for maximum privacy:"
    - Enable Enhanced Tracking Protection (Strict mode)
    - Install uBlock Origin extension (if not present)
    - Configure DNS-over-HTTPS
    - Disable telemetry and data collection
    - **Facts Set**: `{ "firefox_hardened": true, "dns_over_https": true }`

**LibreWolf/Brave Users** (Tier 1 Path):
11. **Already Optimized** → "You're using an excellent privacy-focused browser!"
    - **LibreWolf**: "Pre-hardened Firefox with uBlock Origin built-in - perfect setup!"
    - **Brave**: "Built-in ad-blocking and privacy features - great choice!"
    - **Optional enhancements**: DNS-over-HTTPS, additional privacy extensions
    - **Facts Set**: `{ "privacy_browser_optimal": true, "ad_blocker_builtin": true }`

**Edge Users** (Tier 2 Path):
11. **Edge Optimization** → "Let's enhance Edge's privacy while keeping it user-friendly:"
    - **Microsoft Store uBlock Origin**: "Install uBlock Origin directly from Microsoft Store - it's safe, easy, and Microsoft-verified! Even if you switch browsers later, having uBlock Origin in Edge is smart since you might accidentally open links in Edge."
    - Enable Enhanced Security in Edge settings
    - Configure DNS-over-HTTPS 
    - Disable Microsoft tracking where possible
    - **Migration suggestion**: "Edge is much better than Chrome, but consider trying Firefox or Brave for even better privacy"
    - **Facts Set**: `{ "edge_optimized": true, "microsoft_store_ublock": true, "accidental_usage_protected": true }`

**Chrome Users** (Tier 3 Migration Path):
11. **Chrome Mitigation + Strong Migration Push** → "Chrome has significant privacy issues. Let's minimize damage and plan your upgrade:"
    - Install uBlock Origin (explain Google's resistance and future blocking plans)
    - Disable sync with Google account for browsing history
    - Use Incognito mode more frequently
    - **Strong Recommendation**: "Chrome will soon block uBlock Origin. Switch to Firefox, Brave, or even Edge for better privacy and continued ad-blocking"
    - **Facts Set**: `{ "chrome_mitigation_applied": true, "migration_strongly_recommended": true }`

**Safari Users** (Tier 2 Path):
11. **Safari Limitations + Migration Push** → "Safari has decent privacy basics, but we strongly recommend upgrading:"
    - Enable existing privacy features (Intelligent Tracking Prevention, etc.)
    - **Explain limitations**: "Safari uses WebKit which limits extension capabilities. Apple's ecosystem lock-in reduces your privacy control options compared to Firefox or Brave."
    - **Strong migration recommendation**: "We strongly encourage switching to Firefox or Brave for better privacy control, more security options, and proper uBlock Origin support."
    - **iPhone users**: "Keep Safari on your phone if you prefer, but use Firefox/Brave on your computer for better privacy control."
    - **Mac users**: "Don't feel locked into Safari just because you use Mac - Firefox and Brave work excellently on macOS with better privacy features."
    - **Facts Set**: `{ "safari_limitations_explained": true, "migration_strongly_recommended": true, "webkit_concerns_addressed": true }`

## **Game-Like Task System Architecture**

### **Task Types & Flow**

#### **Assessment Questions** → **Task Questions** → **Follow-up/Confirmation**
1. **Assessment Question**: "Do you use a password manager?" 
   - Answer: "No" 
2. **Educational Context**: Brief explanation of why password managers matter
3. **Willingness Check**: "Would you be willing to try a password manager?"
   - Yes → **Task Unlocked**
4. **Task Question**: "Do you want help setting up a password manager?"
   - "It's already set up" → Task completed
   - "No, I got this" → Self-directed tracking
   - **"Yes, I need help"** → **Interactive task guide unlocked**
5. **Follow-up Confirmation** (24-48 hours later): "How did the password manager setup go?"

### **Task Question Design Principles**

#### **Visual & Interactive Elements**:
- **Expandable content sections** (collapsed by default, click to expand)
- **Step-by-step visual guides** with screenshots/GIFs  
- **Progress indicators** showing completion steps
- **Direct action buttons** (links to downloads, settings pages)
- **Troubleshooting accordions** for common issues
- **Estimated time indicators** ("This takes about 3 minutes")

#### **Answer Options Philosophy**:
- **"It's done!"** → Celebration, badge unlock, facts recorded
- **"Remind me later"** → Respectful scheduling, no nagging
- **"I'm not doing it"** → No judgment, facts recorded, alternative suggestions

#### **Task Completion Celebration**:
- **Visual feedback** (checkmarks, progress bars, badges)
- **Security score impact** clearly shown  
- **Next suggested task** offered (optional, not forced)
- **Social proof** ("Join the 78% of users who use ad-blockers!")

### **Extended Task Examples**

#### **Firefox Hardening Task**
**Triggered by**: Firefox users who want optimization help
**Task Content**: 
- **Step 1**: Enable Enhanced Tracking Protection (Strict) - *30 seconds*
- **Step 2**: Install uBlock Origin - *1 minute* 
- **Step 3**: Configure DNS-over-HTTPS - *2 minutes*
- **Step 4**: Disable telemetry - *1 minute*
**Completion Options**: "All steps complete!" | "Remind me to finish later" | "Too complicated for now"

#### **Edge uBlock Origin Task**  
**Triggered by**: Edge users who want ad-blocker help
**Task Content**:
- **Microsoft Store advantage explained** (safe, verified, easy)
- **Direct link** to MS Store uBlock Origin page
- **Installation walkthrough** with screenshots
- **Verification step** ("Do you see the uBlock Origin icon in your toolbar?")
**Completion Options**: "Installed and working!" | "Need more help" | "Remind me later"

#### **Browser Migration Task**
**Triggered by**: Chrome/Safari users open to switching
**Task Content**:
- **Firefox/Brave download links** 
- **Import bookmarks/passwords guide**
- **Side-by-side comparison** setup
- **"Try it for a week" approach** (not forcing immediate switch)
**Completion Options**: "Successfully switched!" | "Using both browsers now" | "Went back to old browser" | "Still deciding"

#### Level 0 → Level 1 Transition
- **Required Facts**: `onboarding_complete: true`, `device_context: established`
- **No score requirement** - just foundation setting

#### Level 1 → Level 2 Transition  
- **Required Facts**: 
  - `browser_privacy_assessed: true`
  - `ad_blocker: true` OR `understands_ad_blocking: true`
  - `browser_optimized: true` OR `privacy_browser_recommended: true`
- **No score requirement** - focuses on establishing browser security foundation

#### Level 2 → Level 3 Transition
- **Required Facts**: Level 1 facts + password/email security foundations
- **Score consideration**: Higher scores might unlock advanced topics sooner

### Success Criteria
- ✅ Browser privacy education completed before any other Level 1 topics
- ✅ Ad-blocker assessment and education provided
- ✅ Browser-specific optimization paths working
- ✅ Migration recommendations for Chrome users
- ✅ uBlock Origin specifically recommended and explained
- ✅ LibreWolf users get recognition for optimal setup
- ✅ Level progression based on facts, not just scores
- ✅ Educational content builds understanding, not just compliance

---

## Journey 2: Existing User - Return Visit

### Initial State  
- Has existing answers in localStorage
- Facts should be rebuilt from persisted answers
- Completed Level 0 (onboarding) previously
- Some Level 1 questions answered

### Expected Flow
1. **Page Load** → Store initialization rebuilds facts from localStorage
2. **Privacy Notice** → Should NOT appear (already dismissed)
3. **Onboarding Skip** → Level 0 questions should NOT appear (already completed)
4. **Current Progress** → Shows where user left off:
   - If in Level 1: Continue with remaining quick wins
   - If completed Level 1: Move to Level 2 deeper assessment
5. **Conditional Logic** → Previously confirmed facts still hide appropriate questions

### Success Criteria
- ✅ Facts are rebuilt from localStorage on page load
- ✅ No repeated onboarding experience
- ✅ Conditional logic still works (hidden questions stay hidden)
- ✅ Score and level are preserved
- ✅ Can continue where they left off
- ✅ Progress feels continuous and respectful of time invested

---

## Journey 3: Mobile-First User - Different Device Path

### Initial State
- User visits on mobile device first
- No previous data

### Expected Flow  
1. **Privacy & Education** → Same privacy notice, mobile-optimized
2. **Mobile OS Detection** → "We detected iOS. Is this correct?" → User clicks "Yes"
   - **Facts Set**: `{ "os": "ios", "os.confirmed": true, "device_type": "mobile" }`
3. **Browser Detection** → Mobile Safari detected
4. **Tech Comfort** → Same comfort assessment
5. **Desktop Device Check** → "Do you also use a computer/laptop for important activities?"
   - **Facts Set**: `{ "has_desktop": true, "desktop_os": "windows|macos|linux" }`
6. **Mobile-Optimized Quick Wins**:
   - Phone Screen Lock & Face ID
   - App Store Security Settings  
   - Mobile Password Manager
   - Text Message 2FA Setup
   - App Permission Review

### Success Criteria
- ✅ Mobile-first experience works smoothly
- ✅ Desktop follow-up questions appear
- ✅ Mobile-specific recommendations
- ✅ Touch-optimized interface
- ✅ Same security principles apply

---

## Journey 4: Manual OS Selection - Detection Failed

### Initial State
- OS detection failed or user said "No"
- Need manual OS selection

### Expected Flow
1. **OS Detection** → "We detected Windows. Is this correct?" → User clicks "No"
   - **Facts Set**: `{ "os": "not-windows" }`
2. **OS Selection** → Should APPEAR (exclude condition not triggered)
   - Shows options: Windows, macOS, Linux, Other
   - User selects "macOS"
   - **Facts Set**: `{ "os": "macos", "os.confirmed": true }`
3. **Continue** → OS selection should now be HIDDEN

### Success Criteria  
- ✅ OS selection appears when detection is rejected
- ✅ Manual selection sets correct facts
- ✅ OS selection hides after manual confirmation
- ✅ Appropriate OS-specific content shown

---

## Journey 4: Power User - Quick Completion Path

### Initial State
- Security-savvy user
- Desktop computer
- Wants efficient assessment

### Expected Flow
1. **Privacy Notice** → Quickly reads and dismisses (appreciates privacy-first approach)
2. **Rapid Onboarding** → Confirms detections, selects "Very comfortable" with tech
3. **Device Setup** → Has both desktop and mobile, multiple usage contexts
4. **Level 1 Quick Wins** → Already has most implemented:
   - Password Manager: "Yes, I use 1Password"
   - Updates: "Yes, fully automatic"  
   - Screen Lock: "Yes, with biometric"
   - Antivirus: "Yes, built-in + premium"
   - 2FA Email: "Yes, authenticator app"
5. **Rapid Level Progression** → Moves quickly to Level 2+ deeper questions
6. **Advanced Topics** → Gets questions about:
   - VPN usage
   - Encrypted communications  
   - Network security
   - Privacy tools
   - Backup encryption

### Success Criteria
- ✅ Efficient flow respects their expertise
- ✅ Level progression works smoothly
- ✅ Advanced questions appear for high comfort level
- ✅ High scores calculated correctly
- ✅ Reaches "Expert" or "Paranoid" security levels
- ✅ Gets nuanced recommendations, not basic advice

---

## Journey 5: Beginner User - Learning & Growth Path

### Initial State  
- Non-technical user
- Single device (desktop)
- Feels overwhelmed by security

### Expected Flow
1. **Reassuring Privacy Notice** → Emphasizes "no judgment, just improvement"
2. **Gentle Onboarding** → Confirms basic detection, selects "I prefer simple solutions"
3. **Simple Device Questions** → Basic setup questions, clear language
4. **Level 1 - Guided Quick Wins** → Educational approach:
   - Password Manager: "No" → Gets simple explanation of why it matters + easy setup steps
   - Updates: "I'm not sure" → Gets explanation of automatic updates + guide
   - Screen Lock: "What's that?" → Gets explanation + step-by-step setup
   - Each answer provides immediate educational value
5. **Confidence Building** → Celebrates small wins, shows progress clearly
6. **Paced Learning** → Doesn't overwhelm with advanced topics too quickly

### Success Criteria
- ✅ Non-intimidating language throughout
- ✅ Educational content with every question
- ✅ Clear progress indicators
- ✅ Actionable, simple recommendations
- ✅ Builds confidence rather than highlighting gaps
- ✅ Respects learning pace and technical comfort

---

## Level Progression Framework

### Level 0: Onboarding (Foundation)
- **Goal**: Establish baseline and device context
- **Questions**: Device detection, comfort level, usage patterns, mobile/desktop setup
- **Progression**: Fact-based completion of onboarding sequence
- **Outcome**: User understands tool, feels welcomed, facts established for personalization

### Level 1: Browser Security Foundation (Easy Wins)  
- **Goal**: Secure the browsing experience - foundation for all online activity
- **Focus Areas**: 
  - Browser privacy assessment and education
  - Ad-blocker installation and optimization  
  - Browser-specific security configurations
- **Time Investment**: 2-10 minutes per action
- **Progression Requirements**: 
  - `browser_privacy_assessed: true`
  - `ad_blocker: true` OR `understands_ad_blocking: true`
  - `browser_optimized: true` OR `privacy_browser_recommended: true`
- **Outcome**: Secure, privacy-focused browsing setup established

### Level 2: Authentication & Communication Security  
- **Goal**: Secure identity and communications
- **Focus Areas**:
  - Password managers and strong authentication
  - Email security and 2FA setup
  - Secure communication tools
- **Time Investment**: 5-30 minutes per action
- **Progression Requirements**: Level 1 facts + authentication security facts
- **Outcome**: Strong identity protection and secure communications

### Level 3: System & Network Security (Comprehensive Protection)
- **Goal**: Complete security ecosystem
- **Focus Areas**:
  - System updates and endpoint protection
  - Network security (WiFi, VPN)
  - Data backup and encryption
  - Privacy tools and threat awareness
- **Time Investment**: 15-60 minutes per action
- **Progression**: Score-based for advanced topics
- **Outcome**: Expert-level comprehensive security posture

### Scoring vs. Progression Philosophy

**Fact-Based Progression (Levels 0-2)**:
- Progression based on **understanding and implementation** of key concepts
- Score contributes to **overall security rating** but doesn't gate progress
- Focus on **education and capability building**

**Score-Enhanced Progression (Level 3+)**:
- Higher scores may **unlock advanced topics sooner**
- Score represents **overall security maturity**
- Advanced users can access expert-level content faster

**Score Purpose**:
- **Comparative assessment**: "Where am I relative to others?"
- **Progress motivation**: Shows improvement over time
- **Risk communication**: Helps users understand their security posture
- **Recommendation prioritization**: Higher scores get more nuanced advice

---

## Technical Validation Points

### Privacy Notice Implementation
- [ ] Full-screen modal on first visit
- [ ] Educational content about privacy-first approach
- [ ] Clear explanation of local data storage
- [ ] Sets `privacy-notice-dismissed` flag in localStorage
- [ ] Never shows again after dismissal
- [ ] Mobile-optimized presentation

### Onboarding Flow (Level 0) 
- [ ] Complete 6+ question onboarding sequence
- [ ] Device detection (OS + Browser) working
- [ ] Tech comfort level assessment
- [ ] Mobile/desktop cross-device questions
- [ ] Usage context multi-select
- [ ] All questions marked as `phase: 'onboarding'`
- [ ] Facts properly extracted and stored

### Level Progression System
- [ ] Level 0 = Onboarding (foundation setting)
- [ ] Level 1 = Quick Wins (high-impact, easy actions)
- [ ] Level 2 = Core Security (fundamental practices)
- [ ] Level 3 = Advanced Protection (comprehensive security)
- [ ] Proper level gating (can't skip levels)
- [ ] Clear progress indicators

### Browser Security & Ad-Blocking Implementation (Level 1)
- [ ] Browser privacy tier assessment (Chrome vs Firefox vs Safari)
- [ ] Educational content about browser privacy implications
- [ ] Ad-blocker detection and assessment
- [ ] uBlock Origin specifically recommended with explanation
- [ ] Browser-specific optimization paths (Firefox hardening, Chrome mitigation)
- [ ] LibreWolf recognition as optimal setup
- [ ] Migration recommendations for privacy-hostile browsers

### **Technical Implementation - Enhanced Question Schema**

Rather than creating a separate `TaskQuestion` interface, let's extend the base `Question` type with optional fields for interactive functionality:

```typescript
// Simplified: Let the options define the behavior
interface Question {
  id: string;
  text: string;
  priority: number;
  options: AnswerOption[];  // The options determine how to render
  
  // Optional task enhancement fields
  taskMeta?: {
    estimatedTime: string;
    difficulty: 'easy' | 'medium' | 'advanced';
    helpContent?: HelpContent[];
    celebration?: CelebrationConfig;
  };
  
  conditions?: ConditionalLogic;
}

// UI Logic:
// - 2 options with "Yes"/"No" text → render as yes/no buttons
// - Multiple options → render as list/radio buttons  
// - taskMeta present → render with expandable help content
// - No type field needed!
```

// Modular helper interfaces
interface HelpContent {
  type: 'step' | 'troubleshooting' | 'link';
  title: string;
  description: string;
  visualAid?: {
    type: 'screenshot' | 'gif' | 'video';
    url: string;
    altText: string;
  };
  actionButton?: {
    text: string;
    url: string;
    opensInNewTab: boolean;
  };
}

interface CelebrationConfig {
  message: string;
  badgeUnlocked?: string;
  scoreImpact: number;
  nextSuggestedTask?: string;
}

interface ReminderConfig {
  defaultDelay: number;  // hours
  maxReminders: number;
  reminderMessages: string[];
}
```

### **Benefits of This Approach**:
1. **No artificial type system** - Questions are defined by their actual options
2. **Maximum flexibility** - Any combination of options works
3. **Backward compatible** - Works with existing questions immediately  
4. **UI renders intelligently** - Based on actual content, not predetermined categories
5. **Progressive enhancement** - Add `taskMeta` only when needed

### **Example Usage**:

```typescript
// Regular yes/no question - UI detects 2 options and renders buttons
const basicQuestion: Question = {
  id: "has_password_manager",
  text: "Do you use a password manager?",
  priority: 8000,
  options: [
    { id: "yes", text: "Yes", facts: { "password_manager": true } },
    { id: "no", text: "No", facts: { "password_manager": false } }
  ]
};

// Multi-choice question - UI detects multiple options and renders list
const osSelection: Question = {
  id: "os_selection", 
  text: "Which operating system do you use?",
  priority: 9400,
  options: [
    { id: "windows", text: "Windows", facts: { "os": "windows" } },
    { id: "macos", text: "macOS", facts: { "os": "macos" } },
    { id: "linux", text: "Linux", facts: { "os": "linux" } }
  ]
};

// Task guide question - UI detects taskMeta and renders enhanced interface
const taskQuestion: Question = {
  id: "ublock_install_guide",
  text: "Let's install uBlock Origin together",
  priority: 7999,
  taskMeta: {
    estimatedTime: "2 minutes",
    difficulty: "easy",
    helpContent: [/* installation steps */]
  },
  options: [
    { id: "completed", text: "✅ It's installed!", facts: { "task_completed": "ublock" } },
    { id: "remind_later", text: "⏰ Remind me later", facts: { "task_deferred": "ublock" } }
  ]
};
```

### **Task State Management & Persistence**

```typescript
interface TaskState {
  taskId: string;
  status: 'unlocked' | 'in_progress' | 'completed' | 'deferred' | 'declined';
  unlockedAt: Date;
  completedAt?: Date;
  deferredUntil?: Date;
  reminderCount: number;
  selfDirected: boolean;  // User chose "I got this"
  needsFollowUp: boolean;
  completionMethod: 'guided' | 'self_directed' | 'partial';
}

// Task states persist in localStorage alongside answers and facts
interface UserProgress {
  answers: Record<string, Answer>;
  facts: Record<string, Fact>;
  tasks: Record<string, TaskState>;  // NEW: Task completion tracking
  badges: string[];
  scores: ScoreData;
}
```

### Level Progression Logic
- [ ] Level 0 → 1: Onboarding completion (fact-based)
- [ ] Level 1 → 2: Browser security established (fact-based)
- [ ] Level 2 → 3: Authentication security established (mixed fact/score-based)
- [ ] Score used for comparative assessment, not strict gating
- [ ] Higher scores unlock advanced content sooner
- [ ] Facts determine capability, scores determine sophistication

### Browser-Specific Conditional Logic
- [ ] Firefox users get hardening path
- [ ] Chrome users get migration recommendations + mitigation
- [ ] Safari users get basic optimization
- [ ] LibreWolf users get positive reinforcement
- [ ] Ad-blocker type affects follow-up recommendations
- [ ] Browser tier affects advanced topic availability

### Educational Content Requirements
- [ ] Browser privacy tier explanations
- [ ] Ad-blocker comparison (uBlock Origin vs others)
- [ ] Why Chrome is problematic for privacy
- [ ] Firefox optimization step-by-step guides
- [ ] DNS-over-HTTPS explanation and setup
- [ ] LibreWolf as privacy-optimized Firefox distribution

### Conditional Logic Testing
- [ ] `os_selection` hidden when `os.confirmed = true`
- [ ] Windows options hidden when `os = "not-windows"`  
- [ ] Mobile questions appear for desktop users
- [ ] Desktop questions appear for mobile users
- [ ] Tech comfort affects question complexity
- [ ] Include/exclude conditions work bidirectionally

### Facts System Testing  
- [ ] Facts extracted from all answer options
- [ ] Facts persist in localStorage
- [ ] Facts rebuilt from answers on page load
- [ ] Onboarding completion tracked in facts
- [ ] Device context facts properly set
- [ ] Usage context facts stored correctly

### User Experience Validation
- [ ] No repeated onboarding for returning users
- [ ] Progress feels continuous and respectful
- [ ] Educational content throughout
- [ ] Non-judgmental language for beginners
- [ ] Efficient flow for power users
- [ ] Clear value proposition at each level

---

## Implementation Priorities

### Phase 1: Privacy & Onboarding Foundation
1. **Privacy Notice Modal** - Full-screen, educational, dismissible
2. **Complete Onboarding Questions** - 6+ questions including comfort & device context
3. **Level 0 Implementation** - Proper onboarding phase tracking
4. **Facts System Enhancement** - Ensure all onboarding facts are captured

### Phase 2: Level System & Quick Wins  
1. **Level Progression Logic** - Proper level gating and advancement
2. **Level 1 Quick Wins** - High-impact, easy questions prioritized
3. **Immediate Value Feedback** - Show progress and impact clearly
4. **Cross-Device Questions** - Mobile for desktop users, desktop for mobile users

### Phase 3: Advanced Flows & Polish
1. **Power User Experience** - Efficient flow for experts
2. **Beginner Support** - Educational, confidence-building approach  
3. **Return User Experience** - Seamless continuation
4. **Mobile Optimization** - Touch-friendly, mobile-first design

---

## Technical Implementation Requirements

### Store Initialization Updates Needed
The store's `initializeStore()` function must:

1. **Preserve Detection Facts** through resets:
```typescript
// In store reset operation
const resetStore = () => {
  // Preserve these facts
  const preservedFacts = {
    detected_os: currentFacts.detected_os,
    detected_browser: currentFacts.detected_browser, 
    device_type: currentFacts.device_type,
    screen_size: currentFacts.screen_size,
    detection_timestamp: currentFacts.detection_timestamp
  };
  
  // Clear user-provided facts only
  set(state => ({
    ...state,
    facts: preservedFacts, // Start with detected facts
    answers: {},
    level: 0,
    onboarding_complete: false
  }));
};
```

2. **Rebuild Facts** from localStorage answers:
```typescript
// In initializeStore()
const storedState = JSON.parse(localStorage.getItem('cyber-fitness-state') || '{}');
if (storedState.answers) {
  // Rebuild facts from all stored answers
  Object.entries(storedState.answers).forEach(([questionId, answerId]) => {
    const question = getQuestionById(questionId);
    const selectedOption = question.options.find(opt => opt.id === answerId);
    if (selectedOption?.facts) {
      Object.assign(facts, selectedOption.facts);
    }
  });
}
```

### Priority System Implementation
Questions need proper priority ordering:
- **Privacy Notice**: Priority 10000 (always first)
- **OS Confirmation**: Priority 9500
- **OS Selection**: Priority 9400 (conditional)
- **Browser Confirmation**: Priority 9300
- **Tech Comfort**: Priority 9200
- **Mobile Context**: Priority 9100
- **Usage Context**: Priority 9000
- **Level 1 Questions**: Priority 8000+

### Visual Flow Integration
The new `VISUAL_FLOW_ONBOARDING.md` document provides:
- Complete visual mockups for each onboarding step
- Exact question progression logic
- Facts created at each step
- Conditional logic rules

**Implementation checklist**:
- [ ] Privacy notice modal component with full-screen overlay
- [ ] Device detection on app startup
- [ ] Facts preservation through reset operations
- [ ] Priority-based question ordering
- [ ] Conditional logic using facts (not raw answers)
- [ ] Progress indicators showing "Step X of Y"

Would you like me to create specific implementation tickets or automated tests for any of these priorities?
