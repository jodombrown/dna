
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Building, ExternalLink, Mail, Users, Award, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';

const ProfileConnect = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connectionRequested, setConnectionRequested] = useState(false);

  useEffect(() => {
    // Since profiles table is removed, show placeholder
    setProfile({
      id: id,
      full_name: 'Sample Profile',
      profession: 'Professional',
      company: 'Sample Company',
      location: 'Sample Location',
      bio: 'This is a placeholder profile.'
    });
    setLoading(false);
  }, [id]);

  const handleConnect = () => {
    setConnectionRequested(true);
    console.log('Connection request sent to:', profile?.full_name);
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
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
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

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
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
                    <p className="text-sm text-gray-600">• Innovation</p>
                    <p className="text-sm text-gray-600">• Development</p>
                    <p className="text-sm text-gray-600">• Mentorship</p>
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
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Professional experience details will be displayed here.
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
                <div className="text-center py-8 text-gray-500">
                  Connection statistics will be displayed here.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Activity feed will be displayed here.
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
