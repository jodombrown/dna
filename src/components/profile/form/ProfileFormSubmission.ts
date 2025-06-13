
import { supabase } from '@/integrations/supabase/client';
import { FormData, ArrayStates } from './FormDataTypes';

export const handleProfileSubmission = async (
  userId: string,
  formData: FormData,
  arrayStates: ArrayStates,
  avatarUrl: string,
  bannerUrl: string
) => {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      ...formData,
      avatar_url: avatarUrl,
      banner_image_url: bannerUrl,
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
    });

  if (error) throw error;
};
