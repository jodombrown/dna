/**
 * ReleaseCard Component
 * Card component for displaying releases in grid layouts
 * Supports featured, standard, and compact variants
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { CategoryTag } from './CategoryTag';
import { ReleaseHero } from './ReleaseHero';
import type { ReleaseCategory } from '@/types/releases';

interface ReleaseFeature {
  id?: string;
  feature_text: string;
  sort_order?: number;
}

interface Release {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  category: ReleaseCategory;
  release_date: string;
  hero_type: string;
  hero_image_url?: string;
  hero_video_url?: string;
  version?: string;
  cta_text?: string;
  cta_link?: string;
  features?: (string | ReleaseFeature)[];
  lifecycle_stage?: 'featured' | 'recent' | 'archived';
}

interface ReleaseCardProps {
  release: Release;
  variant?: 'featured' | 'standard' | 'compact';
  className?: string;
}

export const ReleaseCard: React.FC<ReleaseCardProps> = ({
  release,
  variant = 'standard',
  className,
}) => {
  const navigate = useNavigate();

  const releaseDate = new Date(release.release_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Get feature text from either string[] or ReleaseFeature[] format
  const getFeatureText = (feature: string | ReleaseFeature): string => {
    return typeof feature === 'string' ? feature : feature.feature_text;
  };

  const handleCtaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (release.cta_link) {
      if (release.cta_link.startsWith('http')) {
        window.open(release.cta_link, '_blank');
      } else {
        navigate(release.cta_link);
      }
    }
  };

  // Featured variant - larger card with prominent hero
  if (variant === 'featured') {
    return (
      <Link
        to={`/releases/${release.slug}`}
        className="block group"
      >
        <Card
          className={cn(
            'overflow-hidden transition-all duration-300',
            'hover:shadow-lg hover:-translate-y-1',
            'border-dna-emerald/20 bg-gradient-to-br from-dna-emerald/5 to-white',
            className
          )}
        >
          {/* Hero Section */}
          <ReleaseHero
            heroType={release.hero_type as any}
            imageUrl={release.hero_image_url}
            videoUrl={release.hero_video_url}
            category={release.category}
          />

          <CardContent className="p-5">
            {/* Meta */}
            <div className="flex items-center gap-3 mb-3">
              <CategoryTag category={release.category} size="sm" />
              {release.version && (
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  v{release.version}
                </span>
              )}
              {release.lifecycle_stage && (
                <StatusBadge status={release.lifecycle_stage} />
              )}
            </div>

            {/* Date */}
            <p className="text-xs text-muted-foreground mb-2">{releaseDate}</p>

            {/* Title */}
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-dna-emerald transition-colors">
              {release.title}
            </h3>

            {/* Subtitle */}
            {release.subtitle && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2 italic">
                {release.subtitle}
              </p>
            )}

            {/* Features preview */}
            {release.features && release.features.length > 0 && (
              <div className="bg-dna-pearl/50 dark:bg-muted/30 rounded-lg p-3 space-y-2 mb-4">
                {release.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-dna-emerald flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-foreground line-clamp-1">
                      {getFeatureText(feature)}
                    </span>
                  </div>
                ))}
                {release.features.length > 3 && (
                  <p className="text-xs text-muted-foreground pl-6">
                    +{release.features.length - 3} more
                  </p>
                )}
              </div>
            )}

            {/* CTA or Learn More */}
            {release.cta_link ? (
              <Button
                onClick={handleCtaClick}
                className="w-full bg-dna-emerald hover:bg-dna-forest text-white group/btn"
              >
                {release.cta_text || 'Try it now'}
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">{releaseDate}</span>
                <span className="flex items-center gap-1 text-sm font-medium text-dna-emerald group-hover:gap-2 transition-all">
                  Learn more
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Compact variant - minimal card for archived listings
  if (variant === 'compact') {
    return (
      <Link
        to={`/releases/${release.slug}`}
        className="block group"
      >
        <Card
          className={cn(
            'overflow-hidden transition-all duration-200',
            'hover:shadow-md hover:border-dna-emerald/30',
            className
          )}
        >
          <CardContent className="p-4 flex items-center gap-4">
            {/* Mini Hero */}
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <ReleaseHero
                heroType={release.hero_type as any}
                imageUrl={release.hero_image_url}
                category={release.category}
                className="absolute inset-0"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CategoryTag category={release.category} size="sm" showIcon={false} />
                {release.lifecycle_stage && (
                  <StatusBadge status={release.lifecycle_stage} size="sm" />
                )}
              </div>
              <h4 className="font-medium text-foreground truncate group-hover:text-dna-emerald transition-colors">
                {release.title}
              </h4>
              <p className="text-xs text-muted-foreground">{releaseDate}</p>
            </div>

            {/* Arrow */}
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-dna-emerald group-hover:translate-x-1 transition-all flex-shrink-0" />
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Standard variant - default grid card
  return (
    <Link
      to={`/releases/${release.slug}`}
      className="block group"
    >
      <article
        className={cn(
          'bg-card rounded-xl border border-border shadow-sm overflow-hidden',
          'hover:shadow-lg hover:-translate-y-1 transition-all duration-300',
          className
        )}
      >
        {/* Hero Visual */}
        <ReleaseHero
          heroType={release.hero_type as any}
          category={release.category}
          imageUrl={release.hero_image_url}
          videoUrl={release.hero_video_url}
        />

        {/* Content */}
        <div className="p-5 space-y-3">
          {/* Meta row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CategoryTag category={release.category} size="sm" />
              {release.version && (
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  v{release.version}
                </span>
              )}
            </div>
            {release.lifecycle_stage && (
              <StatusBadge status={release.lifecycle_stage} />
            )}
          </div>

          {/* Date */}
          <p className="text-xs text-muted-foreground">{releaseDate}</p>

          {/* Title */}
          <h3 className="font-serif text-lg font-semibold text-foreground leading-tight group-hover:text-dna-emerald transition-colors">
            {release.title}
          </h3>

          {/* Subtitle */}
          {release.subtitle && (
            <p className="text-sm text-muted-foreground italic line-clamp-2">
              {release.subtitle}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end pt-2 border-t border-border">
            <span className="flex items-center gap-1 text-sm font-medium text-dna-emerald opacity-0 group-hover:opacity-100 transition-opacity">
              View
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ReleaseCard;
