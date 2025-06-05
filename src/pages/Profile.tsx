
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedProfileForm from '@/components/profile/EnhancedProfileForm';
import EnhancedProfileDisplay from '@/components/profile/EnhancedProfileDisplay';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const isOwnProfile = user?.id === id;

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id]);

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

  const handleSave = () => {
    setIsEditing(false);
    fetchProfile();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleConnect = () => {
    navigate(`/connect/${id}`);
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EnhancedProfileDisplay 
          profile={profile} 
          isOwnProfile={isOwnProfile}
          onEdit={handleEdit}
          onConnect={handleConnect}
        />
      </div>
    </div>
  );
};

export default Profile;
