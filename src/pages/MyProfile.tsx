
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedProfileForm from '@/components/profile/EnhancedProfileForm';
import EnhancedProfileDisplay from '@/components/profile/EnhancedProfileDisplay';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const MyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

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
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
      
      // If profile is empty or missing essential fields, show form by default
      if (!data || !data.full_name) {
        setIsEditing(true);
      }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-lg">Loading your profile...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEditing ? (
          <div>
            {profile && (
              <div className="mb-6">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
            <EnhancedProfileForm profile={profile} onSave={handleSave} />
          </div>
        ) : (
          <div>
            {!profile || !profile.full_name ? (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-dna-forest mb-4">Welcome to DiasporaLink!</h2>
                <p className="text-gray-600 mb-6">Complete your profile to start connecting with the diaspora community.</p>
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-dna-copper hover:bg-dna-gold text-white"
                >
                  Create Your Profile
                </Button>
              </div>
            ) : (
              <EnhancedProfileDisplay 
                profile={profile} 
                isOwnProfile={true}
                onEdit={handleEdit}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
