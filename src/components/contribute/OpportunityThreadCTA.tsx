/**
 * OpportunityThreadCTA — Call-to-action linking an opportunity to its messaging thread(s).
 *
 * TWO render paths depending on user role:
 *  - Non-poster: "Message About This" button → opens private 1:1 thread with poster
 *  - Poster: "View Responses (N)" button → navigates to messaging, or
 *            "No responses yet" muted text when no threads exist
 *
 * Hides entirely when the user is not logged in or the hook errors.
 */

import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useOpportunityThread } from '@/hooks/useOpportunityThread';

interface OpportunityThreadCTAProps {
  opportunityId: string;
  opportunityTitle: string;
  posterId: string;
  currentUserId: string;
  isClosed: boolean;
}

function getNonPosterButtonText(isClosed: boolean): string {
  if (isClosed) return 'View Conversation';
  return 'Message About This';
}

function formatResponseCount(count: number): string {
  if (count > 99) return '99+';
  return String(count);
}

export default function OpportunityThreadCTA({
  opportunityId,
  opportunityTitle,
  posterId,
  currentUserId,
  isClosed,
}: OpportunityThreadCTAProps) {
  const navigate = useNavigate();
  const isPoster = currentUserId === posterId;

  // Not logged in — render nothing
  if (!currentUserId) return null;

  const { threadId, responseCount, isLoading, error } = useOpportunityThread(
    opportunityId,
    currentUserId,
    posterId,
    !!currentUserId
  );

  // Loading — show small skeleton that matches button dimensions
  if (isLoading) {
    return (
      <Skeleton className="h-10 w-full md:w-48 rounded-md" />
    );
  }

  // Error — hide CTA entirely
  if (error) return null;

  // ── Poster path ──
  if (isPoster) {
    if (responseCount === 0) {
      return (
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground px-4 py-2">
          <MessageCircle className="h-[18px] w-[18px] flex-shrink-0" />
          {isClosed ? 'No responses' : 'No responses yet'}
        </span>
      );
    }

    const handlePosterClick = () => {
      if (responseCount === 1 && threadId) {
        navigate(`/dna/messages?thread=${threadId}`);
      } else {
        navigate('/dna/messages');
      }
    };

    return (
      <button
        type="button"
        onClick={handlePosterClick}
        className={
          'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium ' +
          'border border-[#4A8D77] bg-transparent text-[#4A8D77] ' +
          'hover:bg-[#4A8D77] hover:text-white ' +
          'transition-colors duration-150 ' +
          'w-full md:w-auto'
        }
        aria-label={`View responses for ${opportunityTitle}`}
      >
        <MessageCircle className="h-[18px] w-[18px] flex-shrink-0" />
        <span>View Responses ({formatResponseCount(responseCount)})</span>
      </button>
    );
  }

  // ── Non-poster path ──

  // No thread available — hide CTA
  if (!threadId) return null;

  const buttonText = getNonPosterButtonText(isClosed);

  return (
    <button
      type="button"
      onClick={() => navigate(`/dna/messages?thread=${threadId}`)}
      className={
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium ' +
        'border border-[#4A8D77] bg-transparent text-[#4A8D77] ' +
        'hover:bg-[#4A8D77] hover:text-white ' +
        'transition-colors duration-150 ' +
        'w-full md:w-auto'
      }
      aria-label={`Open conversation about ${opportunityTitle}`}
    >
      <MessageCircle className="h-[18px] w-[18px] flex-shrink-0" />
      <span>{buttonText}</span>
    </button>
  );
}
