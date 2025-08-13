import { supabase } from '@/integrations/supabase/client';
import { isValidUsername, isUsernameAvailable, normalizeUsername } from '@/utils/username';

export interface ValidationError {
  field: string;
  message: string;
}

export interface OnboardingFormData {
  full_name?: string; // composed later from first/last
  first_name?: string;
  last_name?: string;
  username: string;
  country_of_origin: string;
  current_country_code?: string;
  current_country?: string;
  skills: string[];
  sectors: string[];
  contribution_style: string;
  linkedin_url?: string;
  twitter_url?: string;
  website_url?: string;
  avatar_url?: string;
  agrees_to_values: boolean;
}

export const validateStep = async (step: number, data: OnboardingFormData): Promise<ValidationError[]> => {
  const errors: ValidationError[] = [];

  switch (step) {
    case 0: // Identity Step
      await validateIdentityStep(data, errors);
      break;
    case 1: // Skills & Contribution Step
      validateSkillsStep(data, errors);
      break;
    case 2: // Links & Identity Step
      validateLinksStep(data, errors);
      break;
    case 3: // Community Agreement Step
      validateAgreementStep(data, errors);
      break;
  }

  return errors;
};

const validateIdentityStep = async (data: OnboardingFormData, errors: ValidationError[]) => {
  // First and last name validation
  if (!data.first_name?.trim()) {
    errors.push({ field: 'first_name', message: 'First name is required' });
  }
  if (!data.last_name?.trim()) {
    errors.push({ field: 'last_name', message: 'Last name is required' });
  }

  // Username validation
  if (!data.username?.trim()) {
    errors.push({ field: 'username', message: 'Username is required' });
  } else {
    const uname = normalizeUsername(data.username);
    if (!isValidUsername(uname)) {
      errors.push({ 
        field: 'username', 
        message: '3–30 chars; lowercase letters, numbers, . _ -' 
      });
    } else {
      const isAvailable = await isUsernameAvailable(uname);
      if (!isAvailable) {
        errors.push({ field: 'username', message: 'This username is already taken' });
      }
    }
  }

  // Country of origin validation
  if (!data.country_of_origin?.trim()) {
    errors.push({ field: 'country_of_origin', message: 'Country of origin is required' });
  }

  // Current country code (selection-only) validation
  if (!data.current_country_code?.trim()) {
    errors.push({ field: 'current_country_code', message: 'Current country is required' });
  }
};

const validateSkillsStep = (data: OnboardingFormData, errors: ValidationError[]) => {
  if (!data.skills || data.skills.length === 0) {
    errors.push({ field: 'skills', message: 'Please select at least one skill' });
  }

  if (!data.sectors || data.sectors.length === 0) {
    errors.push({ field: 'sectors', message: 'Please select at least one sector' });
  }

  if (!data.contribution_style?.trim()) {
    errors.push({ field: 'contribution_style', message: 'Please select your contribution style' });
  }
};

const validateLinksStep = (data: OnboardingFormData, errors: ValidationError[]) => {
  // LinkedIn URL validation (optional but must be valid if provided)
  if (data.linkedin_url && !isValidLinkedInUrl(data.linkedin_url)) {
    errors.push({ 
      field: 'linkedin_url', 
      message: 'Please enter a valid LinkedIn profile URL' 
    });
  }

  // Twitter URL validation (optional but must be valid if provided)
  if (data.twitter_url && !isValidTwitterUrl(data.twitter_url)) {
    errors.push({ 
      field: 'twitter_url', 
      message: 'Please enter a valid Twitter profile URL' 
    });
  }

  // Website URL validation (optional but must be valid if provided)
  if (data.website_url && !isValidUrl(data.website_url)) {
    errors.push({ 
      field: 'website_url', 
      message: 'Please enter a valid website URL' 
    });
  }
};

const validateAgreementStep = (data: OnboardingFormData, errors: ValidationError[]) => {
  if (!data.agrees_to_values) {
    errors.push({ 
      field: 'agrees_to_values', 
      message: 'You must agree to the community values and terms to continue' 
    });
  }
};


const isValidLinkedInUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return (
      (urlObj.hostname === 'linkedin.com' || urlObj.hostname === 'www.linkedin.com') &&
      urlObj.pathname.startsWith('/in/') &&
      urlObj.pathname.length > 4
    );
  } catch {
    return false;
  }
};

const isValidTwitterUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return (
      (urlObj.hostname === 'twitter.com' || urlObj.hostname === 'www.twitter.com' ||
       urlObj.hostname === 'x.com' || urlObj.hostname === 'www.x.com') &&
      urlObj.pathname.startsWith('/') &&
      urlObj.pathname.length > 1
    );
  } catch {
    return false;
  }
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};