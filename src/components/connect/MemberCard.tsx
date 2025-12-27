import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
import { cn } from '@/lib/utils';

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
  /** Enable compact mobile-first layout */
  compact?: boolean;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member, onConnectionSent, compact = false }) => {
  const { user } = useAuth();
  const { data: currentUserProfile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();
  const [isSending, setIsSending] = useState(false);
  const { data: connectionStatus, refetch: refetchStatus } = useConnectionStatus(member.id);
  const { mutualConnections, mutualCount, hasMutualConnections } = useMutualConnections(user?.id, member.id);

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

  // Calculate tag overflow
  const allTags = [
    ...(member.is_mentor ? ['Mentor'] : []),
    ...(member.is_investor ? ['Investor'] : []),
    ...(member.focus_areas || []),
  ];
  const visibleTags = allTags.slice(0, 2);
  const overflowCount = allTags.length - 2;

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <motion.div
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Card className={cn(
        "transition-all border-border/50 overflow-hidden",
        compact
          ? "shadow-sm hover:shadow-md"
          : "shadow-md hover:shadow-lg"
      )}>
        <CardContent className={cn(
          compact ? "p-3" : "p-3 sm:p-5"
        )}>
          <div className="flex items-start gap-3">
            {/* Avatar - compact: 40px, regular: 48px/64px */}
            <Avatar
              className={cn(
                "cursor-pointer shrink-0",
                compact ? "h-10 w-10" : "h-12 w-12 sm:h-16 sm:w-16"
              )}
              onClick={handleViewProfile}
            >
              <AvatarImage
                src={getOptimizedAvatarUrl(member.avatar_url)}
                alt={member.full_name}
                loading="lazy"
              />
              <AvatarFallback className={cn(
                "bg-primary/10 text-primary",
                compact ? "text-xs" : "text-sm"
              )}>
                {(member.full_name || member.username || 'DN').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header row with name and match score */}
              <div className="flex items-start justify-between gap-1 mb-0.5">
                <h3
                  className={cn(
                    "font-semibold hover:text-dna-copper cursor-pointer truncate flex-1 min-w-0",
                    compact ? "text-sm" : "text-sm sm:text-base"
                  )}
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

              {/* Headline - single line, truncated */}
              <p className="text-xs text-muted-foreground truncate mb-1">
                {member.headline || member.profession || 'DNA Member'}
              </p>

              {/* Location */}
              {member.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{member.location}</span>
                </div>
              )}

              {/* Mutual Connections - compact inline */}
              {hasMutualConnections && (
                <div className="flex items-center gap-1 text-xs text-dna-copper font-medium mb-1.5">
                  <Users className="h-3 w-3 shrink-0" />
                  <span>
                    {mutualCount} mutual{mutualCount !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Tags - max 2 visible + overflow badge */}
              <div className="flex flex-wrap gap-1 mb-2">
                {visibleTags.map((tag, idx) => {
                  // Special styling for Mentor/Investor
                  if (tag === 'Mentor') {
                    return (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 border-green-300 bg-green-50 text-green-700"
                      >
                        Mentor
                      </Badge>
                    );
                  }
                  if (tag === 'Investor') {
                    return (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 border-blue-300 bg-blue-50 text-blue-700"
                      >
                        Investor
                      </Badge>
                    );
                  }
                  return (
                    <Badge
                      key={`${tag}-${idx}`}
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0.5 whitespace-nowrap max-w-[100px] truncate"
                    >
                      {tag}
                    </Badge>
                  );
                })}
                {overflowCount > 0 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0.5 text-muted-foreground"
                  >
                    +{overflowCount}
                  </Badge>
                )}
              </div>

              {/* Actions - compact height 28px (h-7) */}
              <div className="flex gap-1.5">
                {connectionStatus === 'accepted' ? (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleMessage}
                      className={cn(
                        "flex-1 text-xs",
                        compact ? "h-7" : "h-8"
                      )}
                    >
                      <MessageSquare className="mr-1 h-3 w-3" />
                      Message
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleViewProfile}
                      className={cn(
                        "px-2 text-xs",
                        compact ? "h-7" : "h-8"
                      )}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </>
                ) : connectionStatus === 'pending_sent' ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className={cn(
                        "flex-1 text-xs",
                        compact ? "h-7" : "h-8"
                      )}
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Sent
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleViewProfile}
                      className={cn(
                        "px-2 text-xs",
                        compact ? "h-7" : "h-8"
                      )}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </>
                ) : connectionStatus === 'pending_received' ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/dna/connect/network?tab=requests')}
                      className={cn(
                        "flex-1 text-xs",
                        compact ? "h-7" : "h-8"
                      )}
                    >
                      Respond
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleViewProfile}
                      className={cn(
                        "px-2 text-xs",
                        compact ? "h-7" : "h-8"
                      )}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleConnect}
                      disabled={isSending}
                      className={cn(
                        "flex-1 text-xs",
                        compact ? "h-7" : "h-8"
                      )}
                    >
                      <UserPlus className="mr-1 h-3 w-3" />
                      {isSending ? '...' : 'Connect'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleViewProfile}
                      className={cn(
                        "px-2 text-xs",
                        compact ? "h-7" : "h-8"
                      )}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
