/**
 * Quick debugging test for device scenarios
 */

import { detectCurrentDevice, getApplicableScenarios } from './src/features/assessment/engine/deviceScenarios.js';
import { loadDeviceSpecificQuestions } from './src/features/assessment/data/deviceQuestionLoader.js';

// Test device detection
console.log('🔧 Testing Device Detection');
console.log('=' .repeat(40));

const testDevice = detectCurrentDevice();
console.log('Detected device:', JSON.stringify(testDevice, null, 2));

// Test profile creation
const testProfile = {
  currentDevice: { type: 'desktop', os: 'windows', browser: 'chrome' },
  otherDevices: { 
    hasWindows: true, hasMac: false, hasLinux: false,
    hasIPhone: true, hasAndroid: false, hasIPad: false 
  },
  primaryDesktop: 'windows',
  primaryMobile: 'ios'
};

console.log('\n📱 Testing Profile Analysis');
console.log('=' .repeat(40));
console.log('Test profile:', JSON.stringify(testProfile, null, 2));

// Test scenario matching
const scenarios = getApplicableScenarios(testProfile);
console.log('\n🎯 Applicable scenarios:', scenarios.map(s => s.id));

// Test question loading
try {
  const questions = loadDeviceSpecificQuestions(testProfile);
  console.log('\n📋 Loaded domains:', questions.domains.length);
  console.log('Domain IDs:', questions.domains.map(d => d.id));
  
  // Count total questions
  let totalQuestions = 0;
  questions.domains.forEach(domain => {
    domain.levels.forEach(level => {
      totalQuestions += level.questions.length;
    });
  });
  
  console.log('Total questions loaded:', totalQuestions);
  
  // Show first few questions
  if (questions.domains.length > 0 && questions.domains[0].levels.length > 0) {
    const firstQuestions = questions.domains[0].levels[0].questions.slice(0, 3);
    console.log('\nFirst few questions:');
    firstQuestions.forEach(q => {
      console.log(`- ${q.id}: ${q.text}`);
    });
  }
  
} catch (error) {
  console.error('❌ Error loading questions:', error);
}

console.log('\n✅ Device scenario test completed!');
