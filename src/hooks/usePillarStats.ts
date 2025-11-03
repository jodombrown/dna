import { useState, useEffect } from 'react';

export interface PillarStats {
  feed: {
    postsCount: number;
    latestPost?: string;
  };
  connect: {
    connectionsCount: number;
    pendingRequests: number;
  };
  collaborate: {
    activeProjects: number;
    upcomingEvents: number;
  };
  contribute: {
    opportunitiesCount: number;
    myContributions: number;
  };
}

export const usePillarStats = (userId?: string) => {
  const [stats, setStats] = useState<PillarStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Simulate loading and set mock stats for now
    const timer = setTimeout(() => {
      setStats({
        feed: {
          postsCount: 12,
          latestPost: undefined
        },
        connect: {
          connectionsCount: 47,
          pendingRequests: 3
        },
        collaborate: {
          activeProjects: 5,
          upcomingEvents: 8
        },
        contribute: {
          opportunitiesCount: 24,
          myContributions: 6
        }
      });
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [userId]);

  return { data: stats, isLoading };
};
