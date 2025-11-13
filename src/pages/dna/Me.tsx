import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import MyDNAHub from '@/components/dashboard/MyDNAHub';
import { ConnectNudges } from '@/components/connect/ConnectNudges';

const DnaMe = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      <ConnectNudges />
      <MyDNAHub profile={profile} currentUser={user} />
    </div>
  );
};

export default DnaMe;
