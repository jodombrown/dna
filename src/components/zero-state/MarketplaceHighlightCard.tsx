/**
 * MarketplaceHighlightCard
 *
 * Displays a marketplace opportunity/contribution need
 * matching the user's skills for the Zero State discovery experience.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, Briefcase, Clock, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MarketplaceHighlight } from '@/types/zero-state';
import { TYPOGRAPHY } from '@/lib/typography.config';

interface MarketplaceHighlightCardProps {
  opportunity: MarketplaceHighlight;
}

export function MarketplaceHighlightCard({ opportunity }: MarketplaceHighlightCardProps) {
  const timeAgo = opportunity.created_at
    ? formatDistanceToNow(new Date(opportunity.created_at), { addSuffix: true })
    : '';

  // Format contribution type for display
  const typeLabel = opportunity.contribution_type
    ? opportunity.contribution_type.charAt(0).toUpperCase() +
      opportunity.contribution_type.slice(1).replace(/_/g, ' ')
    : 'Opportunity';

  // Show top 3 skills needed
  const displaySkills = opportunity.skills_needed?.slice(0, 3) || [];
  const remainingSkills = (opportunity.skills_needed?.length || 0) - 3;

  return (
    <Link to={`/dna/contribute/${opportunity.id}`}>
      <Card className="p-4 hover:border-primary/50 transition-colors cursor-pointer">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-dna-gold/10 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-dna-gold" />
          </div>
          <div className="flex-1 min-w-0">
            {/* Type Badge */}
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="bg-dna-gold/10 text-dna-gold border-0">
                <Briefcase className="w-3 h-3 mr-1" />
                {typeLabel}
              </Badge>
              {opportunity.skills_match_count > 0 && (
                <Badge variant="outline" className="border-dna-emerald text-dna-emerald">
                  <Star className="w-3 h-3 mr-1" />
                  {opportunity.skills_match_count} skill{opportunity.skills_match_count > 1 ? 's' : ''} match
                </Badge>
              )}
            </div>

            {/* Title */}
            <h3 className={`${TYPOGRAPHY.h5} text-foreground line-clamp-2`}>
              {opportunity.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        {opportunity.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {opportunity.description}
          </p>
        )}

        {/* Skills Needed */}
        {displaySkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {displaySkills.map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {remainingSkills > 0 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{remainingSkills} more
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {timeAgo}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="text-dna-emerald border-dna-emerald hover:bg-dna-emerald/10"
          >
            View Opportunity
          </Button>
        </div>
      </Card>
    </Link>
  );
}
