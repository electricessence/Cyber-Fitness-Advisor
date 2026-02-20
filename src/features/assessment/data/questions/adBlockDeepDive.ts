// Ad-Blocker Deep-Dive Questions
// Browser × device-specific follow-ups that unlock when a user answers "no" or
// "partial" to the core ad_blocker question.
//
// Content philosophy:
//   - uBlock Origin and SponsorBlock are open-source, free — fair game.
//   - Firefox Focus is free and open-source — fair game.
//   - LibreWolf is FOSS (Firefox derivative) — fair game as educational reference.
//   - Chrome's Manifest V3 limitations are factual, documented — fair game.
//   - We steer *away* from Chrome and toward privacy-respecting browsers
//     without being preachy: let the facts speak.
//   - Desktop flows rank higher priority than mobile (lower effort to act on).
//   - Multi-step "installed / skipped" options let users signal willingness.

import type { Question } from '../../engine/schema.js';
import { ASSESSMENT_PRIORITIES } from './priorities.js';

// Named priority slots from ASSESSMENT_PRIORITIES — no ad-hoc arithmetic
const AB_DESKTOP = ASSESSMENT_PRIORITIES.AD_BLOCK_DESKTOP;       // 94
const AB_SECONDARY = ASSESSMENT_PRIORITIES.AD_BLOCK_SECONDARY;   // 93
const AB_FOLLOWUP = ASSESSMENT_PRIORITIES.AD_BLOCK_FOLLOWUP;     // 92

