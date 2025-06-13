
import React, { useState, useEffect } from 'react';
import LinkedInStyleProfileHeader from './LinkedInStyleProfileHeader';
import LinkedInAboutSection from './LinkedInAboutSection';
import LinkedInExperienceSection from './LinkedInExperienceSection';
import LinkedInProjectsSection from './LinkedInProjectsSection';
import CulturalImpactSection from './CulturalImpactSection';
import MentorshipPreferences from './MentorshipPreferences';
import { useToast } from '@/hooks/use-toast';
import { useProfileConnectionHandlers } from './ProfileConnectionHandlers';
import { useProfileDataFetcher } from './ProfileDataFetcher';

interface EnhancedProfileDisplayProps {
  profile: any;
  isOwnProfile: boolean;
  onEdit?: () => void;
  onConnect?: () => void;
}

const EnhancedProfileDisplay: React.FC<EnhancedProfileDisplayProps> = ({ 
  profile, 
  isOwnProfile, 
  onEdit, 
  onConnect 
}) => {
  const [projects, setProjects] = useState([]);
  const [initiatives, setInitiatives] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { checkFollowingStatus, handleFollow } = useProfileConnectionHandlers(profile, isOwnProfile);
  const { fetchProjectsAndInitiatives } = useProfileDataFetcher(profile);

  useEffect(() => {
    if (profile?.id) {
      loadProfileData();
    }
  }, [profile?.id, isOwnProfile]);

  const loadProfileData = async () => {
    // Fetch projects and initiatives
    const { projects: projectsData, initiatives: initiativesData } = await fetchProjectsAndInitiatives();
    setProjects(projectsData);
    setInitiatives(initiativesData);

    // Check following status if not own profile
    if (!isOwnProfile) {
      const followingStatus = await checkFollowingStatus();
      setIsFollowing(followingStatus);
    }
  };

  const handleFollowClick = () => {
    handleFollow(isFollowing, setIsFollowing, setLoading);
  };

  const handleMessage = () => {
    // Navigate to messages - this would be handled by parent component
    if (onConnect) {
      onConnect();
    }
  };

  const handleAddProject = () => {
    // This would open a project creation modal
    toast({
      title: "Feature Coming Soon",
      description: "Project creation will be available soon!",
    });
  };

  return (
    <div className="space-y-6">
      {/* LinkedIn-style Profile Header */}
      <LinkedInStyleProfileHeader 
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEdit={onEdit}
        onFollow={handleFollowClick}
        onMessage={handleMessage}
        isFollowing={isFollowing}
      />

      {/* About Section */}
      <LinkedInAboutSection 
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEdit={onEdit}
      />

      {/* Experience Section */}
      <LinkedInExperienceSection 
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEdit={onEdit}
      />

      {/* Projects & Initiatives Section */}
      <LinkedInProjectsSection 
        profile={profile}
        projects={projects}
        initiatives={initiatives}
        isOwnProfile={isOwnProfile}
        onEdit={onEdit}
        onAddProject={handleAddProject}
      />

      {/* Cultural Impact Section */}
      <CulturalImpactSection profile={profile} />

      {/* Mentorship Section */}
      <MentorshipPreferences 
        profile={profile} 
        isOwnProfile={isOwnProfile}
        onConnect={onConnect}
        onMessage={handleMessage}
      />
    </div>
  );
};

export default EnhancedProfileDisplay;
