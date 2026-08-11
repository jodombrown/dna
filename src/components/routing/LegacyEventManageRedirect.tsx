/**
 * LegacyEventManageRedirect — old `/dna/convene/events/:id/manage[/*]` links
 * (still emitted by some CTAs) forward to the unified event route.
 *
 * These used to be declared as `<Navigate to=".." />` / `<Navigate to="../x" />`
 * siblings of the `/dna/convene/events/:id` route rather than children of it,
 * so the relative `".."` resolved against the *declared* route tree depth
 * (1) instead of the URL's segment count, sending users to the site root
 * instead of the event. Navigating to an explicit absolute path sidesteps
 * that entirely.
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AfricaSpinner from '@/components/ui/AfricaSpinner';

interface LegacyEventManageRedirectProps {
  /** Sub-path under the event route to land on, e.g. "attendees". Omit for the event overview itself. */
  to?: string;
}

export default function LegacyEventManageRedirect({ to }: LegacyEventManageRedirectProps) {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (eventId) {
      navigate(`/dna/convene/events/${eventId}${to ? `/${to}` : ''}`, { replace: true });
    } else {
      navigate('/dna/convene', { replace: true });
    }
  }, [eventId, to, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <AfricaSpinner size="md" showText text="Redirecting..." />
    </div>
  );
}
