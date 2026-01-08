/**
 * LegacyEventRedirect - Redirects old /events/:id URLs to new /dna/convene/events/:id
 * Supports both UUID and slug-based identifiers
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AfricaSpinner from '@/components/ui/AfricaSpinner';

export default function LegacyEventRedirect() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      // Redirect to the new canonical URL
      navigate(`/dna/convene/events/${id}`, { replace: true });
    } else {
      // If no ID, go to events list
      navigate('/dna/convene/events', { replace: true });
    }
  }, [id, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <AfricaSpinner size="md" showText text="Redirecting..." />
    </div>
  );
}
