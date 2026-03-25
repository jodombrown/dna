import { supabase } from '@/integrations/supabase/client';
import type { OpportunityApplication, ApplicationStatus, ContributionFulfillment, ContributionAcknowledgment, ContributionHistoryItem } from '@/types/applicationTypes';

export const contributeApplicationService = {
  async getApplicationsForOpportunity(
    opportunityId: string,
    statusFilter?: string,
    cursor?: string,
    limit = 20
  ): Promise<OpportunityApplication[]> {
    const { data, error } = await supabase.rpc('get_applications_for_opportunity', {
      p_opportunity_id: opportunityId,
      p_status_filter: statusFilter || null,
      p_cursor: cursor || null,
      p_limit: limit,
    });
    if (error) throw error;
    return (data || []) as unknown as OpportunityApplication[];
  },

  async updateApplicationStatus(
    applicationId: string,
    newStatus: ApplicationStatus,
    posterNotes?: string
  ): Promise<string | null> {
    const { data, error } = await supabase.rpc('update_application_status', {
      p_application_id: applicationId,
      p_new_status: newStatus,
      p_poster_notes: posterNotes || null,
    });
    if (error) throw error;
    return data as string | null;
  },

  async getApplicationCount(opportunityId: string): Promise<number> {
    const { count, error } = await supabase
      .from('opportunity_applications')
      .select('id', { count: 'exact', head: true })
      .eq('opportunity_id', opportunityId)
      .neq('status', 'withdrawn');
    if (error) throw error;
    return count || 0;
  },

  async getMyApplications(cursor?: string, limit = 20) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
      .from('opportunity_applications')
      .select(`
        *,
        opportunity:opportunities(id, title, created_by, type, status,
          poster:profiles!opportunities_created_by_fkey(id, full_name, avatar_url, username)
        )
      `)
      .eq('applicant_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async withdrawApplication(applicationId: string) {
    const { error } = await supabase.rpc('update_application_status', {
      p_application_id: applicationId,
      p_new_status: 'withdrawn',
      p_poster_notes: null,
    });
    // Fallback: direct update if RPC fails (applicant can't call poster-only RPC)
    if (error) {
      const { error: directError } = await supabase
        .from('opportunity_applications')
        .update({ status: 'withdrawn', withdrawn_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', applicationId);
      if (directError) throw directError;
    }
  },

  async getFulfillment(fulfillmentId: string): Promise<ContributionFulfillment | null> {
    const { data, error } = await supabase
      .from('contribution_fulfillments')
      .select('*')
      .eq('id', fulfillmentId)
      .maybeSingle();
    if (error) throw error;
    return data as ContributionFulfillment | null;
  },

  async getFulfillmentForOpportunity(opportunityId: string): Promise<ContributionFulfillment | null> {
    const { data, error } = await supabase
      .from('contribution_fulfillments')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .maybeSingle();
    if (error) throw error;
    return data as ContributionFulfillment | null;
  },

  async submitFulfillment(fulfillmentId: string, notes: string, attachments: unknown[] = []) {
    const { error } = await supabase.rpc('submit_fulfillment', {
      p_fulfillment_id: fulfillmentId,
      p_notes: notes,
      p_attachments: attachments as never,
    });
    if (error) throw error;
  },

  async respondToFulfillment(fulfillmentId: string, action: 'complete' | 'request_revision', notes?: string) {
    const { error } = await supabase.rpc('respond_to_fulfillment', {
      p_fulfillment_id: fulfillmentId,
      p_action: action,
      p_notes: notes || null,
    });
    if (error) throw error;
  },

  async createAcknowledgment(
    fulfillmentId: string,
    toProfileId: string,
    message: string,
    rating?: number,
    isPublic = true
  ): Promise<string> {
    const { data, error } = await supabase.rpc('create_acknowledgment', {
      p_fulfillment_id: fulfillmentId,
      p_to_profile_id: toProfileId,
      p_message: message,
      p_rating: rating || null,
      p_is_public: isPublic,
    });
    if (error) throw error;
    return data as string;
  },

  async getProfileAcknowledgments(
    profileId: string,
    cursor?: string,
    limit = 10
  ): Promise<ContributionAcknowledgment[]> {
    const { data, error } = await supabase.rpc('get_profile_acknowledgments', {
      p_profile_id: profileId,
      p_cursor: cursor || null,
      p_limit: limit,
    });
    if (error) throw error;
    return (data || []) as unknown as ContributionAcknowledgment[];
  },

  async getProfileContributionHistory(
    profileId: string,
    type: 'all' | 'given' | 'received' = 'all',
    cursor?: string,
    limit = 10
  ): Promise<ContributionHistoryItem[]> {
    const { data, error } = await supabase.rpc('get_profile_contribution_history', {
      p_profile_id: profileId,
      p_type: type,
      p_cursor: cursor || null,
      p_limit: limit,
    });
    if (error) throw error;
    return (data || []) as unknown as ContributionHistoryItem[];
  },

  async searchOpportunities(
    query?: string,
    filters: Record<string, string> = {},
    cursor?: string,
    limit = 20
  ) {
    const { data, error } = await supabase.rpc('search_opportunities', {
      p_query: query || null,
      p_filters: filters as never,
      p_cursor: cursor || null,
      p_limit: limit,
    });
    if (error) throw error;
    return data || [];
  },
};
