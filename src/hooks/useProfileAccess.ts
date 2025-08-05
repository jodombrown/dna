import { useAuth } from '@/contexts/AuthContext';

export interface ProfileAccessLevel {
  name: string;
  range: [number, number];
  features: {
    viewFeed: boolean;
    comment: boolean;
    createPost: boolean;
    joinEvents: boolean;
    joinCommunities: boolean;
    viewDirectory: boolean;
    sendConnections: boolean | string;
    createCollaborations: boolean;
    applyToPrograms: boolean;
    appearInMatching: boolean;
    receiveOpportunities: boolean;
    publicProfileVisible: boolean;
  };
}

const ACCESS_LEVELS: ProfileAccessLevel[] = [
  {
    name: "Basic Access",
    range: [0, 49],
    features: {
      viewFeed: true,
      comment: false,
      createPost: false,
      joinEvents: false,
      joinCommunities: false,
      viewDirectory: false,
      sendConnections: false,
      createCollaborations: false,
      applyToPrograms: false,
      appearInMatching: false,
      receiveOpportunities: false,
      publicProfileVisible: false,
    }
  },
  {
    name: "Core Access",
    range: [50, 79],
    features: {
      viewFeed: true,
      comment: true,
      createPost: true,
      joinEvents: true,
      joinCommunities: true,
      viewDirectory: true,
      sendConnections: "limited (3/day)",
      createCollaborations: false,
      applyToPrograms: false,
      appearInMatching: true,
      receiveOpportunities: false,
      publicProfileVisible: true,
    }
  },
  {
    name: "Full Access",
    range: [80, 100],
    features: {
      viewFeed: true,
      comment: true,
      createPost: true,
      joinEvents: true,
      joinCommunities: true,
      viewDirectory: true,
      sendConnections: true,
      createCollaborations: true,
      applyToPrograms: true,
      appearInMatching: true,
      receiveOpportunities: true,
      publicProfileVisible: true,
    }
  }
];

export const useProfileAccess = () => {
  const { profile } = useAuth();
  
  const completenessScore = profile?.profile_completeness_score || 0;
  
  const getCurrentAccessLevel = (): ProfileAccessLevel => {
    return ACCESS_LEVELS.find(level => 
      completenessScore >= level.range[0] && completenessScore <= level.range[1]
    ) || ACCESS_LEVELS[0];
  };
  
  const hasAccess = (feature: keyof ProfileAccessLevel['features']): boolean => {
    const currentLevel = getCurrentAccessLevel();
    const featureAccess = currentLevel.features[feature];
    return featureAccess === true || typeof featureAccess === 'string';
  };
  
  const meetsMinScore = (minScore: number): boolean => {
    return completenessScore >= minScore;
  };
  
  return {
    completenessScore,
    currentAccessLevel: getCurrentAccessLevel(),
    hasAccess,
    meetsMinScore,
  };
};