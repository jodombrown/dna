
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/CleanAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import UserProfileView from './UserProfileView';
import UserProfileEdit from './UserProfileEdit';

interface ProfileData {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  professional_role: string | null;
  current_country: string | null;
  interests: string[] | null;
  bio: string | null;
}

const UserProfileContainer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, professional_role, current_country, interests, bio')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create a basic one
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.email?.split('@')[0] || 'User'
            })
            .select('id, full_name, avatar_url, professional_role, current_country, interests, bio')
            .single();

          if (createError) throw createError;
          setProfile(newProfile);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedProfile: Partial<ProfileData>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
      setEditing(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {editing ? (
        <UserProfileEdit
          profile={profile}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <UserProfileView
          profile={profile}
          onEdit={() => setEditing(true)}
        />
      )}
    </div>
  );
};

export default UserProfileContainer;
