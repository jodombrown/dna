
// Enhanced security validation utilities
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  // Remove potential XSS patterns
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

export const validateCharacterLimit = (text: string, limit: number): boolean => {
  return text.length <= limit;
};

export const validateProfessionalField = (text: string): boolean => {
  if (!text) return true;
  
  // Allow letters, numbers, spaces, common punctuation, and accented characters
  const validPattern = /^[a-zA-Z0-9\s\-&.,()''""àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ]+$/;
  return validPattern.test(text) && text.length <= 100;
};

export const isValidLinkedInUrl = (url: string): boolean => {
  if (!url) return true;
  
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

export const validateBioContent = (bio: string): boolean => {
  if (!bio) return true;
  
  // Check for potential security risks in bio content
  const suspiciousPatterns = [
    /(?:https?:\/\/)?(?:bit\.ly|tinyurl|t\.co)/i, // Suspicious short URLs
    /\b(?:admin|administrator|root|sudo)\b/i, // Admin-related terms
    /\$\{.*\}/i, // Template injection patterns
    /__.*__/i, // Potential code injection
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(bio));
};

export const rateLimitKey = (userId: string, action: string): string => {
  return `rate_limit:${userId}:${action}`;
};

export const isRateLimited = (lastAction: number, minInterval: number = 2000): boolean => {
  return Date.now() - lastAction < minInterval;
};
