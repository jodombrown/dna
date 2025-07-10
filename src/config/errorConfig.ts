// Environment configuration for error handling
export const ENV_CONFIG = {
  // Environment detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Error logging configuration
  errorLogging: {
    // Log levels that should be suppressed in production
    suppressedLevels: ['log', 'warn', 'info'] as const,
    
    // Error patterns that should always be logged even in production
    criticalPatterns: [
      'uncaught',
      'typeerror',
      'referenceerror',
      'syntaxerror',
      'network error',
      'failed to fetch',
      'authentication',
      'database error',
      'supabase',
      'payment',
      'security'
    ] as const,
    
    // Maximum number of error logs per session to prevent spam
    maxLogsPerSession: 100,
    
    // Debounce time for similar errors (ms)
    errorDebounceTime: 5000,
  },
  
  // UI configuration
  ui: {
    // Show detailed error information in development
    showErrorDetails: import.meta.env.DEV,
    
    // Show error boundary fallback
    showErrorBoundary: true,
    
    // Auto-retry failed requests
    autoRetryFailedRequests: true,
    
    // Number of retry attempts
    maxRetryAttempts: 3,
  },
  
  // Performance monitoring
  performance: {
    // Track component render times
    trackRenderTimes: import.meta.env.DEV,
    
    // Track network request times
    trackNetworkTimes: true,
    
    // Memory usage monitoring
    trackMemoryUsage: import.meta.env.DEV,
  }
} as const;

// Type definitions
export type LogLevel = typeof ENV_CONFIG.errorLogging.suppressedLevels[number];
export type CriticalPattern = typeof ENV_CONFIG.errorLogging.criticalPatterns[number];

export default ENV_CONFIG;