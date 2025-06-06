
// Enhanced error handling and security logging

interface SecurityEvent {
  event_type: string;
  user_id?: string;
  details?: Record<string, any>;
  timestamp: string;
  ip_address?: string;
}

export const logSecurityEvent = (
  eventType: string, 
  userId?: string, 
  details?: Record<string, any>
): void => {
  const event: SecurityEvent = {
    event_type: eventType,
    user_id: userId,
    details: details || {},
    timestamp: new Date().toISOString(),
    ip_address: 'client' // Client-side logging
  };
  
  // Log to console for development (remove in production)
  console.warn('Security Event:', event);
  
  // In production, you could send this to a security monitoring service
  // sendToSecurityMonitoring(event);
};

export const getGenericErrorMessage = (error: any): string => {
  // Don't expose internal error details to users
  const safeErrors = [
    'Invalid email format',
    'Invalid name format', 
    'Invalid LinkedIn URL',
    'Missing required fields',
    'Profile update failed',
    'Authentication required',
    'Rate limit exceeded',
    'Request too large'
  ];
  
  const errorMessage = error?.message || 'Unknown error';
  
  if (safeErrors.some(safe => errorMessage.includes(safe))) {
    return errorMessage;
  }
  
  // Log the actual error for debugging
  console.error('Internal error:', error);
  
  // Return generic message to user
  return 'An unexpected error occurred. Please try again later.';
};

export const handleFormError = (error: any, context: string): void => {
  logSecurityEvent('form_error', undefined, {
    context,
    error: error?.message || 'Unknown error'
  });
};

export const handleAuthError = (error: any, userId?: string): void => {
  logSecurityEvent('auth_error', userId, {
    error: error?.message || 'Unknown error'
  });
};

export const handleValidationError = (field: string, value: any, userId?: string): void => {
  logSecurityEvent('validation_error', userId, {
    field,
    valueType: typeof value,
    valueLength: value?.length || 0
  });
};
