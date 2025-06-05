
export const sanitizeText = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .substring(0, 1000); // Limit length to prevent abuse
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const isValidUrl = (url: string): boolean => {
  if (!url) return true; // Optional field
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol) && url.length <= 2048;
  } catch {
    return false;
  }
};

export const isValidLinkedInUrl = (url: string): boolean => {
  if (!url) return true; // Optional field
  const linkedinPattern = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
  return linkedinPattern.test(url) && url.length <= 200;
};

export const isRateLimited = (lastAction: number, cooldownMs: number): boolean => {
  return Date.now() - lastAction < cooldownMs;
};

export const validateProfileForm = (formData: any, userId?: string) => {
  const errors: any = {};
  
  if (!formData.full_name?.trim()) {
    errors.full_name = 'Full name is required';
  } else if (formData.full_name.length > 100) {
    errors.full_name = 'Full name must be less than 100 characters';
  }
  
  if (formData.profession && formData.profession.length > 100) {
    errors.profession = 'Profession must be less than 100 characters';
  }
  
  if (formData.company && formData.company.length > 100) {
    errors.company = 'Company name must be less than 100 characters';
  }
  
  if (formData.location && formData.location.length > 100) {
    errors.location = 'Location must be less than 100 characters';
  }
  
  if (formData.bio && formData.bio.length > 2000) {
    errors.bio = 'Bio must be less than 2000 characters';
  }
  
  if (formData.linkedin_url && !isValidLinkedInUrl(formData.linkedin_url)) {
    errors.linkedin_url = 'Please enter a valid LinkedIn profile URL';
  }
  
  if (formData.website_url && !isValidUrl(formData.website_url)) {
    errors.website_url = 'Please enter a valid website URL';
  }
  
  return errors;
};

export const logSecurityEvent = (event: string, userId?: string, details?: any) => {
  console.log(`Security Event: ${event}`, {
    userId,
    timestamp: new Date().toISOString(),
    details,
  });
};
