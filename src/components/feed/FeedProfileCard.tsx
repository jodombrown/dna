/**
 * FeedProfileCard - Warm, heritage-infused profile card for feed left sidebar
 * DNA-branded with Kente-inspired accents
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Bookmark, ChevronRight, MapPin } from 'lucide-react';

export const FeedProfileCard: React.FC = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();

  if (!profile) return null;

  const displayName = profile.display_name || profile.username || 'Member';
  const initials = displayName.charAt(0).toUpperCase();
  const username = profile.username || '';
  const currentCity = (profile as Record<string, unknown>).current_city as string | undefined;

  return (
    <Card className="overflow-hidden border-0 shadow-sm bg-card">
      {/* Heritage-inspired header band — taller for more presence */}
      <div className="h-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--dna-emerald))] via-[hsl(var(--dna-emerald)/0.7)] to-[hsl(var(--dna-gold)/0.6)]" />
        {/* Subtle Kente-inspired pattern overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 120 48" preserveAspectRatio="none">
          <pattern id="kente-feed" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="12" height="12" fill="white" />
            <rect x="12" y="12" width="12" height="12" fill="white" />
          </pattern>
          <rect width="120" height="48" fill="url(#kente-feed)" />
        </svg>
      </div>

      <div className="px-3 pb-3 -mt-8">
        {/* Avatar */}
        <div className="flex justify-center">
          <Avatar
            className="h-16 w-16 border-[3px] border-card cursor-pointer ring-2 ring-[hsl(var(--dna-emerald)/0.3)] hover:ring-[hsl(var(--dna-emerald)/0.6)] transition-all"
            onClick={() => navigate(`/dna/${username}`)}
          >
            <AvatarImage src={profile.avatar_url || ''} alt={displayName} />
            <AvatarFallback className="bg-[hsl(var(--dna-emerald))] text-white text-lg font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name, headline, and city */}
        <div className="text-center mt-2.5">
          <h3
            className="font-semibold text-sm cursor-pointer hover:text-[hsl(var(--dna-emerald))] transition-colors"
            onClick={() => navigate(`/dna/${username}`)}
          >
            {displayName}
          </h3>
          {profile.headline && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
              {profile.headline}
            </p>
          )}
          {currentCity && (
            <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              Based in {currentCity}
            </p>
          )}
        </div>

        {/* Saved Items link — warm amber icon */}
        <button
          className="w-full flex items-center justify-between mt-3 px-2 py-1.5 rounded-md hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors text-xs text-muted-foreground group"
          onClick={() => navigate('/dna/feed?tab=bookmarks')}
        >
          <span className="flex items-center gap-1.5">
            <Bookmark className="h-3.5 w-3.5 text-[hsl(var(--dna-gold))]" />
            Saved Items
          </span>
          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </Card>
  );
};
