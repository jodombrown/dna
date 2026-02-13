/**
 * DNA Post Composer — Core Service
 *
 * Handles all Composer operations: submission routing, draft management,
 * and attribution tracking across all Five C's.
 */

import { supabase } from '@/integrations/supabase/client';
import {
  ComposerMode,
  CModule,
  MODE_TO_PRIMARY_C,
  type ComposerBaseFields,
  type ComposerSubmission,
  type ComposerAttribution,
  type PostModeFields,
  type StoryModeFields,
  type EventModeFields,
  type SpaceModeFields,
  type OpportunityModeFields,
  type CrossReference,
} from '@/types/composer';

interface AttributionInsert {
  content_type: string;
  content_id: string;
  created_by: string;
  created_via: string;
  primary_c: string;
  secondary_cs: string[];
  composer_mode: string;
  dia_suggested_mode: boolean;
  dia_interactions: number;
  cross_references: CrossReference[];
}

export const composerService = {
  // ============================================
  // SUBMISSION — Routes to correct table
  // ============================================

  async submit(
    submission: ComposerSubmission
  ): Promise<{ id: string; type: ComposerMode }> {
    const handlers: Record<ComposerMode, () => Promise<string>> = {
      [ComposerMode.POST]: () =>
        this.submitPost(
          submission.base,
          submission.modeFields as PostModeFields
        ),
      [ComposerMode.STORY]: () =>
        this.submitStory(
          submission.base,
          submission.modeFields as StoryModeFields
        ),
      [ComposerMode.EVENT]: () =>
        this.submitEvent(
          submission.base,
          submission.modeFields as EventModeFields
        ),
      [ComposerMode.SPACE]: () =>
        this.submitSpace(
          submission.base,
          submission.modeFields as SpaceModeFields
        ),
      [ComposerMode.OPPORTUNITY]: () =>
        this.submitOpportunity(
          submission.base,
          submission.modeFields as OpportunityModeFields
        ),
    };

    const contentId = await handlers[submission.mode]();

    // Create attribution record
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (userId) {
      await this.createAttribution({
        content_type: submission.mode,
        content_id: contentId,
        created_by: userId,
        created_via: 'post_composer',
        primary_c: submission.attribution.primaryC,
        secondary_cs: submission.attribution.secondaryCs,
        composer_mode: submission.attribution.composerMode,
        dia_suggested_mode: submission.attribution.diaSuggestedMode,
        dia_interactions: submission.attribution.diaInteractions,
        cross_references: submission.attribution.crossReferences,
      });
    }

    // Clear draft for this mode
    await this.deleteDraft(submission.mode);

    return { id: contentId, type: submission.mode };
  },

  // ============================================
  // DRAFT MANAGEMENT
  // ============================================

  async saveDraft(
    mode: ComposerMode,
    baseFields: ComposerBaseFields,
    modeFields: Record<string, unknown>
  ): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return;

    const { error } = await (supabase as any).from('composer_drafts').upsert(
      {
        user_id: userId,
        mode,
        base_fields: baseFields,
        mode_fields: modeFields,
        last_saved_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,mode',
      }
    );

    if (error) throw error;
  },

  async loadDraft(
    mode: ComposerMode
  ): Promise<{
    baseFields: ComposerBaseFields;
    modeFields: Record<string, unknown>;
  } | null> {
    const { data, error } = await (supabase as any)
      .from('composer_drafts')
      .select('base_fields, mode_fields')
      .eq('mode', mode)
      .single();

    if (error || !data) return null;

    const record = data as Record<string, unknown>;
    return {
      baseFields: record.base_fields as ComposerBaseFields,
      modeFields: record.mode_fields as Record<string, unknown>,
    };
  },

  async deleteDraft(mode: ComposerMode): Promise<void> {
    await (supabase as any)
      .from('composer_drafts')
      .delete()
      .eq('mode', mode);
  },

  // ============================================
  // ATTRIBUTION
  // ============================================

  async createAttribution(attribution: AttributionInsert): Promise<void> {
    const { error } = await (supabase as any)
      .from('content_attribution')
      .insert({
        content_type: attribution.content_type,
        content_id: attribution.content_id,
        created_by: attribution.created_by,
        created_via: attribution.created_via,
        primary_c: attribution.primary_c,
        secondary_cs: attribution.secondary_cs,
        composer_mode: attribution.composer_mode,
        dia_suggested_mode: attribution.dia_suggested_mode,
        dia_interactions: attribution.dia_interactions,
        cross_references: attribution.cross_references,
      });

    if (error) {
      console.warn('Failed to create attribution record:', error);
    }
  },

  // ============================================
  // SECONDARY C-MODULE DETECTION
  // ============================================

  detectSecondaryCModules(
    mode: ComposerMode,
    base: ComposerBaseFields,
    modeFields: Record<string, unknown>
  ): CModule[] {
    const secondaryCs: CModule[] = [];
    const primaryC = MODE_TO_PRIMARY_C[mode];

    // If posting in a space context, add COLLABORATE
    if (base.audienceTargetId && primaryC !== CModule.COLLABORATE) {
      secondaryCs.push(CModule.COLLABORATE);
    }

    // If event has a related space, add COLLABORATE
    if (mode === ComposerMode.EVENT && modeFields.relatedSpaceId) {
      secondaryCs.push(CModule.COLLABORATE);
    }

    // If opportunity has a related space, add COLLABORATE
    if (mode === ComposerMode.OPPORTUNITY && modeFields.relatedSpaceId) {
      secondaryCs.push(CModule.COLLABORATE);
    }

    // If story has an event CTA, add CONVENE
    if (mode === ComposerMode.STORY) {
      const storyFields = modeFields as Partial<StoryModeFields>;
      if (storyFields.callToAction?.type === 'attend_event') {
        secondaryCs.push(CModule.CONVENE);
      }
      if (storyFields.callToAction?.type === 'join_space') {
        secondaryCs.push(CModule.COLLABORATE);
      }
      if (storyFields.callToAction?.type === 'view_opportunity') {
        secondaryCs.push(CModule.CONTRIBUTE);
      }
    }

    // If there are mentions, add CONNECT
    if (base.mentions.length > 0 && primaryC !== CModule.CONNECT) {
      secondaryCs.push(CModule.CONNECT);
    }

    return [...new Set(secondaryCs)];
  },

  // ============================================
  // MODE-SPECIFIC SUBMISSION HANDLERS
  // ============================================

  async submitPost(
    base: ComposerBaseFields,
    fields: PostModeFields
  ): Promise<string> {
    const { data, error } = await (supabase as any)
      .from('posts')
      .insert({
        content: base.body,
        image_url: base.media[0]?.url ?? null,
        privacy_level: base.audience,
        context: base.context ?? null,
        composer_mode: 'post',
      })
      .select('id')
      .single();

    if (error || !data) throw error || new Error('Failed to create post');
    return data.id;
  },

  async submitStory(
    base: ComposerBaseFields,
    fields: StoryModeFields
  ): Promise<string> {
    const { data, error } = await (supabase as any)
      .from('posts')
      .insert({
        content: base.body,
        title: fields.title,
        subtitle: fields.subtitle ?? null,
        image_url: fields.coverImage?.url ?? base.media[0]?.url ?? null,
        post_type: 'story',
        privacy_level: base.audience,
        composer_mode: 'story',
      })
      .select('id')
      .single();

    if (error || !data) throw error || new Error('Failed to create story');
    return data.id;
  },

  async submitEvent(
    base: ComposerBaseFields,
    fields: EventModeFields
  ): Promise<string> {
    const { data: authData } = await supabase.auth.getSession();

    const eventPayload = {
      title: fields.title,
      description: base.body,
      event_type: 'meetup',
      format: fields.eventType,
      start_time: fields.startDateTime.toISOString(),
      end_time: fields.endDateTime.toISOString(),
      timezone: fields.timezone,
      timezone_displays: fields.timezoneDisplay,
      location_name: fields.physicalLocation?.venueName ?? fields.physicalLocation?.address,
      location_city: fields.physicalLocation?.city,
      location_country: fields.physicalLocation?.country,
      location_lat: fields.physicalLocation?.coordinates?.lat,
      location_lng: fields.physicalLocation?.coordinates?.lng,
      meeting_url: fields.virtualLink,
      max_attendees: fields.capacity,
      co_hosts: fields.coHosts,
      related_space_id: fields.relatedSpaceId,
      rsvp_questions: fields.rsvpQuestions ?? [],
      cover_image_url: fields.coverImage?.url ?? base.media[0]?.url ?? null,
      is_public: base.audience === 'public',
      requires_approval: false,
      allow_guests: true,
      composer_mode: 'event',
    };

    const response = await supabase.functions.invoke('create-event', {
      body: eventPayload,
      headers: {
        Authorization: `Bearer ${authData.session?.access_token}`,
      },
    });

    if (response.error) {
      throw new Error('Failed to create event');
    }

    if (response.data && !response.data.success) {
      throw new Error(response.data.error || 'Failed to create event');
    }

    return response.data?.event_id ?? response.data?.id ?? '';
  },

  async submitSpace(
    base: ComposerBaseFields,
    fields: SpaceModeFields
  ): Promise<string> {
    const { data, error } = await (supabase as any)
      .from('collaboration_spaces')
      .insert({
        title: fields.name,
        description: fields.description || base.body,
        image_url: fields.coverImage?.url ?? base.media[0]?.url ?? null,
        visibility: fields.visibility === 'open' ? 'public' : 'private',
        space_type: fields.spaceType,
        roles_needed: fields.rolesNeeded,
        initial_tasks: fields.initialTasks ?? [],
        regional_focus: fields.regionalFocus,
        related_event_id: fields.relatedEventId,
        composer_mode: 'space',
      })
      .select('id')
      .single();

    if (error || !data) throw error || new Error('Failed to create space');
    return data.id;
  },

  async submitOpportunity(
    base: ComposerBaseFields,
    fields: OpportunityModeFields
  ): Promise<string> {
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { data, error } = await (supabase as any)
      .from('opportunities')
      .insert({
        created_by: userId,
        title: fields.title,
        description: base.body,
        direction: fields.direction,
        category: fields.category,
        compensation_type: fields.compensation,
        compensation_details: fields.compensationDetails ?? {},
        location_relevance: fields.locationRelevance,
        specific_region: fields.specificRegion,
        specific_country: fields.specificCountry,
        duration: fields.duration,
        deadline: fields.deadline?.toISOString(),
        requirements: fields.requirements,
        related_space_id: fields.relatedSpaceId,
        budget_range: fields.budgetRange ?? null,
        tags: base.tags.map((t) => t.label),
        audience: base.audience,
        media: base.media,
      })
      .select('id')
      .single();

    if (error || !data) throw error || new Error('Failed to create opportunity');
    return (data as any).id;
  },
};
