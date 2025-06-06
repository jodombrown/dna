
// Enhanced security validation utilities

export const validateCharacterLimit = (text: string, maxLength: number): boolean => {
  return text.length <= maxLength;
};

export const validateProfessionalField = (text: string): boolean => {
  if (!text) return true; // Optional field
  
  // Allow letters, numbers, spaces, common punctuation, but block potential XSS
  const safePattern = /^[a-zA-Z0-9\s\.\,\-\&\(\)\/\+àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ]{1,100}$/;
  return safePattern.test(text) && !/<script|javascript:|data:|vbscript:/i.test(text);
};

export const validateBioContent = (bio: string): boolean => {
  if (!bio) return true; // Optional field
  
  // Check length
  if (bio.length > 1000) return false;
  
  // Block potential XSS and injection attempts
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i,
    /onmouseover=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\s*\(/i,
    /expression\s*\(/i
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(bio));
};

export const isValidLinkedInUrl = (url: string): boolean => {
  if (!url) return true; // Optional field
  
  try {
    const urlObj = new URL(url);
    
    // Must be HTTPS for security
    if (urlObj.protocol !== 'https:') return false;
    
    // Must be LinkedIn domain
    const validHosts = ['linkedin.com', 'www.linkedin.com'];
    if (!validHosts.includes(urlObj.hostname)) return false;
    
    // Must follow LinkedIn profile URL pattern
    const pathPattern = /^\/in\/[a-zA-Z0-9\-]{3,100}\/?$/;
    return pathPattern.test(urlObj.pathname);
  } catch {
    return false;
  }
};

export const sanitizeText = (text: string): string => {
  return text
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
    .replace(/\s+/g, ' '); // Normalize whitespace
};

export const isRateLimited = (lastAction: number, cooldownMs: number = 3000): boolean => {
  return Date.now() - lastAction < cooldownMs;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && 
         email.length <= 254 && 
         !email.includes('..') && // Prevent consecutive dots
         !/<script|javascript:|data:/i.test(email); // Basic XSS protection
};

export const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s\-'àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ]{1,50}$/;
  return nameRegex.test(name) && 
         !/<script|javascript:|data:/i.test(name) && // XSS protection
         name.trim().length >= 1; // Must have actual content
};
