
import React from 'react';
import LinkedInProjectsSection from '../LinkedInProjectsSection';

interface ProjectsTabContentProps {
  profile: any;
  isOwnProfile: boolean;
  onEdit?: () => void;
  onAddProject?: () => void;
}

const ProjectsTabContent: React.FC<ProjectsTabContentProps> = ({
  profile,
  isOwnProfile,
  onEdit,
  onAddProject
}) => {
  return (
    <LinkedInProjectsSection 
      profile={profile} 
      isOwnProfile={isOwnProfile}
      onEdit={onEdit}
      onAddProject={onAddProject}
    />
  );
};

export default ProjectsTabContent;
