/**
 * useMessageRequests - Stub hook for message requests feature
 * 
 * NOTE: Message requests feature requires additional database functions
 * that are not yet implemented. This stub prevents build errors.
 */

export function useMessageRequests(_limit: number = 50) {
  return {
    requests: [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: async () => {},
    requestCount: 0,
  };
}

export function useAcceptMessageRequest() {
  return {
    mutate: (_conversationId: string) => {
      console.warn('Message requests feature not yet implemented');
    },
    mutateAsync: async (_conversationId: string) => false,
    isPending: false,
  };
}

export function useDeclineMessageRequest() {
  return {
    mutate: (_conversationId: string) => {
      console.warn('Message requests feature not yet implemented');
    },
    mutateAsync: async (_conversationId: string) => false,
    isPending: false,
  };
}

export function useMessageRequestCount() {
  return { count: 0, isLoading: false };
}
