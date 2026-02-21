import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MapPin,
  UserPlus,
  Check,
  MessageSquare,
  Users,
  MoreHorizontal,
  Bookmark,
  Share2,
  UserCheck,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useAuth } from '@/contexts/AuthContext';
import { useMutualConnections } from '@/hooks/useMutualConnections';
import { FiveCsEngagement } from './FiveCsEngagement';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/errorLogger';

// Sector color mapping
const SECTOR_COLORS: Record<string, string> = {
  TECHNOLOGY: 'bg-blue-100 text-blue-700 border-blue-200',
  EDUCATION: 'bg-purple-100 text-purple-700 border-purple-200',
  AGRICULTURE: 'bg-green-100 text-green-700 border-green-200',
  HEALTHCARE: 'bg-rose-100 text-rose-700 border-rose-200',
  FINANCE: 'bg-amber-100 text-amber-700 border-amber-200',
  MEDIA: 'bg-pink-100 text-pink-700 border-pink-200',
  ARTS: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  GOVERNMENT: 'bg-slate-100 text-slate-700 border-slate-200',
  NONPROFIT: 'bg-teal-100 text-teal-700 border-teal-200',
  ENERGY: 'bg-orange-100 text-orange-700 border-orange-200',
  DEFAULT: 'bg-gray-100 text-gray-700 border-gray-200',
};

interface EnhancedMemberCardProps {
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
    // Match context data (if available from matching service)
    match_reasons?: string[];
    shared_events?: number;
    shared_skills?: string[];
    shared_focus_areas?: string[];
  };
  onConnectionSent?: () => void;
  onMessage?: (memberId: string) => void;
  variant?: 'default' | 'compact';
}

/**
 * EnhancedMemberCard - Redesigned member card with Five C's engagement
 *
 * PRD Requirements:
 * - Sector Badge with color coding
 * - Match Percentage with hover tooltip explaining match factors
 * - Contextual Match Reasons (up to 3)
 * - Five C's Engagement badges
 * - Primary: Connect/Message button, Secondary: overflow menu
 */
