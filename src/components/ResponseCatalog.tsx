import { useState } from 'react';
import { useAssessmentStore } from '../features/assessment/state/store';
import { CheckCircle, Clock, AlertTriangle, Edit, ChevronDown, ChevronUp, Shield, Users, Wifi, Database, Globe, Smartphone } from 'lucide-react';
import { getSecurityTopic } from '../features/assessment/data/security-topics';
import { SECURE_ACTIONS } from '../data/secureActions';

type ResponseItem = {
  questionId: string;
  questionText: string;
  answer: string | boolean | number;
  points: number;
  domain: string;
  topicIds: string[];
};

type TopicGroup = {
  topicId: string;
  topicTitle: string;
  icon: React.ReactNode;
  responses: ResponseItem[];
  totalPoints: number;
  maxPossiblePoints: number;
  status: 'secured' | 'todo' | 'needs-improvement';
};

interface CategorizedTopics {
  shieldsUp: TopicGroup[];
  todo: TopicGroup[];
  needsImprovement: TopicGroup[];
}

// Topic to icon mapping
const TOPIC_ICONS: Record<string, React.ReactNode> = {
  physical_access: <Smartphone className="w-4 h-4" />,
  credential_reuse: <Shield className="w-4 h-4" />,
  account_takeover: <Users className="w-4 h-4" />,
  malware_infection: <AlertTriangle className="w-4 h-4" />,
  data_theft: <Database className="w-4 h-4" />,
  network_attacks: <Wifi className="w-4 h-4" />,
  system_info: <Smartphone className="w-4 h-4" />,
  system_security: <Shield className="w-4 h-4" />,
  default: <Globe className="w-4 h-4" />
};

