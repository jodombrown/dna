/**
 * GroupReadReceipts - Avatar stack showing who has read a group message
 * 
 * Shows up to 3 overlapping avatars of readers, with +N for more.
 * Only rendered on the last message in a consecutive sender run.
 */

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ResponsiveModal,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import { format } from 'date-fns';
import type { ConversationParticipant } from '@/types/groupMessaging';

interface GroupReadReceiptsProps {
  messageCreatedAt: string;
  senderId: string;
  participants: ConversationParticipant[];
}

export function GroupReadReceipts({ messageCreatedAt, senderId, participants }: GroupReadReceiptsProps) {
  const [showSeenBy, setShowSeenBy] = useState(false);

  // Filter participants who have read past this message (excluding sender)
  const readers = participants.filter(p => {
    if (p.user_id === senderId) return false;
    if (!p.last_read_at) return false;
    return new Date(p.last_read_at) > new Date(messageCreatedAt);
  });

  if (readers.length === 0) return null;

  const visibleReaders = readers.slice(0, 3);
  const extraCount = readers.length - 3;

  return (
    <>
      <button
        onClick={() => setShowSeenBy(true)}
        className="flex items-center mt-0.5 justify-end"
      >
        <div className="flex items-center">
          {visibleReaders.map((reader, i) => (
            <Avatar
              key={reader.user_id}
              className="h-4 w-4 border border-background"
              style={{ marginLeft: i > 0 ? '-6px' : '0' }}
            >
              <AvatarImage src={reader.avatar_url} />
              <AvatarFallback className="text-[6px] bg-muted">
                {(reader.full_name || '?')[0]}
              </AvatarFallback>
            </Avatar>
          ))}
          {extraCount > 0 && (
            <span className="text-[10px] text-muted-foreground ml-0.5">+{extraCount}</span>
          )}
        </div>
      </button>

      <ResponsiveModal open={showSeenBy} onOpenChange={setShowSeenBy}>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Seen by</ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <div className="px-4 pb-4 space-y-2 max-h-[300px] overflow-y-auto">
          {readers.map(reader => (
            <div key={reader.user_id} className="flex items-center gap-3 py-1.5">
              <Avatar className="h-8 w-8">
                <AvatarImage src={reader.avatar_url} />
                <AvatarFallback className="text-xs bg-muted">
                  {(reader.full_name || '?').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{reader.full_name || 'Unknown'}</p>
                {reader.last_read_at && (
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(reader.last_read_at), 'MMM d, h:mm a')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </ResponsiveModal>
    </>
  );
}
