
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedProfileForm from '@/components/profile/EnhancedProfileForm';
import DNALinkedInProfile from '@/components/profile/DNALinkedInProfile';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = user?.id === id;

  useEffect(() => {
    if (id) {
      fetchProfile();
      if (!isOwnProfile) {
        checkFollowingStatus();
      }
    }
  }, [id, isOwnProfile]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowingStatus = async () => {
    if (!user || !id) return;
    
    try {
      const { data } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', id)
        .single();
      
      setIsFollowing(!!data);
    } catch (error) {
      // Not following
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
      if (isFollowing) {
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', id);
        setIsFollowing(false);
      } else {
        await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: id
          });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  const handleMessage = () => {
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
            <Button 
              onClick={() => navigate('/members')}
              className="mt-4 bg-dna-copper hover:bg-dna-gold text-white"
            >
              Browse Members
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
