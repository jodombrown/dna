
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  // Remove potential script tags and other dangerous content
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

export const validateCharacterLimit = (text: string, maxLength: number): boolean => {
  return text.length <= maxLength;
};

export const validateProfessionalField = (text: string): boolean => {
  if (!text) return true; // Optional fields
  
  // Allow letters, numbers, spaces, common punctuation
  const validPattern = /^[a-zA-Z0-9\s\-'.,()&]+$/;
  return validPattern.test(text) && validateCharacterLimit(text, 100);
};

export const validateBioContent = (bio: string): boolean => {
  if (!bio) return true; // Optional field
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onclick/i,
    /onerror/i,
    /onload/i,
    /<iframe/i,
    /data:text\/html/i
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(bio));
};

export const isValidLinkedInUrl = (url: string): boolean => {
  if (!url) return true; // Optional field
  
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'linkedin.com' || 
           urlObj.hostname === 'www.linkedin.com' ||
           urlObj.pathname.startsWith('/in/');
  } catch {
    return false;
  }
};

export const isRateLimited = (lastSubmit: number, cooldownMs: number = 1000): boolean => {
  const now = Date.now();
  return (now - lastSubmit) < cooldownMs;
};
