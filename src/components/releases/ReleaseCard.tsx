/**
 * ReleaseCard Component
 * Card component for displaying releases in grid layouts
 * Supports featured, standard, and compact variants
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { CategoryTag } from './CategoryTag';
import { ReleaseHero } from './ReleaseHero';
import { usePrefetchRelease } from '@/hooks/useReleases';
import type { ReleaseCardProps } from '@/types/releases';

export const ReleaseCard: React.FC<ReleaseCardProps> = ({
  release,
  variant = 'standard',
  className,
}) => {
  const prefetchRelease = usePrefetchRelease();

  const handleMouseEnter = () => {
    prefetchRelease(release.slug);
  };

  const releaseDate = new Date(release.release_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Featured variant - larger card with prominent hero
  if (variant === 'featured') {
    return (
      <Link
        to={`/releases/${release.slug}`}
        onMouseEnter={handleMouseEnter}
        className="block group"
      >
        <Card
          className={cn(
            'overflow-hidden transition-all duration-300',
            'hover:shadow-lg hover:-translate-y-1',
            'border-amber-200 bg-gradient-to-br from-amber-50/50 to-white',
            className
          )}
        >
          {/* Hero Section */}
          <div className="relative aspect-video">
            <ReleaseHero
              heroType={release.hero_type}
              imageUrl={release.hero_image_url}
              category={release.category}
              title={release.title}
              className="absolute inset-0"
            />
            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              <StatusBadge stage={release.lifecycle_stage} size="md" />
            </div>
          </div>

          <CardContent className="p-5">
            {/* Meta */}
            <div className="flex items-center gap-3 mb-3">
              <CategoryTag category={release.category} size="sm" />
              {release.version && (
                <span className="text-xs font-medium text-gray-500">
                  v{release.version}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-serif text-xl font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-dna-emerald transition-colors">
              {release.title}
            </h3>

            {/* Subtitle */}
            {release.subtitle && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2 italic">
                {release.subtitle}
              </p>
            )}

            {/* Features preview */}
            {release.features && release.features.length > 0 && (
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                {release.features.slice(0, 2).map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-dna-emerald mt-0.5">•</span>
                    <span className="line-clamp-1">{feature}</span>
                  </li>
                ))}
                {release.features.length > 2 && (
                  <li className="text-xs text-gray-400">
                    +{release.features.length - 2} more
                  </li>
                )}
              </ul>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>{releaseDate}</span>
              </div>
              <span className="flex items-center gap-1 text-sm font-medium text-dna-emerald group-hover:gap-2 transition-all">
                Learn more
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
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
        onMouseEnter={handleMouseEnter}
        className="block group"
      >
        <Card
          className={cn(
            'overflow-hidden transition-all duration-200',
            'hover:shadow-md hover:border-gray-300',
            className
          )}
        >
          <CardContent className="p-4 flex items-center gap-4">
            {/* Mini Hero */}
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <ReleaseHero
                heroType={release.hero_type}
                imageUrl={release.hero_image_url}
                category={release.category}
                title={release.title}
                className="absolute inset-0"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CategoryTag category={release.category} size="sm" showIcon={false} />
                <StatusBadge stage={release.lifecycle_stage} size="sm" />
              </div>
              <h4 className="font-medium text-gray-900 truncate group-hover:text-dna-emerald transition-colors">
                {release.title}
              </h4>
              <p className="text-xs text-gray-500">{releaseDate}</p>
            </div>

            {/* Arrow */}
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-dna-emerald group-hover:translate-x-1 transition-all flex-shrink-0" />
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Standard variant - default grid card
  return (
    <Link
      to={`/releases/${release.slug}`}
      onMouseEnter={handleMouseEnter}
      className="block group"
    >
      <Card
        className={cn(
          'overflow-hidden transition-all duration-300',
          'hover:shadow-lg hover:-translate-y-0.5',
          className
        )}
      >
        {/* Hero Section */}
        <div className="relative aspect-[16/10]">
          <ReleaseHero
            heroType={release.hero_type}
            imageUrl={release.hero_image_url}
            category={release.category}
            title={release.title}
            className="absolute inset-0"
          />
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <StatusBadge stage={release.lifecycle_stage} size="sm" />
          </div>
        </div>

        <CardContent className="p-4">
          {/* Meta */}
          <div className="flex items-center gap-2 mb-2">
            <CategoryTag category={release.category} size="sm" />
            {release.version && (
              <span className="text-xs font-medium text-gray-400">
                v{release.version}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-serif text-lg font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-dna-emerald transition-colors">
            {release.title}
          </h3>

          {/* Subtitle */}
          {release.subtitle && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {release.subtitle}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">{releaseDate}</span>
            <span className="flex items-center gap-1 text-sm font-medium text-dna-emerald opacity-0 group-hover:opacity-100 transition-opacity">
              View
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ReleaseCard;
