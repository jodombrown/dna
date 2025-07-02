
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';
import EnhancedProfileForm from '@/components/profile/EnhancedProfileForm';
import DNALinkedInProfile from '@/components/profile/DNALinkedInProfile';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = user?.id === id;

  useEffect(() => {
    if (id) {
      fetchProfile();
    } else {
      console.error('No profile ID provided');
      setLoading(false);
    }
  }, [id]);

  const fetchProfile = async () => {
    if (!id) {
      console.error('Profile ID is missing');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching profile for ID:', id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code === '22P02') {
          console.error('Invalid UUID format for profile ID:', id);
        }
        setProfile(null);
      } else {
        console.log('Profile data fetched:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    fetchProfile();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleFollow = async () => {
    if (!user || !id) return;

    try {
      toast({
        title: "Feature Coming Soon",
        description: "Connection system will be implemented in a future update",
      });
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  const handleMessage = () => {
    if (!id) return;
    navigate(`/messages?user=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-lg">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Profile not found.</p>
            <p className="text-gray-400 text-sm mt-2">
              {id ? `Profile ID: ${id}` : 'No profile ID provided'}
            </p>
            <Button 
              onClick={() => navigate('/connect')}
              className="mt-4 bg-dna-copper hover:bg-dna-gold text-white"
            >
              Browse Professionals
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing && isOwnProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
          <EnhancedProfileForm profile={profile} onSave={handleSave} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <DNALinkedInProfile
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEdit={handleEdit}
        onFollow={handleFollow}
        onMessage={handleMessage}
      />
    </div>
  );
};

export default Profile;
