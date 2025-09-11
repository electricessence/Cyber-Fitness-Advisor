/**
 * Browser Console Debug Script for OS Detection Bug
 * 
 * Paste this into the browser console when the app is running
 * to debug the OS detection question visibility issue.
 */

console.log('🔍 OS Detection Debug - Starting Analysis...');

// Get store instance
const store = window.useAssessmentStore?.getState() || (() => {
  console.error('❌ Assessment store not found!');
  return null;
})();

if (store) {
  console.log('\n📊 Current Facts:');
  const allFacts = store.factsActions.getFacts();
  Object.entries(allFacts).forEach(([key, fact]) => {
    console.log(`  ${key}: ${fact.value} (confidence: ${fact.confidence})`);
  });

  console.log('\n❓ Visible Questions:');
  const visibleQuestions = store.getVisibleQuestionIds();
  visibleQuestions.forEach((id, index) => {
    console.log(`  ${index + 1}. ${id}`);
  });

  console.log('\n🎯 OS Detection Questions Analysis:');
  const osQuestions = ['windows_detection_confirm', 'mac_detection_confirm', 'linux_detection_confirm'];
  osQuestions.forEach(questionId => {
    const isVisible = visibleQuestions.includes(questionId);
    console.log(`  ${questionId}: ${isVisible ? '✅ VISIBLE' : '❌ HIDDEN'}`);
  });

  console.log('\n🔍 Critical Facts Check:');
  const osDetected = store.factsActions.getFact('os_detected');
  const osConfirmed = store.factsActions.getFact('os_confirmed');
  const os = store.factsActions.getFact('os');
  
  console.log(`  os_detected: ${osDetected?.value || 'NOT SET'}`);
  console.log(`  os_confirmed: ${osConfirmed?.value || 'NOT SET'}`);
  console.log(`  os: ${os?.value || 'NOT SET'}`);

  console.log('\n🧪 Test Windows Confirmation:');
  console.log('Run this to confirm Windows:');
  console.log('store.answerQuestion("windows_detection_confirm", "yes")');
}