import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Trophy, 
  Users, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  BarChart3,
  Settings,
  Crown
} from 'lucide-react';

const AdinAdminPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch ADIN leaderboard
  const { data: leaderboard, isLoading: loadingLeaderboard } = useQuery({
    queryKey: ['adin-leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('adin_profiles')
        .select(`
          id,
          display_name,
          influence_score,
          verified,
          region_focus,
          sector_focus,
          admin_notes,
          profiles!inner(full_name, avatar_url)
        `)
        .order('influence_score', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch contribution queue
  const { data: contributionQueue, isLoading: loadingContributions } = useQuery({
    queryKey: ['contribution-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('adin_contributor_requests')
        .select(`
          id,
          user_id,
          description,
          impact_type,
          country_focus,
          evidence_links,
          status,
          created_at
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Fetch user profiles separately
      const userIds = data?.map(req => req.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);
      
      // Merge profile data
      return data?.map(request => ({
        ...request,
        profile: profiles?.find(p => p.id === request.user_id)
      }));
    }
  });

  // Fetch signal analytics
  const { data: signalAnalytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['signal-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('adin_signals')
        .select('id, signal_type, seen, created_at');
      
      if (error) throw error;
      
      const totalSent = data.length;
      const totalSeen = data.filter(s => s.seen).length;
      const engagementRate = totalSent > 0 ? (totalSeen / totalSent * 100).toFixed(1) : '0';
      const seenPercentage = totalSent > 0 ? (totalSeen / totalSent * 100).toFixed(1) : '0';
      
      return {
        total_sent: totalSent,
        engagement_rate: `${engagementRate}%`,
        seen_percentage: `${seenPercentage}%`,
        by_type: data.reduce((acc: any, signal) => {
          acc[signal.signal_type] = (acc[signal.signal_type] || 0) + 1;
          return acc;
        }, {})
      };
    }
  });

  // Verify contributor mutation
  const verifyContributorMutation = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: string; action: 'verify' | 'reject' }) => {
      const { error } = await supabase
        .from('adin_contributor_requests')
        .update({ 
          status: action === 'verify' ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contribution-queue'] });
      toast({
        title: "Success",
        description: "Contributor request processed successfully.",
      });
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async ({ profileId, updates }: { profileId: string; updates: any }) => {
      const { error } = await supabase
        .from('adin_profiles')
        .update(updates)
        .eq('id', profileId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adin-leaderboard'] });
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
      setSelectedProfile(null);
    }
  });

  const handleProfileOverride = (profile: any) => {
    setSelectedProfile(profile);
    setAdminNotes(profile.admin_notes || '');
  };

  const saveProfileChanges = () => {
    if (!selectedProfile) return;
    
    updateProfileMutation.mutate({
      profileId: selectedProfile.id,
      updates: {
        admin_notes: adminNotes,
        // Add other fields as needed
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dna-forest mb-2">ADIN Intelligence Center</h1>
        <p className="text-gray-600">Advanced analytics and management for the ADIN ecosystem</p>
      </div>

      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="contributions" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Contributions
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="override" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Override
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-dna-gold" />
                ADIN Influence Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingLeaderboard ? (
                <div className="text-center py-8">Loading leaderboard...</div>
              ) : (
                <div className="space-y-4">
                  {leaderboard?.map((profile, index) => (
                    <div key={profile.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-dna-emerald text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-dna-forest">
                            {profile.profiles?.full_name || profile.display_name || 'Anonymous'}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={profile.verified ? "default" : "secondary"}>
                              {profile.verified ? 'Verified' : 'Unverified'}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Score: {profile.influence_score || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Focus Areas</div>
                        <div className="flex flex-wrap gap-1">
                          {profile.region_focus?.slice(0, 2).map((region: string) => (
                            <Badge key={region} variant="outline" className="text-xs">
                              {region}
                            </Badge>
                          ))}
                          {profile.sector_focus?.slice(0, 2).map((sector: string) => (
                            <Badge key={sector} variant="outline" className="text-xs">
                              {sector}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributions">
          <Card>
            <CardHeader>
              <CardTitle>Contribution Verification Queue</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingContributions ? (
                <div className="text-center py-8">Loading contributions...</div>
              ) : contributionQueue?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending contributions to review
                </div>
              ) : (
                <div className="space-y-4">
                  {contributionQueue?.map((request) => (
                    <div key={request.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-dna-forest">
                            {request.profile?.full_name || 'Unknown User'}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {request.profile?.email || 'No email'}
                          </p>
                          <div className="mt-2">
                            <Badge variant="outline">{request.impact_type}</Badge>
                            <Badge variant="outline" className="ml-2">{request.country_focus}</Badge>
                          </div>
                          <p className="mt-3 text-sm">{request.description}</p>
                          {request.evidence_links && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500">Evidence Links:</span>
                              <ul className="text-xs text-blue-600 mt-1">
                                {request.evidence_links.map((link: string, idx: number) => (
                                  <li key={idx}>
                                    <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                      {link}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => verifyContributorMutation.mutate({ 
                              requestId: request.id, 
                              action: 'verify' 
                            })}
                            disabled={verifyContributorMutation.isPending}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => verifyContributorMutation.mutate({ 
                              requestId: request.id, 
                              action: 'reject' 
                            })}
                            disabled={verifyContributorMutation.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Total Signals Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-dna-emerald">
                  {signalAnalytics?.total_sent || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Engagement Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-dna-copper">
                  {signalAnalytics?.engagement_rate || '0%'}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Seen Percentage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-dna-gold">
                  {signalAnalytics?.seen_percentage || '0%'}
                </div>
              </CardContent>
            </Card>
          </div>

          {signalAnalytics?.by_type && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Signals by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(signalAnalytics.by_type).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="capitalize">{type}</span>
                      <Badge variant="secondary">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="override">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Selection</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingLeaderboard ? (
                  <div className="text-center py-8">Loading profiles...</div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {leaderboard?.map((profile) => (
                      <div
                        key={profile.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedProfile?.id === profile.id 
                            ? 'border-dna-emerald bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleProfileOverride(profile)}
                      >
                        <div className="font-medium">
                          {profile.profiles?.full_name || profile.display_name || 'Anonymous'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Score: {profile.influence_score || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Override</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedProfile ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Selected Profile
                      </label>
                      <div className="p-2 bg-gray-50 rounded">
                        {selectedProfile.profiles?.full_name || selectedProfile.display_name || 'Anonymous'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Admin Notes
                      </label>
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add admin notes about this profile..."
                        rows={4}
                      />
                    </div>

                    <Button
                      onClick={saveProfileChanges}
                      disabled={updateProfileMutation.isPending}
                      className="w-full"
                    >
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Select a profile from the list to override settings
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdinAdminPanel;