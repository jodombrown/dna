
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Briefcase, 
  FolderOpen, 
  Calendar, 
  Users, 
  Edit,
  Clock
} from 'lucide-react';
import LinkedInAboutSection from './LinkedInAboutSection';
import LinkedInExperienceSection from './LinkedInExperienceSection';
import LinkedInProjectsSection from './LinkedInProjectsSection';
import ContributionsSection from './ContributionsSection';

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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="about" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          About
        </TabsTrigger>
        <TabsTrigger value="experience" className="flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          Experience
        </TabsTrigger>
        <TabsTrigger value="projects" className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          Projects
        </TabsTrigger>
        <TabsTrigger value="contributions" className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Contributions
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Activity
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="about">
          <LinkedInAboutSection 
            profile={profile} 
            isOwnProfile={isOwnProfile}
            onEdit={onEdit}
          />
        </TabsContent>

        <TabsContent value="experience">
          <LinkedInExperienceSection 
            profile={profile} 
            isOwnProfile={isOwnProfile}
            onEdit={onEdit}
          />
        </TabsContent>

        <TabsContent value="projects">
          <LinkedInProjectsSection 
            profile={profile} 
            isOwnProfile={isOwnProfile}
            onEdit={onEdit}
          />
        </TabsContent>

        <TabsContent value="contributions">
          <ContributionsSection 
            userId={profile?.id}
            isOwnProfile={isOwnProfile}
          />
        </TabsContent>

        <TabsContent value="activity">
          <div className="space-y-6">
            {/* Recent Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-dna-emerald" />
                  Recent Posts ({userPosts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userPosts.length > 0 ? (
                  <div className="space-y-4">
                    {userPosts.slice(0, 3).map((post: any) => (
                      <div key={post.id} className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium">{post.content?.substring(0, 100)}...</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No posts yet</p>
                )}
              </CardContent>
            </Card>

            {/* Communities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-dna-copper" />
                  Communities ({userCommunities.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userCommunities.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userCommunities.map((community: any) => (
                      <Badge key={community.id} variant="secondary">
                        {community.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No communities joined yet</p>
                )}
              </CardContent>
            </Card>

            {/* Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-dna-gold" />
                  Events ({userEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userEvents.length > 0 ? (
                  <div className="space-y-3">
                    {userEvents.slice(0, 3).map((event: any) => (
                      <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-gray-500">{event.date_time}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No events yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default DNAProfileTabs;
