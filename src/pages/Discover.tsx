import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, TrendingUp, Users, Target, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { ConnectionRequestModal } from '@/components/connect/ConnectionRequestModal';
import { TYPOGRAPHY } from '@/lib/typography.config';

interface Recommendation {
  id: string;
  type: 'space' | 'opportunity' | 'connection';
  score: number;
  reason: string;
  item: any;
}

export default function Discover() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const { data: profile } = useQuery({
    queryKey: ['current-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: spaceRecommendations, isLoading: loadingSpaces } = useQuery({
    queryKey: ['recommended-spaces', profile?.id],
    queryFn: async () => {
      if (!profile) return [];

      // Get all public spaces
      const { data: spaces } = await supabase
        .from('collaboration_spaces')
        .select('*')
        .eq('visibility', 'public')
        .eq('status', 'active')
        .limit(20);

      if (!spaces) return [];

      // Calculate match scores based on skills and interests
      const userSkills = profile.skills || [];
      const userInterests = profile.interests || [];
      const userImpactAreas = profile.impact_areas || [];

      const scoredSpaces = spaces
        .map(space => {
          let score = 0;
          const reasons = [];

          // Match on tags
          const spaceTags = space.tags || [];
          const skillMatches = spaceTags.filter(tag => 
            userSkills.some(skill => skill.toLowerCase().includes(tag.toLowerCase()))
          ).length;
          const interestMatches = spaceTags.filter(tag => 
            userInterests.some(interest => interest.toLowerCase().includes(tag.toLowerCase()))
          ).length;
          const impactMatches = spaceTags.filter(tag => 
            userImpactAreas.some(area => area.toLowerCase().includes(tag.toLowerCase()))
          ).length;

          score += skillMatches * 10;
          score += interestMatches * 8;
          score += impactMatches * 12;

          if (skillMatches > 0) reasons.push(`${skillMatches} matching skills`);
          if (interestMatches > 0) reasons.push(`${interestMatches} shared interests`);
          if (impactMatches > 0) reasons.push(`${impactMatches} impact areas aligned`);

          return {
            space,
            score,
            reason: reasons.join(', ') || 'New opportunity to explore'
          };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

      return scoredSpaces;
    },
    enabled: !!profile,
  });

  const { data: opportunityRecommendations, isLoading: loadingOpportunities } = useQuery({
    queryKey: ['recommended-opportunities', profile?.id],
    queryFn: async () => {
      if (!profile) return [];

      const { data: opportunities } = await supabase
        .from('opportunities')
        .select('*')
        .eq('status', 'active')
        .eq('visibility', 'public')
        .limit(20);

      if (!opportunities) return [];

      const userSkills = profile.skills || [];
      const userInterests = profile.interests || [];

      const scoredOpportunities = opportunities
        .map(opp => {
          let score = 0;
          const reasons = [];

          const oppTags = opp.tags || [];
          const skillMatches = oppTags.filter(tag => 
            userSkills.some(skill => skill.toLowerCase().includes(tag.toLowerCase()))
          ).length;
          const interestMatches = oppTags.filter(tag => 
            userInterests.some(interest => interest.toLowerCase().includes(tag.toLowerCase()))
          ).length;

          score += skillMatches * 15;
          score += interestMatches * 10;

          // Boost by type
          if (opp.type === profile.profession) score += 20;

          if (skillMatches > 0) reasons.push(`${skillMatches} matching skills`);
          if (interestMatches > 0) reasons.push(`${interestMatches} shared interests`);

          return {
            opportunity: opp,
            score,
            reason: reasons.join(', ') || 'Matches your profile'
          };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

      return scoredOpportunities;
    },
    enabled: !!profile,
  });

  const { data: connectionSuggestions, isLoading: loadingConnections } = useQuery({
    queryKey: ['suggested-connections', profile?.id],
    queryFn: async () => {
      if (!profile) return [];

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get users with similar skills/interests
      const { data: similarUsers } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .limit(50);

      if (!similarUsers) return [];

      const userSkills = profile.skills || [];
      const userInterests = profile.interests || [];
      const userImpactAreas = profile.impact_areas || [];

      const scoredUsers = similarUsers
        .filter(otherUser => otherUser && otherUser.id) // Filter out null/undefined users
        .map(otherUser => {
          let score = 0;
          const reasons = [];

          const otherSkills = otherUser.skills || [];
          const otherInterests = otherUser.interests || [];
          const otherImpactAreas = otherUser.impact_areas || [];

          const skillOverlap = userSkills.filter(s => otherSkills.includes(s)).length;
          const interestOverlap = userInterests.filter(i => otherInterests.includes(i)).length;
          const impactOverlap = userImpactAreas.filter(a => otherImpactAreas.includes(a)).length;

          score += skillOverlap * 8;
          score += interestOverlap * 6;
          score += impactOverlap * 10;

          // Same location boost
          if (profile.location && otherUser.location === profile.location) {
            score += 15;
            reasons.push('Same location');
          }

          if (skillOverlap > 0) reasons.push(`${skillOverlap} shared skills`);
          if (interestOverlap > 0) reasons.push(`${interestOverlap} shared interests`);
          if (impactOverlap > 0) reasons.push(`${impactOverlap} aligned impact areas`);

          return {
            user: otherUser,
            score,
            reason: reasons.join(', ') || 'Part of DNA network'
          };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

      return scoredUsers;
    },
    enabled: !!profile,
  });

  const handleConnect = (user: any) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleSendRequest = async (note: string) => {
    if (!selectedUser || !profile) return;
    
    setConnectingTo(selectedUser.id);
    
    try {
      const { error } = await supabase
        .from('connection_requests')
        .insert({
          sender_id: profile.id,
          receiver_id: selectedUser.id,
          status: 'pending',
          message: note || null,
        });

      if (error) throw error;

      toast({
        title: 'Connection request sent!',
        description: 'You\'ll be notified when they respond.',
      });
      
      // Invalidate queries to refresh recommendations
      queryClient.invalidateQueries({ queryKey: ['connection-suggestions'] });
      
    } catch (error: any) {
      toast({
        title: 'Failed to send request',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setConnectingTo(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dna/me')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-8 w-8 text-dna-copper" />
            <h1 className={TYPOGRAPHY.h1}>Discover</h1>
          </div>
          <p className={`${TYPOGRAPHY.body} text-muted-foreground`}>
            Personalized recommendations based on your skills, interests, and impact goals
          </p>
        </div>

        {/* Collaboration Spaces */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`${TYPOGRAPHY.h2} flex items-center gap-2`}>
                <Users className="h-6 w-6" />
                Recommended Spaces
              </h2>
              <p className={`${TYPOGRAPHY.bodySmall} text-muted-foreground`}>
                Projects that match your expertise
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/dna/spaces')}>
              View All
            </Button>
          </div>

          {loadingSpaces ? (
            <div className="text-center py-8">Loading recommendations...</div>
          ) : !spaceRecommendations || spaceRecommendations.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <p className="text-muted-foreground">
                  Complete your profile to get personalized space recommendations
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {spaceRecommendations.map(({ space, score, reason }) => (
                <Card
                  key={space.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/spaces/${space.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="line-clamp-1">{space.title}</CardTitle>
                      <Badge variant="secondary" className="ml-2">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {score}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {space.description || 'No description available'}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-xs text-dna-copper">
                      <Sparkles className="h-3 w-3" />
                      <span>{reason}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Opportunities */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`${TYPOGRAPHY.h2} flex items-center gap-2`}>
                <Target className="h-6 w-6" />
                Recommended Opportunities
              </h2>
              <p className={`${TYPOGRAPHY.bodySmall} text-muted-foreground`}>
                Contributions aligned with your skills
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/dna/impact')}>
              View All
            </Button>
          </div>

          {loadingOpportunities ? (
            <div className="text-center py-8">Loading recommendations...</div>
          ) : !opportunityRecommendations || opportunityRecommendations.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <p className="text-muted-foreground">
                  Complete your profile to get personalized opportunity recommendations
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {opportunityRecommendations.map(({ opportunity, score, reason }) => (
                <Card
                  key={opportunity.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/opportunities/${opportunity.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="line-clamp-1">{opportunity.title}</CardTitle>
                      <Badge variant="secondary" className="ml-2">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {score}%
                      </Badge>
                    </div>
                    <Badge variant="outline" className="mb-2">{opportunity.type}</Badge>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {opportunity.description || 'No description available'}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-xs text-dna-copper">
                      <Sparkles className="h-3 w-3" />
                      <span>{reason}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Connection Suggestions */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`${TYPOGRAPHY.h2} flex items-center gap-2`}>
                <Users className="h-6 w-6" />
                Suggested Connections
              </h2>
              <p className={`${TYPOGRAPHY.bodySmall} text-muted-foreground`}>
                DNA members with shared interests
              </p>
            </div>
          </div>

          {loadingConnections ? (
            <div className="text-center py-8">Loading suggestions...</div>
          ) : !connectionSuggestions || connectionSuggestions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <p className="text-muted-foreground">
                  Complete your profile to get personalized connection suggestions
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectionSuggestions
                .filter(item => item && item.user && item.user.id) // Extra safety check
                .map(({ user, score, reason }) => (
                  <Card key={user.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>
                            {user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className={`${TYPOGRAPHY.h5} truncate`}>{user.full_name || 'Unknown'}</p>
                          <p className={`${TYPOGRAPHY.bodySmall} text-muted-foreground truncate`}>
                            {user.headline || user.profession || ''}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {score}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-dna-copper mb-3">
                        <Sparkles className="h-3 w-3" />
                        <span className="line-clamp-1">{reason}</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handleConnect(user)}
                        disabled={connectingTo === user.id}
                      >
                        {connectingTo === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Connect'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </section>
      </div>

      <ConnectionRequestModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedUser(null);
        }}
        onSend={handleSendRequest}
        targetUser={selectedUser}
      />
    </div>
  );
}
