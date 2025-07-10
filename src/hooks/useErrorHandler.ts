import { useCallback } from 'react';
import { errorLogger } from '@/services/errorLogger';
import { useToast } from '@/hooks/use-toast';

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = useCallback((
    error: Error | string,
    context?: Record<string, any>,
    showToast = true
  ) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // Log the error
    if (typeof error === 'string') {
      errorLogger.logCustomError(error, context);
    } else {
      errorLogger.logJavaScriptError(error, context);
    }

    // Show user-friendly toast notification
    if (showToast) {
      toast({
        title: "Something went wrong",
        description: "We've encountered an issue. Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleNetworkError = useCallback((
    error: any,
    context?: string,
    showToast = true
  ) => {
    errorLogger.logNetworkError(error, context);
    
    if (showToast) {
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please check your internet connection and try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleAuthError = useCallback((
    error: any,
    showToast = true
  ) => {
    errorLogger.logAuthError(error);
    
    if (showToast) {
      toast({
        title: "Authentication Error",
        description: "There was an issue with your authentication. Please try signing in again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const reportError = useCallback((
    message: string,
    metadata?: Record<string, any>
  ) => {
    errorLogger.logCustomError(message, metadata);
  }, []);

  return {
    handleError,
    handleNetworkError,
    handleAuthError,
    reportError
  };
};