
import { useState } from 'react';

export interface FormData {
  full_name: string;
  headline: string;
  email: string;
  bio: string;
  location: string;
  profession: string;
  company: string;
}

export interface ArrayStates {
  skills: string[];
  interests: string[];
}

export interface HelperStates {
  newSkill: string;
  newInterest: string;
  avatarUrl: string;
  bannerUrl: string;
}

export const useFormState = (profile: any, user: any) => {
  const [formData, setFormData] = useState<FormData>({
    full_name: profile?.full_name || '',
    headline: profile?.headline || '',
    email: profile?.email || user?.email || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    profession: profile?.profession || '',
    company: profile?.company || '',
  });

  const [arrayStates, setArrayStates] = useState<ArrayStates>({
    skills: profile?.skills || [],
    interests: profile?.interests || [],
  });

  const [helperStates, setHelperStates] = useState<HelperStates>({
    newSkill: '',
    newInterest: '',
    avatarUrl: profile?.avatar_url || '',
    bannerUrl: profile?.banner_image_url || '',
  });

  const handleInputChange = (field: string, value: string | boolean | string[] | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateArrayState = (field: keyof ArrayStates, value: string[]) => {
    setArrayStates(prev => ({ ...prev, [field]: value }));
  };

  const updateHelperState = (field: keyof HelperStates, value: string) => {
    setHelperStates(prev => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    arrayStates,
    helperStates,
    handleInputChange,
    updateArrayState,
    updateHelperState,
  };
};
