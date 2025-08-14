import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import UserDashboardLayout from '@/components/dashboard/UserDashboardLayout';
import LoadingSpinner from '@/components/ui/loading-spinner';
import NotFound from './NotFound';
import { useProfile } from '@/hooks/useProfile';

const UserDashboard = () => {
  const { username } = useParams<{ username: string }>();
  const { user, loading: authLoading } = useAuth();
  const { data: myProfile, isLoading: myProfileLoading } = useProfile();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) {
        setError('Username is required');
        setLoading(false);
        return;
      }

      try {
        // Use secure service function to get profile by username
        const { profilesService } = await import('@/services/profilesService');
        const data = await profilesService.getProfileByUsername(username);
        const error = null;

        if (error) {
          console.error('Error fetching profile:', error);
          setError('Failed to load profile');
        } else if (!data) {
          setError('User not found');
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    // Skip fetching when using special aliases
    if (username === 'me' || username === ':username') {
      setLoading(false);
      return;
    }

    fetchUserProfile();

    // Realtime subscribe to profile changes
    const channel = supabase
      .channel('public-profiles-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        // Refetch public view on any profile change
        fetchUserProfile();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username]);

  // Handle special routes
  if (username === ':username') {
    return <Navigate to="/dna/me" replace />;
  }

  if (username === 'me') {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      );
    }
    if (!user) {
      return <Navigate to="/auth" replace />;
    }
    if (myProfileLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      );
    }
    if (myProfile && (myProfile as any).username) {
      return <Navigate to={`/dna/${(myProfile as any).username}`} replace />;
    }
    return <NotFound />;
  }

  // Show loading while auth or profile is loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show 404 if profile not found
  if (error === 'User not found' || !profile) {
    return <NotFound />;
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return <UserDashboardLayout profile={profile} currentUser={user} />;
};

export default UserDashboard;