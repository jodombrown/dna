
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Building, ExternalLink, Mail, Phone, Calendar, Users, Award, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import UnifiedHeader from '@/components/UnifiedHeader';

const ProfileConnect = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connectionRequested, setConnectionRequested] = useState(false);

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

  const handleConnect = () => {
    setConnectionRequested(true);
    // Here you would implement the actual connection logic
    console.log('Connection request sent to:', profile?.full_name);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedHeader />
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
        <UnifiedHeader />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Profile not found.</p>
            <Button onClick={() => navigate('/members')} className="mt-4">
              Back to Members
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex flex-col items-center lg:items-start">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                  <AvatarFallback className="bg-dna-copper text-white text-2xl">
                    {profile.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col gap-3 items-center lg:items-start">
                  {connectionRequested ? (
                    <Badge className="bg-dna-emerald text-white">
                      Connection Requested
                    </Badge>
                  ) : (
                    <Button 
                      onClick={handleConnect}
                      className="bg-dna-copper hover:bg-dna-gold text-white"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  )}
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    {profile.linkedin_url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(profile.linkedin_url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile.full_name || 'Anonymous User'}
                </h1>
                
                {profile.profession && (
                  <p className="text-xl text-dna-emerald font-medium mb-4">
                    {profile.profession}
                  </p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                
                {profile.bio && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                    <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-dna-copper" />
                    Skills & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Technology</Badge>
                    <Badge variant="secondary">Leadership</Badge>
                    <Badge variant="secondary">Strategy</Badge>
                    <Badge variant="secondary">Innovation</Badge>
                    <Badge variant="secondary">Africa Development</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-dna-emerald" />
                    Professional Interests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">• Fintech Innovation</p>
                    <p className="text-sm text-gray-600">• African Market Expansion</p>
                    <p className="text-sm text-gray-600">• Mentorship & Education</p>
                    <p className="text-sm text-gray-600">• Sustainable Development</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="experience">
            <Card>
              <CardHeader>
                <CardTitle>Professional Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-l-2 border-dna-copper pl-4">
                  <h4 className="font-semibold text-gray-900">Senior Technology Lead</h4>
                  <p className="text-dna-emerald">Tech Innovations Inc.</p>
                  <p className="text-sm text-gray-500">2020 - Present</p>
                  <p className="text-gray-700 mt-2">
                    Leading digital transformation initiatives across African markets.
                  </p>
                </div>
                <div className="border-l-2 border-dna-emerald pl-4">
                  <h4 className="font-semibold text-gray-900">Product Manager</h4>
                  <p className="text-dna-emerald">Global Solutions Ltd.</p>
                  <p className="text-sm text-gray-500">2018 - 2020</p>
                  <p className="text-gray-700 mt-2">
                    Managed product development for emerging markets.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="connections">
            <Card>
              <CardHeader>
                <CardTitle>Network Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-dna-copper">247</p>
                    <p className="text-sm text-gray-600">Connections</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-dna-emerald">15</p>
                    <p className="text-sm text-gray-600">Mutual Connections</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-dna-gold">8</p>
                    <p className="text-sm text-gray-600">Endorsements</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-dna-copper mt-0.5" />
                  <div>
                    <p className="text-sm">Attended <strong>African Tech Summit 2024</strong></p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-dna-emerald mt-0.5" />
                  <div>
                    <p className="text-sm">Connected with <strong>3 new professionals</strong></p>
                    <p className="text-xs text-gray-500">1 week ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfileConnect;
