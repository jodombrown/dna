/**
 * CollaborateFocus - Focus Mode Content for Collaborate Module
 *
 * Displays actionable Collaborate content including:
 * - Spaces needing attention (stalled activity)
 * - Active user spaces
 * - Space invitations
 * - Aspiration mode for when spaces feature is launching
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, AlertTriangle, Users, Clock, Bell, Rocket, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useCollaborateFocusData, type Space, type SpaceInvite } from '@/hooks/useCollaborateFocusData';

function formatLastActivity(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return `${Math.floor(diffDays / 7)} weeks ago`;
}

function StalledSpaceCard({ space }: { space: Space }) {
  return (
    <Link
      to={`/dna/collaborate/spaces/${space.id}`}
      className="block p-3 bg-dna-copper/5 border border-dna-copper/20 rounded-lg hover:bg-dna-copper/10 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-dna-copper/10 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-dna-copper" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-neutral-900 truncate">
            {space.name}
          </h4>
          <p className="text-xs text-dna-copper mt-0.5">
            Inactive for {formatLastActivity(space.lastActivityAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}

function ActiveSpaceCard({ space }: { space: Space }) {
  return (
    <Link
      to={`/dna/collaborate/spaces/${space.id}`}
      className="block p-3 border border-neutral-100 rounded-lg hover:border-neutral-200 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-dna-mint/10 flex items-center justify-center shrink-0">
          <Layers className="w-5 h-5 text-dna-mint" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-neutral-900 truncate">
            {space.name}
          </h4>
          <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {space.memberCount} members
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatLastActivity(space.lastActivityAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SpaceInviteCard({ invite, onAccept, onDecline }: {
  invite: SpaceInvite;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="p-3 bg-dna-purple/5 border border-dna-purple/20 rounded-lg">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={invite.invitedByAvatar || undefined} />
          <AvatarFallback className="bg-dna-purple/20 text-dna-purple text-sm">
            {invite.invitedByName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-neutral-900 truncate">
            {invite.spaceName}
          </h4>
          <p className="text-xs text-neutral-500 truncate">
            Invited by {invite.invitedByName}
          </p>
          {invite.message && (
            <p className="text-xs text-neutral-600 mt-1 italic line-clamp-2">
              "{invite.message}"
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Button size="sm" onClick={onAccept} className="flex-1 bg-dna-emerald hover:bg-dna-emerald/90">
          Join Space
        </Button>
        <Button size="sm" variant="outline" onClick={onDecline}>
          Decline
        </Button>
      </div>
    </div>
  );
}

function AspirationMode() {
  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dna-mint/10 flex items-center justify-center">
        <Layers className="w-8 h-8 text-dna-mint" />
      </div>
      <h3 className="font-semibold text-neutral-900 mb-2">Spaces are coming soon</h3>
      <p className="text-sm text-neutral-500 mb-4">
        From startup co-founding to community initiatives — build something meaningful together.
      </p>
      <div className="space-y-2">
        <Button variant="outline" className="w-full">
          <Bell className="w-4 h-4 mr-2" />
          Notify Me When Spaces Open
        </Button>
        <Link to="/dna/collaborate/propose">
          <Button variant="ghost" className="w-full text-dna-emerald">
            <Rocket className="w-4 h-4 mr-2" />
            Propose a Space
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function CollaborateFocus() {
  const {
    activeSpaces,
    stalledSpaces,
    spaceInvites,
    isLoading,
    totalSpaces,
    stalledCount,
    inviteCount,
  } = useCollaborateFocusData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-dna-emerald" />
      </div>
    );
  }

  // Show aspiration mode if no spaces at all
  if (totalSpaces === 0 && inviteCount === 0) {
    return <AspirationMode />;
  }

  return (
    <div className="space-y-6">
      {/* Stalled Spaces - Needs Attention */}
      {stalledCount > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-dna-copper" />
            <h3 className="font-semibold text-sm text-neutral-900">
              Needs Your Attention
            </h3>
          </div>
          <div className="space-y-2">
            {stalledSpaces.slice(0, 2).map((space) => (
              <StalledSpaceCard key={space.id} space={space} />
            ))}
          </div>
        </section>
      )}

      {/* Space Invitations */}
      {inviteCount > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-neutral-900">
              Space Invitations ({inviteCount})
            </h3>
          </div>
          <div className="space-y-2">
            {spaceInvites.slice(0, 2).map((invite) => (
              <SpaceInviteCard
                key={invite.id}
                invite={invite}
                onAccept={() => {
                  // TODO: Implement accept invite
                }}
                onDecline={() => {
                  // TODO: Implement decline invite
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Active Spaces */}
      {activeSpaces.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-neutral-900">
              Your Spaces ({activeSpaces.length})
            </h3>
            {activeSpaces.length > 2 && (
              <Link
                to="/dna/collaborate/my-spaces"
                className="text-xs text-dna-emerald hover:underline"
              >
                See All
              </Link>
            )}
          </div>
          <div className="space-y-2">
            {activeSpaces.slice(0, 3).map((space) => (
              <ActiveSpaceCard key={space.id} space={space} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default CollaborateFocus;
