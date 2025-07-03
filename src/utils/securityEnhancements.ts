// Enhanced Security Utilities for DNA Platform

import { supabase } from '@/integrations/supabase/client';

// Content Security Policy configuration
export const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
  styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  imgSrc: ["'self'", "data:", "https:", "blob:"],
  fontSrc: ["'self'", "https://fonts.gstatic.com"],
  connectSrc: ["'self'", "https://*.supabase.co", "wss://*.supabase.co"],
  mediaSrc: ["'self'", "blob:"],
  objectSrc: ["'none'"],
  frameSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"]
};

// Advanced input sanitization
export const sanitizeInput = (input: string, options: {
  allowHtml?: boolean;
  maxLength?: number;
  removeUrls?: boolean;
} = {}): string => {
  if (!input) return '';
  
  let sanitized = input.trim();
  
  // Remove dangerous patterns
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/expression\s*\(/gi, '');
  
  // Remove suspicious patterns
  const suspiciousPatterns = [
    /\$\{.*\}/gi, // Template injection
    /__.*__/gi, // Potential code patterns
    /\[\[.*\]\]/gi, // Template patterns
    /\{\{.*\}\}/gi, // Template patterns
  ];
  
  suspiciousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  // Remove URLs if requested
  if (options.removeUrls) {
    sanitized = sanitized.replace(/https?:\/\/[^\s]+/gi, '[URL removed]');
  }
  
  // Remove all HTML if not allowed
  if (!options.allowHtml) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }
  
  // Enforce length limit
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }
  
  return sanitized;
};

// Enhanced bio validation with comprehensive checks
export const validateBioSecurity = (bio: string): { isValid: boolean; reason?: string } => {
  if (!bio) return { isValid: true };
  
  // Length check
  if (bio.length > 1000) {
    return { isValid: false, reason: 'Bio exceeds maximum length of 1000 characters' };
  }
  
  // Suspicious patterns
  const risks = [
    { pattern: /<script|javascript:|on\w+=/i, reason: 'Contains potentially malicious code' },
    { pattern: /\b(?:admin|root|sudo|password)\b/i, reason: 'Contains sensitive system terms' },
    { pattern: /\$\{.*\}|\[\[.*\]\]|\{\{.*\}\}/i, reason: 'Contains template injection patterns' },
    { pattern: /(?:https?:\/\/)?(?:bit\.ly|tinyurl|t\.co|goo\.gl)\/\w+/i, reason: 'Contains suspicious shortened URLs' },
    { pattern: /data:text\/html|data:application/i, reason: 'Contains data URIs that could be malicious' },
    { pattern: /<iframe|<embed|<object/i, reason: 'Contains embedded content tags' },
    { pattern: /eval\s*\(|Function\s*\(|setTimeout\s*\(/i, reason: 'Contains code execution patterns' }
  ];
  
  for (const risk of risks) {
    if (risk.pattern.test(bio)) {
      return { isValid: false, reason: risk.reason };
    }
  }
  
  return { isValid: true };
};

// Rate limiting with progressive penalties
interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  penaltyMultiplier?: number;
}

export const createRateLimiter = (config: RateLimitConfig) => {
  const attempts = new Map<string, number[]>();
  
  return {
    isLimited: (identifier: string): boolean => {
      const now = Date.now();
      const userAttempts = attempts.get(identifier) || [];
      
      // Clean old attempts
      const validAttempts = userAttempts.filter(
        attempt => now - attempt < config.windowMs
      );
      
      // Check if limit exceeded
      if (validAttempts.length >= config.maxAttempts) {
        // Apply progressive penalty
        const penalty = config.penaltyMultiplier 
          ? Math.min(validAttempts.length * config.penaltyMultiplier, 10)
          : 1;
        
        const lastAttempt = Math.max(...validAttempts);
        const waitTime = config.windowMs * penalty;
        
        return (now - lastAttempt) < waitTime;
      }
      
      return false;
    },
    
    recordAttempt: (identifier: string): void => {
      const now = Date.now();
      const userAttempts = attempts.get(identifier) || [];
      userAttempts.push(now);
      attempts.set(identifier, userAttempts);
    },
    
    reset: (identifier: string): void => {
      attempts.delete(identifier);
    }
  };
};

// Security event logging with severity levels
export enum SecurityEventSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface SecurityEvent {
  type: string;
  severity: SecurityEventSeverity;
  userId?: string;
  userAgent?: string;
  ipAddress?: string;
  details?: any;
  timestamp: string;
}

export const logSecurityEvent = async (event: Omit<SecurityEvent, 'timestamp'>): Promise<void> => {
  const securityEvent: SecurityEvent = {
    ...event,
    timestamp: new Date().toISOString()
  };
  
  // Log to console with appropriate level
  const logMethod = event.severity === SecurityEventSeverity.CRITICAL ? 'error' :
                   event.severity === SecurityEventSeverity.HIGH ? 'warn' :
                   'info';
  
  console[logMethod]('Security Event:', securityEvent);
  
  // Store critical events in database for admin review
  if (event.severity === SecurityEventSeverity.HIGH || event.severity === SecurityEventSeverity.CRITICAL) {
    try {
      await supabase.from('admin_audit_log').insert({
        action: `security_event_${event.type}`,
        details: JSON.parse(JSON.stringify(securityEvent)),
        admin_user_id: event.userId || null
      });
    } catch (error) {
      console.error('Failed to log security event to database:', error);
    }
  }
};

// File upload security validation
export const validateFileUpload = (file: File): { isValid: boolean; reason?: string } => {
  // Size limits (10MB for images, 50MB for documents)
  const maxImageSize = 10 * 1024 * 1024; // 10MB
  const maxDocumentSize = 50 * 1024 * 1024; // 50MB
  
  // Allowed MIME types
  const allowedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];
  
  const allowedDocumentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  
  // Check file size
  const isImage = allowedImageTypes.includes(file.type);
  const isDocument = allowedDocumentTypes.includes(file.type);
  
  if (!isImage && !isDocument) {
    return { isValid: false, reason: 'File type not allowed' };
  }
  
  const maxSize = isImage ? maxImageSize : maxDocumentSize;
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return { isValid: false, reason: `File too large. Maximum size: ${maxSizeMB}MB` };
  }
  
  // Check file name for suspicious patterns
  const suspiciousNamePatterns = [
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.scr$/i,
    /\.vbs$/i,
    /\.js$/i,
    /\.php$/i,
    /\.jsp$/i,
    /\.asp$/i,
    /\.htm$/i,
    /\.html$/i
  ];
  
  if (suspiciousNamePatterns.some(pattern => pattern.test(file.name))) {
    return { isValid: false, reason: 'File name contains suspicious extension' };
  }
  
  return { isValid: true };
};

