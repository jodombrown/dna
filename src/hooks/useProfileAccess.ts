import { useMemo } from 'react';
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

const getAccessLevel = (score: number): ProfileAccessLevel => {
  return ACCESS_LEVELS.find(level => 
    score >= level.range[0] && score <= level.range[1]
  ) || ACCESS_LEVELS[0];
};

export const useProfileAccess = () => {
  const { profile } = useAuth();
  
  // Memoize the score to prevent recalculation on every render
  const completenessScore = useMemo(() => {
    return profile?.profile_completion_percentage || 0;
  }, [profile?.profile_completion_percentage]);
  
  // Memoize the access level to prevent object recreation
  const currentAccessLevel = useMemo(() => {
    return getAccessLevel(completenessScore);
  }, [completenessScore]);
  
  // Memoize hasAccess to maintain stable reference
  const hasAccess = useMemo(() => {
    return (feature: keyof ProfileAccessLevel['features']): boolean => {
      const featureAccess = currentAccessLevel.features[feature];
      return featureAccess === true || typeof featureAccess === 'string';
    };
  }, [currentAccessLevel]);
  
  // Memoize meetsMinScore to maintain stable reference
  const meetsMinScore = useMemo(() => {
    return (minScore: number): boolean => {
      return completenessScore >= minScore;
    };
  }, [completenessScore]);
  
  return {
    completenessScore,
    currentAccessLevel,
    hasAccess,
    meetsMinScore,
  };
};
