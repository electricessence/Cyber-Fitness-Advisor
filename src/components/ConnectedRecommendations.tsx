/**
 * Store-connected wrapper for ActionRecommendations.
 * Reads browser/platform from deviceProfile and facts to build
 * the props that ActionRecommendations expects.
 */

import { useAssessmentStore } from '../features/assessment/state/store';
import { ActionRecommendations } from './ActionRecommendations';

export function ConnectedRecommendations() {
  const { deviceProfile, facts } = useAssessmentStore();

  const browserInfo = {
    browser: (facts?.get('browser') as string) || deviceProfile?.currentDevice?.browser || 'unknown',
    platform: (facts?.get('os') as string) || deviceProfile?.currentDevice?.os || 'unknown',
  };

  const techComfort = (facts?.get('tech_comfort') as string) || 'comfortable';
  const comfortLevel = (['beginner', 'comfortable', 'advanced'].includes(techComfort)
    ? techComfort
    : 'comfortable') as 'beginner' | 'comfortable' | 'advanced';

  const userProfile = {
    techComfort: comfortLevel,
    mainConcerns: ['privacy', 'security'] as string[],
  };

  return (
    <ActionRecommendations
      browserInfo={browserInfo}
      userProfile={userProfile}
    />
  );
}
