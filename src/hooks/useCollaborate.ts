// src/hooks/useCollaborate.ts
// DNA COLLABORATE Phase 1: React Query Hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import * as collaborateService from '@/services/collaborateService';
import type {
  CreateSpaceInput,
  CreateInitiativeInput,
  CreateMilestoneInput,
  CreateTaskInput,
  SendNudgeInput,
  CreateRoleInput,
  SpaceFilters,
  TaskFilters,
  CollaborateSpace,
  Initiative,
  Milestone,
  CollaborateTask,
} from '@/types/collaborate';

// Query Keys
export const collaborateKeys = {
  all: ['collaborate'] as const,
  templates: () => [...collaborateKeys.all, 'templates'] as const,
  templatesByCategory: (category: string) => [...collaborateKeys.templates(), category] as const,
  spaces: () => [...collaborateKeys.all, 'spaces'] as const,
  space: (id: string) => [...collaborateKeys.spaces(), id] as const,
  spaceBySlug: (slug: string) => [...collaborateKeys.spaces(), 'slug', slug] as const,
  userSpaces: (userId: string) => [...collaborateKeys.spaces(), 'user', userId] as const,
  publicSpaces: (filters?: SpaceFilters) => [...collaborateKeys.spaces(), 'public', filters] as const,
  spaceStats: (spaceId: string) => [...collaborateKeys.space(spaceId), 'stats'] as const,
  members: (spaceId: string) => [...collaborateKeys.space(spaceId), 'members'] as const,
  membership: (spaceId: string, userId: string) => [...collaborateKeys.members(spaceId), userId] as const,
  roles: (spaceId: string) => [...collaborateKeys.space(spaceId), 'roles'] as const,
  initiatives: (spaceId: string) => [...collaborateKeys.space(spaceId), 'initiatives'] as const,
  initiative: (id: string) => [...collaborateKeys.all, 'initiative', id] as const,
  milestones: (initiativeId: string) => [...collaborateKeys.initiative(initiativeId), 'milestones'] as const,
  tasks: (spaceId: string, filters?: TaskFilters) => [...collaborateKeys.space(spaceId), 'tasks', filters] as const,
  userTasks: (userId: string) => [...collaborateKeys.all, 'userTasks', userId] as const,
  nudges: (userId: string) => [...collaborateKeys.all, 'nudges', userId] as const,
  activity: (spaceId: string) => [...collaborateKeys.space(spaceId), 'activity'] as const,
};

// ============================================
// TEMPLATE HOOKS
// ============================================

export function useSpaceTemplates() {
  return useQuery({
    queryKey: collaborateKeys.templates(),
    queryFn: collaborateService.getSpaceTemplates,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useSpaceTemplate(id: string) {
  return useQuery({
    queryKey: [...collaborateKeys.templates(), id],
    queryFn: () => collaborateService.getSpaceTemplate(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 30,
  });
}

export function useTemplatesByCategory(category: string) {
  return useQuery({
    queryKey: collaborateKeys.templatesByCategory(category),
    queryFn: () => collaborateService.getTemplatesByCategory(category),
    enabled: !!category,
    staleTime: 1000 * 60 * 30,
  });
}

// ============================================
// SPACE HOOKS
// ============================================

export function useSpace(id: string) {
  return useQuery({
    queryKey: collaborateKeys.space(id),
    queryFn: () => collaborateService.getSpace(id),
    enabled: !!id,
  });
}

export function useSpaceBySlug(slug: string) {
  return useQuery({
    queryKey: collaborateKeys.spaceBySlug(slug),
    queryFn: () => collaborateService.getSpaceBySlug(slug),
    enabled: !!slug,
  });
}

export function useUserSpaces() {
  const { user } = useAuth();
  return useQuery({
    queryKey: collaborateKeys.userSpaces(user?.id || ''),
    queryFn: () => collaborateService.getUserSpaces(user!.id),
    enabled: !!user?.id,
  });
}

export function usePublicSpaces(filters?: SpaceFilters) {
  return useQuery({
    queryKey: collaborateKeys.publicSpaces(filters),
    queryFn: () => collaborateService.getPublicSpaces(filters),
  });
}

export function useSpaceStats(spaceId: string) {
  return useQuery({
    queryKey: collaborateKeys.spaceStats(spaceId),
    queryFn: () => collaborateService.getSpaceStats(spaceId),
    enabled: !!spaceId,
  });
}

export function useCreateSpace() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (input: CreateSpaceInput) =>
      collaborateService.createSpace(input, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collaborateKeys.spaces() });
    },
  });
}

