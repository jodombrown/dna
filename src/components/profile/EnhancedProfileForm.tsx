
import React from 'react';
import ProfileFormContainer from './form/ProfileFormContainer';

interface EnhancedProfileFormProps {
  profile?: any;
  onSave?: () => void;
}

const EnhancedProfileForm: React.FC<EnhancedProfileFormProps> = ({ profile, onSave }) => {
  return <ProfileFormContainer profile={profile} onSave={onSave} />;
};

export default EnhancedProfileForm;
