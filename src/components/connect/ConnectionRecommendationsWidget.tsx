import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Globe, MapPin, Lightbulb, Loader2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { ConnectionRequestModal } from './ConnectionRequestModal';

interface AfricaFocusArea {
  geography: string;
  sectors: string[];
}

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  headline?: string;
  company?: string;
  location?: string;
  country_of_origin?: string;
  intentions?: string[];
  africa_focus_areas?: string[]; // DB stores as string array
  [key: string]: any; // Allow other profile fields
}

interface ScoredProfile extends Profile {
  score: number;
  matchPercentage?: number;
  reason: string;
}

export const ConnectionRecommendationsWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  // Fetch current user profile
  const { data: currentUser } = useQuery({
    queryKey: ['current-user-full', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();
      return data as Profile;
    },
    enabled: !!user?.id,
  });

  // Fetch existing connections
  const { data: existingConnections } = useQuery({
    queryKey: ['user-connections', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('connections')
        .select('b')
        .eq('a', user!.id)
        .eq('status', 'accepted');
      return data?.map(c => c.b) || [];
    },
    enabled: !!user?.id,
  });

  // Fetch pending connection requests (sent and received)
  const { data: pendingRequests } = useQuery({
    queryKey: ['pending-requests', user?.id],
    queryFn: async () => {
      const { data: sent } = await supabase
        .from('connection_requests')
        .select('receiver_id')
        .eq('sender_id', user!.id)
        .eq('status', 'pending');
      
      const { data: received } = await supabase
        .from('connection_requests')
        .select('sender_id')
        .eq('receiver_id', user!.id)
        .eq('status', 'pending');
      
      return [
        ...(sent?.map(r => r.receiver_id) || []),
        ...(received?.map(r => r.sender_id) || [])
      ];
    },
    enabled: !!user?.id,
  });

  // Fetch and score recommendations
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['connection-recommendations', user?.id, currentUser, existingConnections, pendingRequests],
    queryFn: async () => {
      if (!currentUser) return [];

      // Fetch potential candidates (exclude self, existing connections, pending requests, incomplete profiles)
      const excludedIds = [
        user!.id,
        ...(existingConnections || []),
        ...(pendingRequests || [])
      ];

      const { data: candidates } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', `(${excludedIds.join(',')})`)
        .gte('profile_completion_percentage', 40)
        .limit(100); // Fetch more to apply diversity later

      if (!candidates) return [];

      // Get viewed recommendations from localStorage for anti-staleness
      const viewedKey = `recommendations_viewed_${user!.id}`;
      const viewed = JSON.parse(localStorage.getItem(viewedKey) || '{}');
      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

      // Score each candidate with multi-dimensional algorithm
      const scored: ScoredProfile[] = candidates.map(candidate => {
        let score = 0;
        const reasons: string[] = [];

        // A. DIASPORA ALIGNMENT (30 points max)
        if (candidate.country_of_origin === currentUser.country_of_origin && candidate.country_of_origin) {
          score += 20;
          reasons.push(`Both from ${currentUser.country_of_origin}`);
        }
        if (candidate.diaspora_status === currentUser.diaspora_status && candidate.diaspora_status) {
          score += 10;
        }

        // B. INTENTION COMPLEMENTARITY (25 points max)
        const userIntents = currentUser.intentions || [];
        const candIntents = candidate.intentions || [];
        
        // High synergy pairs
        if ((userIntents.includes('invest') && candIntents.includes('build')) ||
            (userIntents.includes('build') && candIntents.includes('invest'))) {
          score += 25;
          reasons.push('Investor seeking builders');
        } else if ((userIntents.includes('mentor') && candIntents.includes('learn')) ||
                   (userIntents.includes('learn') && candIntents.includes('mentor'))) {
          score += 20;
          reasons.push('Mentor-learner match');
        } else if ((userIntents.includes('give_back') && candIntents.includes('build')) ||
                   (userIntents.includes('build') && candIntents.includes('give_back'))) {
          score += 15;
        } else {
          // Matching intentions
          const sharedIntents = userIntents.filter(i => candIntents.includes(i));
          if (sharedIntents.length > 0) {
            score += Math.min(10, sharedIntents.length * 5);
          }
        }

        // C. AFRICA FOCUS OVERLAP (20 points max)
        const userAreas = currentUser.africa_focus_areas || [];
        const candAreas = candidate.africa_focus_areas || [];
        const sharedAreas = userAreas.filter(a => candAreas.includes(a));
        
        if (sharedAreas.length > 0) {
          score += 15;
          if (reasons.length === 0) {
            reasons.push(`Both focused on ${sharedAreas[0]}`);
          }
          // Additional points for sector overlap (up to 5 more)
          score += Math.min(5, sharedAreas.length - 1);
        }

        // D. SKILLS RELEVANCE (15 points max)
        const userSkills = currentUser.skills || [];
        const candSkills = candidate.skills || [];
        const sharedSkills = userSkills.filter(s => candSkills.includes(s));
        score += Math.min(15, sharedSkills.length * 3);

        // E. NETWORK PROXIMITY (10 points max)
        // For now, placeholder - would need connections graph query
        // In future: query mutual connections via connections table

        // Apply anti-staleness decay (10% if shown in last 7 days)
        if (viewed[candidate.id] && viewed[candidate.id] > sevenDaysAgo) {
          score = Math.floor(score * 0.9);
        }

        // Calculate match percentage
        const matchPercentage = Math.min(100, Math.round(score));

        return {
          ...candidate,
          score,
          matchPercentage,
          reason: reasons[0] || 'Recommended for you'
        };
      });

      // Apply diversity rules
      let diverse: ScoredProfile[] = [];
      const cityCounts: Record<string, number> = {};

      for (const profile of scored.sort((a, b) => b.score - a.score)) {
        const city = profile.location?.split(',')[0]?.trim() || 'Unknown';
        const cityCount = cityCounts[city] || 0;

        // Max 2 from same city in recommendations
        if (cityCount < 2) {
          diverse.push(profile);
          cityCounts[city] = cityCount + 1;
        }

        if (diverse.length >= 5) break;
      }

      // Track viewed recommendations
      const updatedViewed = { ...viewed };
      diverse.forEach(p => {
        updatedViewed[p.id] = now;
      });
      localStorage.setItem(viewedKey, JSON.stringify(updatedViewed));

      return diverse;
    },
    enabled: !!currentUser && !!existingConnections && !!pendingRequests,
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
  });

  const handleConnect = (profile: Profile) => {
    setSelectedUser(profile);
    setModalOpen(true);
  };

  const handleSendRequest = async (note: string) => {
    if (!selectedUser) return;
    
    setConnectingTo(selectedUser.id);
    
    try {
      const { error } = await supabase
        .from('connection_requests')
        .insert({
          sender_id: user!.id,
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
      queryClient.invalidateQueries({ queryKey: ['connection-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
      
    } catch (error: any) {
      toast({
        title: 'Failed to send request',
        description: error.message,
        variant: 'destructive',
      });
      throw error; // Re-throw so modal knows to stay open
    } finally {
      setConnectingTo(null);
    }
  };

  if (!currentUser || isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Recommended Connections
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Recommended Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No recommendations available yet. Complete your profile to see suggestions!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-copper-500" />
          Recommended Connections
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((profile) => (
          <div
            key={profile.id}
            className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              <AvatarFallback>
                {profile.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">
                {profile.full_name}
              </h4>
              {profile.headline && (
                <p className="text-xs text-muted-foreground truncate">
                  {profile.headline}
                  {profile.company && ` @ ${profile.company}`}
                </p>
              )}
              {profile.location && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{profile.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={profile.matchPercentage && profile.matchPercentage >= 70 ? 'default' : 'secondary'} className="text-xs">
                  {profile.matchPercentage || profile.score}% match
                </Badge>
                <div className="flex items-center gap-1 text-xs text-copper-600">
                  <Lightbulb className="h-3 w-3" />
                  <span>{profile.reason}</span>
                </div>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => handleConnect(profile)}
              disabled={connectingTo === profile.id}
              className="shrink-0"
            >
              {connectingTo === profile.id ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                'Connect'
              )}
            </Button>
          </div>
        ))}

        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/dna/discover')}
        >
          See all suggestions &rarr;
        </Button>
      </CardContent>

      <ConnectionRequestModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedUser(null);
        }}
        onSend={handleSendRequest}
        targetUser={selectedUser}
      />
    </Card>
  );
};
