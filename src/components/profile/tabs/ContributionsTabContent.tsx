
import React from 'react';
import ContributionsSection from '../ContributionsSection';

interface ContributionsTabContentProps {
  userId?: string;
  isOwnProfile: boolean;
}

const ContributionsTabContent: React.FC<ContributionsTabContentProps> = ({
  userId,
  isOwnProfile
}) => {
  return (
    <ContributionsSection 
      userId={userId}
      isOwnProfile={isOwnProfile}
    />
  );
};

export default ContributionsTabContent;
