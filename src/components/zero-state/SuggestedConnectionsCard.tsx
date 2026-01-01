/**
 * SuggestedConnectionsCard
 *
 * Displays a horizontal scroll of suggested connections
 * based on user profile matching (country, industry, interests).
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConnectButton } from '@/components/connect/ConnectButton';
import type { SuggestedConnection } from '@/types/zero-state';
import { TYPOGRAPHY } from '@/lib/typography.config';

interface SuggestedConnectionsCardProps {
  connections: SuggestedConnection[];
}

export function SuggestedConnectionsCard({ connections }: SuggestedConnectionsCardProps) {
  const navigate = useNavigate();

  if (!connections || connections.length === 0) {
    return null;
  }

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-dna-emerald" />
          <h3 className={`${TYPOGRAPHY.h5} text-foreground`}>
            People You Might Know
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dna/connect')}
          className="text-dna-emerald hover:text-dna-forest"
        >
          See More
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Horizontal Scroll of Connection Cards */}
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-thin scrollbar-thumb-muted">
        {connections.map((connection) => (
          <ConnectionCard key={connection.id} connection={connection} />
        ))}
      </div>
    </Card>
  );
}

interface ConnectionCardProps {
  connection: SuggestedConnection;
}

function ConnectionCard({ connection }: ConnectionCardProps) {
  const initials = connection.display_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  // Get the first match reason for display
  const primaryReason = connection.match_reasons?.[0];

  return (
    <div className="flex-shrink-0 w-44 bg-muted/30 rounded-lg p-4 text-center">
      {/* Avatar */}
      <Link to={`/u/${connection.id}`}>
        <Avatar className="h-16 w-16 mx-auto mb-3 ring-2 ring-background">
          <AvatarImage src={connection.avatar_url || ''} />
          <AvatarFallback className="text-lg bg-dna-emerald/10 text-dna-emerald">
            {initials}
          </AvatarFallback>
        </Avatar>
      </Link>

      {/* Name */}
      <Link to={`/u/${connection.id}`}>
        <h4 className="font-medium text-sm truncate hover:text-dna-emerald transition-colors">
          {connection.display_name || 'DNA Member'}
        </h4>
      </Link>

      {/* Headline */}
      {connection.headline && (
        <p className="text-xs text-muted-foreground truncate mt-1 mb-2">
          {connection.headline}
        </p>
      )}

      {/* Match Reason Badge */}
      {primaryReason && (
        <Badge
          variant="outline"
          className="text-xs mb-3 bg-background"
        >
          {primaryReason}
        </Badge>
      )}

      {/* Connect Button */}
      <ConnectButton
        targetUserId={connection.id}
        targetUserName={connection.display_name || 'DNA Member'}
        size="sm"
        className="w-full"
      />
    </div>
  );
}
