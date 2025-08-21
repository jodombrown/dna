import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  UserCheck, 
  Clock, 
  TrendingUp,
  Mail,
  CheckCircle2
} from 'lucide-react';

interface OnboardingStats {
  total_approved: number;
  profiles_created: number;
  profiles_completed: number;
  pending_invitations: number;
  completion_rate: number;
  avg_completion_time_hours: number;
}

const OnboardingProgress = () => {
  const [stats, setStats] = useState<OnboardingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentProfiles, setRecentProfiles] = useState<any[]>([]);

  useEffect(() => {
    fetchOnboardingStats();
    fetchRecentProfiles();
  }, []);

  const fetchOnboardingStats = async () => {
    try {
      const { data: applications, error: appError } = await supabase
        .from('beta_applications')
        .select('id, status, profile_created_at, created_at')
        .eq('status', 'approved');

      if (appError) throw appError;

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, onboarding_completed_at, created_at')
        .not('onboarding_completed_at', 'is', null);

      if (profileError) throw profileError;

      const totalApproved = applications?.length || 0;
      const profilesCreated = applications?.filter(app => app.profile_created_at).length || 0;
      const profilesCompleted = profiles?.length || 0;
      const pendingInvitations = totalApproved - profilesCreated;
      const completionRate = totalApproved > 0 ? (profilesCompleted / totalApproved) * 100 : 0;

      // Calculate average completion time
      const completedProfiles = profiles?.filter(p => p.onboarding_completed_at) || [];
      const avgCompletionTime = completedProfiles.length > 0 
        ? completedProfiles.reduce((acc, profile) => {
            const created = new Date(profile.created_at);
            const completed = new Date(profile.onboarding_completed_at);
            const diffHours = (completed.getTime() - created.getTime()) / (1000 * 60 * 60);
            return acc + diffHours;
          }, 0) / completedProfiles.length
        : 0;

      setStats({
        total_approved: totalApproved,
        profiles_created: profilesCreated,
        profiles_completed: profilesCompleted,
        pending_invitations: pendingInvitations,
        completion_rate: Math.round(completionRate),
        avg_completion_time_hours: Math.round(avgCompletionTime * 10) / 10
      });
    } catch (error) {
      console.error('Error fetching onboarding stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, onboarding_completed_at, created_at')
        .not('onboarding_completed_at', 'is', null)
        .order('onboarding_completed_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentProfiles(data || []);
    } catch (error) {
      console.error('Error fetching recent profiles:', error);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6">
        <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500 p-8">
        Unable to load onboarding statistics
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Approved</p>
                <p className="text-2xl font-bold text-dna-forest">{stats.total_approved}</p>
              </div>
              <Users className="w-8 h-8 text-dna-copper" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profiles Created</p>
                <p className="text-2xl font-bold text-dna-emerald">{stats.profiles_created}</p>
              </div>
              <UserCheck className="w-8 h-8 text-dna-emerald" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Onboarding Complete</p>
                <p className="text-2xl font-bold text-dna-gold">{stats.profiles_completed}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-dna-gold" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Invites</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending_invitations}</p>
              </div>
              <Mail className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completion Rate Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-dna-copper" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Overall Progress</span>
                  <span className="text-sm font-medium">{stats.completion_rate}%</span>
                </div>
                <Progress 
                  value={stats.completion_rate} 
                  className="h-3"
                />
              </div>
              <div className="text-sm text-gray-600">
                {stats.profiles_completed} of {stats.total_approved} approved users have completed onboarding
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-dna-emerald" />
              Average Completion Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-dna-emerald">
                {stats.avg_completion_time_hours}h
              </div>
              <p className="text-sm text-gray-600">
                Average time from account creation to profile completion
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Completions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Profile Completions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentProfiles.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No completed profiles yet
            </div>
          ) : (
            <div className="space-y-3">
              {recentProfiles.map((profile) => (
                <div key={profile.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{profile.full_name}</p>
                    <p className="text-sm text-gray-600">{profile.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      Completed
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(profile.onboarding_completed_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingProgress;