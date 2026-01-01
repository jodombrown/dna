/**
 * PopularSpaceCard
 *
 * Displays a popular collaboration space
 * for the Zero State discovery experience.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Users, CheckSquare, Rocket, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PopularSpace } from '@/types/zero-state';
import { TYPOGRAPHY } from '@/lib/typography.config';

interface PopularSpaceCardProps {
  space: PopularSpace;
}

export function PopularSpaceCard({ space }: PopularSpaceCardProps) {
  return (
    <Link to={`/dna/collaborate/space/${space.id}`}>
      <Card className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer">
        {/* Cover Image */}
        {space.cover_image && (
          <div className="h-24 overflow-hidden bg-muted">
            <img
              src={space.cover_image}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-4">
          {/* Header with Icon */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-dna-terra/10 flex items-center justify-center flex-shrink-0">
              <Rocket className="w-5 h-5 text-dna-terra" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`${TYPOGRAPHY.h5} text-foreground line-clamp-1`}>
                {space.name}
              </h3>
              {space.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {space.description}
                </p>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {space.member_count} members
            </span>
            <span className="flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4" />
              {space.active_task_count} active tasks
            </span>
          </div>

          {/* Open/Closed Badge and CTA */}
          <div className="flex items-center justify-between">
            {space.is_open ? (
              <Badge variant="secondary" className="bg-dna-emerald/10 text-dna-emerald border-0">
                Open for Contributors
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-muted text-muted-foreground border-0">
                <Lock className="w-3 h-3 mr-1" />
                Invite Only
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-dna-emerald border-dna-emerald hover:bg-dna-emerald/10"
            >
              View Space
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
