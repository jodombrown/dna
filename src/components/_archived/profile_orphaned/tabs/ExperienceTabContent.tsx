
import React from 'react';
import LinkedInExperienceSection from '../LinkedInExperienceSection';

interface ExperienceTabContentProps {
  profile: any;
  isOwnProfile: boolean;
  onEdit?: () => void;
}

const ExperienceTabContent: React.FC<ExperienceTabContentProps> = ({
  profile,
  isOwnProfile,
  onEdit
}) => {
  return (
    <LinkedInExperienceSection 
      profile={profile} 
      isOwnProfile={isOwnProfile}
      onEdit={onEdit}
    />
  );
};

export default ExperienceTabContent;