export const adBlockDeepDiveQuestions: Question[] = [

  // ═══════════════════════════════════════════════════════════════════════
  // Firefox + Desktop — easiest path, highest value
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'adblock_firefox_desktop',
    text: 'Installing uBlock Origin in Firefox takes about 30 seconds. Open Firefox → go to addons.mozilla.org → search "uBlock Origin" → click "Add to Firefox". Done!',
    priority: AB_DESKTOP,
    tags: ['browser', 'firefox', 'privacy', 'quickwin', 'action'],
    journeyIntent: 'action-guided',
    difficulty: 'beginner',
    effort: '1 minute',
    description: 'uBlock Origin is the gold standard open-source ad/tracker blocker. It blocks malicious ads, tracking scripts, and even some phishing domains — all with near-zero performance impact.',
    conditions: {
      include: { browser: 'firefox', ad_blocker: ['no', 'partial'] },
      exclude: { device_type: 'mobile' }
    },
    options: [
      {
        id: 'installed',
        text: '✅ Done — I installed uBlock Origin!',
        statement: 'uBlock Origin: Installed in Firefox',
        statusCategory: 'shields-up',
        facts: { ublock_origin: true, ad_blocker_installed: true, ad_blocker_browser: 'firefox' },
        points: 15,
        feedback: 'Excellent! You\'ve just added one of the most effective security layers available. uBlock Origin blocks malvertising, trackers, and phishing domains automatically.'
      },
      {
        id: 'already_have',
        text: '👍 I already have it',
        statement: 'uBlock Origin: Already installed',
        statusCategory: 'shields-up',
        facts: { ublock_origin: true, ad_blocker_installed: true, ad_blocker_browser: 'firefox' },
        points: 15,
        feedback: 'Great — you\'re already protected. Make sure it\'s kept up to date (Firefox handles this automatically for extensions).'
      },
      {
        id: 'skipped',
        text: '⏭️ I\'ll skip this for now',
        statement: 'uBlock Origin: Skipped',
        statusCategory: 'to-do',
        facts: { ublock_origin: false, ad_blocker_installed: false },
        points: 0,
        feedback: 'No pressure — it\'ll be here when you\'re ready. This is one of the highest-impact, lowest-effort security steps you can take.'
      }
    ]
  },

  // SponsorBlock follow-up for Firefox desktop users who installed uBlock Origin
  {
    id: 'sponsorblock_firefox',
    text: 'Bonus: SponsorBlock is a free, community-driven extension that auto-skips sponsor segments in YouTube videos. Same install process — search "SponsorBlock" in Firefox Add-ons.',
    priority: AB_SECONDARY,
    tags: ['browser', 'firefox', 'privacy', 'bonus'],
    journeyIntent: 'action-guided',
    difficulty: 'beginner',
    effort: '1 minute',
    description: 'SponsorBlock uses community-submitted timestamps to skip sponsor reads, intros, and other non-content segments. Entirely open-source and community-maintained.',
    conditions: {
      include: { ublock_origin: true, browser: 'firefox' },
      exclude: { device_type: 'mobile' }
    },
    options: [
      {
        id: 'installed',
        text: '✅ Installed SponsorBlock!',
        statement: 'SponsorBlock: Installed',
        statusCategory: 'shields-up',
        facts: { sponsorblock: true },
        points: 5,
        feedback: 'Nice bonus! SponsorBlock saves hours of sponsor segments over time. Community-powered and open-source.'
      },
      {
        id: 'skipped',
        text: '⏭️ Not interested',
        statement: 'SponsorBlock: Skipped',
        statusCategory: 'shields-up', // Not a security issue, just a bonus
        facts: { sponsorblock: false },
        points: 0,
        feedback: 'Totally fine — this is a convenience feature, not a security necessity.'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════
  // Edge + Desktop — familiar process, different instructions
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'adblock_edge_desktop',
    text: 'Installing uBlock Origin in Edge takes about 30 seconds. Open Edge → go to the Edge Add-ons store (or search "uBlock Origin Edge extension") → click "Get" → confirm. That\'s it!',
    priority: AB_DESKTOP,
    tags: ['browser', 'edge', 'privacy', 'quickwin', 'action'],
    journeyIntent: 'action-guided',
    difficulty: 'beginner',
    effort: '1 minute',
    description: 'Edge supports the same Chrome Web Store extensions plus its own add-ons store. uBlock Origin works fully on Edge — unlike Chrome, Edge hasn\'t restricted extension capabilities.',
    conditions: {
      include: { browser: 'edge', ad_blocker: ['no', 'partial'] },
      exclude: { device_type: 'mobile' }
    },
    options: [
      {
        id: 'installed',
        text: '✅ Done — I installed uBlock Origin!',
        statement: 'uBlock Origin: Installed in Edge',
        statusCategory: 'shields-up',
        facts: { ublock_origin: true, ad_blocker_installed: true, ad_blocker_browser: 'edge' },
        points: 15,
        feedback: 'Well done! Edge fully supports uBlock Origin\'s capabilities. You now have first-class ad and tracker blocking.'
      },
      {
        id: 'already_have',
        text: '👍 I already have it',
        statement: 'uBlock Origin: Already installed',
        statusCategory: 'shields-up',
        facts: { ublock_origin: true, ad_blocker_installed: true, ad_blocker_browser: 'edge' },
        points: 15,
        feedback: 'Excellent — you\'re already covered. Edge keeps extensions updated automatically.'
      },
      {
        id: 'skipped',
        text: '⏭️ I\'ll skip this for now',
        statement: 'uBlock Origin: Skipped',
        statusCategory: 'to-do',
        facts: { ublock_origin: false, ad_blocker_installed: false },
        points: 0,
        feedback: 'It\'ll be here when you\'re ready. One of the easiest security wins available.'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════
  // Chrome + Desktop — the honest conversation
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'adblock_chrome_desktop',
    text: 'Here\'s the reality: Chrome has restricted the capabilities that ad blockers rely on (Manifest V3). uBlock Origin Lite exists but is significantly weaker than the full version available on Firefox and Edge. You have a few options:',
    priority: AB_DESKTOP,
    tags: ['browser', 'chrome', 'privacy', 'action'],
    journeyIntent: 'action-guided',
    difficulty: 'intermediate',
    effort: '5–15 minutes',
    description: 'Google\'s Manifest V3 changes limit the number of filtering rules extensions can use, directly impacting ad blockers. This is a documented, factual limitation — not speculation. Firefox and Edge do not have this restriction.',
    conditions: {
      include: { browser: 'chrome', ad_blocker: ['no', 'partial'] },
      exclude: { device_type: 'mobile' }
    },
    options: [
      {
        id: 'install_lite',
        text: '🔸 I\'ll install uBlock Origin Lite (limited protection)',
        statement: 'uBlock Origin Lite: Installed in Chrome',
        statusCategory: 'to-do',
        facts: { ublock_origin_lite: true, ad_blocker_installed: true, ad_blocker_browser: 'chrome' },
        points: 5,
        feedback: 'Better than nothing, but be aware that uBO Lite can\'t block as many trackers or malicious ads as the full version on Firefox/Edge. It\'s a documented limitation of Chrome\'s extension platform.'
      },
      {
        id: 'switch_firefox',
        text: '🦊 I\'ll try Firefox instead (full ad-blocker support)',
        statement: 'Considering Firefox: For full ad-blocking',
        statusCategory: 'to-do',
        facts: { considering_browser_switch: 'firefox', ad_blocker_installed: false },
        points: 8,
        feedback: 'Firefox gives you full uBlock Origin support, better privacy defaults, and no restrictions on extension capabilities. You can import your Chrome bookmarks and passwords during setup. It\'s a one-time effort for a permanent upgrade.'
      },
      {
        id: 'switch_edge',
        text: '🌐 I\'ll try Edge instead (full ad-blocker support)',
        statement: 'Considering Edge: For full ad-blocking',
        statusCategory: 'to-do',
        facts: { considering_browser_switch: 'edge', ad_blocker_installed: false },
        points: 6,
        feedback: 'Edge supports full uBlock Origin and feels familiar if you\'re used to Chrome (same rendering engine). It\'s an easy switch with bookmark/password import built in.'
      },
      {
        id: 'skipped',
        text: '⏭️ I\'ll stay on Chrome without an ad blocker',
        statement: 'Ad Blocker: Skipped (Chrome limitation)',
        statusCategory: 'room-for-improvement',
        facts: { ad_blocker_installed: false, chrome_adblock_aware: true },
        points: 0,
        feedback: 'Understood. Just know that without effective ad blocking on Chrome, you\'re more exposed to malvertising and tracking than users on Firefox or Edge with uBlock Origin. This is one area where your browser choice directly impacts your security.'
      }
    ]
  },

  // Chrome password manager warning — gated by Chrome + using Chrome's built-in PM
  {
    id: 'chrome_password_warning',
    text: 'Something worth knowing: as of early 2026, Chrome\'s password manager offers "on-device encryption" — but it\'s opt-in, not the default. In the standard mode, Google holds the encryption key in your Google Account and uses it to decrypt your passwords. This is different from "zero-knowledge" architectures where even the provider can\'t access your vault.',
    priority: AB_SECONDARY,
    tags: ['browser', 'chrome', 'passwords', 'privacy', 'educational'],
    journeyIntent: 'insight',
    difficulty: 'beginner',
    effort: 'Quick read + optional research',
    description: 'As of early 2026, Google documents that in standard mode the encryption key is stored in your Google Account. Google offers an opt-in "on-device encryption" mode where only you hold the key, but the EFF and Privacy Guides both note this is not enabled by default (sources: EFF 2025-03-06; Privacy Guides 2025-09-12). This is worth researching yourself — search "Google Password Manager on-device encryption" to see the current state.',
    conditions: {
      include: { browser: 'chrome', pm_type: 'browser' },
      exclude: { browser_switched: true }
    },
    options: [
      {
        id: 'will_research',
        text: '🔍 I\'ll research my options',
        statement: 'Browser Password Manager: Researching alternatives',
        statusCategory: 'to-do',
        facts: { chrome_pm_aware: true, considering_pm_switch: true },
        points: 5,
        feedback: 'Good approach. Password managers fall into three categories — local/offline (like KeePassXC), cloud-based dedicated (like Bitwarden), and browser built-in. Each has different tradeoffs around convenience, control, and what happens if the provider is breached. Privacy Guides (privacyguides.org) maintains a comparison with specific criteria including published audits and documented encryption.'
      },
      {
        id: 'enable_encryption',
        text: '🔒 I\'ll check if on-device encryption is enabled',
        statement: 'Chrome PM: Checking on-device encryption status',
        statusCategory: 'to-do',
        facts: { chrome_pm_aware: true, chrome_ode_checking: true },
        points: 3,
        feedback: 'In Chrome, go to Settings → Google Password Manager → Settings and look for "On-device encryption." As of early 2026, Google states this is being rolled out gradually. Once enabled, it can\'t be removed — and if you lose access to your recovery method, Google cannot help you recover your passwords.'
      },
      {
        id: 'keep_current',
        text: '📌 I\'m fine with my current setup',
        statement: 'Chrome Password Manager: Keeping current setup',
        statusCategory: 'room-for-improvement',
        facts: { chrome_pm_aware: true, considering_pm_switch: false },
        points: 1,
        feedback: 'Using any password manager is better than reusing passwords. If you stay with Chrome\'s, make sure your Google account has strong 2FA — in the standard mode, your Google account is the key to all your saved passwords. You can always revisit this later.'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════
  // Safari + Desktop — content blockers, different model
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'adblock_safari_desktop',
    text: 'Safari uses a different extension model than other browsers. It supports "content blockers" rather than traditional extensions. While uBlock Origin isn\'t available for Safari, there are effective content-blocking options in the Mac App Store.',
    priority: AB_DESKTOP,
    tags: ['browser', 'safari', 'mac', 'privacy', 'action'],
    journeyIntent: 'action-guided',
    difficulty: 'beginner',
    effort: '2 minutes',
    description: 'Safari\'s content blocker API is more restricted than Firefox/Edge but still provides meaningful ad and tracker blocking. Apple\'s approach prioritises performance and battery life.',
    conditions: {
      include: { browser: 'safari', ad_blocker: ['no', 'partial'] },
      exclude: { device_type: 'mobile' }
    },
    options: [
      {
        id: 'installed',
        text: '✅ I\'ve installed a content blocker from the App Store',
        statement: 'Safari Content Blocker: Installed',
        statusCategory: 'shields-up',
        facts: { safari_content_blocker: true, ad_blocker_installed: true, ad_blocker_browser: 'safari' },
        points: 10,
        feedback: 'Good! Safari content blockers reduce tracking and malvertising. Combined with Safari\'s built-in Intelligent Tracking Prevention, you have solid protection.'
      },
      {
        id: 'try_firefox',
        text: '🦊 I\'d rather try Firefox for full uBlock Origin support',
        statement: 'Considering Firefox: Full ad-blocker support',
        statusCategory: 'to-do',
        facts: { considering_browser_switch: 'firefox', ad_blocker_installed: false },
        points: 8,
        feedback: 'Firefox on Mac gives you full uBlock Origin support — the most capable ad/tracker blocker available. You can keep Safari for Apple ecosystem features and use Firefox as your primary browsing browser.'
      },
      {
        id: 'skipped',
        text: '⏭️ I\'ll skip this for now',
        statement: 'Safari Content Blocker: Skipped',
        statusCategory: 'to-do',
        facts: { safari_content_blocker: false, ad_blocker_installed: false },
        points: 0,
        feedback: 'Safari\'s built-in ITP helps, but a content blocker adds another layer of protection against malicious ads and trackers.'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════
  // Mobile flows — lower priority due to higher effort
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'adblock_mobile_ios',
    text: 'On iOS, ad blocking works differently. Firefox Focus is a free, open-source app that acts as a Safari content blocker — blocking ads and trackers in Safari itself. You can also use Firefox Focus as a standalone private browser.',
    priority: ASSESSMENT_PRIORITIES.AD_BLOCK_MOBILE_IOS, // Mobile-only — must appear after OS detection (80) confirms mobile_os
    tags: ['mobile', 'ios', 'privacy', 'action'],
    journeyIntent: 'action-guided',
    difficulty: 'beginner',
    effort: '2 minutes',
    description: 'Firefox Focus integrates with Safari as a content blocker on iOS, meaning you get ad/tracker blocking without switching away from Safari. It also works as its own privacy-focused browser that wipes your session when you close it.',
    conditions: {
      include: { mobile_os: 'ios', ad_blocker: ['no', 'partial'] }
    },
    options: [
      {
        id: 'installed',
        text: '✅ I installed Firefox Focus',
        statement: 'Firefox Focus: Installed on iOS',
        statusCategory: 'shields-up',
        facts: { firefox_focus: true, mobile_ad_blocker: true },
        points: 10,
        feedback: 'Excellent! Enable it as a Safari content blocker in Settings → Safari → Content Blockers → Firefox Focus. This gives you ad/tracker blocking right inside Safari.'
      },
      {
        id: 'skipped',
        text: '⏭️ I\'ll look into this later',
        statement: 'Firefox Focus: Skipped',
        statusCategory: 'to-do',
        facts: { firefox_focus: false, mobile_ad_blocker: false },
        points: 0,
        feedback: 'Mobile ad blocking is lower priority than desktop, but Firefox Focus is free and takes under 2 minutes to set up when you\'re ready.'
      }
    ]
  },

  {
    id: 'adblock_mobile_android',
    text: 'On Android, Firefox is available as a full mobile browser with extension support — including uBlock Origin. This gives you the same desktop-grade ad blocking on your phone.',
    priority: ASSESSMENT_PRIORITIES.AD_BLOCK_MOBILE_ANDROID, // Mobile-only — must appear after OS detection (80) confirms mobile_os
    tags: ['mobile', 'android', 'privacy', 'action'],
    journeyIntent: 'action-guided',
    difficulty: 'beginner',
    effort: '3 minutes',
    description: 'Android Firefox supports a curated list of extensions including uBlock Origin. This is unique among mobile browsers — Chrome on Android does not support extensions at all.',
    conditions: {
      include: { mobile_os: 'android', ad_blocker: ['no', 'partial'] }
    },
    options: [
      {
        id: 'installed',
        text: '✅ I installed Firefox + uBlock Origin on Android',
        statement: 'Firefox + uBlock Origin: Installed on Android',
        statusCategory: 'shields-up',
        facts: { mobile_firefox: true, mobile_ublock: true, mobile_ad_blocker: true },
        points: 12,
        feedback: 'Excellent! You now have desktop-grade ad blocking on your phone. Firefox on Android is the only major mobile browser that supports full extensions.'
      },
      {
        id: 'just_firefox',
        text: '🦊 I installed Firefox but not the extension yet',
        statement: 'Firefox on Android: Installed (no extensions)',
        statusCategory: 'to-do',
        facts: { mobile_firefox: true, mobile_ublock: false, mobile_ad_blocker: false },
        points: 5,
        feedback: 'Good start! Open Firefox on your phone → tap the menu (⋮) → Add-ons → uBlock Origin → Add. Takes 30 seconds.'
      },
      {
        id: 'skipped',
        text: '⏭️ I\'ll look into this later',
        statement: 'Mobile Firefox: Skipped',
        statusCategory: 'to-do',
        facts: { mobile_firefox: false, mobile_ublock: false, mobile_ad_blocker: false },
        points: 0,
        feedback: 'Mobile ad blocking is lower priority than desktop. When you\'re ready, Firefox + uBlock Origin is the most effective setup on Android.'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════
  // Browser switch follow-up — for anyone who said they'd try Firefox/Edge
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'browser_switch_progress',
    text: 'You mentioned considering a browser switch. Have you had a chance to try it?',
    priority: AB_FOLLOWUP,
    tags: ['browser', 'privacy', 'follow-up'],
    journeyIntent: 'checklist',
    difficulty: 'intermediate',
    effort: '15 minutes',
    description: 'Switching browsers is a bigger change, but the privacy and security benefits are significant. Most browsers let you import bookmarks and passwords from your old browser.',
    conditions: {
      include: { considering_browser_switch: ['firefox', 'edge'] }
    },
    options: [
      {
        id: 'switched',
        text: '✅ Yes, I\'ve switched and I like it!',
        statement: 'Browser Switch: Completed',
        statusCategory: 'shields-up',
        facts: { browser_switched: true },
        points: 15,
        feedback: 'Fantastic! That\'s a major upgrade for your privacy and security. You now have access to full ad-blocker support and better default privacy settings.'
      },
      {
        id: 'trying',
        text: '🔄 I\'m trying it alongside my old browser',
        statement: 'Browser Switch: In progress',
        statusCategory: 'to-do',
        facts: { browser_switch_in_progress: true },
        points: 5,
        feedback: 'Smart approach! Running both browsers side-by-side lets you migrate gradually. Set the new browser as your default when you\'re comfortable.'
      },
      {
        id: 'not_yet',
        text: '⏳ Haven\'t gotten to it yet',
        statement: 'Browser Switch: Not started',
        statusCategory: 'to-do',
        facts: { browser_switched: false },
        points: 0,
        feedback: 'No rush — it\'s a bigger change. The option is here whenever you\'re ready.'
      },
      {
        id: 'decided_no',
        text: '❌ Decided to stay with my current browser',
        statement: 'Browser Switch: Declined',
        statusCategory: 'room-for-improvement',
        facts: { browser_switched: false, browser_switch_declined: true },
        points: 0,
        feedback: 'That\'s okay. Focus on maximising what\'s available in your current browser — every improvement counts.'
      }
    ]
  }
];
