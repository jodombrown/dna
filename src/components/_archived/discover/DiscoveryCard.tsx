import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MatchScoreBadge } from "./MatchScoreBadge";
import { BANNER_GRADIENTS, BannerGradientKey } from "@/lib/constants/bannerGradients";
import { useNavigate } from "react-router-dom";
import { ProfileViewTracker } from "@/components/analytics/ProfileViewTracker";
import { UserPlus, Clock, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { useQueryClient } from "@tanstack/react-query";
import { ConnectionRequestModal } from "@/components/connect/ConnectionRequestModal";
import { getErrorMessage } from '@/lib/errorLogger';

interface DiscoveryCardProps {
  profile: {
    id: string;
    full_name: string;
    username: string;
    avatar_url?: string;
    banner_url?: string;
    banner_type?: string;
    banner_gradient?: string;
    banner_overlay?: boolean;
    headline?: string;
    location?: string;
    country_of_origin?: string;
    focus_areas?: string[];
    regional_expertise?: string[];
    industries?: string[];
    match_score: number;
  };
}

export function DiscoveryCard({ profile }: DiscoveryCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { data: connectionStatus, refetch: refetchStatus } = useConnectionStatus(profile.id);

  const getBannerStyle = () => {
    if (profile.banner_type === 'image' && profile.banner_url) {
      return { backgroundImage: `url(${profile.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
    if (profile.banner_type === 'gradient' && profile.banner_gradient) {
      const gradient = BANNER_GRADIENTS[profile.banner_gradient as BannerGradientKey];
      return { background: gradient?.css || BANNER_GRADIENTS.dna.css };
    }
    return { background: BANNER_GRADIENTS.dna.css };
  };

  const initials = profile.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleConnectClick = () => {
    setModalOpen(true);
  };

  const handleSendRequest = async (message: string) => {
    if (!user) return;
    
    setIsSending(true);
    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: profile.id,
          status: 'pending',
          message: message || null,
        });

      if (error) throw error;

      toast({
        title: 'Connection request sent!',
        description: `Your request to ${profile.full_name} has been sent.`,
      });

      // Refresh connection status and invalidate suggestions
      await refetchStatus();
      queryClient.invalidateQueries({ queryKey: ['network-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['dia-connection-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['suggested-connections'] });
    } catch (error: unknown) {
      toast({
        title: 'Failed to send request',
        description: getErrorMessage(error) || 'Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  // Determine button state
  const isOwnProfile = user?.id === profile.id;
  const isConnected = connectionStatus === 'accepted';
  const isPendingSent = connectionStatus === 'pending_sent';
  const isPendingReceived = connectionStatus === 'pending_received';

  return (
    <>
      {/* Track card view as profile impression */}
      <ProfileViewTracker profileId={profile.id} viewType="discovery_card" />
      
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {/* Banner */}
        <div 
          className="h-20 w-full relative"
          style={getBannerStyle()}
        >
          {profile.banner_overlay && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          )}
          
          {/* Match Score Badge */}
          <div className="absolute top-2 right-2">
            <MatchScoreBadge score={profile.match_score} size="sm" />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 -mt-8 relative">
          {/* Avatar */}
          <Avatar 
            className="h-16 w-16 border-4 border-white shadow-md mb-3 cursor-pointer"
            onClick={() => navigate(`/dna/${profile.username}`)}
          >
            <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Name & Headline */}
          <h3 
            className="font-semibold text-lg text-foreground mb-1 line-clamp-1 cursor-pointer hover:text-primary transition-colors"
            onClick={() => navigate(`/dna/${profile.username}`)}
          >
            {profile.full_name}
          </h3>
          {profile.headline && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {profile.headline}
            </p>
          )}

          {/* Location/Heritage */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 flex-wrap">
            {profile.country_of_origin && (
              <span className="flex items-center gap-1">
                🌍 {profile.country_of_origin}
              </span>
            )}
            {profile.location && (
              <span className="flex items-center gap-1">
                📍 {profile.location}
              </span>
            )}
          </div>

          {/* Tags (Top 2 from each category) */}
          <div className="space-y-1.5 mb-4 min-h-[60px]">
            {profile.focus_areas && profile.focus_areas.length > 0 && (
              <div className="flex items-start gap-2 text-xs">
                <span className="text-muted-foreground flex-shrink-0 mt-0.5">🎯</span>
                <span className="text-foreground line-clamp-1">
                  {profile.focus_areas.slice(0, 2).join(' • ')}
                </span>
              </div>
            )}
            {profile.regional_expertise && profile.regional_expertise.length > 0 && (
              <div className="flex items-start gap-2 text-xs">
                <span className="text-muted-foreground flex-shrink-0 mt-0.5">🌍</span>
                <span className="text-foreground line-clamp-1">
                  {profile.regional_expertise.slice(0, 2).join(' • ')}
                </span>
              </div>
            )}
            {profile.industries && profile.industries.length > 0 && (
              <div className="flex items-start gap-2 text-xs">
                <span className="text-muted-foreground flex-shrink-0 mt-0.5">🏢</span>
                <span className="text-foreground line-clamp-1">
                  {profile.industries.slice(0, 2).join(' • ')}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {!isOwnProfile && (
              <>
                {isConnected ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled
                    className="flex-1 text-primary border-primary/30"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Connected
                  </Button>
                ) : isPendingSent ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled
                    className="flex-1 text-muted-foreground"
                  >
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    Sent
                  </Button>
                ) : isPendingReceived ? (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => navigate('/dna/connect/network?tab=requests')}
                    className="flex-1"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Respond
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={handleConnectClick}
                    disabled={isSending}
                    className="flex-1"
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1" />
                    {isSending ? '...' : 'Connect'}
                  </Button>
                )}
              </>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/dna/${profile.username}`)}
              className={isOwnProfile ? "w-full" : "flex-1"}
            >
              View Profile
            </Button>
          </div>
        </div>
      </Card>

      <ConnectionRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSend={handleSendRequest}
        targetUser={{
          full_name: profile.full_name,
          headline: profile.headline
        }}
      />
    </>
  );
}
