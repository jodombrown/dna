export interface ValidationError {
  field: string;
  message: string;
}

export const validateUserTypeStep = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.user_type) {
    errors.push({ field: 'user_type', message: 'Please select whether you are joining as an individual or organization' });
  }

  // If organization, require organization details
  if (data.user_type === 'organization') {
    if (!data.organization_name?.trim()) {
      errors.push({ field: 'organization_name', message: 'Organization name is required' });
    }
    if (!data.organization_category?.trim()) {
      errors.push({ field: 'organization_category', message: 'Organization category is required' });
    }
  }

  return errors;
};

export const validateIdentityStep = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.first_name?.trim()) {
    errors.push({ field: 'first_name', message: 'First name is required' });
  } else if (data.first_name.trim().length < 2) {
    errors.push({ field: 'first_name', message: 'First name must be at least 2 characters' });
  }

  if (!data.last_name?.trim()) {
    errors.push({ field: 'last_name', message: 'Last name is required' });
  } else if (data.last_name.trim().length < 2) {
    errors.push({ field: 'last_name', message: 'Last name must be at least 2 characters' });
  }

  if (!data.avatar_url?.trim()) {
    errors.push({ field: 'avatar_url', message: 'Profile photo is required' });
  }

  if (!data.current_country?.trim()) {
    errors.push({ field: 'current_country', message: 'Current country is required' });
  }

  // Professional headline is optional but validate length if provided
  if (data.headline?.trim() && data.headline.trim().length > 200) {
    errors.push({ field: 'headline', message: 'Headline must be less than 200 characters' });
  }

  return errors;
};

export const validateProfessionalStep = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.profession?.trim()) {
    errors.push({ field: 'profession', message: 'Profession or role is required' });
  }

  if (!data.professional_sectors || data.professional_sectors.length < 2) {
    errors.push({ 
      field: 'professional_sectors', 
      message: 'Please select at least 2 professional sectors' 
    });
  }

  if (!data.skills || data.skills.length < 3) {
    errors.push({ 
      field: 'skills', 
      message: 'Please select at least 3 skills' 
    });
  }

  if (!data.years_experience) {
    errors.push({ field: 'years_experience', message: 'Years of experience is required' });
  }

  return errors;
};

export const validateDiasporaImpactStep = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.country_of_origin?.trim()) {
    errors.push({ field: 'country_of_origin', message: 'Country of origin is required' });
  }

  if (!data.interests || data.interests.length < 2) {
    errors.push({ 
      field: 'interests', 
      message: 'Please select at least 2 areas of interest' 
    });
  }

  if (!data.my_dna_statement?.trim()) {
    errors.push({ field: 'my_dna_statement', message: 'DNA statement is required' });
  } else if (data.my_dna_statement.trim().length < 50) {
    errors.push({ 
      field: 'my_dna_statement', 
      message: 'DNA statement must be at least 50 characters' 
    });
  }

  return errors;
};

// Discovery step has no required fields - all optional
export const validateDiscoveryStep = (data: any): ValidationError[] => {
  return []; // No validation needed - all fields optional
};

export const validateStep = (step: number, data: any): ValidationError[] => {
  switch (step) {
    case 0:
      return validateUserTypeStep(data);
    case 1:
      return validateIdentityStep(data);
    case 2:
      return validateProfessionalStep(data);
    case 3:
      return validateDiasporaImpactStep(data);
    case 4:
      return validateDiscoveryStep(data);
    default:
      return [];
  }
};
