import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MatchScoreBadge } from "./MatchScoreBadge";
import { BANNER_GRADIENTS, BannerGradientKey } from "@/lib/constants/bannerGradients";
import { useNavigate } from "react-router-dom";
import { ProfileViewTracker } from "@/components/analytics/ProfileViewTracker";

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
        <Avatar className="h-16 w-16 border-4 border-white shadow-md mb-3">
          <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
          <AvatarFallback className="bg-[hsl(151,75%,50%)] text-white text-lg font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Name & Headline */}
        <h3 className="font-semibold text-lg text-[hsl(30,10%,10%)] mb-1 line-clamp-1">
          {profile.full_name}
        </h3>
        {profile.headline && (
          <p className="text-sm text-[hsl(30,10%,60%)] mb-2 line-clamp-2">
            {profile.headline}
          </p>
        )}

        {/* Location/Heritage */}
        <div className="flex items-center gap-2 text-xs text-[hsl(30,10%,60%)] mb-3 flex-wrap">
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
              <span className="text-[hsl(30,10%,60%)] flex-shrink-0 mt-0.5">🎯</span>
              <span className="text-[hsl(30,10%,10%)] line-clamp-1">
                {profile.focus_areas.slice(0, 2).join(' • ')}
              </span>
            </div>
          )}
          {profile.regional_expertise && profile.regional_expertise.length > 0 && (
            <div className="flex items-start gap-2 text-xs">
              <span className="text-[hsl(30,10%,60%)] flex-shrink-0 mt-0.5">🌍</span>
              <span className="text-[hsl(30,10%,10%)] line-clamp-1">
                {profile.regional_expertise.slice(0, 2).join(' • ')}
              </span>
            </div>
          )}
          {profile.industries && profile.industries.length > 0 && (
            <div className="flex items-start gap-2 text-xs">
              <span className="text-[hsl(30,10%,60%)] flex-shrink-0 mt-0.5">🏢</span>
              <span className="text-[hsl(30,10%,10%)] line-clamp-1">
                {profile.industries.slice(0, 2).join(' • ')}
              </span>
            </div>
          )}
        </div>

        {/* Action */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/dna/${profile.username}`)}
          className="w-full border-[hsl(151,75%,50%)] text-[hsl(151,75%,30%)] hover:bg-[hsl(151,75%,50%)]/10"
        >
          View Profile
        </Button>
      </div>
    </Card>
    </>
  );
}
