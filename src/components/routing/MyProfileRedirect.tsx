/**
 * MyProfileRedirect
 * Redirects /dna/profile to the current user's username-based profile
 * If user is not logged in or has no username, redirects to feed
 */

import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import AfricaSpinner from '@/components/ui/AfricaSpinner';

const MyProfileRedirect = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();

  // Wait for auth and profile to load
  const isLoading = authLoading || (user && profileLoading);

  useEffect(() => {
    // Only redirect when we have the data we need
    if (!isLoading) {
      if (user && profile?.username) {
        navigate(`/dna/${profile.username}`, { replace: true });
      } else if (!user) {
        navigate('/auth', { replace: true });
      } else {
        // User exists but no username - go to feed
        navigate('/dna/feed', { replace: true });
      }
    }
  }, [isLoading, user, profile, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AfricaSpinner size="lg" showText text="Loading profile..." />
      </div>
    );
  }

  // Fallback - should redirect via useEffect
  return null;
};

export default MyProfileRedirect;
