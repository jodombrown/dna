/**
 * DNA | Profile — Connection Context Widget
 * Shows "You and [Name] both know [Avatar] Amara and N others"
 * Only rendered when viewing another member's profile with mutual connections.
 */

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMutualConnections } from '@/hooks/useMutualConnections';

interface ProfileConnectionContextProps {
  currentUserId: string;
  targetUserId: string;
  targetName: string;
}

export const ProfileConnectionContext: React.FC<ProfileConnectionContextProps> = ({
  currentUserId,
  targetUserId,
  targetName,
}) => {
  const { mutualConnections, hasMutualConnections } = useMutualConnections(currentUserId, targetUserId);

  if (!hasMutualConnections || mutualConnections.length === 0) return null;

  const first = mutualConnections[0];
  const remaining = mutualConnections.length - 1;
  const displayedAvatars = mutualConnections.slice(0, 3);

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {/* Avatar stack */}
      <div className="flex -space-x-1.5">
        {displayedAvatars.map((conn) => (
          <Avatar key={conn.user_id} className="h-5 w-5 border border-background">
            <AvatarImage src={conn.avatar_url || ''} />
            <AvatarFallback className="text-[8px] bg-dna-emerald text-white">
              {conn.full_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <span>
        You and {targetName.split(' ')[0]} both know{' '}
        <span className="font-medium text-foreground">{first.full_name}</span>
        {remaining > 0 && (
          <> and <span className="font-medium text-foreground">{remaining} {remaining === 1 ? 'other' : 'others'}</span></>
        )}
      </span>
    </div>
  );
};
