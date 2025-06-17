
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Activity, 
  Calendar,
  Users,
  Plus
} from 'lucide-react';
import SocialFeed from '../feed/SocialFeed';
import LinkedInAboutSection from './LinkedInAboutSection';
import LinkedInExperienceSection from './LinkedInExperienceSection';

interface DNAProfileTabsProps {
  profile: any;
  isOwnProfile: boolean;
  userPosts: any[];
  userEvents: any[];
  userCommunities: any[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onEdit?: () => void;
}

const DNAProfileTabs: React.FC<DNAProfileTabsProps> = ({
  profile,
  isOwnProfile,
  userPosts,
  userEvents,
  userCommunities,
  activeTab,
  setActiveTab,
  onEdit
}) => {
  return (
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
  );
};

export default DNAProfileTabs;
