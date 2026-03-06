/**
 * DNA | CONVENE — Event Social Proof
 * Shows attendee avatars with connection priority: "Sarah, Marcus, and 12 others are going"
 * Tappable to open full attendee list modal with CONNECT profile links.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, X, Loader2 } from 'lucide-react';
import { useMutualAttendees } from '@/hooks/useMutualAttendees';
import { useEventAttendees } from '@/hooks/convene/useEventAttendees';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AttendeeProfile {
  id: string;
  username: string | null;
  full_name: string;
  avatar_url: string | null;
}

interface EventSocialProofProps {
  eventId: string;
  attendees: AttendeeProfile[];
  totalCount: number;
}

export function EventSocialProof({ eventId, attendees, totalCount }: EventSocialProofProps) {
  const navigate = useNavigate();
  const { data: mutualAttendees = [] } = useMutualAttendees(eventId);
  const [showAttendeeList, setShowAttendeeList] = useState(false);

  if (totalCount === 0 && mutualAttendees.length === 0) return null;

  // Prioritize connections first, then fill with other attendees
  const connectionIds = new Set(mutualAttendees.map(m => m.user_id));
  const prioritized: AttendeeProfile[] = [
    ...mutualAttendees.map(m => ({
      id: m.user_id,
      username: null,
      full_name: m.full_name,
      avatar_url: m.avatar_url,
    })),
    ...attendees.filter(a => !connectionIds.has(a.id)),
  ].slice(0, 3);

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const renderText = () => {
    const names = prioritized.map(p => p.full_name.split(' ')[0]);
    const remaining = totalCount - prioritized.length;

    if (mutualAttendees.length > 0) {
      const connectionNames = mutualAttendees.slice(0, 2).map(m => m.full_name.split(' ')[0]);
      if (mutualAttendees.length === 1 && remaining <= 0) {
        return <><span className="font-medium">{connectionNames[0]}</span> from your network is going</>;
      }
      if (remaining > 0) {
        return <><span className="font-medium">{connectionNames.join(', ')}</span> and <span className="font-medium">{remaining} other{remaining > 1 ? 's' : ''}</span> are going</>;
      }
      return <><span className="font-medium">{connectionNames.join(' and ')}</span> are going</>;
    }

    if (totalCount === 1 && names[0]) {
      return <><span className="font-medium">{names[0]}</span> is going</>;
    }
    if (totalCount <= 3) {
      return <><span className="font-medium">{names.join(', ')}</span> are going</>;
    }
    return <><span className="font-medium">{names.slice(0, 2).join(', ')}</span> and <span className="font-medium">{remaining} others</span> are going</>;
  };

  return (
    <>
      <div
        className="flex items-center gap-2 py-3 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setShowAttendeeList(true)}
        role="button"
        aria-label={`View all ${totalCount} attendees`}
      >
        <div className="flex -space-x-2">
          {prioritized.map(p => (
            <Avatar
              key={p.id}
              className="h-7 w-7 border-2 border-background"
            >
              <AvatarImage src={p.avatar_url || undefined} alt={p.full_name} />
              <AvatarFallback className="text-[9px] bg-muted">{getInitials(p.full_name)}</AvatarFallback>
            </Avatar>
          ))}
        </div>
        <span className="text-sm text-muted-foreground">{renderText()}</span>
      </div>

      <AttendeeListModal
        eventId={eventId}
        isOpen={showAttendeeList}
        onClose={() => setShowAttendeeList(false)}
        totalCount={totalCount}
      />
    </>
  );
}

/* ── Attendee List Modal ─────────────────── */

interface AttendeeListModalProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
  totalCount: number;
}

function AttendeeListModal({ eventId, isOpen, onClose, totalCount }: AttendeeListModalProps) {
  const navigate = useNavigate();
  const { data: allAttendees = [], isLoading } = useEventAttendees(isOpen ? eventId : undefined);

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleProfileClick = (username: string | null, userId: string) => {
    onClose();
    if (username) {
      navigate(`/dna/${username}`);
    } else {
      navigate(`/dna/connect/profile/${userId}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md max-h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Attendees ({totalCount})
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-1">
              {allAttendees.map(attendee => (
                <div
                  key={attendee.userId}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleProfileClick(attendee.username, attendee.userId)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={attendee.avatarUrl || undefined} alt={attendee.fullName} />
                    <AvatarFallback className="text-xs">{getInitials(attendee.fullName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{attendee.fullName}</p>
                      {attendee.isConnection && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
                          Connection
                        </Badge>
                      )}
                    </div>
                    {attendee.headline && (
                      <p className="text-xs text-muted-foreground truncate">{attendee.headline}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
