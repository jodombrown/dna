/**
 * DNA | Sprint 11 - Member Spotlight Card
 *
 * Surfaces member profiles in the feed for connection discovery.
 * Shows profile info, sector tags, and connection reasoning.
 * Content type badge: "CONNECT"
 */

import React from 'react';
import { FeedCardBase } from './FeedCardBase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MemberSpotlightData {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  headline: string | null;
  sectors: string[];
  location: string | null;
  connectionReasoning: string;
  mutualConnectionCount: number;
}

interface MemberSpotlightCardProps {
  member: MemberSpotlightData;
  currentUserId: string;
  onConnect: (userId: string) => void;
  isConnecting?: boolean;
  connectionSent?: boolean;
}

export const MemberSpotlightCard: React.FC<MemberSpotlightCardProps> = ({
  member,
  currentUserId,
  onConnect,
  isConnecting = false,
  connectionSent = false,
}) => {
  const navigate = useNavigate();

  const initials = member.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <FeedCardBase bevelType="post">
      {/* Content Type Badge */}
      <div className="mb-3">
        <Badge
          variant="outline"
          className="text-xs font-medium bg-dna-emerald/10 text-dna-emerald border-dna-emerald/30"
        >
          <UserPlus className="h-3 w-3 mr-1" />
          CONNECT
        </Badge>
      </div>

      {/* Member Profile */}
      <div className="flex items-start gap-4">
        <Avatar
          className="h-16 w-16 cursor-pointer"
          onClick={() => navigate(`/dna/connect/members/${member.userId}`)}
        >
          <AvatarImage src={member.avatarUrl || ''} alt={member.displayName} />
          <AvatarFallback className="text-lg bg-dna-emerald/10 text-dna-emerald">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3
            className="font-bold text-lg cursor-pointer hover:text-dna-emerald transition-colors"
            onClick={() => navigate(`/dna/connect/members/${member.userId}`)}
          >
            {member.displayName}
          </h3>
          {member.headline && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
              {member.headline}
            </p>
          )}
        </div>
      </div>

      {/* Sector Tags */}
      {member.sectors.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {member.sectors.slice(0, 4).map((sector) => (
            <Badge key={sector} variant="secondary" className="text-xs">
              {sector}
            </Badge>
          ))}
          {member.sectors.length > 4 && (
            <Badge variant="secondary" className="text-xs text-muted-foreground">
              +{member.sectors.length - 4}
            </Badge>
          )}
        </div>
      )}

      {/* Location + Mutual Connections */}
      <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
        {member.location && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{member.location}</span>
          </div>
        )}
        {member.mutualConnectionCount > 0 && (
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{member.mutualConnectionCount} mutual connection{member.mutualConnectionCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Connection Reasoning */}
      <p className="text-sm text-dna-emerald/80 mt-3 italic">
        {member.connectionReasoning}
      </p>

      {/* Connect CTA */}
      <div className="mt-4">
        <Button
          className={cn(
            'w-full',
            connectionSent
              ? 'bg-muted text-muted-foreground cursor-default'
              : 'bg-dna-emerald hover:bg-dna-emerald/90 text-white'
          )}
          disabled={isConnecting || connectionSent}
          onClick={(e) => {
            e.stopPropagation();
            if (!connectionSent) {
              onConnect(member.userId);
            }
          }}
        >
          {connectionSent ? (
            'Request Sent'
          ) : isConnecting ? (
            'Sending...'
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Connect
            </>
          )}
        </Button>
      </div>
    </FeedCardBase>
  );
};
