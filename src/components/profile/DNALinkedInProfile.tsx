
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import LinkedInStyleProfileHeader from './LinkedInStyleProfileHeader';
import LinkedInAboutSection from './LinkedInAboutSection';
import LinkedInExperienceSection from './LinkedInExperienceSection';
import LinkedInProjectsSection from './LinkedInProjectsSection';
import SocialFeed from '../feed/SocialFeed';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Activity, 
  Calendar,
  Users,
  Plus,
  TrendingUp
} from 'lucide-react';

interface DNALinkedInProfileProps {
  profile: any;
  isOwnProfile: boolean;
  onEdit?: () => void;
  onFollow?: () => void;
  onMessage?: () => void;
}

const DNALinkedInProfile: React.FC<DNALinkedInProfileProps> = ({
  profile,
  isOwnProfile,
  onEdit,
  onFollow,
  onMessage
}) => {
  const { user } = useAuth();
  const [userPosts, setUserPosts] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    if (profile?.id) {
      fetchUserContent();
    }
  }, [profile?.id]);

  const fetchUserContent = async () => {
    try {
      // Fetch user's posts - use fallback approach since posts table exists but isn't in types
      try {
        const { data: posts } = await supabase
          .from('posts' as any)
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5);
        setUserPosts(posts || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setUserPosts([]);
      }

      // Fetch user's events
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', profile.id)
        .limit(5);

      // Fetch user's communities
      const { data: communities } = await supabase
        .from('communities')
        .select('*')
        .eq('created_by', profile.id)
        .limit(5);

      setUserEvents(events || []);
      setUserCommunities(communities || []);
    } catch (error) {
      console.error('Error fetching user content:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Header */}
      <LinkedInStyleProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEdit={onEdit}
        onFollow={onFollow}
        onMessage={onMessage}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-dna-forest">DNA Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Profile Views</span>
                <span className="font-semibold text-dna-emerald">42</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Network Size</span>
                <span className="font-semibold text-dna-emerald">{profile?.followers_count || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Posts Created</span>
                <span className="font-semibold text-dna-emerald">{userPosts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Events Hosted</span>
                <span className="font-semibold text-dna-emerald">{userEvents.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          {!isOwnProfile && userPosts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-dna-forest flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userPosts.slice(0, 3).map((post: any) => (
                    <div key={post.id} className="text-sm">
                      <p className="text-gray-800 line-clamp-2">{post.content}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Posts
              </TabsTrigger>
              <TabsTrigger value="about" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                About
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="communities" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Communities
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-6">
              {isOwnProfile ? (
                <SocialFeed />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-dna-forest">
                      {profile?.full_name}'s Posts
                    </h3>
                  </div>
                  {userPosts.length > 0 ? (
                    <div className="space-y-4">
                      {userPosts.map((post: any) => (
                        <Card key={post.id}>
                          <CardContent className="p-4">
                            <p className="text-gray-800">{post.content}</p>
                            <div className="mt-2 text-sm text-gray-500">
                              {new Date(post.created_at).toLocaleDateString()}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      No posts yet
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="about" className="space-y-6">
              <LinkedInAboutSection 
                profile={profile} 
                isOwnProfile={isOwnProfile}
                onEdit={onEdit}
              />
              <LinkedInExperienceSection 
                profile={profile} 
                isOwnProfile={isOwnProfile}
                onEdit={onEdit}
              />
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-dna-forest">Events</h3>
                {isOwnProfile && (
                  <Button className="bg-dna-emerald hover:bg-dna-forest text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                )}
              </div>
              
              {userEvents.length > 0 ? (
                <div className="grid gap-4">
                  {userEvents.map((event: any) => (
                    <Card key={event.id}>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-dna-forest">{event.title}</h4>
                        <p className="text-gray-600 mt-1">{event.description}</p>
                        <div className="mt-2 text-sm text-gray-500">
                          {event.date_time && new Date(event.date_time).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {isOwnProfile ? 'Create your first event' : 'No events yet'}
                </div>
              )}
            </TabsContent>

            <TabsContent value="communities" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-dna-forest">Communities</h3>
                {isOwnProfile && (
                  <Button className="bg-dna-emerald hover:bg-dna-forest text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Community
                  </Button>
                )}
              </div>
              
              {userCommunities.length > 0 ? (
                <div className="grid gap-4">
                  {userCommunities.map((community: any) => (
                    <Card key={community.id}>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-dna-forest">{community.name}</h4>
                        <p className="text-gray-600 mt-1">{community.description}</p>
                        <div className="mt-2 text-sm text-gray-500">
                          {community.member_count} members
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {isOwnProfile ? 'Create your first community' : 'No communities yet'}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DNALinkedInProfile;
