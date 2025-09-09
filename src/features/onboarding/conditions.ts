/**
 * Onboarding Conditions System
 * Evaluates declarative conditions against facts for question visibility
 */

export type ConditionsConfig = {
  /** Show question when ALL these facts match their expected values */
  include?: Record<string, string | boolean>;
  /** Don't show question when ANY of these facts match their expected values */
  exclude?: Record<string, string | boolean>;
};

/**
 * Evaluate conditions against facts to determine if a question should be shown
 */
export function evaluateConditions(
  conditions: ConditionsConfig | undefined,
  facts: Record<string, string | boolean>
): boolean {
  if (!conditions) return true;

  // Check include conditions - ALL must match
  if (conditions.include) {
    for (const [factName, expectedValue] of Object.entries(conditions.include)) {
      if (facts[factName] !== expectedValue) {
        return false;
      }
    }
  }

  // Check exclude conditions - ANY match means exclude
  if (conditions.exclude) {
    for (const [factName, excludedValue] of Object.entries(conditions.exclude)) {
      if (facts[factName] === excludedValue) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Convert device detection and user answers to facts for condition evaluation
 */
export function createFactsFromDeviceAndAnswers(
  device: { os: string; browser: string; type: string },
  answers: Record<string, string>
): Record<string, string | boolean> {
  const facts: Record<string, string | boolean> = {};
  
  // Device detection facts
  facts['device.os.detected'] = device.os;
  facts['device.browser.detected'] = device.browser;
  facts['device.type'] = device.type;
  
  // OS confirmation facts
  if (answers.windows_confirmation === 'yes') facts['os.confirmed'] = true;
  if (answers.mac_confirmation === 'yes') facts['os.confirmed'] = true;
  if (answers.linux_confirmation === 'yes') facts['os.confirmed'] = true;
  if (answers.os_selection === 'mobile') facts['os.confirmed'] = 'mobile';
  if (answers.os_selection && ['windows', 'mac', 'linux'].includes(answers.os_selection)) {
    facts['os.confirmed'] = true;
  }
  
  // Browser confirmation facts
  if (answers.chrome_confirmation === 'yes' || answers.firefox_confirmation === 'yes') {
    facts['browser.confirmed'] = true;
  }
  
  // OS unknown or denied facts
  const osUnknownOrDenied = device.os === 'unknown' || 
    answers.windows_confirmation === 'no' ||
    answers.mac_confirmation === 'no' ||
    answers.linux_confirmation === 'no';
  facts['device.os.unknown_or_denied'] = osUnknownOrDenied;
  
  return facts;
}
