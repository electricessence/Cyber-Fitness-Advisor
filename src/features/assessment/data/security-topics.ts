import type { SecurityTopics, SecurityTopic } from '../engine/schema';
import securityTopicsData from './security-topics.json';

const securityTopics = securityTopicsData as SecurityTopics;

export function getSecurityTopic(topicId: string): SecurityTopic | undefined {
  return securityTopics.topics[topicId];
}

export function getSecurityTopics(): Record<string, SecurityTopic> {
  return securityTopics.topics;
}

export function getQuestionThreat(relatedTopics?: string[]): string | undefined {
  if (!relatedTopics || relatedTopics.length === 0) {
    return undefined;
  }
  
  // Get the threat from the first related topic
  const primaryTopic = getSecurityTopic(relatedTopics[0]);
  return primaryTopic?.threat;
}

export function getQuestionTopics(relatedTopics?: string[]): SecurityTopic[] {
  if (!relatedTopics) return [];
  
  return relatedTopics
    .map(topicId => getSecurityTopic(topicId))
    .filter((topic): topic is SecurityTopic => topic !== undefined);
}