export function ResponseCatalog() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['secured']));
  const { answers, questionBank } = useAssessmentStore();

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Group responses by security topics
  const categorizeByTopics = (): CategorizedTopics => {
    const topicGroups: Record<string, TopicGroup> = {};

    Object.values(answers).forEach(answer => {
      // Find the question in main question bank
      let question = null;
      let domain = '';
      
      for (const d of questionBank.domains) {
        for (const level of d.levels) {
          const q = level.questions.find(q => q.id === answer.questionId);
          if (q) {
            question = q;
            domain = d.title;
            break;
          }
        }
        if (question) break;
      }

      // If not found in question bank, check if it's a secure action
      if (!question) {
        const action = SECURE_ACTIONS.find(a => a.id === answer.questionId);
        if (action) {
          // Create a question-like object for actions
          question = {
            id: action.id,
            text: `Do you have ${action.title}?`,
            relatedTopics: ['browser_security'], // Default topic for actions
            weight: action.impact === 'high' ? 10 : action.impact === 'medium' ? 6 : 3
          };
          domain = 'Security Actions';
        }
      }

      // If still not found, check if it's an onboarding question
      if (!question) {
        const onboardingQuestions: Record<string, any> = {
          // DEBUG: Test expiration question
          'debug_expiration_test': {
            id: 'debug_expiration_test',
            text: 'DEBUG: Test expiration system',
            relatedTopics: ['system_info'],
            weight: 1
          },
          'platform_confirmation': {
            id: 'platform_confirmation',
            text: 'Platform confirmation',
            relatedTopics: ['system_info'],
            weight: 5
          },
          'virus_scan_recent': {
            id: 'virus_scan_recent', 
            text: 'Recent virus scan frequency',
            relatedTopics: ['malware_infection'],
            weight: 15
          },
          'password_strength': {
            id: 'password_strength',
            text: 'Password uniqueness across accounts', 
            relatedTopics: ['credential_reuse'],
            weight: 20
          },
          'software_updates': {
            id: 'software_updates',
            text: 'Software update habits',
            relatedTopics: ['system_security'],
            weight: 15
          },
          'phishing_awareness': {
            id: 'phishing_awareness',
            text: 'Phishing awareness level',
            relatedTopics: ['account_takeover'],
            weight: 20
          },
          'tech_comfort': {
            id: 'tech_comfort',
            text: 'Technology comfort level',
            relatedTopics: ['system_info'],
            weight: 10
          }
        };

        const onboardingQ = onboardingQuestions[answer.questionId];
        if (onboardingQ) {
          question = onboardingQ;
          domain = 'Onboarding Assessment';
        }
      }

      if (!question) return;

      const responseData: ResponseItem = {
        questionId: answer.questionId,
        questionText: answer.questionText || question.text,
        answer: answer.value,
        points: answer.pointsEarned || 0,
        domain,
        topicIds: question.relatedTopics || []
      };

      // If question has no topics, create a domain-based grouping
      const topicsToProcess = question.relatedTopics?.length 
        ? question.relatedTopics 
        : [`domain_${domain.toLowerCase().replace(/\s+/g, '_')}`];

      topicsToProcess.forEach((topicId: string) => {
        if (!topicGroups[topicId]) {
          const securityTopic = getSecurityTopic(topicId);
          topicGroups[topicId] = {
            topicId,
            topicTitle: securityTopic?.title || domain,
            icon: TOPIC_ICONS[topicId] || TOPIC_ICONS.default,
            responses: [],
            totalPoints: 0,
            maxPossiblePoints: 0,
            status: 'needs-improvement'
          };
        }

        topicGroups[topicId].responses.push(responseData);
        topicGroups[topicId].totalPoints += responseData.points;
        topicGroups[topicId].maxPossiblePoints += question.weight || 0;
      });
    });

    // Categorize topics based on answer types, not just scores
    const categorized: CategorizedTopics = {
      shieldsUp: [],
      todo: [],
      needsImprovement: []
    };

    Object.values(topicGroups).forEach(topic => {
      // Categorize based on the dominant answer type in this topic
      const answerTypes = topic.responses.map(r => r.answer);
      const yesCount = answerTypes.filter(a => a === 'yes' || a === true).length;
      const noCount = answerTypes.filter(a => a === 'no' || a === false).length;
      const unsureCount = answerTypes.filter(a => a === 'unsure').length;
      const totalResponses = answerTypes.length;
      
      // If majority are "yes" answers, goes to Shields Up
      if (yesCount / totalResponses >= 0.7) {
        topic.status = 'secured';
        categorized.shieldsUp.push(topic);
      }
      // If has "unsure" answers or mixed results, goes to To Do  
      else if (unsureCount > 0 || (yesCount > 0 && noCount > 0)) {
        topic.status = 'todo';
        categorized.todo.push(topic);
      }
      // If majority are "no" answers, goes to Needs Improvement
      else {
        topic.status = 'needs-improvement';
        categorized.needsImprovement.push(topic);
      }
    });

    // Sort by points within each category
    categorized.shieldsUp.sort((a, b) => b.totalPoints - a.totalPoints);
    categorized.todo.sort((a, b) => b.totalPoints - a.totalPoints);
    categorized.needsImprovement.sort((a, b) => b.totalPoints - a.totalPoints);

    return categorized;
  };

  const getExpirationStatus = (answer: any) => {
    if (!answer.expiresAt) return null;
    
    const now = new Date();
    const expiresAt = new Date(answer.expiresAt);
    const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', message: 'Expired', color: 'text-red-600', bgColor: 'bg-red-50' };
    } else if (daysUntilExpiry <= 3) {
      return { status: 'expiring', message: `${daysUntilExpiry} days left`, color: 'text-orange-600', bgColor: 'bg-orange-50' };
    } else if (daysUntilExpiry <= 7) {
      return { status: 'warning', message: `${daysUntilExpiry} days left`, color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    }
    
    return null; // No warning needed for answers expiring in >7 days
  };

  const categorized = categorizeByTopics();

  const formatResponseDescription = (answer: string | boolean | number, questionText: string, questionId: string): string => {
    // First, try to find the question to get enhanced display text
    for (const domain of questionBank.domains) {
      for (const level of domain.levels) {
        const question = level.questions.find(q => q.id === questionId);
        if (question) {
          if (question.type === 'ACTION' && question.actionOptions) {
            // For ACTION questions, use displayText if available
            const option = question.actionOptions.find(opt => opt.id === answer);
            if (option?.displayText) {
              return option.displayText;
            }
            return option?.text || questionText;
          } else if (typeof answer === 'boolean') {
            // For boolean questions, use affirmativeText/negativeText if available
            if (answer && question.affirmativeText) {
              return question.affirmativeText;
            } else if (!answer && question.negativeText) {
              return question.negativeText;
            }
          }
        }
      }
    }

    // Fallback to current text transformation logic
    const simplifiedText = questionText
      .replace(/^(Do you|Are you|Have you|Is your)/i, '')
      .replace(/\?$/, '')
      .trim();
    
    if (typeof answer === 'boolean') {
      return answer ? simplifiedText : `No ${simplifiedText.toLowerCase()}`;
    } else if (typeof answer === 'number') {
      // For scale questions, create descriptive text
      if (answer >= 4) return simplifiedText;
      if (answer >= 3) return `Partial ${simplifiedText.toLowerCase()}`;
      return `Limited ${simplifiedText.toLowerCase()}`;
    } else {
      // For ACTION questions, find the option text
      for (const domain of questionBank.domains) {
        for (const level of domain.levels) {
          const question = level.questions.find(q => q.id === questionId);
          if (question?.actionOptions) {
            const option = question.actionOptions.find(opt => opt.id === answer);
            return option?.text || simplifiedText;
          }
        }
      }
      return simplifiedText;
    }
  };

  const handleEditAnswer = (questionId: string) => {
    // For now, we'll reset the answer to allow re-answering
    // In the future, this could navigate to the specific question
    const { answers: currentAnswers, ...rest } = useAssessmentStore.getState();
    const newAnswers = { ...currentAnswers };
    delete newAnswers[questionId];
    useAssessmentStore.setState({ answers: newAnswers, ...rest });
  };

  const TopicSection = ({ 
    title, 
    topics, 
    sectionKey, 
    bgColor, 
    borderColor, 
    textColor, 
    icon,
    showPoints = false
  }: { 
    title: string;
    topics: TopicGroup[];
    sectionKey: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    icon: React.ReactNode;
    showPoints?: boolean;
  }) => {
    const isExpanded = expandedSections.has(sectionKey);
    const totalPoints = topics.reduce((sum, topic) => sum + topic.totalPoints, 0);

    // Don't render if no topics
    if (topics.length === 0) return null;

    return (
      <div className={`${bgColor} ${borderColor} border rounded-lg overflow-hidden`}>
        <button
          onClick={() => toggleSection(sectionKey)}
          className={`w-full flex items-center justify-between p-4 text-left hover:bg-opacity-80 transition-colors`}
        >
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <h3 className={`font-medium ${textColor}`}>
                {title} ({topics.length} {topics.length === 1 ? 'topic' : 'topics'})
              </h3>
              {showPoints && (
                <p className={`text-sm ${textColor.replace('900', '700')}`}>
                  {totalPoints} points earned
                </p>
              )}
            </div>
          </div>
          <div className={textColor}>
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {isExpanded && (
          <div className="border-t space-y-4 p-4">
            {topics.map((topic) => (
              <div key={topic.topicId} className="bg-white rounded-lg border p-5">
                <div className="flex items-center gap-2 mb-4">
                  {topic.icon}
                  <h4 className="font-medium text-gray-900">{topic.topicTitle}</h4>
                </div>
                
                <div className="space-y-3">
                  {topic.responses.map((response) => {
                    const expirationStatus = getExpirationStatus(response);
                    
                    return (
                      <div key={response.questionId} className="flex items-start justify-between py-3 px-4 bg-white rounded-lg border">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-green-600 font-bold text-sm">
                            +{response.points}
                          </span>
                          <span className="text-gray-800 font-medium text-sm flex-1">
                            ✓ {formatResponseDescription(response.answer, response.questionText, response.questionId)}
                          </span>
                          
                          {/* Expiration indicator */}
                          {expirationStatus && (
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${expirationStatus.bgColor} ${expirationStatus.color}`}>
                              <Clock className="w-3 h-3" />
                              <span>{expirationStatus.message}</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleEditAnswer(response.questionId)}
                          className="text-gray-400 hover:text-blue-600 p-1 ml-3 flex-shrink-0"
                          title="Edit this response"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const totalTopics = categorized.shieldsUp.length + categorized.todo.length + categorized.needsImprovement.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Security Status</h2>
        <p className="text-sm text-gray-600">Your cybersecurity progress by topic</p>
      </div>

      <div>
        {totalTopics === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Shield className="w-8 h-8 mx-auto mb-3 text-gray-400" />
            <p className="font-medium">No responses yet</p>
            <p className="text-sm">Answer questions to build your security status</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <TopicSection
              title="Shields Up"
              topics={categorized.shieldsUp}
              sectionKey="shieldsUp"
              bgColor="bg-green-50"
              borderColor="border-green-200"
              textColor="text-green-900"
              icon={<CheckCircle className="w-5 h-5 text-green-600" />}
              showPoints={true}
            />

            <TopicSection
              title="To Do"
              topics={categorized.todo}
              sectionKey="todo"
              bgColor="bg-yellow-50"
              borderColor="border-yellow-200"
              textColor="text-yellow-900"
              icon={<Clock className="w-5 h-5 text-yellow-600" />}
              showPoints={false}
            />

            <TopicSection
              title="Needs Improvement"
              topics={categorized.needsImprovement}
              sectionKey="improvement"
              bgColor="bg-red-50"
              borderColor="border-red-200"
              textColor="text-red-900"
              icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
              showPoints={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
