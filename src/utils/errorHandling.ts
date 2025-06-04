
// Secure error handling utilities
export interface SecurityError {
  type: 'validation' | 'authentication' | 'authorization' | 'rate_limit' | 'general';
  userMessage: string;
  logMessage?: string;
}

export const createSecurityError = (
  type: SecurityError['type'], 
  userMessage: string, 
  logMessage?: string
): SecurityError => {
  return {
    type,
    userMessage,
    logMessage: logMessage || userMessage
  };
};

export const getGenericErrorMessage = (error: any): string => {
  // Return generic messages to avoid information disclosure
  if (error?.message?.includes('row-level security')) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error?.message?.includes('duplicate key')) {
    return 'This information is already in use.';
  }
  
  if (error?.message?.includes('violates check constraint')) {
    return 'The provided information does not meet our requirements.';
  }
  
  // Generic fallback
  return 'An error occurred while processing your request. Please try again.';
};

export const logSecurityEvent = (event: string, userId?: string, details?: any): void => {
  // In a production environment, this would send to a security monitoring service
  console.warn(`[SECURITY] ${event}`, {
    userId,
    timestamp: new Date().toISOString(),
    details: details ? JSON.stringify(details) : undefined
  });
};