// Session security utilities
export const generateSecureToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const encryptSensitiveData = (data: string, key?: string): string => {
  // Simple XOR encryption for localStorage (not for production sensitive data)
  const encryptionKey = key || 'dna-platform-key';
  let encrypted = '';
  
  for (let i = 0; i < data.length; i++) {
    const keyChar = encryptionKey[i % encryptionKey.length];
    encrypted += String.fromCharCode(data.charCodeAt(i) ^ keyChar.charCodeAt(0));
  }
  
  return btoa(encrypted);
};

export const decryptSensitiveData = (encryptedData: string, key?: string): string => {
  try {
    const encryptionKey = key || 'dna-platform-key';
    const encrypted = atob(encryptedData);
    let decrypted = '';
    
    for (let i = 0; i < encrypted.length; i++) {
      const keyChar = encryptionKey[i % encryptionKey.length];
      decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ keyChar.charCodeAt(0));
    }
    
    return decrypted;
  } catch {
    return '';
  }
};

// Secure localStorage wrapper
export const secureStorage = {
  setItem: (key: string, value: string): void => {
    const encrypted = encryptSensitiveData(value);
    localStorage.setItem(`dna_${key}`, encrypted);
  },
  
  getItem: (key: string): string | null => {
    const encrypted = localStorage.getItem(`dna_${key}`);
    if (!encrypted) return null;
    return decryptSensitiveData(encrypted);
  },
  
  removeItem: (key: string): void => {
    localStorage.removeItem(`dna_${key}`);
  },
  
  clear: (): void => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('dna_')) {
        localStorage.removeItem(key);
      }
    });
  }
};

// Input validation middleware for forms
export const validateFormInput = (formData: Record<string, any>, rules: Record<string, any>): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  
  for (const [field, value] of Object.entries(formData)) {
    const rule = rules[field];
    if (!rule) continue;
    
    // Required validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors[field] = `${field} is required`;
      continue;
    }
    
    // Skip other validations if field is empty and not required
    if (!value && !rule.required) continue;
    
    const stringValue = value.toString();
    
    // Length validation
    if (rule.maxLength && stringValue.length > rule.maxLength) {
      errors[field] = `${field} must be less than ${rule.maxLength} characters`;
    }
    
    if (rule.minLength && stringValue.length < rule.minLength) {
      errors[field] = `${field} must be at least ${rule.minLength} characters`;
    }
    
    // Pattern validation
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      errors[field] = rule.patternMessage || `${field} format is invalid`;
    }
    
    // Custom validation
    if (rule.customValidator) {
      const result = rule.customValidator(stringValue);
      if (!result.isValid) {
        errors[field] = result.message;
      }
    }
    
    // Security validation
    if (rule.sanitize) {
      const sanitized = sanitizeInput(stringValue, rule.sanitizeOptions || {});
      if (sanitized !== stringValue) {
        errors[field] = `${field} contains invalid content`;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};