export function useCreateSpaceFromTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ templateId, input }: { templateId: string; input: Omit<CreateSpaceInput, 'template_id'> }) =>
      collaborateService.createSpaceFromTemplate(templateId, input, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collaborateKeys.spaces() });
    },
  });
}

export function useUpdateSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CollaborateSpace> }) =>
      collaborateService.updateSpace(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: collaborateKeys.space(data.id) });
      queryClient.invalidateQueries({ queryKey: collaborateKeys.spaces() });
    },
  });
}

// ============================================
// MEMBER HOOKS
// ============================================

export function useSpaceMembers(spaceId: string) {
  return useQuery({
    queryKey: collaborateKeys.members(spaceId),
    queryFn: () => collaborateService.getSpaceMembers(spaceId),
    enabled: !!spaceId,
  });
}

export function useUserMembership(spaceId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: collaborateKeys.membership(spaceId, user?.id || ''),
    queryFn: () => collaborateService.getUserMembership(spaceId, user!.id),
    enabled: !!spaceId && !!user?.id,
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ spaceId, userId, roleId }: { spaceId: string; userId: string; roleId?: string }) =>
      collaborateService.inviteMember(spaceId, userId, roleId, user?.id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: collaborateKeys.members(variables.spaceId) });
    },
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (spaceId: string) =>
      collaborateService.acceptInvite(spaceId, user!.id),
    onSuccess: (_, spaceId) => {
      queryClient.invalidateQueries({ queryKey: collaborateKeys.members(spaceId) });
      queryClient.invalidateQueries({ queryKey: collaborateKeys.userSpaces(user!.id) });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ spaceId, userId }: { spaceId: string; userId: string }) =>
      collaborateService.removeMember(spaceId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: collaborateKeys.members(variables.spaceId) });
    },
  });
}

// ============================================
// ROLE HOOKS
// ============================================

export function useSpaceRoles(spaceId: string) {
  return useQuery({
    queryKey: collaborateKeys.roles(spaceId),
    queryFn: () => collaborateService.getSpaceRoles(spaceId),
    enabled: !!spaceId,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRoleInput) =>
      collaborateService.createSpaceRole(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: collaborateKeys.roles(data.space_id) });
    },
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ spaceId, userId, roleId }: { spaceId: string; userId: string; roleId: string }) =>
      collaborateService.assignRole(spaceId, userId, roleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: collaborateKeys.members(variables.spaceId) });
    },
  });
}

// ============================================
// INITIATIVE HOOKS
// ============================================

export function useSpaceInitiatives(spaceId: string) {
  return useQuery({
    queryKey: collaborateKeys.initiatives(spaceId),
    queryFn: () => collaborateService.getSpaceInitiatives(spaceId),
    enabled: !!spaceId,
  });
}

export function useInitiative(id: string) {
  return useQuery({
    queryKey: collaborateKeys.initiative(id),
    queryFn: () => collaborateService.getInitiative(id),
    enabled: !!id,
  });
}

export function useCreateInitiative() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (input: CreateInitiativeInput) =>
      collaborateService.createInitiative(input, user!.id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: collaborateKeys.initiatives(data.space_id) });
      queryClient.invalidateQueries({ queryKey: collaborateKeys.spaceStats(data.space_id) });
    },
  });
}

export function useUpdateInitiative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Initiative> }) =>
      collaborateService.updateInitiative(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: collaborateKeys.initiative(data.id) });
      queryClient.invalidateQueries({ queryKey: collaborateKeys.initiatives(data.space_id) });
    },
  });
}

export function useCompleteInitiative() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (id: string) => collaborateService.completeInitiative(id, user!.id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: collaborateKeys.initiative(data.id) });
      queryClient.invalidateQueries({ queryKey: collaborateKeys.initiatives(data.space_id) });
      queryClient.invalidateQueries({ queryKey: collaborateKeys.spaceStats(data.space_id) });
    },
  });
}

// ============================================
// MILESTONE HOOKS
// ============================================

