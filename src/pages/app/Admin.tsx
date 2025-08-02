import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserCheck, TrendingUp, Signal, Trophy, MessageSquare, Flag, Settings } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import UserManagementTable from '@/components/admin/UserManagementTable';
import AdinProfileControls from '@/components/admin/AdinProfileControls';
import ContributionModerationQueue from '@/components/admin/ContributionModerationQueue';
import SignalAnalyticsDashboard from '@/components/admin/SignalAnalyticsDashboard';
import LeaderboardsByRegion from '@/components/admin/LeaderboardsByRegion';
import InviteSystemOverview from '@/components/admin/InviteSystemOverview';
import CommunityModeration from '@/components/admin/CommunityModeration';
import FeatureTogglesPanel from '@/components/admin/FeatureTogglesPanel';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        navigate('/app');
        return;
      }

      try {
        const { data: adminStatus } = await supabase.rpc('is_admin_user', { 
          _user_id: user.id 
        });

        if (!adminStatus) {
          navigate('/app');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin access:', error);
        navigate('/app');
      }
    };

    checkAdminAccess();
  }, [user, navigate]);

  if (isAdmin === null) {
    return <Loader label="Verifying admin access..." />;
  }

  if (!isAdmin) {
    return null;
  }

  const adminSections = [
    { id: 'users', label: 'Users', icon: Users, component: UserManagementTable },
    { id: 'adin', label: 'ADIN Profiles', icon: UserCheck, component: AdinProfileControls },
    { id: 'contributions', label: 'Contributions', icon: TrendingUp, component: ContributionModerationQueue },
    { id: 'signals', label: 'Signals', icon: Signal, component: SignalAnalyticsDashboard },
    { id: 'leaderboards', label: 'Leaderboards', icon: Trophy, component: LeaderboardsByRegion },
    { id: 'invites', label: 'Invites', icon: MessageSquare, component: InviteSystemOverview },
    { id: 'communities', label: 'Communities', icon: Flag, component: CommunityModeration },
    { id: 'features', label: 'Feature Flags', icon: Settings, component: FeatureTogglesPanel },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, component: require('@/components/admin/AdminAnalyticsDashboard').default },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-dna-forest" />
            <h1 className="text-3xl font-bold text-foreground">Admin Control Suite</h1>
            <Badge variant="secondary" className="bg-dna-forest text-white">
              Beta Management
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Comprehensive admin dashboard for managing DNA platform operations
          </p>
        </div>

        {/* Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 mb-8 h-auto p-1">
            {adminSections.map((section) => {
              const Icon = section.icon;
              return (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="flex flex-col items-center gap-1 py-3 px-2 text-xs"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{section.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {adminSections.map((section) => {
            const Component = section.component;
            return (
              <TabsContent key={section.id} value={section.id} className="mt-0">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <section.icon className="h-6 w-6 text-dna-forest" />
                    <h2 className="text-2xl font-semibold text-foreground">
                      {section.label}
                    </h2>
                  </div>
                  <Component />
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;