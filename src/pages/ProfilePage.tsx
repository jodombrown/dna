import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserProfileView from '@/components/profile/UserProfileView';
import PublicProfileView from '@/components/profile/PublicProfileView';
import ProfileHeroSection from '@/components/profile/ProfileHeroSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Globe, MapPin, Users } from 'lucide-react';
import { useProfileContent } from '@/hooks/useProfileContent';

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();

  // Fetch user profile by username
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      if (!username) throw new Error('Username required');
      
      // First check users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      // Fallback to profiles table if no user found
      if (!userData) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('full_name', username.replace('-', ' '))
          .single();
        
        if (profileError) throw profileError;
        return profileData;
      }

      return userData;
    },
    enabled: !!username
  });

  const { userPosts, userEvents, userCommunities } = useProfileContent(profile?.id);

  const isOwnProfile = user?.id === profile?.id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-dna-emerald" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
              <p className="text-gray-600">The profile you're looking for doesn't exist or isn't public.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const handleEdit = () => {
    window.location.href = '/settings/profile';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <ProfileHeroSection 
          profile={profile} 
          isOwnProfile={isOwnProfile}
          onEdit={isOwnProfile ? handleEdit : undefined}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            {profile.bio && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Recent Posts */}
            {userPosts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Recent Posts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userPosts.slice(0, 5).map((post: any) => (
                    <div key={post.id} className="border-l-4 border-dna-emerald pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {post.pillar}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-800 line-clamp-3">{post.content}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Communities */}
            {userCommunities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Communities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userCommunities.map((community: any) => (
                      <div key={community.id} className="p-4 border rounded-lg hover:bg-gray-50">
                        <h4 className="font-medium text-gray-900">{community.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{community.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Identity Tags */}
            {((profile as any).diaspora_tags || (profile as any).causes || (profile as any).interests) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Identity & Causes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(profile as any).diaspora_tags && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Diaspora Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {(profile as any).diaspora_tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="bg-dna-mint text-dna-forest">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {((profile as any).causes || (profile as any).interests) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Interests & Causes</h4>
                      <div className="flex flex-wrap gap-2">
                        {((profile as any).causes || (profile as any).interests || []).map((cause: string) => (
                          <Badge key={cause} variant="secondary" className="bg-dna-emerald/10 text-dna-emerald">
                            {cause}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Location Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{profile.location}</span>
                  </div>
                )}
                
                {((profile as any).origin_country || (profile as any).country_of_origin) && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">From {(profile as any).origin_country || (profile as any).country_of_origin}</span>
                  </div>
                )}

                {(profile as any).languages && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{(profile as any).languages.join(', ')}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Posts</span>
                  <span className="font-medium">{userPosts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Communities</span>
                  <span className="font-medium">{userCommunities.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Events</span>
                  <span className="font-medium">{userEvents.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;