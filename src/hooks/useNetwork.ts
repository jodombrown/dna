import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { networkService, NetworkConnection, NetworkCommunity } from '@/services/networkService';

export const useNetwork = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState<NetworkConnection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<NetworkConnection[]>([]);
  const [communities, setCommunities] = useState<NetworkCommunity[]>([]);
  const [counts, setCounts] = useState({
    connections: 0,
    followers: 0,
    communities: 0,
    events: 0,
    initiatives: 0,
    newsletters: 0
  });

  const fetchNetworkData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const [
        connectionsData,
        pendingData,
        communitiesData,
        countsData
      ] = await Promise.all([
        networkService.getConnections(user.id),
        networkService.getPendingRequests(user.id),
        networkService.getCommunities(user.id),
        networkService.getNetworkCounts(user.id)
      ]);

      setConnections(connectionsData);
      setPendingRequests(pendingData);
      setCommunities(communitiesData);
      setCounts(countsData);
    } catch (error) {
      console.error('Error fetching network data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkData();
  }, [user?.id]);

  const getDataForTab = (tab: string) => {
    switch (tab) {
      case 'connections':
        return connections;
      case 'followers':
        return pendingRequests; // For now, showing pending requests as followers
      case 'communities':
        return communities;
      default:
        return [];
    }
  };

  return {
    loading,
    connections,
    pendingRequests,
    communities,
    counts,
    getDataForTab,
    refreshData: fetchNetworkData
  };
};