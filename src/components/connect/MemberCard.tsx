import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Briefcase, UserPlus, Eye, Check, MessageSquare, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useMutualConnections } from '@/hooks/useMutualConnections';
import { MatchScoreBadge, MatchReasoning } from '@/components/discover/MatchScoreBadge';

interface MemberCardProps {
  member: {
    id: string;
    full_name: string;
    username: string;
    avatar_url?: string;
    headline?: string;
    profession?: string;
    location?: string;
    country_of_origin?: string;
    current_country?: string;
    focus_areas?: string[];
    industries?: string[];
    skills?: string[];
    languages?: string[];
    available_for?: string[];
    diaspora_status?: string;
    regional_expertise?: string[];
    is_mentor?: boolean;
    is_investor?: boolean;
    match_score: number;
  };
  onConnectionSent?: () => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member, onConnectionSent }) => {
  const { user } = useAuth();
  const { data: currentUserProfile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();
  const [isSending, setIsSending] = useState(false);
  const { data: connectionStatus, refetch: refetchStatus } = useConnectionStatus(member.id);
  const { data: mutualConnections } = useMutualConnections(user?.id, member.id);

  // Compute match reasons for "why this match" - now with enhanced criteria
  const getMatchReasons = (): string[] => {
    if (!currentUserProfile) return [];
    const reasons: string[] = [];

    // Complementary collaboration opportunities (highest priority)
    const userAvailableFor = (currentUserProfile as any).available_for || [];
    const memberAvailableFor = member.available_for || [];

    if ((userAvailableFor.includes('hiring') && memberAvailableFor.includes('job_seeking')) ||
        (userAvailableFor.includes('job_seeking') && memberAvailableFor.includes('hiring'))) {
      reasons.push('Career match');
    }
    if ((userAvailableFor.includes('investing') && memberAvailableFor.includes('seeking_investment')) ||
        (userAvailableFor.includes('seeking_investment') && memberAvailableFor.includes('investing'))) {
      reasons.push('Investment fit');
    }
    if ((userAvailableFor.includes('mentoring') && memberAvailableFor.includes('being_mentored')) ||
        (userAvailableFor.includes('being_mentored') && memberAvailableFor.includes('mentoring'))) {
      reasons.push('Mentorship match');
    }

    // Mentor/Investor badges
    if (member.is_mentor && (currentUserProfile as any).seeking_mentorship) {
      reasons.push('Mentor available');
    }
    if (member.is_investor && userAvailableFor.includes('seeking_investment')) {
      reasons.push('Investor');
    }

    // Same heritage country
    if (currentUserProfile.country_of_origin && member.country_of_origin &&
        currentUserProfile.country_of_origin.toLowerCase() === member.country_of_origin.toLowerCase()) {
      reasons.push('Same heritage');
    }

    // Same current location
    if ((currentUserProfile as any).current_country && member.current_country &&
        (currentUserProfile as any).current_country.toLowerCase() === member.current_country.toLowerCase()) {
      reasons.push('Same location');
    }

    // Shared languages
    if ((currentUserProfile as any).languages && member.languages) {
      const sharedLangs = (currentUserProfile as any).languages.filter((l: string) =>
        member.languages?.map(ml => ml.toLowerCase()).includes(l.toLowerCase())
      );
      if (sharedLangs.length > 0 && reasons.length < 4) {
        reasons.push(`Speaks ${sharedLangs[0]}`);
      }
    }

    // Check focus areas
    if (currentUserProfile.focus_areas && member.focus_areas && reasons.length < 4) {
      const sharedFocus = currentUserProfile.focus_areas.filter(f =>
        member.focus_areas?.includes(f)
      );
      if (sharedFocus.length > 0) {
        reasons.push(sharedFocus[0]);
      }
    }

    // Check industries
    if (currentUserProfile.industries && member.industries && reasons.length < 4) {
      const sharedIndustries = currentUserProfile.industries.filter(i =>
        member.industries?.includes(i)
      );
      if (sharedIndustries.length > 0) {
        reasons.push(sharedIndustries[0]);
      }
    }

    // Check regional expertise
    if ((currentUserProfile as any).regional_expertise && member.regional_expertise && reasons.length < 4) {
      const sharedRegions = (currentUserProfile as any).regional_expertise.filter((r: string) =>
        member.regional_expertise?.includes(r)
      );
      if (sharedRegions.length > 0) {
        reasons.push(sharedRegions[0]);
      }
    }

    return reasons.slice(0, 3);
  };

  const matchReasons = getMatchReasons();

  // Build detailed reasoning for the popover
  const matchReasoning: MatchReasoning = {
    same_country_of_origin: !!(currentUserProfile?.country_of_origin && member.country_of_origin &&
      currentUserProfile.country_of_origin.toLowerCase() === member.country_of_origin.toLowerCase()),
    same_location: !!((currentUserProfile as any)?.current_country && member.current_country &&
      (currentUserProfile as any).current_country.toLowerCase() === member.current_country.toLowerCase()),
    shared_focus_areas: currentUserProfile?.focus_areas?.filter(f => member.focus_areas?.includes(f)),
    shared_industries: currentUserProfile?.industries?.filter(i => member.industries?.includes(i)),
    shared_skills: currentUserProfile?.skills?.filter(s => member.skills?.includes(s)),
    regional_expertise_match: !!(currentUserProfile as any)?.regional_expertise?.some((r: string) => 
      member.regional_expertise?.includes(r)
    ),
  };

  const handleConnect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-connection-request', {
        body: { target_user_id: member.id },
      });

      if (error) throw error;

      const result = data as { status: string; message?: string; error?: string };

      if (result.status === 'pending') {
        await refetchStatus();
        toast({
          title: 'Connection request sent',
          description: `Your request to connect with ${member.full_name} has been sent.`,
        });
        await trackEvent('connect_request_sent', { target_user_id: member.id });
        onConnectionSent?.();
      } else if (result.status === 'profile_incomplete') {
        toast({
          title: 'Profile Incomplete',
          description: result.message || 'Complete your profile to at least 40% to send connection requests.',
          variant: 'destructive',
        });
        navigate('/dna/profile/edit');
      } else if (result.status === 'already_connected') {
        toast({
          title: 'Already connected',
          description: result.message,
        });
      } else if (result.status === 'already_pending' || result.status === 'request_received') {
        toast({
          title: 'Request pending',
          description: result.message,
        });
      } else {
        toast({
          title: 'Unable to connect',
          description: result.error || 'Please try again later.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      toast({
        title: 'Error sending request',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleMessage = async () => {
    if (!user) return;
    
    try {
      // Get or create conversation
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user_a.eq.${user.id},user_b.eq.${member.id}),and(user_a.eq.${member.id},user_b.eq.${user.id})`)
        .maybeSingle();

      if (existingConversation) {
        // Navigate to messages with conversation ID in URL path
        navigate(`/dna/messages/${existingConversation.id}`);
      } else {
        // Create new conversation
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({ user_a: user.id, user_b: member.id })
          .select('id')
          .single();

        if (error) throw error;
        navigate(`/dna/messages/${newConv.id}`);
      }
    } catch (error) {
      console.error('Message error:', error);
      toast({
        title: 'Error',
        description: 'Could not start conversation',
        variant: 'destructive',
      });
    }
  };

  const handleViewProfile = () => {
    navigate(`/dna/${member.username}`);
  };

  // Add cache-busting for problematic avatar URLs
  const getOptimizedAvatarUrl = (url?: string) => {
    if (!url) return undefined;
    // Add timestamp to bust cache if image fails to load
    return url;
  };

  return (
    <Card className="hover:shadow-lg transition-all shadow-md border-border/50 overflow-hidden">
      <CardContent className="p-3 sm:p-5">
        <div className="flex items-start gap-3">
          {/* Avatar with lazy loading for mobile performance */}
          <Avatar className="h-12 w-12 sm:h-16 sm:w-16 cursor-pointer shrink-0" onClick={handleViewProfile}>
            <AvatarImage 
              src={getOptimizedAvatarUrl(member.avatar_url)} 
              alt={member.full_name}
              loading="lazy"
            />
            <AvatarFallback className="text-sm bg-primary/10 text-primary">
              {(member.full_name || member.username || 'DN').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header row with name and match score */}
            <div className="flex items-start justify-between gap-1 mb-1">
              <h3 
                className="font-semibold text-sm sm:text-base hover:text-dna-copper cursor-pointer truncate flex-1 min-w-0"
                onClick={handleViewProfile}
              >
                {member.full_name}
              </h3>
              {/* Match Score - clickable with popover */}
              <div className="shrink-0">
                <MatchScoreBadge 
                  score={member.match_score} 
                  size="sm"
                  matchReasons={matchReasons}
                  reasoning={matchReasoning}
                />
              </div>
            </div>

            {/* Headline */}
            <p className="text-xs sm:text-sm text-muted-foreground truncate mb-1.5">
              {member.headline || member.profession || 'DNA Member'}
            </p>

            {/* Location */}
            {member.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{member.location}</span>
              </div>
            )}

            {/* Mutual Connections */}
            {mutualConnections && mutualConnections.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-dna-copper font-medium mb-2">
                <Users className="h-3 w-3" />
                <span>
                  {mutualConnections.length} mutual connection{mutualConnections.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Tags - limited on mobile */}
            <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
              {/* Mentor/Investor badges - high visibility */}
              {member.is_mentor && (
                <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0 border-green-300 bg-green-50 text-green-700">
                  Mentor
                </Badge>
              )}
              {member.is_investor && (
                <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0 border-blue-300 bg-blue-50 text-blue-700">
                  Investor
                </Badge>
              )}
              {member.focus_areas?.slice(0, 2).map((area) => (
                <Badge key={area} variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0.5 whitespace-nowrap">
                  {area}
                </Badge>
              ))}
              <span className="hidden sm:inline-flex">
                {member.industries?.slice(0, 1).map((industry) => (
                  <Badge key={industry} variant="outline" className="text-xs">
                    <Briefcase className="h-3 w-3 mr-1 shrink-0" />
                    <span className="truncate max-w-[80px]">{industry}</span>
                  </Badge>
                ))}
              </span>
            </div>

            {/* Actions - compact on mobile */}
            <div className="flex gap-1.5 sm:gap-2">
              {connectionStatus === 'accepted' ? (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleMessage}
                    className="flex-1 h-8 text-xs sm:text-sm"
                  >
                    <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                    Message
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewProfile}
                    className="h-8 text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <Eye className="h-3.5 w-3.5 sm:mr-1.5" />
                    <span className="hidden sm:inline">Profile</span>
                  </Button>
                </>
              ) : connectionStatus === 'pending_sent' ? (
                <>
                  <Button variant="outline" size="sm" disabled className="flex-1 h-8 text-xs sm:text-sm">
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    Sent
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewProfile}
                    className="h-8 text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <Eye className="h-3.5 w-3.5 sm:mr-1.5" />
                    <span className="hidden sm:inline">Profile</span>
                  </Button>
                </>
              ) : connectionStatus === 'pending_received' ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/dna/connect/network?tab=requests')}
                    className="flex-1 h-8 text-xs sm:text-sm"
                  >
                    Respond
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewProfile}
                    className="h-8 text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <Eye className="h-3.5 w-3.5 sm:mr-1.5" />
                    <span className="hidden sm:inline">Profile</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleConnect}
                    disabled={isSending}
                    className="flex-1 h-8 text-xs sm:text-sm"
                  >
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                    {isSending ? '...' : 'Connect'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewProfile}
                    className="h-8 text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <Eye className="h-3.5 w-3.5 sm:mr-1.5" />
                    <span className="hidden sm:inline">Profile</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
