/**
 * DNA Platform — Feed Sponsor Card
 * Displays sponsored content in the feed left sidebar.
 * Gold accent stripe, warm hover, native feel.
 */

import { useState } from 'react';
import { ExternalLink, Award } from 'lucide-react';
import { useSponsorPlacements } from '@/hooks/useSponsorPlacements';

// Fallback logos for known sponsors
const SPONSOR_LOGO_FALLBACKS: Record<string, string> = {
  'GABA Center': '/images/sponsors/gaba-center.png',
};

export function FeedSponsorCard() {
  const { placements, isLoading, trackClick } = useSponsorPlacements('feed_sidebar');

  if (isLoading || placements.length === 0) return null;
  const [logoError, setLogoError] = useState(false);
  
  const placement = placements[0];
  const sponsor = placement.sponsors;
  if (!sponsor) return null;

  const logoUrl = logoError
    ? SPONSOR_LOGO_FALLBACKS[sponsor.name] || null
    : sponsor.logo_url || SPONSOR_LOGO_FALLBACKS[sponsor.name] || null;

  const handleCtaClick = () => {
    trackClick(placement.id);
    if (placement.cta_url) {
      window.open(placement.cta_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-colors group">
      {/* Gold accent stripe */}
      <div className="h-1 bg-gradient-to-r from-[#C4942A] to-[#D4A84B]" />

      <div className="p-3.5">
        {/* Header with Sponsored label */}
        <div className="flex items-start justify-between mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {sponsor.logo_url && (
              <img
                src={sponsor.logo_url}
                alt={`${sponsor.name} logo`}
                className="w-9 h-9 rounded-lg object-contain bg-white border border-border/50 p-0.5 shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate leading-tight">
                {sponsor.name}
              </p>
              {sponsor.tier === 'gold' && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Award className="h-3 w-3 text-[#C4942A]" />
                  <span className="text-[10px] font-medium text-[#C4942A]">Gold Partner</span>
                </div>
              )}
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground/60 shrink-0 mt-0.5">Sponsored</span>
        </div>

        {/* Tagline */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          {placement.headline || sponsor.description}
        </p>

        {/* CTA */}
        <button
          onClick={handleCtaClick}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-lg bg-[#C4942A]/10 text-[#C4942A] hover:bg-[#C4942A]/20 transition-colors"
        >
          {placement.cta_label || 'Learn More'}
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
