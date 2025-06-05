
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileForm from '@/components/profile/ProfileForm';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Building, ExternalLink, Edit } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-lg">Loading your profile...</div>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <ProfileForm profile={profile} onSave={handleSave} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                  <AvatarFallback className="bg-dna-copper text-white text-2xl">
                    {profile.full_name?.split(' ').map((n: string) => n[0]).join('') || user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-dna-copper hover:bg-dna-gold text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-dna-forest mb-2">
                  {profile.full_name || 'Complete Your Profile'}
                </h1>
                
                {profile.profession && (
                  <p className="text-xl text-dna-copper font-medium mb-4">
                    {profile.profession}
                  </p>
                )}
                
                <div className="space-y-2 mb-6">
                  {profile.company && (
                    <div className="flex items-center text-gray-600">
                      <Building className="w-5 h-5 mr-2" />
                      <span>{profile.company}</span>
                    </div>
                  )}
                  
                  {profile.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>
                
                {profile.bio ? (
                  <div>
                    <h3 className="text-lg font-semibold text-dna-forest mb-2">About</h3>
                    <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                  </div>
                ) : (
                  <div className="bg-dna-mint p-4 rounded-lg">
                    <p className="text-dna-forest">Complete your profile to connect with other diaspora members and access all platform features!</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyProfile;
