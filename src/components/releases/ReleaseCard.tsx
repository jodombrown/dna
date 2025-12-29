import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ReleaseHero } from './ReleaseHero';
import { CategoryTag } from './CategoryTag';
import { StatusBadge } from './StatusBadge';
import type { Release } from '@/hooks/useReleases';
import { getReleaseBadgeStatus } from '@/hooks/useReleases';

interface ReleaseCardProps {
  release: Release;
  className?: string;
}

export const ReleaseCard: React.FC<ReleaseCardProps> = ({ release, className }) => {
  const navigate = useNavigate();
  const badgeStatus = getReleaseBadgeStatus(release.release_date);
  
  const formattedDate = new Date(release.release_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleCtaClick = () => {
    if (release.cta_link) {
      if (release.cta_link.startsWith('http')) {
        window.open(release.cta_link, '_blank');
      } else {
        navigate(release.cta_link);
      }
    }
  };

  return (
    <article
      className={cn(
        'group bg-card rounded-xl border border-border shadow-sm overflow-hidden',
        'hover:shadow-lg hover:-translate-y-1 transition-all duration-300',
        className
      )}
    >
      {/* Hero Visual */}
      <ReleaseHero
        heroType={release.hero_type}
        category={release.category}
        imageUrl={release.hero_image_url}
        videoUrl={release.hero_video_url}
      />

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Meta row */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CategoryTag category={release.category} />
            {release.version && (
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                v{release.version}
              </span>
            )}
          </div>
          <StatusBadge status={badgeStatus} />
        </div>

        {/* Date */}
        <p className="text-xs text-muted-foreground">{formattedDate}</p>

        {/* Title */}
        <h3 className="font-serif text-xl font-semibold text-foreground leading-tight">
          {release.title}
        </h3>

        {/* Subtitle */}
        {release.subtitle && (
          <p className="text-sm text-muted-foreground italic">
            {release.subtitle}
          </p>
        )}

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {release.description}
        </p>

        {/* Features */}
        {release.features && release.features.length > 0 && (
          <div className="bg-dna-pearl/50 dark:bg-muted/30 rounded-lg p-3 space-y-2">
            {release.features
              .sort((a, b) => a.sort_order - b.sort_order)
              .slice(0, 4)
              .map((feature) => (
                <div key={feature.id} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-dna-emerald flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-foreground">{feature.feature_text}</span>
                </div>
              ))}
            {release.features.length > 4 && (
              <p className="text-xs text-muted-foreground pl-6">
                +{release.features.length - 4} more features
              </p>
            )}
          </div>
        )}

        {/* CTA Button */}
        {release.cta_link && (
          <Button
            onClick={handleCtaClick}
            className="w-full bg-dna-emerald hover:bg-dna-emerald-dark text-white group/btn"
          >
            {release.cta_text || 'Try it now'}
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        )}
      </div>
    </article>
  );
};
