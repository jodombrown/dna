
// URL validation utility
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// LinkedIn URL validation
export const isValidLinkedInUrl = (url: string): boolean => {
  if (!url) return true; // Optional field
  if (!isValidUrl(url)) return false;
  
  const linkedInPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;
  return linkedInPattern.test(url);
};

// Content sanitization - basic XSS prevention
export const sanitizeText = (text: string): string => {
  return text
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .substring(0, 1000); // Enforce max length
};

// Character limit validation
export const validateCharacterLimit = (text: string, limit: number): boolean => {
  return text.length <= limit;
};

// Professional field validation
export const validateProfessionalField = (text: string): boolean => {
  return validateCharacterLimit(text, 100) && /^[a-zA-Z0-9\s\-,.'&()]+$/.test(text);
};
