
// Enhanced validation utilities with security focus
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  // Remove potential XSS patterns and normalize
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
};

export const validateCharacterLimit = (text: string, limit: number): boolean => {
  return text.length <= limit;
};

export const validateProfessionalField = (text: string): boolean => {
  if (!text) return true;
  
  // Enhanced pattern to prevent injection attempts
  const validPattern = /^[a-zA-Z0-9\s\-&.,()''""àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ]+$/;
  const noScriptPattern = !/(?:script|javascript|onload|onerror)/i.test(text);
  
  return validPattern.test(text) && noScriptPattern && text.length <= 100;
};

export const isValidLinkedInUrl = (url: string): boolean => {
  if (!url) return true;
  
  try {
    const urlObj = new URL(url);
    // Strict LinkedIn URL validation
    return (
      (urlObj.hostname === 'linkedin.com' || urlObj.hostname === 'www.linkedin.com') &&
      urlObj.pathname.startsWith('/in/') &&
      urlObj.pathname.length > 4 &&
      !urlObj.pathname.includes('..') && // Prevent path traversal
      !/[<>'"]/g.test(url) // Prevent XSS in URL - fixed regex syntax
    );
  } catch {
    return false;
  }
};

// Additional security validation functions
export const validateBioContent = (bio: string): boolean => {
  if (!bio) return true;
  
  // Check for potential security risks
  const suspiciousPatterns = [
    /(?:https?:\/\/)?(?:bit\.ly|tinyurl|t\.co)/i, // Suspicious short URLs
    /\b(?:admin|administrator|root|sudo)\b/i, // Admin-related terms
    /\$\{.*\}/i, // Template injection patterns
    /__.*__/i, // Potential code injection
    /<[^>]*>/i, // HTML tags
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(bio));
};

export const isRateLimited = (lastAction: number, minInterval: number = 2000): boolean => {
  return Date.now() - lastAction < minInterval;
};
