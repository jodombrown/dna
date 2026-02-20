/**
 * DNA | Identity Hub Hook
 *
 * React hook for fetching and managing profile data through
 * the Identity Hub service layer. Provides access to the full
 * ProfileViewPayload with viewer context, relationship data,
 * DIA match info, and visible sections.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileIdentityHubService } from '@/services/profileIdentityHubService';
import type {
  IdentityHubProfile,
  DiasporaHeritage,
  SkillCategory,
  ProfileBadge,
} from '@/types/profileIdentityHub';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch a profile with viewer context, relationship data,
 * and DIA match info via the Identity Hub service.
 */
export function useIdentityHubProfile(profileId: string | undefined, viewerId: string | null) {
  return useQuery({
    queryKey: ['identity-hub-profile', profileId, viewerId],
    queryFn: () => profileIdentityHubService.getProfile(profileId!, viewerId),
    enabled: !!profileId,
    staleTime: STALE_TIME,
  });
}

/**
 * Update profile fields via the Identity Hub service.
 * Automatically recomputes completion and triggers DIA re-matching.
 */
export function useUpdateIdentityHubProfile(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<IdentityHubProfile>) =>
      profileIdentityHubService.updateProfile(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity-hub-profile'] });
    },
  });
}

/**
 * Manage structured skills with endorsements and DIA strength.
 */
export function useIdentityHubSkills(userId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['identity-hub-skills', userId],
    queryFn: () => profileIdentityHubService.getSkills(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME,
  });

  const addSkill = useMutation({
    mutationFn: ({ name, category }: { name: string; category: SkillCategory }) =>
      profileIdentityHubService.addSkill(userId!, name, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity-hub-skills', userId] });
      queryClient.invalidateQueries({ queryKey: ['identity-hub-profile'] });
    },
  });

  const removeSkill = useMutation({
    mutationFn: (skillId: string) =>
      profileIdentityHubService.removeSkill(userId!, skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity-hub-skills', userId] });
    },
  });

  const endorseSkill = useMutation({
    mutationFn: ({ skillId, skillOwnerId }: { skillId: string; skillOwnerId: string }) =>
      profileIdentityHubService.endorseSkill(skillId, userId!, skillOwnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity-hub-skills'] });
    },
  });

  const toggleTopSkill = useMutation({
    mutationFn: ({ skillId, isTopSkill }: { skillId: string; isTopSkill: boolean }) =>
      profileIdentityHubService.toggleTopSkill(userId!, skillId, isTopSkill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity-hub-skills', userId] });
    },
  });

  return { ...query, addSkill, removeSkill, endorseSkill, toggleTopSkill };
}

/**
 * Manage heritage data with DIA re-matching.
 */
export function useUpdateHeritage(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (heritage: DiasporaHeritage) =>
      profileIdentityHubService.updateHeritage(userId, heritage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity-hub-profile'] });
    },
  });
}

/**
 * Compute and fetch Five C's Impact Score.
 */
export function useImpactScore(userId: string | undefined) {
  return useQuery({
    queryKey: ['identity-hub-impact-score', userId],
    queryFn: () => profileIdentityHubService.computeImpactScore(userId!),
    enabled: !!userId,
    staleTime: 30 * 60 * 1000, // 30 minutes — expensive computation
  });
}

/**
 * Fetch and manage profile badges.
 */
export function useIdentityHubBadges(userId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['identity-hub-badges', userId],
    queryFn: () => profileIdentityHubService.getBadges(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME,
  });

  const toggleDisplay = useMutation({
    mutationFn: ({ badgeId, isDisplayed }: { badgeId: string; isDisplayed: boolean }) =>
      profileIdentityHubService.toggleBadgeDisplay(userId!, badgeId, isDisplayed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity-hub-badges', userId] });
    },
  });

  const evaluateBadges = useMutation({
    mutationFn: () => profileIdentityHubService.evaluateBadges(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity-hub-badges', userId] });
    },
  });

  return { ...query, toggleDisplay, evaluateBadges };
}

/**
 * Generate DIA "What makes you unique" insight.
 */
export function useDIAInsight(userId: string | undefined) {
  const queryClient = useQueryClient();

  const refresh = useMutation({
    mutationFn: () => profileIdentityHubService.generateDIAInsight(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity-hub-profile'] });
    },
  });

  return { refresh };
}

/**
 * Manage onboarding state.
 */
export function useOnboardingHub(userId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['identity-hub-onboarding', userId],
    queryFn: () => profileIdentityHubService.getOnboardingState(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME,
  });

  const init = useMutation({
    mutationFn: () => profileIdentityHubService.initOnboarding(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity-hub-onboarding', userId] });
    },
  });

  const advance = useMutation({
    mutationFn: ({
      completedStep,
      nextStep,
      skipped,
    }: {
      completedStep: string;
      nextStep: string;
      skipped?: boolean;
    }) =>
      profileIdentityHubService.advanceOnboarding(userId!, completedStep, nextStep, skipped),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity-hub-onboarding', userId] });
    },
  });

  return { ...query, init, advance };
}
