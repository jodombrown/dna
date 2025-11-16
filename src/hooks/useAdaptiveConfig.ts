import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { adaptiveConfigService, type PolicyType, type PolicyResolution } from '@/services/ada/AdaptiveConfigService';
import { useLocation } from 'react-router-dom';

/**
 * ADA Phase 4 - M1: Adaptive Config Hooks
 * React hooks for accessing adaptive policies
 */

/**
 * Hook to get policy for current user and context
 */
export function useAdaptivePolicy(
  type: PolicyType,
  context?: { route?: string; viewState?: string }
) {
  const { user } = useAuth();
  const location = useLocation();

  return useQuery({
    queryKey: ['adaptive-policy', user?.id, type, context?.route || location.pathname, context?.viewState],
    queryFn: async () => {
      if (!user) return null;

      const route = context?.route || location.pathname;
      return await adaptiveConfigService.getPolicyForUser(user.id, type, {
        route,
        viewState: context?.viewState,
      });
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get module configuration policy
 */
export function useModulePolicy(route?: string) {
  const { user } = useAuth();
  const location = useLocation();

  return useQuery({
    queryKey: ['module-policy', user?.id, route || location.pathname],
    queryFn: async () => {
      if (!user) return null;
      return await adaptiveConfigService.resolveModulePolicy(
        user.id,
        route || location.pathname
      );
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get layout policy
 */
export function useLayoutPolicy(viewState?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['layout-policy', user?.id, viewState],
    queryFn: async () => {
      if (!user) return null;
      return await adaptiveConfigService.resolveLayoutPolicy(user.id, viewState);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get CTA policy
 */
export function useCTAPolicy(entityType?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cta-policy', user?.id, entityType],
    queryFn: async () => {
      if (!user) return null;
      return await adaptiveConfigService.resolveCTAPolicy(user.id, entityType);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get nudge frequency policy
 */
export function useNudgePolicy() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['nudge-policy', user?.id],
    queryFn: async () => {
      if (!user) return null;
      return await adaptiveConfigService.resolveNudgePolicy(user.id);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Helper to extract config from policy resolution with fallback
 */
export function usePolicyConfig<T = Record<string, any>>(
  policyResolution: PolicyResolution | null | undefined,
  fallback: T
): T {
  if (!policyResolution || !policyResolution.policy) {
    return fallback;
  }

  return policyResolution.policy.config as T;
}
