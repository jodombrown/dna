import { supabase } from '@/integrations/supabase/client';

export interface ErrorLogData {
  errorType: string;
  errorMessage: string;
  errorStack?: string;
  componentStack?: string;
  url?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  severity?: 'error' | 'warning' | 'critical';
  userId?: string;
}

class ErrorLogger {
  private isProduction = import.meta.env.PROD;
  private isDevelopment = import.meta.env.DEV;

  // Suppress console errors in production but keep critical ones
  suppressProductionConsole() {
    if (!this.isProduction) return;

    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;

    // Override console methods in production
    console.error = (...args: any[]) => {
      // Only log critical errors in production
      const message = args.join(' ');
      if (this.isCriticalError(message)) {
        originalError(...args);
        this.logError({
          errorType: 'console_error',
          errorMessage: message,
          severity: 'critical',
          metadata: { args }
        });
      }
    };

    console.warn = (...args: any[]) => {
      // Suppress most warnings in production
      const message = args.join(' ');
      if (this.isCriticalError(message)) {
        originalWarn(...args);
      }
    };

    // Keep console.log for debugging but limit in production
    console.log = (...args: any[]) => {
      if (this.isDevelopment) {
        originalLog(...args);
      }
    };
  }

  private isCriticalError(message: string): boolean {
    const criticalPatterns = [
      'Uncaught',
      'TypeError',
      'ReferenceError',
      'SyntaxError',
      'Network Error',
      'Failed to fetch',
      'Authentication',
      'Database error',
      'Supabase'
    ];

    return criticalPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  async logError(errorData: ErrorLogData): Promise<void> {
    try {
      // Get current user if available
      const { data: { user } } = await supabase.auth.getUser();
      
      const logEntry = {
        user_id: errorData.userId || user?.id || null,
        error_type: errorData.errorType,
        error_message: errorData.errorMessage,
        error_stack: errorData.errorStack || null,
        component_stack: errorData.componentStack || null,
        url: errorData.url || window.location.href,
        user_agent: errorData.userAgent || navigator.userAgent,
        metadata: errorData.metadata || {},
        severity: errorData.severity || 'error'
      };

      const { error } = await supabase
        .from('error_logs')
        .insert(logEntry);

      if (error) {
        // Fallback to console if database logging fails
        console.error('Failed to log error to database:', error);
        console.error('Original error:', errorData);
      }
    } catch (err) {
      // Last resort - log to console
      console.error('Error logging service failed:', err);
      console.error('Original error:', errorData);
    }
  }

  // Log JavaScript errors
  logJavaScriptError(error: Error, errorInfo?: any): void {
    this.logError({
      errorType: 'javascript_error',
      errorMessage: error.message,
      errorStack: error.stack,
      componentStack: errorInfo?.componentStack,
      severity: 'error',
      metadata: {
        name: error.name,
        ...errorInfo
      }
    });
  }

  // Log React component errors
  logReactError(error: Error, errorInfo: any): void {
    this.logError({
      errorType: 'react_error',
      errorMessage: error.message,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack,
      severity: 'critical',
      metadata: {
        name: error.name,
        errorBoundary: true
      }
    });
  }

  // Log network/API errors
  logNetworkError(error: any, context?: string): void {
    this.logError({
      errorType: 'network_error',
      errorMessage: error.message || 'Network request failed',
      errorStack: error.stack,
      severity: 'error',
      metadata: {
        context,
        status: error.status,
        statusText: error.statusText,
        url: error.url
      }
    });
  }

  // Log authentication errors
  logAuthError(error: any): void {
    this.logError({
      errorType: 'auth_error',
      errorMessage: error.message || 'Authentication failed',
      severity: 'warning',
      metadata: {
        code: error.code,
        details: error.details
      }
    });
  }

  // Log custom application errors
  logCustomError(message: string, context?: Record<string, any>): void {
    this.logError({
      errorType: 'application_error',
      errorMessage: message,
      severity: 'error',
      metadata: context
    });
  }
}

// Create singleton instance
export const errorLogger = new ErrorLogger();

// Initialize production console suppression
errorLogger.suppressProductionConsole();

// Setup global error handlers
window.addEventListener('error', (event) => {
  errorLogger.logJavaScriptError(event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  errorLogger.logError({
    errorType: 'unhandled_promise_rejection',
    errorMessage: event.reason?.message || 'Unhandled promise rejection',
    errorStack: event.reason?.stack,
    severity: 'error',
    metadata: {
      reason: event.reason
    }
  });
});

export default errorLogger;
