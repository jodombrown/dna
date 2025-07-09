import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Building, Lightbulb, UserPlus, RefreshCw, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

interface SuggestedConnection {
  id: string;
  full_name: string;
  display_name?: string;
  avatar_url?: string;
  location?: string;
  bio?: string;
  match_score: number;
  match_reason: string;
  shared_interests: string[];
  pillars: string[];
}

interface SuggestedCommunity {
  id: string;
  name: string;
  description?: string;
  member_count: number;
  category?: string;
  tags: string[];
  match_reason: string;
}

interface Opportunity {
  id: string;
  title: string;
  type: 'event' | 'project' | 'collaboration' | 'funding';
  description: string;
  pillar: string;
  match_score: number;
  deadline?: string;
}

const AdinSuggestions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<SuggestedConnection[]>([]);
  const [communities, setCommunities] = useState<SuggestedCommunity[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggestedConnections = async () => {
    if (!user) return [];

    try {
      // Get user's ADIN profile
      const { data: userProfile } = await supabase
        .from('user_adin_profile')
        .select('interests, industries, engagement_pillars')
        .eq('user_id', user.id)
        .single();

      // Get connection signals to avoid suggesting already connected users
      const { data: existingConnections } = await supabase
        .from('adin_connection_signals')
        .select('target_user, source_user')
        .or(`source_user.eq.${user.id},target_user.eq.${user.id}`);

      const connectedUserIds = new Set([
        ...(existingConnections?.map(c => c.source_user) || []),
        ...(existingConnections?.map(c => c.target_user) || [])
      ]);

      // Get potential matches based on ADIN profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, display_name, avatar_url, location, bio')
        .neq('id', user.id)
        .eq('is_public', true)
        .limit(20);

      if (!profiles || !userProfile) return [];

      // Calculate match scores based on ADIN criteria
      const scoredConnections = await Promise.all(
        profiles
          .filter(profile => !connectedUserIds.has(profile.id))
          .map(async (profile) => {
            // Get their ADIN profile
            const { data: targetProfile } = await supabase
              .from('user_adin_profile')
              .select('interests, industries, engagement_pillars')
              .eq('user_id', profile.id)
              .single();

            if (!targetProfile) return null;

            let matchScore = 0;
            const matchReasons = [];
            const sharedInterests = [];

            // Interest overlap (30% weight)
            if (userProfile.interests && targetProfile.interests) {
              const shared = userProfile.interests.filter(interest => 
                targetProfile.interests.includes(interest)
              );
              sharedInterests.push(...shared);
              matchScore += (shared.length / Math.max(userProfile.interests.length, 1)) * 0.3;
              if (shared.length > 0) matchReasons.push(`Shared interests: ${shared.slice(0, 2).join(', ')}`);
            }

            // Industry overlap (20% weight)
            if (userProfile.industries && targetProfile.industries) {
              const shared = userProfile.industries.filter(industry => 
                targetProfile.industries.includes(industry)
              );
              matchScore += (shared.length / Math.max(userProfile.industries.length, 1)) * 0.2;
              if (shared.length > 0) matchReasons.push(`Same industry: ${shared[0]}`);
            }

            // Pillar engagement similarity (20% weight)
            if (userProfile.engagement_pillars && targetProfile.engagement_pillars) {
              const shared = userProfile.engagement_pillars.filter(pillar => 
                targetProfile.engagement_pillars.includes(pillar)
              );
              matchScore += (shared.length / 3) * 0.2; // Max 3 pillars
              if (shared.length > 0) matchReasons.push(`Active in ${shared[0]}`);
            }

            return {
              id: profile.id,
              full_name: profile.full_name || 'DNA Member',
              display_name: profile.display_name,
              avatar_url: profile.avatar_url,
              location: profile.location,
              bio: profile.bio,
              match_score: matchScore,
              match_reason: matchReasons[0] || 'Active community member',
              shared_interests: sharedInterests.slice(0, 3),
              pillars: targetProfile.engagement_pillars || []
            };
          })
      );

      return scoredConnections
        .filter(Boolean)
        .sort((a, b) => b!.match_score - a!.match_score)
        .slice(0, 5) as SuggestedConnection[];

    } catch (error) {
      console.error('Error fetching suggested connections:', error);
      return [];
    }
  };

  const fetchSuggestedCommunities = async () => {
    try {
      // Get communities with member count
      const { data: communities } = await supabase
        .from('communities')
        .select('*')
        .eq('is_active', true)
        .order('member_count', { ascending: false })
        .limit(10);

      if (!communities) return [];

      // Mock enhanced community suggestions with match reasoning
      return communities.slice(0, 3).map(community => ({
        id: community.id,
        name: community.name,
        description: community.description,
        member_count: community.member_count || 0,
        category: community.category,
        tags: community.tags || [],
        match_reason: 'Active in your areas of interest'
      }));

    } catch (error) {
      console.error('Error fetching suggested communities:', error);
      return [];
    }
  };

  const fetchOpportunities = async () => {
    // Mock opportunities based on user's engagement patterns
    const mockOpportunities: Opportunity[] = [
      {
        id: '1',
        title: 'African Tech Innovation Summit',
        type: 'event',
        description: 'Connect with tech leaders across Africa',
        pillar: 'connect',
        match_score: 0.9,
        deadline: '2024-03-15'
      },
      {
        id: '2',
        title: 'Diaspora Investment Initiative',
        type: 'funding',
        description: 'Seed funding for African startups',
        pillar: 'collaborate',
        match_score: 0.8
      },
      {
        id: '3',
        title: 'Education Support Project',
        type: 'project',
        description: 'Help provide digital literacy training',
        pillar: 'contribute',
        match_score: 0.7
      }
    ];

    return mockOpportunities;
  };

  const refreshSuggestions = async () => {
    setLoading(true);
    try {
      const [connectionsData, communitiesData, opportunitiesData] = await Promise.all([
        fetchSuggestedConnections(),
        fetchSuggestedCommunities(),
        fetchOpportunities()
      ]);

      setConnections(connectionsData);
      setCommunities(communitiesData);
      setOpportunities(opportunitiesData);
    } catch (error) {
      console.error('Error refreshing suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to load suggestions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (connectionId: string) => {
    if (!user) return;

    try {
      // Create connection signal
      await supabase
        .from('adin_connection_signals')
        .insert({
          source_user: user.id,
          target_user: connectionId,
          reason: 'suggested_connection',
          score: 0.5,
          context: { via: 'suggestions' }
        });

      toast({
        title: "Connection Request Sent",
        description: "ADIN has recorded your interest in connecting",
      });

      // Remove from suggestions
      setConnections(prev => prev.filter(c => c.id !== connectionId));
    } catch (error) {
      console.error('Error creating connection:', error);
    }
  };

  useEffect(() => {
    refreshSuggestions();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Suggested Connections */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-dna-emerald" />
              Suggested Connections
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshSuggestions}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-xs text-gray-500">ADIN-powered based on shared interests and engagement</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {connections.length > 0 ? (
            connections.map((connection) => (
              <div key={connection.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={connection.avatar_url || undefined} />
                    <AvatarFallback className="bg-dna-emerald text-white">
                      {connection.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{connection.display_name || connection.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{connection.location}</p>
                    <p className="text-xs text-dna-emerald">{connection.match_reason}</p>
                    {connection.shared_interests.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {connection.shared_interests.map(interest => (
                          <Badge key={interest} variant="outline" className="text-xs px-1 py-0">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleConnect(connection.id)}
                  className="hover:bg-dna-emerald hover:text-white"
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  Connect
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Complete your profile to get better suggestions
            </p>
          )}
        </CardContent>
      </Card>

      {/* Suggested Communities */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Building className="h-5 w-5 mr-2 text-dna-copper" />
            Suggested Communities
          </CardTitle>
          <p className="text-xs text-gray-500">Based on your interests and network activity</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {communities.map((community) => (
            <div key={community.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">{community.name}</h4>
                <Badge variant="secondary" className="text-xs">
                  {community.member_count} members
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mb-2">{community.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-dna-copper">{community.match_reason}</p>
                <Button size="sm" variant="outline" className="hover:bg-dna-copper hover:text-white">
                  Join
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Opportunities for You */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-dna-gold" />
            Opportunities for You
          </CardTitle>
          <p className="text-xs text-gray-500">Curated based on your ADIN engagement profile</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {opportunities.map((opportunity) => (
            <div key={opportunity.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{opportunity.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{opportunity.description}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`ml-2 text-xs ${
                    opportunity.pillar === 'connect' ? 'border-dna-emerald text-dna-emerald' :
                    opportunity.pillar === 'collaborate' ? 'border-dna-copper text-dna-copper' :
                    'border-dna-forest text-dna-forest'
                  }`}
                >
                  {opportunity.pillar}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-dna-gold" />
                  <span className="text-xs text-dna-gold">
                    {Math.round(opportunity.match_score * 100)}% match
                  </span>
                </div>
                <Button size="sm" variant="outline" className="hover:bg-dna-gold hover:text-white">
                  Learn More
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdinSuggestions;