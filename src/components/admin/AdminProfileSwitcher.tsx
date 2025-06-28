
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Crown, 
  User, 
  RefreshCw,
  LogOut,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const AdminProfileSwitcher = () => {
  const [testProfiles, setTestProfiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchTestProfiles();
    fetchCurrentProfile();
  }, [user]);

  const fetchTestProfiles = async () => {
    try {
      // Get profiles from professionals table (our seeded data)
      const { data: professionals } = await supabase
        .from('professionals')
        .select('*')
        .limit(20);

      setTestProfiles(professionals || []);
    } catch (error) {
      console.error('Error fetching test profiles:', error);
    }
  };

  const fetchCurrentProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setCurrentProfile(profile);
    } catch (error) {
      console.error('Error fetching current profile:', error);
    }
  };

  const switchToTestProfile = async (professional) => {
    setLoading(true);
    try {
      // Create or update a profile based on the professional data
      const profileData = {
        id: user.id,
        full_name: professional.full_name,
        profession: professional.profession,
        company: professional.company,
        location: professional.location,
        country_of_origin: professional.country_of_origin,
        bio: professional.bio,
        years_experience: professional.years_experience,
        education: professional.education,
        linkedin_url: professional.linkedin_url,
        skills: professional.expertise,
        availability_for_mentoring: professional.is_mentor,
        looking_for_opportunities: professional.looking_for_opportunities,
        languages: professional.languages ? professional.languages.join(', ') : null,
        available_for: professional.availability_for,
        avatar_url: professional.avatar_url,
        // Add a flag to indicate this is a test profile
        professional_role: `${professional.profession} (Test Profile)`
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) throw error;

      await fetchCurrentProfile();
      
      toast({
        title: "Profile Switched!",
        description: `Now testing as ${professional.full_name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to switch profile: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetToRealProfile = async () => {
    setLoading(true);
    try {
      // Reset to basic profile info
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: user?.user_metadata?.full_name || user?.email,
          profession: null,
          company: null,
          location: null,
          country_of_origin: null,
          bio: null,
          years_experience: null,
          education: null,
          linkedin_url: null,
          skills: null,
          availability_for_mentoring: false,
          looking_for_opportunities: false,
          languages: null,
          available_for: null,
          avatar_url: null,
          professional_role: null
        })
        .eq('id', user.id);

      if (error) throw error;

      await fetchCurrentProfile();
      
      toast({
        title: "Profile Reset!",
        description: "Back to your real profile",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to reset profile: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Crown className="w-8 h-8 text-dna-gold" />
            Admin Profile Switcher
          </h1>
          <p className="text-gray-600 mt-2">Switch between test profiles to experience the platform from different perspectives</p>
        </div>
        <Button onClick={fetchTestProfiles} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Profiles
        </Button>
      </div>

      {/* Current Profile */}
      <Card className="border-dna-emerald border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-dna-emerald" />
            Current Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentProfile ? (
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={currentProfile.avatar_url} alt={currentProfile.full_name} />
                <AvatarFallback className="bg-dna-mint text-dna-forest text-lg">
                  {currentProfile.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{currentProfile.full_name || 'No Name Set'}</h3>
                <p className="text-gray-600">{currentProfile.professional_role || currentProfile.profession || 'No profession set'}</p>
                <p className="text-sm text-gray-500">{currentProfile.location || 'No location set'}</p>
                {currentProfile.professional_role?.includes('Test Profile') && (
                  <Badge className="mt-2 bg-dna-gold text-dna-forest">Test Profile Active</Badge>
                )}
              </div>
              <Button 
                onClick={resetToRealProfile} 
                disabled={loading}
                variant="outline"
                className="text-dna-forest border-dna-forest hover:bg-dna-forest hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Reset to Real Profile
              </Button>
            </div>
          ) : (
            <p className="text-gray-500">No profile data available</p>
          )}
        </CardContent>
      </Card>

      {/* Test Profiles Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-dna-copper" />
            Available Test Profiles ({testProfiles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testProfiles.map((professional) => (
              <Card key={professional.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={professional.avatar_url} alt={professional.full_name} />
                      <AvatarFallback className="bg-dna-mint text-dna-forest">
                        {professional.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{professional.full_name}</h4>
                      <p className="text-xs text-gray-600 truncate">{professional.profession}</p>
                      <p className="text-xs text-gray-500 truncate">{professional.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {professional.is_mentor && (
                      <Badge variant="secondary" className="text-xs bg-dna-emerald/10 text-dna-emerald">
                        Mentor
                      </Badge>
                    )}
                    {professional.is_investor && (
                      <Badge variant="secondary" className="text-xs bg-dna-copper/10 text-dna-copper">
                        Investor
                      </Badge>
                    )}
                    {professional.looking_for_opportunities && (
                      <Badge variant="secondary" className="text-xs bg-dna-gold/10 text-dna-gold">
                        Seeking Opportunities
                      </Badge>
                    )}
                  </div>

                  <Button 
                    onClick={() => switchToTestProfile(professional)}
                    disabled={loading}
                    className="w-full bg-dna-copper hover:bg-dna-gold text-white text-xs"
                    size="sm"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Switch to This Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfileSwitcher;
