
import { supabase } from '@/integrations/supabase/client';
import { FormData, ArrayStates } from './FormDataTypes';

export const handleProfileSubmission = async (
  userId: string,
  formData: FormData,
  arrayStates: ArrayStates,
  avatarUrl: string,
  bannerUrl: string
) => {
  // Convert string numbers to actual numbers for database compatibility
  const processedData = {
    ...formData,
    years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
    years_in_diaspora: formData.years_in_diaspora ? parseInt(formData.years_in_diaspora) : null,
  };

  const { error } = await (supabase as any)
    .from('profiles')
    .upsert({
      id: userId,
      ...processedData,
      avatar_url: avatarUrl,
      banner_url: bannerUrl,
      skills: arrayStates.skills,
      interests: arrayStates.interests,
      impact_areas: arrayStates.impactAreas,
      engagement_intentions: arrayStates.engagementIntentions,
      skills_offered: arrayStates.skillsOffered,
      skills_needed: arrayStates.skillsNeeded,
      available_for: arrayStates.availableFor,
      professional_sectors: arrayStates.professionalSectors,
      diaspora_networks: arrayStates.diasporaNetworks,
      mentorship_areas: arrayStates.mentorshipAreas,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

  if (error) throw error;
};
