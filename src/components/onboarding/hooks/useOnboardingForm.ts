import { useState } from 'react';

export interface OnboardingFormData {
  // Step 1: Identity
  first_name: string;
  last_name: string;
  avatar_url: string;
  current_country: string;
  headline: string;

  // Step 2: Professional
  profession: string;
  professional_role: string;
  professional_sectors: string[];
  skills: string[];
  years_experience: string;

  // Step 3: Diaspora & Impact
  country_of_origin: string;
  diaspora_origin: string;
  interests: string[];
  my_dna_statement: string;

  // Step 4: Discovery (Optional)
  focus_areas: string[];
  regional_expertise: string[];
  industries: string[];
  engagement_intentions: string[];
}

export const useOnboardingForm = (initialData?: Partial<OnboardingFormData>) => {
  const [formData, setFormData] = useState<OnboardingFormData>({
    // Step 1
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    avatar_url: initialData?.avatar_url || '',
    current_country: initialData?.current_country || '',
    headline: initialData?.headline || '',

    // Step 2
    profession: initialData?.profession || '',
    professional_role: initialData?.professional_role || '',
    professional_sectors: initialData?.professional_sectors || [],
    skills: initialData?.skills || [],
    years_experience: initialData?.years_experience || '',

    // Step 3
    country_of_origin: initialData?.country_of_origin || '',
    diaspora_origin: initialData?.diaspora_origin || '',
    interests: initialData?.interests || [],
    my_dna_statement: initialData?.my_dna_statement || '',

    // Step 4
    focus_areas: initialData?.focus_areas || [],
    regional_expertise: initialData?.regional_expertise || [],
    industries: initialData?.industries || [],
    engagement_intentions: initialData?.engagement_intentions || [],
  });

  const updateField = (field: keyof OnboardingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateMultipleFields = (updates: Partial<OnboardingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return {
    formData,
    updateField,
    updateMultipleFields,
  };
};
