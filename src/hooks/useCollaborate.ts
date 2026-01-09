import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { toast } from 'sonner';
import type { SpaceTemplate, CreateSpaceInput, SpaceTemplateRole, SpaceTemplateInitiative, Space, SpaceMember, SpaceRole, Initiative, SpaceTask, SpaceActivity } from '@/types/collaborate';

export function useSpaceTemplates() {
  return useQuery({
    queryKey: ['space-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('space_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      // Map the data to match our SpaceTemplate type - cast through unknown for Json fields
      return (data || []).map((t) => ({
        ...t,
        default_roles: (t.default_roles as unknown) as SpaceTemplateRole[] | null,
        default_initiatives: (t.default_initiatives as unknown) as SpaceTemplateInitiative[] | null,
        suggested_milestones: (t.suggested_milestones as unknown) as SpaceTemplate['suggested_milestones'],
      })) as SpaceTemplate[];
    },
  });
}

export function useCreateSpaceFromTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ templateId, input }: { templateId: string; input: CreateSpaceInput }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get template data
      const { data: template, error: templateError } = await supabase
        .from('space_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      // Create space with template - use supabaseClient for new columns not yet in types
      const { data: space, error: spaceError } = await supabaseClient
        .from('spaces')
        .insert({
          name: input.name,
          description: input.description || template.description,
          template_id: templateId,
          privacy_level: input.privacy_level || 'public',
          source_type: input.source_type || 'organic',
          source_id: input.source_id,
          created_by: user.id,
          status: 'active',
          visibility: input.privacy_level === 'private' ? 'invite_only' : 'public',
        })
        .select()
        .single();

      if (spaceError) throw spaceError;

      // Create default roles from template
      const defaultRoles = (template.default_roles as unknown) as SpaceTemplateRole[] | null;
      if (defaultRoles && defaultRoles.length > 0) {
        const roles = defaultRoles.map((role) => ({
          space_id: space.id,
          title: role.title,
          description: role.description || null,
          is_lead: role.is_lead || false,
          permissions: role.permissions || [],
        }));

        const { error: rolesError } = await supabase
          .from('space_roles')
          .insert(roles);

        if (rolesError) {
          console.error('Failed to create roles:', rolesError);
        }
      }

      // Create default initiatives from template
      const defaultInitiatives = (template.default_initiatives as unknown) as SpaceTemplateInitiative[] | null;
      if (defaultInitiatives && defaultInitiatives.length > 0) {
        const initiatives = defaultInitiatives.map((init) => ({
          space_id: space.id,
          title: init.title,
          description: init.description || null,
          status: 'active',
          creator_id: user.id,
        }));

        const { error: initError } = await supabase
          .from('initiatives')
          .insert(initiatives);

        if (initError) {
          console.error('Failed to create initiatives:', initError);
        }
      }

      return space;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-spaces'] });
      queryClient.invalidateQueries({ queryKey: ['public-spaces'] });
      toast.success('Space created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create space', { description: error.message });
    },
  });
}

export function useCreateSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSpaceInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Use supabaseClient for new columns not yet in generated types
      const { data: space, error } = await supabaseClient
        .from('spaces')
        .insert({
          name: input.name,
          description: input.description,
          privacy_level: input.privacy_level || 'public',
          source_type: input.source_type || 'organic',
          source_id: input.source_id,
          created_by: user.id,
          status: 'active',
          visibility: input.privacy_level === 'private' ? 'invite_only' : 'public',
        })
        .select()
        .single();

      if (error) throw error;
      return space;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-spaces'] });
      queryClient.invalidateQueries({ queryKey: ['public-spaces'] });
      toast.success('Space created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create space', { description: error.message });
    },
  });
}

// Get single space
export function useSpace(spaceId: string) {
  return useQuery({
    queryKey: ['space', spaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spaces')
        .select('*')
        .eq('id', spaceId)
        .single();

      if (error) throw error;
      return data as Space;
    },
    enabled: !!spaceId,
  });
}

// Get space members with user and role info
export function useSpaceMembers(spaceId: string) {
  return useQuery({
    queryKey: ['space-members', spaceId],
    queryFn: async () => {
      const { data: members, error } = await supabase
        .from('space_members')
        .select('*, role_info:space_roles(id, title, is_lead)')
        .eq('space_id', spaceId)
        .eq('status', 'active');

      if (error) throw error;

      // Fetch user profiles separately
      const userIds = members?.map(m => m.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return (members || []).map(m => ({
        ...m,
        user: profileMap.get(m.user_id),
      })) as unknown as SpaceMember[];
    },
    enabled: !!spaceId,
  });
}

// Get space roles
export function useSpaceRoles(spaceId: string) {
  return useQuery({
    queryKey: ['space-roles', spaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('space_roles')
        .select('*')
        .eq('space_id', spaceId)
        .order('order_index');

      if (error) throw error;
      return data as SpaceRole[];
    },
    enabled: !!spaceId,
  });
}

// Get space initiatives
export function useSpaceInitiatives(spaceId: string) {
  return useQuery({
    queryKey: ['space-initiatives', spaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('initiatives')
        .select('*')
        .eq('space_id', spaceId)
        .order('order_index');

      if (error) throw error;
      return data as Initiative[];
    },
    enabled: !!spaceId,
  });
}

// Get space tasks
export function useSpaceTasks(spaceId: string) {
  return useQuery({
    queryKey: ['space-tasks', spaceId],
    queryFn: async () => {
      const { data: tasks, error } = await supabase
        .from('space_tasks')
        .select('*')
        .eq('space_id', spaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch assignee profiles separately
      const assigneeIds = tasks?.filter(t => t.assignee_id).map(t => t.assignee_id!) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', assigneeIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return (tasks || []).map(t => ({
        ...t,
        assignee: t.assignee_id ? profileMap.get(t.assignee_id) : undefined,
      })) as unknown as SpaceTask[];
    },
    enabled: !!spaceId,
  });
}

// Get space activity log
export function useSpaceActivity(spaceId: string, limit = 20) {
  return useQuery({
    queryKey: ['space-activity', spaceId],
    queryFn: async () => {
      const { data: activities, error } = await supabase
        .from('space_activity_log')
        .select('*')
        .eq('space_id', spaceId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Fetch user profiles separately
      const userIds = activities?.map(a => a.user_id).filter(Boolean) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return (activities || []).map(a => ({
        ...a,
        user: a.user_id ? profileMap.get(a.user_id) : undefined,
      })) as unknown as SpaceActivity[];
    },
    enabled: !!spaceId,
  });
}
