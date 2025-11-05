import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import UserDashboardLayout from '@/components/dashboard/UserDashboardLayout';

const DnaImpact = () => {
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

  return <UserDashboardLayout profile={profile} currentUser={user} viewMode="impact" />;
};

export default DnaImpact;
