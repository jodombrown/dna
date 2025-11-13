import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import DashboardDiscoverColumn from '@/components/dashboard/DashboardDiscoverColumn';

const ConnectDiscover = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return <DashboardDiscoverColumn profile={profile} isOwnProfile={true} />;
};

export default ConnectDiscover;
