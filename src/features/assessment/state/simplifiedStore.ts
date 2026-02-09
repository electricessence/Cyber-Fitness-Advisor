/**
 * Simplified Assessment Store Demo
 * 
 * Demonstrates Registry pattern replacing complex facts system.
 * This is a proof-of-concept showing the simplified approach.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Registry } from '../../../utils/Registry';
import { createZustandRegistry } from '../../../utils/Registry';
import type { DeviceProfile } from '../engine/deviceScenarios';
import type { Answer } from '../engine/schema';
import { detectCurrentDevice } from '../../device/deviceDetection';
import { safeStorage } from '../../../utils/safeStorage';

// Simplified state interface using registries
interface SimplifiedAssessmentState {
  // Raw data (persisted)
  factsData: Record<string, any>;
  answersData: Record<string, Answer>;
  
  // Non-persisted computed state
  deviceProfile: DeviceProfile | null;
  overallScore: number;
  
  // Registry helpers (recreated on load)
  facts: Registry<any>;
  answers: Registry<Answer>;
  
  // Essential actions only
  setFact: (key: string, value: any) => void;
  getFact: (key: string) => any;
  answerQuestion: (questionId: string, value: boolean | number | string) => void;
  resetAssessment: () => void;
  
  // Initialization
  initialize: () => void;
}

// Create the simplified store
export const useSimplifiedStore = create<SimplifiedAssessmentState>()(
  persist(
    (set, get) => {
      
      const createRegistries = () => {
        const state = get();
        return {
          facts: createZustandRegistry(
            () => state.factsData,
            (data) => set({ factsData: data })
          ),
          answers: createZustandRegistry(
            () => state.answersData,
            (data) => {
              // Could recalculate scores here when answers change
              set({ answersData: data });
            }
          )
        };
      };

      return {
        // Raw data
        factsData: {},
        answersData: {},
        
        // Computed state
        deviceProfile: null,
        overallScore: 0,
        
        // Registries (will be initialized)
        facts: null as any,
        answers: null as any,
        
        // Actions using registries
        setFact: (key: string, value: any) => {
          const state = get();
          state.facts.set(key, value);
        },
        
        getFact: (key: string) => {
          const state = get();
          return state.facts.get(key);
        },
        
        answerQuestion: (questionId: string, value: boolean | number | string) => {
          const state = get();
          const answer: Answer = {
            questionId,
            value,
            timestamp: new Date(),
            pointsEarned: 0,
            questionText: questionId  // Simplified
          };
          
          state.answers.set(questionId, answer);
        },
        
        resetAssessment: () => {
          set({
            factsData: {},
            answersData: {},
            overallScore: 0,
            deviceProfile: null
          });
          
          // Recreate registries
          const registries = createRegistries();
          set(registries);
        },
        
        initialize: () => {
          // Create registries and link them to state
          const registries = createRegistries();
          set(registries);
          
          // Do initial setup like device detection
          const device = detectCurrentDevice();
          
          // Set device facts using simple registry operations
          registries.facts.set('os_detected', device.os);
          registries.facts.set('browser_detected', device.browser);
          registries.facts.set('device_type', device.type);
          
          // Set device profile for backwards compatibility
          set({
            deviceProfile: {
              currentDevice: device,
              otherDevices: {
                hasWindows: device.os === 'windows',
                hasMac: device.os === 'mac',
                hasLinux: device.os === 'linux',
                hasIPhone: device.os === 'ios',
                hasAndroid: device.os === 'android',
                hasIPad: device.type === 'tablet'
              }
            }
          });
        }
      };
    },
    {
      name: 'simplified-assessment-store',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        // Only persist the raw data
        factsData: state.factsData,
        answersData: state.answersData
      }),
    }
  )
);

// Export initialization function
export const initializeSimplifiedStore = () => {
  useSimplifiedStore.getState().initialize();
};