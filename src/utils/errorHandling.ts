
export const getGenericErrorMessage = (error: any): string => {
  // Log the actual error for debugging
  console.error('Error details:', error);
  
  // Return generic messages to avoid exposing system details
  if (error?.code === 'PGRST116') {
    return 'Profile not found. Please try again.';
  }
  
  if (error?.code === '23503') {
    return 'User profile required. Please complete your profile first.';
  }
  
  if (error?.message?.includes('duplicate key')) {
    return 'This information is already in use. Please try different values.';
  }
  
  if (error?.message?.includes('rate limit')) {
    return 'Too many requests. Please wait a moment before trying again.';
  }
  
  if (error?.message?.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  return 'An unexpected error occurred. Please try again later.';
};

export const logSecurityEvent = (eventType: string, userId?: string, details?: any): void => {
  console.warn(`Security Event: ${eventType}`, {
    userId,
    timestamp: new Date().toISOString(),
    details
  });
  
  // In production, you might want to send this to a monitoring service
};
