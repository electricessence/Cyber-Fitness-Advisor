#!/usr/bin/env node

/**
 * Simple Test Runner for Device Scenario Flows
 * Runs our test scenarios and displays the results in a clear format
 */

import { simulateCompleteUserJourney, generateUIState } from './uiFlowSimulator.test.js';

// Test Scenario 1: Windows + iPhone User (Good Practices)
console.log('🔧 Testing Windows + iPhone User (Good Security Practices)');
console.log('=' .repeat(60));

const scenario1 = simulateCompleteUserJourney(
  { os: 'windows', browser: 'chrome', type: 'desktop' },
  { 
    primary_desktop: 'windows',
    primary_mobile: 'iphone',
    tech_comfort: 'comfortable'
  },
  {
    'windows_update_frequency': 'immediately',
    'windows_virus_scan_frequency': 'automatic_daily',
    'ios_passcode_security': 'face_id_touch_id',
    'password_management_strategy': 'dedicated_password_manager'
  }
);

console.log(`✅ Security Score: ${scenario1.assessmentResult.securityScore}/100`);
console.log(`📋 Questions Answered: ${scenario1.journey.questionsAnswered}`);
console.log(`⚡ Urgent Follow-ups: ${scenario1.finalUIState.recommendations.urgent}`);
console.log(`📅 Routine Follow-ups: ${scenario1.finalUIState.recommendations.routine}`);
console.log('');

// Test Scenario 2: Windows + iPhone User (Poor Practices)
console.log('⚠️  Testing Windows + iPhone User (Poor Security Practices)');
console.log('=' .repeat(60));

const scenario2 = simulateCompleteUserJourney(
  { os: 'windows', browser: 'edge', type: 'desktop' },
  { 
    primary_desktop: 'windows',
    primary_mobile: 'iphone',
    tech_comfort: 'basic'
  },
  {
    'windows_update_frequency': 'ignore_them',
    'windows_virus_scan_frequency': 'rarely_never',
    'ios_passcode_security': 'no_lock',
    'password_management_strategy': 'reuse_passwords'
  }
);

console.log(`🚨 Security Score: ${scenario2.assessmentResult.securityScore}/100`);
console.log(`📋 Questions Answered: ${scenario2.journey.questionsAnswered}`);
console.log(`⚡ Urgent Follow-ups: ${scenario2.finalUIState.recommendations.urgent}`);
console.log(`📅 Routine Follow-ups: ${scenario2.finalUIState.recommendations.routine}`);
console.log('');

// Test Scenario 3: iPhone-only User
console.log('📱 Testing iPhone-only User (Mobile First)');
console.log('=' .repeat(60));

const scenario3 = simulateCompleteUserJourney(
  { os: 'ios', browser: 'safari', type: 'mobile' },
  { 
    primary_desktop: 'none',
    primary_mobile: 'iphone',
    tech_comfort: 'comfortable'
  },
  {
    'ios_passcode_enabled': 'yes',
    'ios_biometric_enabled': 'yes',
    'ios_auto_updates': 'yes',
    'password_management_strategy': 'icloud_keychain'
  }
);

console.log(`✅ Security Score: ${scenario3.assessmentResult.securityScore}/100`);
console.log(`📋 Questions Answered: ${scenario3.journey.questionsAnswered}`);
console.log(`⚡ Urgent Follow-ups: ${scenario3.finalUIState.recommendations.urgent}`);
console.log(`📅 Routine Follow-ups: ${scenario3.finalUIState.recommendations.routine}`);
console.log('');

// Test Scenario 4: Basic User (Windows Only)
console.log('👵 Testing Basic User (Windows Only, Older Adult)');
console.log('=' .repeat(60));

const scenario4 = simulateCompleteUserJourney(
  { os: 'windows', browser: 'edge', type: 'desktop' },
  { 
    primary_desktop: 'windows',
    primary_mobile: 'none',
    tech_comfort: 'basic'
  },
  {
    'windows_defender_enabled': 'yes',
    'windows_firewall_enabled': 'yes',
    'email_provider_security': 'gmail',
    'browser_security_settings': 'default'
  }
);

console.log(`✅ Security Score: ${scenario4.assessmentResult.securityScore}/100`);
console.log(`📋 Questions Answered: ${scenario4.journey.questionsAnswered}`);
console.log(`⚡ Urgent Follow-ups: ${scenario4.finalUIState.recommendations.urgent}`);
console.log(`📅 Routine Follow-ups: ${scenario4.finalUIState.recommendations.routine}`);
console.log('');

// Summary
console.log('📊 Test Summary');
console.log('=' .repeat(60));
console.log(`Good Practices User: ${scenario1.assessmentResult.securityScore} score, ${scenario1.finalUIState.recommendations.urgent} urgent items`);
console.log(`Poor Practices User: ${scenario2.assessmentResult.securityScore} score, ${scenario2.finalUIState.recommendations.urgent} urgent items`);
console.log(`Mobile-First User: ${scenario3.assessmentResult.securityScore} score, ${scenario3.finalUIState.recommendations.urgent} urgent items`);
console.log(`Basic User: ${scenario4.assessmentResult.securityScore} score, ${scenario4.finalUIState.recommendations.urgent} urgent items`);
console.log('');
console.log('✅ All scenario tests completed! UI can now be built to reflect these states.');
