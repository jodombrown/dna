/**
 * SpaceChannelCTA — Call-to-action button linking a space to its team channel.
 *
 * Renders a secondary-style button with participant count badge that navigates
 * the user to /dna/messages?thread={channelId}. Hides entirely when:
 *  - The user is neither a member nor the owner
 *  - The channel fetch is still loading or failed
 *  - No channelId was returned
 */

import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSpaceChannel } from '@/hooks/useSpaceChannel';

interface SpaceChannelCTAProps {
  spaceId: string;
  spaceName: string;
  isMember: boolean;
  isArchived: boolean;
  isOwner: boolean;
}

function getButtonText(isArchived: boolean): string {
  if (isArchived) return 'View Channel History';
  return 'Team Channel';
}

function formatMemberCount(count: number): string {
  if (count > 99) return '99+';
  return `${count} members`;
}

export default function SpaceChannelCTA({
  spaceId,
  spaceName,
  isMember,
  isArchived,
  isOwner,
}: SpaceChannelCTAProps) {
  const navigate = useNavigate();
  const canAccess = isMember || isOwner;

  const { channelId, participantCount, isLoading, error } = useSpaceChannel(spaceId, canAccess);

  // Not authorized — render nothing
  if (!canAccess) return null;

  // Loading — show small skeleton that matches button dimensions
  if (isLoading) {
    return (
      <Skeleton className="h-10 w-full md:w-48 rounded-md" />
    );
  }

  // Error or no channel — hide CTA entirely
  if (error || !channelId) return null;

  const buttonText = getButtonText(isArchived);

  return (
    <button
      type="button"
      onClick={() => navigate(`/dna/messages?thread=${channelId}`)}
      className={
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium ' +
        'border border-[#4A8D77] bg-transparent text-[#4A8D77] ' +
        'hover:bg-[#4A8D77] hover:text-white ' +
        'transition-colors duration-150 ' +
        'w-full md:w-auto'
      }
      aria-label={`Open team channel for ${spaceName}`}
    >
      <MessageCircle className="h-[18px] w-[18px] flex-shrink-0" />
      <span>{buttonText}</span>
      {participantCount > 1 && (
        <span
          className={
            'ml-1 inline-flex items-center justify-center rounded-full ' +
            'bg-[#4A8D77]/10 px-2 py-0.5 text-xs font-semibold text-[#4A8D77] ' +
            'leading-none min-w-[1.25rem]'
          }
        >
          {formatMemberCount(participantCount)}
        </span>
      )}
    </button>
  );
}
