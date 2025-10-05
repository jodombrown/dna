import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingData {
  // Step 1: Diaspora Identity
  first_name: string;
  last_name: string;
  country_of_origin?: string;
  origin_country_code?: string;
  country_of_origin_id?: string | null;
  current_country?: string;
  current_country_code?: string;
  current_country_id?: string | null;
  current_city: string;
  languages: string[];
  years_in_diaspora: number | null;
  years_in_diaspora_text?: string;
  diaspora_story: string;
  
  // Step 2: Professional
  profession: string;
  industry_sectors: string[];
  years_of_experience: number | null;
  linkedin_url: string;
  website_url: string;
  selected_skills: string[]; // skill IDs
  
  // Step 3: Causes
  selected_causes: string[]; // cause IDs
  why_contribute?: string;
  
  // Step 4: Availability
  availability_hours_per_month: number;
  contribution_types: string[];
  location_preference: 'remote' | 'onsite' | 'hybrid';
}

export const useOnboarding = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    first_name: '',
    last_name: '',
    country_of_origin: '',
    origin_country_code: '',
    country_of_origin_id: null,
    current_country: '',
    current_country_code: '',
    current_country_id: null,
    current_city: '',
    languages: [],
    years_in_diaspora: null,
    years_in_diaspora_text: '',
    diaspora_story: '',
    profession: '',
    industry_sectors: [],
    years_of_experience: null,
    linkedin_url: '',
    website_url: '',
    selected_skills: [],
    selected_causes: [],
    availability_hours_per_month: 0,
    contribution_types: [],
    location_preference: 'remote',
  });

  // Load existing profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('*, profile_skills(skill_id), profile_causes(cause_id)')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profile) {
        setFormData({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          country_of_origin: profile.country_of_origin || '',
          origin_country_code: profile.origin_country_code || '',
          country_of_origin_id: profile.country_of_origin_id || null,
          current_country: profile.current_country || '',
          current_country_code: profile.current_country_code || '',
          current_country_id: profile.current_country_id || null,
          current_city: profile.current_city || '',
          languages: profile.languages || [],
          years_in_diaspora: profile.years_in_diaspora,
          years_in_diaspora_text: profile.years_in_diaspora_text || '',
          diaspora_story: profile.diaspora_story || '',
          profession: profile.profession || '',
          industry_sectors: profile.industry_sectors || [],
          years_of_experience: profile.years_of_experience,
          linkedin_url: profile.linkedin_url || '',
          website_url: profile.website_url || '',
          selected_skills: profile.profile_skills?.map((ps: any) => ps.skill_id) || [],
          selected_causes: profile.profile_causes?.map((pc: any) => pc.cause_id) || [],
          availability_hours_per_month: profile.availability_hours_per_month || 0,
          contribution_types: profile.contribution_types || [],
          location_preference: profile.location_preference || 'remote',
        });
      }
    };
    
    loadProfile();
  }, [user?.id]);

  // Auto-save on step completion
  const saveStepData = async (stepData: Partial<OnboardingData>) => {
    if (!user?.id) return;
    
    const updateData: any = { ...stepData };
    
    // Remove junction table fields from main update
    const { selected_skills, selected_causes, ...profileData } = updateData;
    
    // Update profile table
    const { error: profileError } = await (supabase as any)
      .from('profiles')
      .update(profileData)
      .eq('id', user.id);
    
    if (profileError) throw profileError;
    
    // Handle skills junction table
    if (selected_skills !== undefined) {
      // Delete existing
      await (supabase as any)
        .from('profile_skills')
        .delete()
        .eq('profile_id', user.id);
      
      // Insert new
      if (selected_skills.length > 0) {
        await (supabase as any)
          .from('profile_skills')
          .insert(selected_skills.map((skill_id: string) => ({
            profile_id: user.id,
            skill_id
          })));
      }
    }
    
    // Handle causes junction table
    if (selected_causes !== undefined) {
      await (supabase as any)
        .from('profile_causes')
        .delete()
        .eq('profile_id', user.id);
      
      if (selected_causes.length > 0) {
        await (supabase as any)
          .from('profile_causes')
          .insert(selected_causes.map((cause_id: string) => ({
            profile_id: user.id,
            cause_id
          })));
      }
    }
  };

  const completeOnboarding = async () => {
    if (!user?.id) return null;

    // Fetch current required fields
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('username, full_name, first_name, last_name, origin_country_code, current_country_code, current_city')
      .eq('id', user.id)
      .maybeSingle();

    // Consolidate with local form state as fallbacks
    const firstName = (profile?.first_name || formData.first_name || '').trim();
    const lastName = (profile?.last_name || formData.last_name || '').trim();
    const originCode = (profile?.origin_country_code || formData.origin_country_code || '').trim();
    const currentCode = (profile?.current_country_code || formData.current_country_code || '').trim();
    const currentCity = (profile?.current_city || formData.current_city || '').trim();

    const missing: string[] = [];
    if (!firstName) missing.push('first name');
    if (!lastName) missing.push('last name');
    if (!originCode || originCode.length !== 2) missing.push('country of origin');
    if (!currentCode || currentCode.length !== 2) missing.push('country of residence');
    if (!currentCity) missing.push('current city');

    if (missing.length) {
      throw new Error(`Please complete the following before finishing: ${missing.join(', ')}`);
    }

    // Prepare username if missing
    let finalUsername = profile?.username;
    const fullNameForUsername = (profile?.full_name && profile.full_name.trim().length > 0)
      ? profile.full_name
      : `${firstName} ${lastName}`.trim();

    const updates: any = {
      first_name: firstName,
      last_name: lastName,
      origin_country_code: originCode,
      current_country_code: currentCode,
      current_city: currentCity,
      onboarding_completed_at: new Date().toISOString(),
    };

    if (!finalUsername) {
      const { data: usernameData } = await (supabase as any)
        .rpc('generate_username', { _full_name: fullNameForUsername || 'user' });
      updates.username = usernameData;
      finalUsername = usernameData;
    }

    const { error } = await (supabase as any)
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    return finalUsername;
  };

  return {
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    saveStepData,
    completeOnboarding,
  };
};
