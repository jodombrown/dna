// Backward compatibility wrapper for existing analytics code
export type ConnectEventName = string;

// Old analytics interface for backward compatibility
export function useAnalytics() {
  return {
    trackEvent: async (eventName: string, metadata?: any, route?: string) => {
      // Legacy event tracking - simplified for backward compatibility
      if (import.meta.env.DEV) {
        console.debug('[Analytics]', eventName, metadata);
      }
    },
  };
}
