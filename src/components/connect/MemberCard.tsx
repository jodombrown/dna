import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { MapPin, Briefcase, UserPlus, Eye, Check, MessageSquare, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useMutualConnections } from '@/hooks/useMutualConnections';

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
        navigate(`/dna/messages?conversation=${existingConversation.id}`);
      } else {
        // Create new conversation
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({ user_a: user.id, user_b: member.id })
          .select('id')
          .single();

        if (error) throw error;
        navigate(`/dna/messages?conversation=${newConv.id}`);
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

  const getMatchColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-16 w-16 cursor-pointer" onClick={handleViewProfile}>
            <AvatarImage src={member.avatar_url} alt={member.full_name} />
            <AvatarFallback>
              {member.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 
                  className="font-semibold text-base hover:text-dna-copper cursor-pointer truncate"
                  onClick={handleViewProfile}
                >
                  {member.full_name}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {member.headline || member.profession || 'DNA Member'}
                </p>
                {/* Why this match - enhanced match reasons */}
                {matchReasons.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {matchReasons.map((reason, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs bg-dna-copper/10 text-dna-copper border-none">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Match Score */}
              <div className="flex flex-col items-end">
                <span className={`text-sm font-semibold ${getMatchColor(member.match_score)}`}>
                  {member.match_score}% match
                </span>
                <Progress value={member.match_score} className="w-16 h-1.5 mt-1" />
              </div>
            </div>

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

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {/* Mentor/Investor badges - high visibility */}
              {member.is_mentor && (
                <Badge variant="outline" className="text-xs border-green-300 bg-green-50 text-green-700">
                  Mentor
                </Badge>
              )}
              {member.is_investor && (
                <Badge variant="outline" className="text-xs border-blue-300 bg-blue-50 text-blue-700">
                  Investor
                </Badge>
              )}
              {member.focus_areas?.slice(0, 2).map((area) => (
                <Badge key={area} variant="secondary" className="text-xs">
                  {area}
                </Badge>
              ))}
              {member.industries?.slice(0, 1).map((industry) => (
                <Badge key={industry} variant="outline" className="text-xs">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {industry}
                </Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {connectionStatus === 'accepted' ? (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleMessage}
                    className="flex-1"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewProfile}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                </>
              ) : connectionStatus === 'pending_sent' ? (
                <>
                  <Button variant="outline" size="sm" disabled className="flex-1">
                    <Check className="mr-2 h-4 w-4" />
                    Request Sent
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewProfile}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                </>
              ) : connectionStatus === 'pending_received' ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/dna/connect/network?tab=requests')}
                    className="flex-1"
                  >
                    Request Received
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewProfile}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleConnect}
                    disabled={isSending}
                    className="flex-1"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {isSending ? 'Sending...' : 'Connect'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewProfile}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Profile
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
