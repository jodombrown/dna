/**
 * LegacyProfileRedirect
 * Redirects legacy /dna/profile/:id routes to username-based routes
 * Looks up the username from the user ID and redirects accordingly
 */

import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AfricaSpinner from '@/components/ui/AfricaSpinner';

const LegacyProfileRedirect = () => {
  const { id } = useParams<{ id: string }>();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const lookupUsername = async () => {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', id)
          .single();

        if (error || !data?.username) {
          // If no username found, redirect to feed
          setNotFound(true);
        } else {
          setUsername(data.username);
        }
      } catch (err) {
        console.error('Error looking up username:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    lookupUsername();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AfricaSpinner size="lg" showText text="Redirecting..." />
      </div>
    );
  }

  if (notFound) {
    return <Navigate to="/dna/feed" replace />;
  }

  return <Navigate to={`/dna/${username}`} replace />;
};

export default LegacyProfileRedirect;
