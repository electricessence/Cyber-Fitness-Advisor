/**
 * Facts System: Core Tests
 * 
 * Tests for the facts-based architecture implementation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FactsEngine } from './engine';
import { FactsQueries } from './integration';
import type { Answer } from '../engine/schema';

describe('FactsEngine', () => {
  let engine: FactsEngine;
  
  beforeEach(() => {
    engine = new FactsEngine();
  });
  
  it('should create empty profile', () => {
    const profile = engine.createEmptyProfile();
    
    expect(profile.facts).toEqual({});
    expect(profile.version).toBe('1.0.0');
    expect(profile.lastUpdated).toBeInstanceOf(Date);
  });
  
  it('should extract OS facts from Windows confirmation', () => {
    const profile = engine.createEmptyProfile();
    const answer: Answer = {
      questionId: 'windows_confirmation',
      value: true,
      timestamp: new Date(),
      pointsEarned: 0,
      questionText: 'Are you using Windows?'
    };
    
    const result = engine.extractFactsFromAnswer(answer, profile);
    
    expect(result.factsEstablished).toHaveLength(1);
    expect(result.factsEstablished[0].id).toBe('device.os.primary');
    expect(result.factsEstablished[0].value).toBe('windows');
    expect(result.factsEstablished[0].category).toBe('device');
  });
  
  it('should extract password manager facts', () => {
    const profile = engine.createEmptyProfile();
    const answer: Answer = {
      questionId: 'browser_passwords',
      value: true,
      timestamp: new Date(),
      pointsEarned: 10,
      questionText: 'Do you use browser password manager?'
    };
    
    const result = engine.extractFactsFromAnswer(answer, profile);
    
    expect(result.factsEstablished).toHaveLength(1);
    expect(result.factsEstablished[0].id).toBe('behavior.password_manager.browser');
    expect(result.factsEstablished[0].value).toBe(true);
    expect(result.factsEstablished[0].category).toBe('behavior');
  });
  
  it('should handle fact conflicts', () => {
    const profile = engine.createEmptyProfile();
    
    // First answer: Windows user
    const windowsAnswer: Answer = {
      questionId: 'windows_confirmation',
      value: true,
      timestamp: new Date(),
      pointsEarned: 0,
      questionText: 'Windows?'
    };
    
    let result = engine.extractFactsFromAnswer(windowsAnswer, profile);
    
    // Update profile with first result
    for (const fact of result.factsEstablished) {
      profile.facts[fact.id] = fact;
    }
    
    // Second answer: Mac user (conflict!)
    const macAnswer: Answer = {
      questionId: 'mac_confirmation', 
      value: true,
      timestamp: new Date(),
      pointsEarned: 0,
      questionText: 'Mac?'
    };
    
    result = engine.extractFactsFromAnswer(macAnswer, profile);
    
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0].factIds).toContain('device.os.primary');
  });
  
  it('should query facts correctly', () => {
    const profile = engine.createEmptyProfile();
    
    // Add some test facts
    profile.facts['device.os.primary'] = {
      id: 'device.os.primary',
      name: 'Primary OS',
      category: 'device',
      value: 'windows',
      establishedAt: new Date(),
      establishedBy: { questionId: 'windows_confirmation' },
      confidence: 0.9
    };
    
    profile.facts['behavior.password_manager.browser'] = {
      id: 'behavior.password_manager.browser',
      name: 'Browser Password Manager',
      category: 'behavior',
      value: true,
      establishedAt: new Date(),
      establishedBy: { questionId: 'browser_passwords' },
      confidence: 0.95
    };
    
    // Query by category
    const deviceFacts = engine.queryFacts(profile, { category: 'device' });
    expect(deviceFacts).toHaveLength(1);
    expect(deviceFacts[0].id).toBe('device.os.primary');
    
    const behaviorFacts = engine.queryFacts(profile, { category: 'behavior' });
    expect(behaviorFacts).toHaveLength(1);
    expect(behaviorFacts[0].id).toBe('behavior.password_manager.browser');
    
    // Query by IDs
    const specificFacts = engine.queryFacts(profile, { 
      ids: ['device.os.primary'] 
    });
    expect(specificFacts).toHaveLength(1);
    expect(specificFacts[0].value).toBe('windows');
  });
});

describe('FactsQueries', () => {
  let profile: any;
  
  beforeEach(() => {
    profile = {
      facts: {
        'device.os.primary': {
          id: 'device.os.primary',
          category: 'device',
          value: 'windows'
        },
        'behavior.password_manager.browser': {
          id: 'behavior.password_manager.browser',
          category: 'behavior',
          value: true
        }
      }
    };
  });
  
  it('should get primary OS', () => {
    expect(FactsQueries.getPrimaryOS(profile)).toBe('windows');
  });
  
  it('should check browser password manager usage', () => {
    expect(FactsQueries.usesBrowserPasswordManager(profile)).toBe(true);
  });
  
  it('should get device facts', () => {
    const deviceFacts = FactsQueries.getDeviceFacts(profile);
    expect(deviceFacts).toHaveLength(1);
    expect(deviceFacts[0].id).toBe('device.os.primary');
  });
  
  it('should check minimum facts', () => {
    expect(FactsQueries.hasMinimumFacts(profile)).toBe(true);
    
    // Remove behavior facts
    delete profile.facts['behavior.password_manager.browser'];
    expect(FactsQueries.hasMinimumFacts(profile)).toBe(false);
  });
});
