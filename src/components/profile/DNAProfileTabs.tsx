
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Briefcase, 
  FolderOpen, 
  Calendar, 
  Clock
} from 'lucide-react';
import AboutTabContent from './tabs/AboutTabContent';
import ExperienceTabContent from './tabs/ExperienceTabContent';
import ProjectsTabContent from './tabs/ProjectsTabContent';
import ContributionsTabContent from './tabs/ContributionsTabContent';
import ActivityTabContent from './tabs/ActivityTabContent';

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
  const handleAddProject = () => {
    // TODO: Implement add project functionality
    console.log('Add project functionality coming soon');
  };

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
          <AboutTabContent 
            profile={profile} 
            isOwnProfile={isOwnProfile}
            onEdit={onEdit}
          />
        </TabsContent>

        <TabsContent value="experience">
          <ExperienceTabContent 
            profile={profile} 
            isOwnProfile={isOwnProfile}
            onEdit={onEdit}
          />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectsTabContent 
            profile={profile} 
            isOwnProfile={isOwnProfile}
            onEdit={onEdit}
            onAddProject={handleAddProject}
          />
        </TabsContent>

        <TabsContent value="contributions">
          <ContributionsTabContent 
            userId={profile?.id}
            isOwnProfile={isOwnProfile}
          />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityTabContent 
            userPosts={userPosts}
            userEvents={userEvents}
            userCommunities={userCommunities}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default DNAProfileTabs;