export function useInitiativeMilestones(initiativeId: string) {
  return useQuery({
    queryKey: collaborateKeys.milestones(initiativeId),
    queryFn: () => collaborateService.getInitiativeMilestones(initiativeId),
    enabled: !!initiativeId,
  });
}

export function useCreateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMilestoneInput) =>
      collaborateService.createMilestone(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: collaborateKeys.initiative(data.initiative_id) });
      queryClient.invalidateQueries({ queryKey: collaborateKeys.milestones(data.initiative_id) });
    },
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Milestone> }) =>
      collaborateService.updateMilestone(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: collaborateKeys.initiative(data.initiative_id) });
      queryClient.invalidateQueries({ queryKey: collaborateKeys.milestones(data.initiative_id) });
    },
  });
}

export function useCompleteMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => collaborateService.completeMilestone(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: collaborateKeys.initiative(data.initiative_id) });
      queryClient.invalidateQueries({ queryKey: collaborateKeys.milestones(data.initiative_id) });
    },
  });
}

// ============================================
// TASK HOOKS
// ============================================

export function useSpaceTasks(spaceId: string, filters?: TaskFilters) {
  return useQuery({
    queryKey: collaborateKeys.tasks(spaceId, filters),
    queryFn: () => collaborateService.getSpaceTasks(spaceId, filters),
    enabled: !!spaceId,
  });
}

export function useUserTasks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: collaborateKeys.userTasks(user?.id || ''),
    queryFn: () => collaborateService.getUserTasks(user!.id),
    enabled: !!user?.id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (input: CreateTaskInput) =>
      collaborateService.createTask(input, user!.id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: collaborateKeys.tasks(data.space_id) });
      queryClient.invalidateQueries({ queryKey: collaborateKeys.spaceStats(data.space_id) });
      if (data.initiative_id) {
        queryClient.invalidateQueries({ queryKey: collaborateKeys.initiative(data.initiative_id) });
      }
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CollaborateTask> }) =>
      collaborateService.updateTask(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: collaborateKeys.tasks(data.space_id) });
      queryClient.invalidateQueries({ queryKey: collaborateKeys.spaceStats(data.space_id) });
      queryClient.invalidateQueries({ queryKey: collaborateKeys.userTasks(user?.id || '') });
      if (data.initiative_id) {
        queryClient.invalidateQueries({ queryKey: collaborateKeys.initiative(data.initiative_id) });
      }
    },
  });
}

export function useAssignTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
      collaborateService.assignTask(taskId, userId, user!.id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: collaborateKeys.tasks(data.space_id) });
      queryClient.invalidateQueries({ queryKey: collaborateKeys.userTasks(data.assigned_to || '') });
    },
  });
}

// ============================================
// NUDGE HOOKS
// ============================================

export function useUserNudges() {
  const { user } = useAuth();
  return useQuery({
    queryKey: collaborateKeys.nudges(user?.id || ''),
    queryFn: () => collaborateService.getUserNudges(user!.id),
    enabled: !!user?.id,
  });
}

export function useSendNudge() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (input: SendNudgeInput) =>
      collaborateService.sendNudge(input, user!.id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: collaborateKeys.nudges(data.target_user_id) });
      if (data.task_id) {
        queryClient.invalidateQueries({ queryKey: collaborateKeys.tasks(data.space_id) });
      }
    },
  });
}

export function useAcknowledgeNudge() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (nudgeId: string) => collaborateService.acknowledgeNudge(nudgeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collaborateKeys.nudges(user?.id || '') });
    },
  });
}

export function useCanNudge(spaceId: string, targetUserId: string, taskId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['canNudge', spaceId, user?.id, targetUserId, taskId],
    queryFn: () => collaborateService.canUserNudge(spaceId, user!.id, targetUserId, taskId),
    enabled: !!spaceId && !!user?.id && !!targetUserId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================
// ACTIVITY HOOKS
// ============================================

export function useSpaceActivity(spaceId: string, limit = 20) {
  return useQuery({
    queryKey: collaborateKeys.activity(spaceId),
    queryFn: () => collaborateService.getSpaceActivity(spaceId, limit),
    enabled: !!spaceId,
  });
}

// ============================================
// OVERDUE TASKS HOOK
// ============================================

export function useOverdueTasks(spaceId?: string) {
  return useQuery({
    queryKey: ['overdueTasks', spaceId],
    queryFn: () => collaborateService.getOverdueTasks(spaceId),
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}
