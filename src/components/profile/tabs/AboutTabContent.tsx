
import React from 'react';
import LinkedInAboutSection from '../LinkedInAboutSection';

interface AboutTabContentProps {
  profile: any;
  isOwnProfile: boolean;
  onEdit?: () => void;
}

const AboutTabContent: React.FC<AboutTabContentProps> = ({
  profile,
  isOwnProfile,
  onEdit
}) => {
  return (
    <LinkedInAboutSection 
      profile={profile} 
      isOwnProfile={isOwnProfile}
      onEdit={onEdit}
    />
  );
};

export default AboutTabContent;
