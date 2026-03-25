import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileStrengthCard } from '@/components/profile/ProfileStrengthCard';
import { Users, Network, MessageCircle } from 'lucide-react';
// MobileBottomNav removed - PulseDock handles mobile nav globally
import { calculateProfileCompletionPts } from '@/lib/profileCompletion';
import { ConnectTabExplainer, ConnectTab } from './ConnectTabExplainer';

export const ConnectLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: profile } = useProfile();

  const currentPath = (location.pathname.split('/').pop() || 'discover') as ConnectTab;

  const handleTabChange = (value: string) => {
    navigate(`/dna/connect/${value}`);
  };

  return (
    <>
      <div className="min-h-screen bg-background pb-bottom-nav md:pb-bottom-nav-0">
        <div className="container max-w-7xl mx-auto px-4 py-6 pt-20">
          {/* Header with Profile Strength */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-6 mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Connect</h1>
                <p className="text-muted-foreground">
                  Discover members, grow your network, and start conversations
                </p>
              </div>
              
              {profile && (
                <div className="w-full max-w-sm hidden md:block">
                  <ProfileStrengthCard
                    completionScore={calculateProfileCompletionPts(profile)}
                    compact
                  />
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <Tabs value={currentPath} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="discover" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Discover</span>
                </TabsTrigger>
                <TabsTrigger value="network" className="flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  <span className="hidden sm:inline">Network</span>
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Messages</span>
                </TabsTrigger>
              </TabsList>
          </Tabs>
          </div>

          {/* Tab Explainer */}
          <ConnectTabExplainer activeTab={currentPath} />

          {/* Content */}
          <Outlet />
        </div>
      </div>
      <MobileBottomNav />
    </>
  );
};