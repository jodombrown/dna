/**
 * DNA | FEED - Space Activity Feed
 * 
 * Shows activity within a space via the universal feed.
 * Replaces legacy space_updates table with unified posts system.
 */

import React from 'react';
import { UniversalFeed } from '@/components/feed/UniversalFeed';
import { UniversalComposer } from '@/components/composer/UniversalComposer';
import { useUniversalComposer } from '@/hooks/useUniversalComposer';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MessageCircle, PenSquare } from 'lucide-react';

interface SpaceUpdatesProps {
  spaceId: string;
  canEdit: boolean;
  spaceName?: string;
}

export function SpaceUpdates({ spaceId, canEdit, spaceName }: SpaceUpdatesProps) {
  const { user } = useAuth();
  const composer = useUniversalComposer({ spaceId });

  if (!user) return null;

  const emptyAction = canEdit ? (
    <Button variant="outline" className="mt-4" onClick={() => composer.open('post', { spaceId })}>
      <MessageCircle className="w-4 h-4 mr-2" />
      Share an Update
    </Button>
  ) : undefined;

  return (
    <div className="space-y-4">
      {/* Create post button */}
      {canEdit && (
        <Button 
          onClick={() => composer.open('post', { spaceId })}
          className="w-full"
          variant="outline"
        >
          <PenSquare className="w-4 h-4 mr-2" />
          Share an update in this space
        </Button>
      )}

      {/* Universal Feed filtered by space */}
      <UniversalFeed
        viewerId={user.id}
        spaceId={spaceId}
        tab="all"
        emptyMessage={`No activity in ${spaceName || 'this space'} yet.`}
        emptyAction={emptyAction}
      />

      {/* Composer Modal */}
      <UniversalComposer
        isOpen={composer.isOpen}
        mode={composer.mode}
        context={composer.context}
        isSubmitting={composer.isSubmitting}
        onClose={composer.close}
        onModeChange={composer.switchMode}
        onSubmit={composer.submit}
      />
    </div>
  );
}
