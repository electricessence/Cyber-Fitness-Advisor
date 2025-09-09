/**
 * Onboarding Conditions System Tests
 * Tests the new declarative conditions system for onboarding questions
 */

import { describe, it, expect } from 'vitest';
import { evaluateConditions } from '../features/onboarding/conditions';

describe('Onboarding Conditions System', () => {
  const windowsFacts = {
    'device.os.detected': 'windows',
    'device.browser.detected': 'chrome',
    'device.type': 'desktop'
  };

  const macFacts = {
    'device.os.detected': 'mac',
    'device.browser.detected': 'safari',
    'device.type': 'desktop'
  };

  describe('Include Conditions', () => {
    it('should show question when include conditions match', () => {
      const conditions = {
        include: { 'device.os.detected': 'windows' }
      };

      expect(evaluateConditions(conditions, windowsFacts)).toBe(true);
      expect(evaluateConditions(conditions, macFacts)).toBe(false);
    });

    it('should require ALL include conditions to match', () => {
      const conditions = {
        include: { 
          'device.os.detected': 'windows',
          'device.browser.detected': 'chrome'
        }
      };

      expect(evaluateConditions(conditions, windowsFacts)).toBe(true);
      
      const windowsFirefoxFacts = { ...windowsFacts, 'device.browser.detected': 'firefox' };
      expect(evaluateConditions(conditions, windowsFirefoxFacts)).toBe(false);
    });
  });

  describe('Exclude Conditions', () => {
    it('should hide question when exclude conditions match', () => {
      const conditions = {
        exclude: { 'device.os.detected': 'mobile' }
      };

      expect(evaluateConditions(conditions, windowsFacts)).toBe(true);
      
      const mobileFacts = { 'device.os.detected': 'mobile' };
      expect(evaluateConditions(conditions, mobileFacts)).toBe(false);
    });

    it('should hide question when ANY exclude condition matches', () => {
      const conditions = {
        exclude: { 
          'device.os.detected': 'mobile',
          'device.type': 'tablet'
        }
      };

      expect(evaluateConditions(conditions, windowsFacts)).toBe(true);
      
      const mobileFacts = { 'device.os.detected': 'mobile' };
      expect(evaluateConditions(conditions, mobileFacts)).toBe(false);
      
      const tabletFacts = { 'device.type': 'tablet' };
      expect(evaluateConditions(conditions, tabletFacts)).toBe(false);
    });
  });

  describe('Combined Conditions', () => {
    it('should handle both include and exclude conditions', () => {
      const conditions = {
        include: { 'device.type': 'desktop' },
        exclude: { 'device.os.detected': 'mobile' }
      };

      // Desktop Windows - should show (included and not excluded)
      expect(evaluateConditions(conditions, windowsFacts)).toBe(true);
      
      // Mobile device - should not show (excluded)
      const mobileFacts = { 'device.type': 'mobile', 'device.os.detected': 'mobile' };
      expect(evaluateConditions(conditions, mobileFacts)).toBe(false);
      
      // Desktop but excluded OS
      const desktopMobileFacts = { 'device.type': 'desktop', 'device.os.detected': 'mobile' };
      expect(evaluateConditions(conditions, desktopMobileFacts)).toBe(false);
    });
  });

  describe('No Conditions', () => {
    it('should show question when no conditions are specified', () => {
      expect(evaluateConditions(undefined, windowsFacts)).toBe(true);
      expect(evaluateConditions({}, windowsFacts)).toBe(true);
    });
  });

  describe('Boolean Values', () => {
    it('should handle boolean fact values', () => {
      const conditions = {
        include: { 'user.confirmed.os': true },
        exclude: { 'user.denied.browser': true }
      };

      const confirmedFacts = { 'user.confirmed.os': true, 'user.denied.browser': false };
      expect(evaluateConditions(conditions, confirmedFacts)).toBe(true);
      
      const deniedFacts = { 'user.confirmed.os': true, 'user.denied.browser': true };
      expect(evaluateConditions(conditions, deniedFacts)).toBe(false);
      
      const unconfirmedFacts = { 'user.confirmed.os': false };
      expect(evaluateConditions(conditions, unconfirmedFacts)).toBe(false);
    });
  });
});