export function EnhancedMemberCard({
  member,
  onConnectionSent,
  onMessage,
  variant = 'default',
}: EnhancedMemberCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();
  const [isSending, setIsSending] = useState(false);
  const { data: connectionStatus, refetch: refetchStatus } = useConnectionStatus(member.id);
  const { mutualCount, hasMutualConnections } = useMutualConnections(user?.id, member.id);

  // Determine primary sector badge
  const primarySector = useMemo(() => {
    if (member.industries?.[0]) {
      return member.industries[0].toUpperCase();
    }
    if (member.focus_areas?.[0]) {
      return member.focus_areas[0].toUpperCase();
    }
    return null;
  }, [member.industries, member.focus_areas]);

  const sectorColor = primarySector
    ? SECTOR_COLORS[primarySector] || SECTOR_COLORS.DEFAULT
    : SECTOR_COLORS.DEFAULT;

  // Build match reasons
  const matchReasons = useMemo(() => {
    const reasons: string[] = [];

    if (member.match_reasons) {
      return member.match_reasons.slice(0, 3);
    }

    // Generate contextual reasons
    if (member.shared_events && member.shared_events > 0) {
      reasons.push(
        `${member.shared_events} shared event${member.shared_events > 1 ? 's' : ''}`
      );
    }

    if (hasMutualConnections) {
      reasons.push(`${mutualCount} mutual connection${mutualCount !== 1 ? 's' : ''}`);
    }

    if (member.shared_focus_areas && member.shared_focus_areas.length > 0) {
      reasons.push(`Both focus on ${member.shared_focus_areas[0]}`);
    }

    if (member.shared_skills && member.shared_skills.length > 0) {
      reasons.push(`Shared skill: ${member.shared_skills[0]}`);
    }

    if (member.is_mentor) {
      reasons.push('Available as mentor');
    }

    if (member.is_investor) {
      reasons.push('Active investor');
    }

    return reasons.slice(0, 3);
  }, [member, hasMutualConnections, mutualCount]);

  // Match score tooltip content
  const matchTooltipContent = useMemo(() => {
    if (member.match_score >= 80) {
      return 'High compatibility based on shared interests, location, and network overlap';
    }
    if (member.match_score >= 60) {
      return 'Good match based on complementary skills and focus areas';
    }
    if (member.match_score >= 40) {
      return 'Potential connection based on industry alignment';
    }
    return 'Explore their profile to discover common ground';
  }, [member.match_score]);

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
          description:
            result.message ||
            'Complete your profile to at least 40% to send connection requests.',
          variant: 'destructive',
        });
        navigate('/dna/profile/edit');
      } else {
        toast({
          title: 'Request status',
          description: result.message || 'Please try again later.',
        });
      }
    } catch (error: unknown) {
      toast({
        title: 'Error sending request',
        description: getErrorMessage(error) || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleMessage = async (e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (onMessage) {
      onMessage(member.id);
      return;
    }

    if (!user) return;

    try {
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(
          `and(user_a.eq.${user.id},user_b.eq.${member.id}),and(user_a.eq.${member.id},user_b.eq.${user.id})`
        )
        .maybeSingle();

      if (existingConversation) {
        navigate(`/dna/messages/${existingConversation.id}`);
      } else {
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({ user_a: user.id, user_b: member.id })
          .select('id')
          .single();

        if (error) throw error;
        navigate(`/dna/messages/${newConv.id}`);
      }
    } catch (error) {
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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const profileUrl = `${window.location.origin}/dna/${member.username}`;
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'Link copied',
      description: 'Profile link copied to clipboard',
    });
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: 'Profile saved',
      description: `${member.full_name} added to your saved profiles`,
    });
  };

  // Reduced motion check
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isCompact = variant === 'compact';

  return (
    <TooltipProvider>
      <motion.div
        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="w-full"
      >
        <Card
          className="bg-card/60 backdrop-blur-sm border-border/30 overflow-hidden cursor-pointer hover:bg-card/80 hover:shadow-md transition-all duration-200"
          onClick={handleViewProfile}
        >
          <div className={cn('p-4', isCompact && 'p-3')}>
            <div className="flex gap-3">
              {/* Left column: Content */}
              <div className="flex-1 min-w-0 flex flex-col">
                {/* Top row: Sector + Match Score */}
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  {primarySector && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'w-fit px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border',
                        sectorColor
                      )}
                    >
                      {primarySector}
                    </Badge>
                  )}

                  {member.is_mentor && (
                    <Badge variant="secondary" className="px-1.5 py-0.5 text-[10px]">
                      Mentor
                    </Badge>
                  )}

                  {member.is_investor && (
                    <Badge variant="secondary" className="px-1.5 py-0.5 text-[10px]">
                      Investor
                    </Badge>
                  )}

                  {/* Match Score with Tooltip */}
                  {member.match_score > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className={cn(
                            'w-fit px-2 py-0.5 text-[10px] font-semibold cursor-help',
                            member.match_score >= 80
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              : member.match_score >= 60
                              ? 'bg-amber-100 text-amber-700 border-amber-200'
                              : 'bg-muted text-muted-foreground border-border'
                          )}
                        >
                          {member.match_score}% Match
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="text-sm">{matchTooltipContent}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>

                {/* Name */}
                <h3
                  className={cn(
                    'font-semibold text-foreground leading-tight mb-1 line-clamp-1',
                    isCompact ? 'text-sm' : 'text-base'
                  )}
                >
                  {member.full_name}
                </h3>

                {/* Headline */}
                <p
                  className={cn(
                    'text-muted-foreground leading-snug line-clamp-2 mb-2',
                    isCompact ? 'text-xs' : 'text-sm'
                  )}
                >
                  {member.headline || member.profession || 'DNA Community Member'}
                </p>

                {/* Contextual Match Reasons */}
                {matchReasons.length > 0 && !isCompact && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {matchReasons.map((reason, index) => (
                      <span
                        key={index}
                        className="text-[11px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                )}

                {/* Five C's Engagement */}
                <FiveCsEngagement userId={member.id} compact className="mb-2" />

                {/* Location footer */}
                <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground/70">
                  {member.location && <MapPin className="h-3 w-3 shrink-0" />}
                  <span className="truncate">
                    {member.location || member.current_country || 'DNA Member'}
                    {hasMutualConnections && member.location && ' · '}
                    {hasMutualConnections && (
                      <span className="inline-flex items-center gap-0.5">
                        <Users className="h-3 w-3 inline" />
                        {mutualCount} mutual
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Right column: Avatar + Actions */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                {/* Avatar */}
                <Avatar className={cn('rounded-xl', isCompact ? 'h-16 w-16' : 'h-20 w-20')}>
                  <AvatarImage
                    src={member.avatar_url}
                    alt={member.full_name}
                    className="object-cover"
                    loading="lazy"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold rounded-xl">
                    {(member.full_name || member.username || 'DN')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  {/* Primary action button */}
                  {connectionStatus === 'accepted' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMessage();
                      }}
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-1" />
                      Message
                    </Button>
                  ) : connectionStatus === 'pending_sent' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs text-muted-foreground border-muted"
                      disabled
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Sent
                    </Button>
                  ) : connectionStatus === 'pending_received' ? (
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 px-3 text-xs bg-primary text-primary-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/dna/connect/network?tab=requests');
                      }}
                    >
                      <UserCheck className="h-3.5 w-3.5 mr-1" />
                      Respond
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 px-3 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={handleConnect}
                      disabled={isSending}
                    >
                      <UserPlus className="h-3.5 w-3.5 mr-1" />
                      {isSending ? '...' : 'Connect'}
                    </Button>
                  )}

                  {/* Overflow menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={handleViewProfile}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSave}>
                        <Bookmark className="mr-2 h-4 w-4" />
                        Save Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleShare}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Profile
                      </DropdownMenuItem>
                      {hasMutualConnections && (
                        <>
                          <DropdownMenuSeparator />
                          <div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center gap-1.5">
                            <Users className="h-3 w-3" />
                            {mutualCount} mutual connection{mutualCount !== 1 ? 's' : ''}
                          </div>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
}

export default EnhancedMemberCard;
