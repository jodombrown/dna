import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { MapPin, Briefcase, UserPlus, Eye, Check, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

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
    focus_areas?: string[];
    industries?: string[];
    skills?: string[];
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

  // Compute shared attributes for "why this match"
  const getSharedAttributes = () => {
    if (!currentUserProfile) return [];
    const shared: string[] = [];
    
    // Check focus areas
    if (currentUserProfile.focus_areas && member.focus_areas) {
      const sharedFocus = currentUserProfile.focus_areas.filter(f => 
        member.focus_areas?.includes(f)
      );
      shared.push(...sharedFocus.slice(0, 2));
    }
    
    // Check industries
    if (currentUserProfile.industries && member.industries) {
      const sharedIndustries = currentUserProfile.industries.filter(i => 
        member.industries?.includes(i)
      );
      if (sharedIndustries.length > 0 && shared.length < 3) {
        shared.push(...sharedIndustries.slice(0, 3 - shared.length));
      }
    }
    
    // Check regional expertise
    if (currentUserProfile.regional_expertise && member.country_of_origin) {
      if (currentUserProfile.regional_expertise.includes(member.country_of_origin) && shared.length < 3) {
        shared.push(member.country_of_origin);
      }
    }
    
    return shared.slice(0, 3);
  };

  const sharedAttributes = getSharedAttributes();

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
        navigate('/app/profile/edit');
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
                {/* Why this match */}
                {sharedAttributes.length > 0 && (
                  <p className="text-xs text-dna-copper font-medium mt-0.5">
                    Shared: {sharedAttributes.join(' · ')}
                  </p>
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

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {member.focus_areas?.slice(0, 2).map((area) => (
                <Badge key={area} variant="secondary" className="text-xs">
                  {area}
                </Badge>
              ))}
              {member.industries?.slice(0, 2).map((industry) => (
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
