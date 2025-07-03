// Security middleware for form submissions and API calls

import { 
  sanitizeInput, 
  validateBioSecurity, 
  validateFileUpload,
  logSecurityEvent,
  SecurityEventSeverity
} from './securityEnhancements';

export interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

// Form data security validation middleware
export const validateFormSecurity = async (
  formData: Record<string, any>,
  userId?: string,
  formType?: string
): Promise<SecurityValidationResult> => {
  const errors: string[] = [];
  const sanitizedData: Record<string, any> = {};

  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      // Sanitize all string inputs
      const sanitized = sanitizeInput(value, {
        maxLength: getMaxLengthForField(key),
        allowHtml: isHtmlAllowedForField(key),
        removeUrls: shouldRemoveUrlsForField(key)
      });

      // Check if sanitization removed content (potential security risk)
      if (sanitized !== value && sanitized.length < value.length * 0.8) {
        errors.push(`${key} contains potentially unsafe content`);
        
        // Log security event
        await logSecurityEvent({
          type: 'input_sanitization_triggered',
          severity: SecurityEventSeverity.MEDIUM,
          userId,
          details: {
            field: key,
            original_length: value.length,
            sanitized_length: sanitized.length,
            form_type: formType
          }
        });
      }

      sanitizedData[key] = sanitized;

      // Special validation for bio fields
      if (key.toLowerCase().includes('bio') || key.toLowerCase().includes('description')) {
        const bioValidation = validateBioSecurity(sanitized);
        if (!bioValidation.isValid) {
          errors.push(`${key}: ${bioValidation.reason}`);
          
          await logSecurityEvent({
            type: 'bio_security_violation',
            severity: SecurityEventSeverity.HIGH,
            userId,
            details: {
              field: key,
              reason: bioValidation.reason,
              content_preview: sanitized.substring(0, 100)
            }
          });
        }
      }
    } else {
      sanitizedData[key] = value;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
};

// File upload security validation
export const validateUploadSecurity = async (
  file: File,
  userId?: string
): Promise<SecurityValidationResult> => {
  const validation = validateFileUpload(file);
  
  if (!validation.isValid) {
    await logSecurityEvent({
      type: 'file_upload_rejected',
      severity: SecurityEventSeverity.MEDIUM,
      userId,
      details: {
        filename: file.name,
        file_type: file.type,
        file_size: file.size,
        reason: validation.reason
      }
    });
  }

  return {
    isValid: validation.isValid,
    errors: validation.isValid ? [] : [validation.reason || 'File validation failed']
  };
};

// Profile update security validation
export const validateProfileUpdateSecurity = async (
  profileData: any,
  userId: string
): Promise<SecurityValidationResult> => {
  const result = await validateFormSecurity(profileData, userId, 'profile_update');
  
  // Additional profile-specific validations
  if (profileData.linkedin_url) {
    const urlPattern = /^https:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;
    if (!urlPattern.test(profileData.linkedin_url)) {
      result.errors.push('LinkedIn URL format is invalid');
    }
  }

  // Check for suspicious profile data patterns
  const suspiciousPatterns = [
    /\b(?:test|example|fake|dummy)\b/i,
    /\b(?:admin|root|system)\b/i,
    /^.{1,2}$/ // Very short names
  ];

  if (profileData.full_name) {
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(profileData.full_name)) {
        await logSecurityEvent({
          type: 'suspicious_profile_data',
          severity: SecurityEventSeverity.MEDIUM,
          userId,
          details: {
            field: 'full_name',
            value: profileData.full_name,
            pattern: pattern.toString()
          }
        });
        break;
      }
    }
  }

  return result;
};

// Post creation security validation
export const validatePostSecurity = async (
  postData: any,
  userId: string
): Promise<SecurityValidationResult> => {
  const result = await validateFormSecurity(postData, userId, 'post_creation');
  
  // Additional post-specific validations
  if (postData.content) {
    const content = postData.content.toString();
    
    // Check for spam patterns
    const spamPatterns = [
      /(.)\1{10,}/, // Repeated characters
      /https?:\/\/[^\s]+/g, // Multiple URLs
      /\b(buy|sell|money|cash|earn|free|click|visit)\b/gi // Spam keywords
    ];

    const urlMatches = content.match(/https?:\/\/[^\s]+/g);
    if (urlMatches && urlMatches.length > 3) {
      result.errors.push('Post contains too many URLs');
      
      await logSecurityEvent({
        type: 'post_spam_detection',
        severity: SecurityEventSeverity.MEDIUM,
        userId,
        details: {
          url_count: urlMatches.length,
          urls: urlMatches
        }
      });
    }

    // Check for repeated characters (potential spam)
    if (spamPatterns[0].test(content)) {
      result.errors.push('Post contains suspicious repeated patterns');
    }
  }

  return result;
};

// Helper functions
function getMaxLengthForField(fieldName: string): number {
  const fieldLimits: Record<string, number> = {
    full_name: 100,
    profession: 100,
    company: 100,
    location: 100,
    bio: 1000,
    description: 2000,
    content: 5000,
    title: 200
  };

  for (const [key, limit] of Object.entries(fieldLimits)) {
    if (fieldName.toLowerCase().includes(key)) {
      return limit;
    }
  }

  return 500; // Default limit
}

function isHtmlAllowedForField(fieldName: string): boolean {
  // HTML is generally not allowed except for specific rich text fields
  const htmlAllowedFields = ['description', 'bio', 'content'];
  return htmlAllowedFields.some(field => fieldName.toLowerCase().includes(field));
}

function shouldRemoveUrlsForField(fieldName: string): boolean {
  // Remove URLs from sensitive fields
  const urlRestrictedFields = ['full_name', 'profession', 'title'];
  return urlRestrictedFields.some(field => fieldName.toLowerCase().includes(field));
}