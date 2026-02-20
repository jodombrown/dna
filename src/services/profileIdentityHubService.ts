/**
 * DNA | Profile & Identity Hub — Service Layer
 *
 * Core service for all profile operations across the four identity layers:
 * - Layer 1: Professional Identity (CRUD)
 * - Layer 2: Diaspora Heritage (management)
 * - Layer 3: Five C's Activity (computation)
 * - Layer 4: Impact Score, Badges, DIA Insight (generation)
 *
 * Also handles profile completion, view tracking, and badge evaluation.
 */

import { supabase as _supabase } from '@/integrations/supabase/client';

// Bypass: provisional tables/columns not yet in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = _supabase as any;
import type {
  IdentityHubProfile,
  ProfileViewPayload,
  ProfileViewContext,
  ProfileSection,
  ProfileVisibility,
  ProfileSkill,
  SkillCategory,
  DiasporaHeritage,
  FiveCActivitySummary,
  FiveCImpactScore,
  ProfileBadge,
  BadgeType,
  CompletionChecklistItem,
  CModule,
  ParticipantPreview,
  PROFILE_COMPLETION_WEIGHTS,
} from '@/types/profileIdentityHub';

// ============================================================
// PROFILE IDENTITY HUB SERVICE
// ============================================================

export const profileIdentityHubService = {

  // ============================================
  // FETCH PROFILE
  // ============================================

  async getProfile(
    profileId: string,
    viewerId: string | null
  ): Promise<ProfileViewPayload> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (error) throw error;

    const viewContext = viewerId
      ? await this.determineViewContext(profileId, viewerId)
      : 'not_connected' as ProfileViewContext;

    const visibleSections = this.computeVisibleSections(
      profile.hub_visibility ?? {},
      viewContext
    );

    const viewerRelationship = viewerId
      ? await this.getViewerRelationship(profileId, viewerId)
      : {
          isConnected: false,
          isPending: false,
          mutualConnectionCount: 0,
          mutualConnections: [] as ParticipantPreview[],
          sharedSpaces: [],
          sharedEvents: [],
          relationshipStrength: null,
        };

    const diaMatchInfo = viewerId && viewerId !== profileId && !viewerRelationship.isConnected
      ? await this.getDIAMatchInfo(profileId, viewerId)
      : null;

    if (viewerId && viewerId !== profileId) {
      await this.recordProfileView(profileId, viewerId, viewContext);
    }

    return {
      profile: this.mapToIdentityHubProfile(profile),
      viewContext,
      viewerRelationship,
      diaMatchInfo,
      visibleSections,
    };
  },

  // ============================================
  // UPDATE PROFILE
  // ============================================

  async updateProfile(
    userId: string,
    updates: Partial<IdentityHubProfile>
  ): Promise<IdentityHubProfile> {
    // Strip computed fields that should not be directly written
    const {
      activitySummary,
      impactScore,
      badges,
      completionPercentage,
      completionChecklist,
      diaInsight,
      profileViews,
      ...safeUpdates
    } = updates;

    const dbUpdates: Record<string, unknown> = {};

    if (safeUpdates.displayName !== undefined) dbUpdates.full_name = safeUpdates.displayName;
    if (safeUpdates.firstName !== undefined) dbUpdates.first_name = safeUpdates.firstName;
    if (safeUpdates.lastName !== undefined) dbUpdates.last_name = safeUpdates.lastName;
    if (safeUpdates.headline !== undefined) dbUpdates.headline = safeUpdates.headline;
    if (safeUpdates.bio !== undefined) dbUpdates.bio = safeUpdates.bio;
    if (safeUpdates.avatarUrl !== undefined) dbUpdates.avatar_url = safeUpdates.avatarUrl;
    if (safeUpdates.coverImageUrl !== undefined) dbUpdates.banner_url = safeUpdates.coverImageUrl;
    if (safeUpdates.pronouns !== undefined) dbUpdates.pronouns = safeUpdates.pronouns;
    if (safeUpdates.industry !== undefined) dbUpdates.industry = safeUpdates.industry;
    if (safeUpdates.heritage !== undefined) dbUpdates.heritage = safeUpdates.heritage;
    if (safeUpdates.visibility !== undefined) dbUpdates.hub_visibility = safeUpdates.visibility;
    if (safeUpdates.location !== undefined) {
      dbUpdates.location = safeUpdates.location.displayFormat;
      dbUpdates.current_country = safeUpdates.location.country;
      dbUpdates.current_city = safeUpdates.location.city;
    }
    if (safeUpdates.socialLinks !== undefined) {
      dbUpdates.social_links = safeUpdates.socialLinks;
    }
    if (safeUpdates.experience !== undefined) {
      dbUpdates.experience = safeUpdates.experience;
    }
    if (safeUpdates.education !== undefined) {
      dbUpdates.education = safeUpdates.education;
    }

    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Recompute completion
    await this.recomputeCompletion(userId);

    // Notify DIA of profile changes for re-matching
    await this.notifyDIAProfileUpdate(userId, Object.keys(safeUpdates));

    return this.mapToIdentityHubProfile(data);
  },

  // ============================================
  // SKILLS MANAGEMENT
  // ============================================

  async getSkills(userId: string): Promise<ProfileSkill[]> {
    const { data, error } = await supabase
      .from('profile_skills')
      .select('*')
      .eq('user_id', userId)
      .order('is_top_skill', { ascending: false })
      .order('endorsement_count', { ascending: false });

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      category: row.category as SkillCategory,
      endorsementCount: row.endorsement_count ?? 0,
      endorsedBy: row.endorsed_by ?? [],
      isTopSkill: row.is_top_skill ?? false,
      diaStrength: row.dia_strength ?? 0,
      source: (row.source ?? 'user_added') as ProfileSkill['source'],
    }));
  },

  async addSkill(userId: string, skillName: string, category: SkillCategory): Promise<ProfileSkill> {
    const { data, error } = await supabase
      .from('profile_skills')
      .insert({
        user_id: userId,
        name: skillName,
        category,
        endorsement_count: 0,
        endorsed_by: [],
        is_top_skill: false,
        dia_strength: 0,
        source: 'user_added',
      })
      .select()
      .single();

    if (error) throw error;

    // Trigger DIA re-matching
    await supabase.rpc('trigger_dia_rematch', { p_user_id: userId, p_reason: 'skill_added' });

    return {
      id: data.id,
      name: data.name,
      category: data.category as SkillCategory,
      endorsementCount: data.endorsement_count ?? 0,
      endorsedBy: data.endorsed_by ?? [],
      isTopSkill: data.is_top_skill ?? false,
      diaStrength: data.dia_strength ?? 0,
      source: (data.source ?? 'user_added') as ProfileSkill['source'],
    };
  },

  async removeSkill(userId: string, skillId: string): Promise<void> {
    const { error } = await supabase
      .from('profile_skills')
      .delete()
      .eq('id', skillId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async toggleTopSkill(userId: string, skillId: string, isTopSkill: boolean): Promise<void> {
    const { error } = await supabase
      .from('profile_skills')
      .update({ is_top_skill: isTopSkill })
      .eq('id', skillId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async endorseSkill(skillId: string, endorserId: string, skillOwnerId: string): Promise<void> {
    // Verify endorser is connected to skill owner
    const isConnected = await this.verifyConnection(skillOwnerId, endorserId);
    if (!isConnected) throw new Error('Must be connected to endorse skills');

    await supabase.rpc('endorse_skill', {
      p_skill_id: skillId,
      p_endorser_id: endorserId,
    });
  },

  // ============================================
  // INTERESTS MANAGEMENT
  // ============================================

  async getInterests(userId: string) {
    const { data, error } = await supabase
      .from('profile_interests')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addInterest(userId: string, name: string, category: string) {
    const { data, error } = await supabase
      .from('profile_interests')
      .insert({ user_id: userId, name, category })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeInterest(userId: string, interestId: string) {
    const { error } = await supabase
      .from('profile_interests')
      .delete()
      .eq('id', interestId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // ============================================
  // HERITAGE MANAGEMENT
  // ============================================

  async updateHeritage(userId: string, heritage: DiasporaHeritage): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        heritage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    // DIA re-matching (heritage affects diaspora alignment score)
    await supabase.rpc('trigger_dia_rematch', { p_user_id: userId, p_reason: 'heritage_updated' });
  },

  // ============================================
  // FIVE C's ACTIVITY SUMMARY
  // ============================================

  async computeActivitySummary(userId: string): Promise<FiveCActivitySummary> {
    const [connect, convene, collaborate, contribute, convey] = await Promise.all([
      this.computeConnectActivity(userId),
      this.computeConveneActivity(userId),
      this.computeCollaborateActivity(userId),
      this.computeContributeActivity(userId),
      this.computeConveyActivity(userId),
    ]);

    const summary: FiveCActivitySummary = { connect, convene, collaborate, contribute, convey };

    // Cache in profile
    await supabase
      .from('profiles')
      .update({ activity_summary: summary })
      .eq('id', userId);

    return summary;
  },

  async computeConnectActivity(userId: string) {
    const { count: connectionCount } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
      .eq('status', 'accepted');

    const { data: countryData } = await supabase.rpc('count_connection_countries', { p_user_id: userId });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: recentCount } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
      .eq('status', 'accepted')
      .gte('connected_at', thirtyDaysAgo);

    return {
      connectionCount: connectionCount ?? 0,
      countrySpan: (countryData as number) ?? 0,
      recentConnectionCount: recentCount ?? 0,
      mutualConnectionsWithViewer: 0,
    };
  },

  async computeConveneActivity(userId: string) {
    const { count: eventsHosted } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', userId);

    const { count: eventsAttended } = await supabase
      .from('event_attendees')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: upcomingEvents } = await supabase
      .from('event_attendees')
      .select('events!inner(*)', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('events.start_time', new Date().toISOString());

    return {
      eventsHosted: eventsHosted ?? 0,
      eventsAttended: eventsAttended ?? 0,
      upcomingEvents: upcomingEvents ?? 0,
      totalAttendees: 0,
    };
  },

  async computeCollaborateActivity(userId: string) {
    const { count: spacesActive } = await supabase
      .from('space_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: spacesLed } = await supabase
      .from('spaces')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', userId);

    return {
      spacesActive: spacesActive ?? 0,
      spacesLed: spacesLed ?? 0,
      tasksCompleted: 0,
      collaboratorsCount: 0,
    };
  },

  async computeContributeActivity(userId: string) {
    const { count: opportunitiesPosted } = await supabase
      .from('opportunities')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', userId);

    return {
      opportunitiesPosted: opportunitiesPosted ?? 0,
      opportunitiesFulfilled: 0,
      offersActive: 0,
      needsActive: 0,
    };
  },

  async computeConveyActivity(userId: string) {
    const { count: storiesPublished } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'published');

    const { data: followers } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
      .eq('status', 'accepted');

    return {
      storiesPublished: storiesPublished ?? 0,
      totalEngagement: 0,
      followerCount: followers?.length ?? 0,
      avgEngagementRate: 0,
    };
  },

  // ============================================
  // FIVE C's IMPACT SCORE (DIA-generated)
  // ============================================

  async computeImpactScore(userId: string): Promise<FiveCImpactScore> {
    const activity = await this.computeActivitySummary(userId);

    const connect = this.scoreConnect(activity.connect);
    const convene = this.scoreConvene(activity.convene);
    const collaborate = this.scoreCollaborate(activity.collaborate);
    const contribute = this.scoreContribute(activity.contribute);
    const convey = this.scoreConvey(activity.convey);

    const overall = Math.round((connect + convene + collaborate + contribute + convey) / 5);

    const scores: Record<string, number> = { connect, convene, collaborate, contribute, convey };
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const strongestC = sorted[0][0] as CModule;
    const growthOpportunityC = sorted[sorted.length - 1][0] as CModule;

    const previousScore = await this.getPreviousImpactScore(userId);
    const trend = overall > (previousScore ?? 0) + 5
      ? 'rising' as const
      : overall < (previousScore ?? 0) - 5
        ? 'declining' as const
        : 'stable' as const;

    const impactScore: FiveCImpactScore = {
      overall,
      connect,
      convene,
      collaborate,
      contribute,
      convey,
      lastComputedAt: new Date(),
      trend,
      percentileRank: 50, // Default; computed via batch job
      strongestC,
      growthOpportunityC,
    };

    await supabase
      .from('profiles')
      .update({ impact_score: impactScore })
      .eq('id', userId);

    return impactScore;
  },

  scoreConnect(data: FiveCActivitySummary['connect']): number {
    let score = 0;
    score += Math.min(data.connectionCount, 100) * 0.4;
    score += Math.min(data.countrySpan, 20) * 1.5;
    score += Math.min(data.recentConnectionCount, 10) * 3;
    return Math.min(Math.round(score), 100);
  },

  scoreConvene(data: FiveCActivitySummary['convene']): number {
    let score = 0;
    score += Math.min(data.eventsHosted, 10) * 5;
    score += Math.min(data.eventsAttended, 20) * 1.5;
    score += Math.min(data.upcomingEvents, 5) * 4;
    return Math.min(Math.round(score), 100);
  },

  scoreCollaborate(data: FiveCActivitySummary['collaborate']): number {
    let score = 0;
    score += Math.min(data.spacesLed, 5) * 8;
    score += Math.min(data.spacesActive, 10) * 3;
    score += Math.min(data.tasksCompleted, 30) * 1;
    return Math.min(Math.round(score), 100);
  },

  scoreContribute(data: FiveCActivitySummary['contribute']): number {
    let score = 0;
    score += Math.min(data.opportunitiesPosted, 10) * 4;
    score += Math.min(data.opportunitiesFulfilled, 10) * 5;
    score += (data.offersActive + data.needsActive > 0 ? 10 : 0);
    return Math.min(Math.round(score), 100);
  },

  scoreConvey(data: FiveCActivitySummary['convey']): number {
    let score = 0;
    score += Math.min(data.storiesPublished, 10) * 4;
    score += Math.min(data.followerCount, 50) * 0.6;
    score += Math.min(data.avgEngagementRate * 100, 30);
    return Math.min(Math.round(score), 100);
  },

  // ============================================
  // PROFILE COMPLETION
  // ============================================

  async recomputeCompletion(userId: string): Promise<number> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const weights: Record<ProfileSection, number> = {
      avatar: 10, cover_image: 3, headline: 8, bio: 7,
      location: 5, heritage: 10, languages: 5, skills: 10,
      interests: 5, experience: 7, education: 5, social_links: 3,
      first_post: 5, first_connection: 7, first_event: 3,
      first_space: 3, first_story: 4,
    };

    const heritage = profile.heritage as Record<string, unknown> | null;
    const activitySummary = profile.activity_summary as Record<string, Record<string, number>> | null;

    const checks: { section: ProfileSection; test: () => boolean; label: string; diaMessage: string }[] = [
      { section: 'avatar', test: () => !!profile.avatar_url, label: 'Add profile photo', diaMessage: 'Profiles with photos get 5x more connection requests.' },
      { section: 'cover_image', test: () => !!profile.banner_url, label: 'Add cover image', diaMessage: 'Make your profile stand out with a cover image.' },
      { section: 'headline', test: () => !!profile.headline && (profile.headline as string).length > 10, label: 'Write your headline', diaMessage: 'Your headline is the first thing people see. Make it count.' },
      { section: 'bio', test: () => !!profile.bio && (profile.bio as string).length > 50, label: 'Tell your story', diaMessage: 'Help the diaspora understand what drives you.' },
      { section: 'location', test: () => !!profile.current_country, label: 'Add your location', diaMessage: 'Location helps DIA connect you with nearby diaspora members.' },
      { section: 'heritage', test: () => Array.isArray((heritage as any)?.heritageCountries) && ((heritage as any).heritageCountries?.length ?? 0) > 0, label: 'Share your heritage', diaMessage: 'Your diaspora heritage connects you to 200M+ people worldwide.' },
      { section: 'languages', test: () => Array.isArray(profile.languages) && (profile.languages as string[]).length > 0, label: 'Add languages', diaMessage: 'Language skills open doors across the diaspora.' },
      { section: 'skills', test: () => Array.isArray(profile.skills) && (profile.skills as string[]).length >= 3, label: 'Add at least 3 skills', diaMessage: 'Skills are how DIA matches you with opportunities and collaborators.' },
      { section: 'interests', test: () => Array.isArray(profile.interests) && (profile.interests as string[]).length >= 2, label: 'Add interests', diaMessage: 'Interests help you discover relevant events and content.' },
      { section: 'experience', test: () => Array.isArray(profile.experience) && (profile.experience as unknown[]).length > 0, label: 'Add work experience', diaMessage: 'Your experience helps others understand your expertise.' },
      { section: 'education', test: () => Array.isArray(profile.education) && (profile.education as unknown[]).length > 0, label: 'Add education', diaMessage: 'Your educational background is part of your diaspora story.' },
      { section: 'social_links', test: () => !!profile.linkedin_url || !!profile.website_url, label: 'Link social accounts', diaMessage: 'Social links help people verify and connect with you.' },
      { section: 'first_post', test: () => !!profile.first_post_at || (activitySummary?.convey?.storiesPublished ?? 0) > 0, label: 'Make your first post', diaMessage: 'Your first post introduces you to the community.' },
      { section: 'first_connection', test: () => (activitySummary?.connect?.connectionCount ?? 0) > 0, label: 'Make your first connection', diaMessage: 'Every great network starts with one connection.' },
      { section: 'first_event', test: () => (activitySummary?.convene?.eventsAttended ?? 0) > 0, label: 'Attend an event', diaMessage: 'Events are where diaspora magic happens.' },
      { section: 'first_space', test: () => (activitySummary?.collaborate?.spacesActive ?? 0) > 0, label: 'Join a Space', diaMessage: 'Spaces let you collaborate on projects that matter.' },
      { section: 'first_story', test: () => (activitySummary?.convey?.storiesPublished ?? 0) > 0, label: 'Publish a Story', diaMessage: 'Share your perspective with the diaspora.' },
    ];

    let totalWeight = 0;
    let completedWeight = 0;
    const checklist: CompletionChecklistItem[] = [];

    for (const check of checks) {
      const weight = weights[check.section];
      const isComplete = check.test();
      totalWeight += weight;
      if (isComplete) completedWeight += weight;

      checklist.push({
        id: check.section,
        section: check.section,
        label: check.label,
        isComplete,
        weight,
        diaMessage: isComplete ? null : check.diaMessage,
      });
    }

    const percentage = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;

    await supabase
      .from('profiles')
      .update({
        completion_checklist: checklist,
        profile_completion_score: percentage,
      })
      .eq('id', userId);

    return percentage;
  },

  // ============================================
  // BADGE EVALUATION
  // ============================================

  async evaluateBadges(userId: string): Promise<ProfileBadge[]> {
    const activity = await this.computeActivitySummary(userId);
    const earnedBadges: ProfileBadge[] = [];

    const { data: existing } = await supabase
      .from('profile_badges')
      .select('type')
      .eq('user_id', userId);

    const existingTypes = new Set((existing || []).map(b => b.type));

    const badgeRules: { type: BadgeType; test: () => boolean; name: string; description: string; cModule: CModule | 'cross_c' }[] = [
      // CONNECT
      { type: 'connector_10', test: () => activity.connect.connectionCount >= 10, name: 'First 10', description: 'Made 10 connections on DNA', cModule: 'connect' },
      { type: 'connector_50', test: () => activity.connect.connectionCount >= 50, name: 'Growing Network', description: 'Built a network of 50+ connections', cModule: 'connect' },
      { type: 'connector_100', test: () => activity.connect.connectionCount >= 100, name: 'Century Club', description: '100+ connections across the diaspora', cModule: 'connect' },
      { type: 'global_networker', test: () => activity.connect.countrySpan >= 10, name: 'Global Networker', description: 'Connected across 10+ countries', cModule: 'connect' },
      // CONVENE
      { type: 'event_host', test: () => activity.convene.eventsHosted >= 1, name: 'Event Host', description: 'Hosted your first event', cModule: 'convene' },
      { type: 'serial_host', test: () => activity.convene.eventsHosted >= 5, name: 'Serial Host', description: 'Hosted 5+ events for the diaspora', cModule: 'convene' },
      { type: 'community_gatherer', test: () => activity.convene.eventsAttended >= 20, name: 'Community Gatherer', description: 'Attended 20+ diaspora events', cModule: 'convene' },
      // COLLABORATE
      { type: 'space_creator', test: () => activity.collaborate.spacesLed >= 1, name: 'Space Creator', description: 'Created your first collaboration Space', cModule: 'collaborate' },
      { type: 'team_player', test: () => activity.collaborate.spacesActive >= 5, name: 'Team Player', description: 'Active contributor in 5+ Spaces', cModule: 'collaborate' },
      { type: 'task_master', test: () => activity.collaborate.tasksCompleted >= 50, name: 'Task Master', description: 'Completed 50+ tasks across Spaces', cModule: 'collaborate' },
      // CONTRIBUTE
      { type: 'first_offer', test: () => activity.contribute.offersActive + activity.contribute.opportunitiesPosted >= 1, name: 'First Contribution', description: 'Made your first offer to the diaspora', cModule: 'contribute' },
      { type: 'skill_sharer', test: () => activity.contribute.opportunitiesFulfilled >= 5, name: 'Skill Sharer', description: 'Fulfilled 5+ diaspora needs', cModule: 'contribute' },
      // CONVEY
      { type: 'storyteller', test: () => activity.convey.storiesPublished >= 1, name: 'Storyteller', description: 'Published your first Story', cModule: 'convey' },
      { type: 'thought_leader', test: () => activity.convey.totalEngagement >= 100, name: 'Thought Leader', description: 'Your content reached 100+ engagements', cModule: 'convey' },
      // CROSS-C
      {
        type: 'five_c_explorer',
        test: () => {
          const activeCount = [
            activity.connect.connectionCount > 0,
            activity.convene.eventsAttended + activity.convene.eventsHosted > 0,
            activity.collaborate.spacesActive > 0,
            activity.contribute.opportunitiesPosted + activity.contribute.offersActive > 0,
            activity.convey.storiesPublished > 0,
          ].filter(Boolean).length;
          return activeCount >= 5;
        },
        name: "Five C's Explorer",
        description: "Active across all Five C's",
        cModule: 'cross_c',
      },
    ];

    for (const rule of badgeRules) {
      if (!existingTypes.has(rule.type) && rule.test()) {
        const badge: ProfileBadge = {
          id: crypto.randomUUID(),
          type: rule.type,
          name: rule.name,
          description: rule.description,
          iconUrl: `/badges/${rule.type}.svg`,
          cModule: rule.cModule,
          earnedAt: new Date(),
          isDisplayed: true,
        };
        earnedBadges.push(badge);

        await supabase.from('profile_badges').insert({
          id: badge.id,
          user_id: userId,
          type: badge.type,
          name: badge.name,
          description: badge.description,
          icon_url: badge.iconUrl,
          c_module: badge.cModule,
          earned_at: badge.earnedAt.toISOString(),
          is_displayed: badge.isDisplayed,
        });
      }
    }

    return earnedBadges;
  },

  // ============================================
  // DIA "WHAT MAKES YOU UNIQUE"
  // ============================================

  async generateDIAInsight(userId: string): Promise<string> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) return '';

    const activity = profile.activity_summary as FiveCActivitySummary | null;
    const impact = profile.impact_score as FiveCImpactScore | null;
    const heritage = profile.heritage as DiasporaHeritage | null;

    const insights: string[] = [];

    // Heritage uniqueness
    if (heritage?.heritageCountries && heritage.heritageCountries.length > 1) {
      const countries = heritage.heritageCountries.map((h: any) => h.countryName);
      insights.push(`Your ${countries.join(' and ')} heritage bridges communities that rarely connect on other platforms.`);
    }

    // Network uniqueness
    if (activity?.connect?.countrySpan && activity.connect.countrySpan > 10) {
      insights.push(`Your network spans ${activity.connect.countrySpan} countries — you're a global connector.`);
    }

    // Impact balance
    if (impact && impact.strongestC !== impact.growthOpportunityC) {
      insights.push(`You lead in ${String(impact.strongestC).toUpperCase()} and have room to grow in ${String(impact.growthOpportunityC).toUpperCase()} — the combination could amplify your impact.`);
    }

    // Five C's breadth
    if (activity) {
      const activeCs = [
        (activity.connect?.connectionCount ?? 0) > 0,
        ((activity.convene?.eventsHosted ?? 0) + (activity.convene?.eventsAttended ?? 0)) > 0,
        (activity.collaborate?.spacesActive ?? 0) > 0,
        (activity.contribute?.opportunitiesPosted ?? 0) > 0,
        (activity.convey?.storiesPublished ?? 0) > 0,
      ].filter(Boolean).length;

      if (activeCs >= 4) {
        insights.push(`You're active across ${activeCs} of the Five C's — that puts you in the top 15% of DNA members.`);
      }
    }

    const diaInsight = insights.slice(0, 3).join(' ');

    await supabase
      .from('profiles')
      .update({ dia_insight: diaInsight })
      .eq('id', userId);

    return diaInsight;
  },

  // ============================================
  // ONBOARDING STATE
  // ============================================

  async getOnboardingState(userId: string) {
    const { data, error } = await supabase
      .from('onboarding_state')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async initOnboarding(userId: string) {
    const { data, error } = await supabase
      .from('onboarding_state')
      .upsert({
        user_id: userId,
        current_step: 'welcome',
        completed_steps: [],
        skipped_steps: [],
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async advanceOnboarding(userId: string, completedStep: string, nextStep: string, skipped: boolean = false) {
    const state = await this.getOnboardingState(userId);
    if (!state) return;

    const completedSteps = [...(state.completed_steps || [])];
    const skippedSteps = [...(state.skipped_steps || [])];

    if (skipped) {
      if (!skippedSteps.includes(completedStep)) skippedSteps.push(completedStep);
    } else {
      if (!completedSteps.includes(completedStep)) completedSteps.push(completedStep);
    }

    const isComplete = nextStep === 'complete';

    const { error } = await supabase
      .from('onboarding_state')
      .update({
        current_step: nextStep,
        completed_steps: completedSteps,
        skipped_steps: skippedSteps,
        completed_at: isComplete ? new Date().toISOString() : null,
      })
      .eq('user_id', userId);

    if (error) throw error;
  },

  // ============================================
  // BADGES DISPLAY
  // ============================================

  async getBadges(userId: string): Promise<ProfileBadge[]> {
    const { data, error } = await supabase
      .from('profile_badges')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      type: row.type as BadgeType,
      name: row.name,
      description: row.description,
      iconUrl: row.icon_url ?? '',
      cModule: row.c_module as CModule | 'cross_c',
      earnedAt: new Date(row.earned_at),
      isDisplayed: row.is_displayed ?? true,
    }));
  },

  async toggleBadgeDisplay(userId: string, badgeId: string, isDisplayed: boolean): Promise<void> {
    const { error } = await supabase
      .from('profile_badges')
      .update({ is_displayed: isDisplayed })
      .eq('id', badgeId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // ============================================
  // HELPER METHODS
  // ============================================

  async determineViewContext(profileId: string, viewerId: string): Promise<ProfileViewContext> {
    if (profileId === viewerId) return 'own_profile';

    const { data: connection } = await supabase
      .from('connections')
      .select('status')
      .or(`and(user_id.eq.${viewerId},connected_user_id.eq.${profileId}),and(user_id.eq.${profileId},connected_user_id.eq.${viewerId})`)
      .eq('status', 'accepted')
      .maybeSingle();

    return connection ? 'connected' : 'not_connected';
  },

  computeVisibleSections(
    visibility: Record<string, unknown>,
    viewContext: ProfileViewContext
  ): ProfileSection[] {
    if (viewContext === 'own_profile') {
      return [
        'avatar', 'cover_image', 'headline', 'bio', 'location',
        'heritage', 'languages', 'skills', 'interests', 'experience',
        'education', 'social_links', 'first_post', 'first_connection',
        'first_event', 'first_space', 'first_story',
      ];
    }

    const sections: ProfileSection[] = ['avatar', 'cover_image', 'headline', 'bio'];
    const vis = visibility as unknown as ProfileVisibility;
    const isConnected = viewContext === 'connected';

    const shouldShow = (setting: string | undefined): boolean => {
      if (setting === 'everyone') return true;
      if (setting === 'connections' && isConnected) return true;
      return false;
    };

    // Heritage is public by default
    if (shouldShow(vis?.showHeritage || 'everyone')) {
      sections.push('heritage', 'languages');
    }
    if (shouldShow(vis?.showExperience || 'everyone')) {
      sections.push('experience', 'education');
    }
    sections.push('location', 'skills', 'interests', 'social_links');

    if (shouldShow(vis?.showActivity || 'connections')) {
      sections.push('first_post', 'first_connection', 'first_event', 'first_space', 'first_story');
    }

    return sections;
  },

  async getViewerRelationship(profileId: string, viewerId: string) {
    const { data: connection } = await supabase
      .from('connections')
      .select('status')
      .or(`and(user_id.eq.${viewerId},connected_user_id.eq.${profileId}),and(user_id.eq.${profileId},connected_user_id.eq.${viewerId})`)
      .maybeSingle();

    const isConnected = connection?.status === 'accepted';
    const isPending = connection?.status === 'pending';

    // Get mutual connections count
    const { count: mutualCount } = await supabase
      .rpc('get_mutual_connection_count', {
        p_user_id: viewerId,
        p_other_user_id: profileId,
      })
      .single()
      .then(res => ({ count: (res.data as number) ?? 0 }))
      .catch(() => ({ count: 0 }));

    return {
      isConnected,
      isPending,
      mutualConnectionCount: mutualCount ?? 0,
      mutualConnections: [] as ParticipantPreview[],
      sharedSpaces: [] as { id: string; name: string }[],
      sharedEvents: [] as { id: string; name: string }[],
      relationshipStrength: isConnected ? 50 : null,
    };
  },

  async getDIAMatchInfo(profileId: string, viewerId: string) {
    // DIA match info is computed asynchronously; return cached result if available
    return {
      matchScore: null,
      matchType: null,
      matchReasons: [],
    };
  },

  async recordProfileView(profileId: string, viewerId: string, context: ProfileViewContext) {
    try {
      await supabase.rpc('record_profile_view_hub', {
        p_profile_id: profileId,
        p_viewer_id: viewerId,
        p_context: context,
      });
    } catch {
      // Silently fail — view tracking is analytics-only
    }
  },

  async verifyConnection(userId1: string, userId2: string): Promise<boolean> {
    const { data } = await supabase
      .from('connections')
      .select('id')
      .or(`and(user_id.eq.${userId1},connected_user_id.eq.${userId2}),and(user_id.eq.${userId2},connected_user_id.eq.${userId1})`)
      .eq('status', 'accepted')
      .maybeSingle();

    return !!data;
  },

  async notifyDIAProfileUpdate(userId: string, changedFields: string[]) {
    try {
      await supabase.rpc('trigger_dia_rematch', {
        p_user_id: userId,
        p_reason: `profile_fields_updated:${changedFields.join(',')}`,
      });
    } catch {
      // Non-critical; DIA will catch up on next batch
    }
  },

  async getPreviousImpactScore(userId: string): Promise<number | null> {
    const { data } = await supabase
      .from('profiles')
      .select('impact_score')
      .eq('id', userId)
      .single();

    const score = data?.impact_score as FiveCImpactScore | null;
    return score?.overall ?? null;
  },

  // ============================================
  // DB → TypeScript MAPPING
  // ============================================

  mapToIdentityHubProfile(row: Record<string, any>): IdentityHubProfile {
    const heritage = (row.heritage ?? {}) as DiasporaHeritage;
    const activitySummary = (row.activity_summary ?? {}) as FiveCActivitySummary;
    const impactScore = (row.impact_score ?? {}) as FiveCImpactScore;
    const visibility = (row.hub_visibility ?? {}) as ProfileVisibility;

    return {
      id: row.id,
      userId: row.id,
      displayName: row.full_name ?? '',
      firstName: row.first_name ?? '',
      lastName: row.last_name ?? '',
      headline: row.headline ?? null,
      bio: row.bio ?? null,
      avatarUrl: row.avatar_url ?? null,
      coverImageUrl: row.banner_url ?? null,
      location: {
        city: row.current_city ?? null,
        state: null,
        country: row.current_country ?? '',
        countryCode: row.current_country_code ?? '',
        timezone: '',
        coordinates: null,
        displayFormat: row.location ?? row.current_city
          ? `${row.current_city || ''}, ${row.current_country || ''}`.replace(/^, /, '')
          : row.current_country ?? '',
      },
      pronouns: row.pronouns ?? null,
      skills: [],
      interests: [],
      industry: row.industry ?? null,
      experience: Array.isArray(row.experience) ? row.experience : [],
      education: Array.isArray(row.education) ? row.education : [],
      socialLinks: Array.isArray(row.social_links) ? row.social_links : [],
      heritage: {
        heritageCountries: heritage.heritageCountries ?? [],
        currentCountry: heritage.currentCountry ?? row.current_country ?? '',
        languages: heritage.languages ?? [],
        diasporaGeneration: heritage.diasporaGeneration ?? null,
        culturalInterests: heritage.culturalInterests ?? [],
        diasporaEngagement: heritage.diasporaEngagement ?? 'exploring',
        regionalConnections: heritage.regionalConnections ?? [],
      },
      activitySummary: {
        connect: activitySummary.connect ?? { connectionCount: 0, countrySpan: 0, recentConnectionCount: 0, mutualConnectionsWithViewer: 0 },
        convene: activitySummary.convene ?? { eventsHosted: 0, eventsAttended: 0, upcomingEvents: 0, totalAttendees: 0 },
        collaborate: activitySummary.collaborate ?? { spacesActive: 0, spacesLed: 0, tasksCompleted: 0, collaboratorsCount: 0 },
        contribute: activitySummary.contribute ?? { opportunitiesPosted: 0, opportunitiesFulfilled: 0, offersActive: 0, needsActive: 0 },
        convey: activitySummary.convey ?? { storiesPublished: 0, totalEngagement: 0, followerCount: 0, avgEngagementRate: 0 },
      },
      impactScore: {
        overall: impactScore.overall ?? 0,
        connect: impactScore.connect ?? 0,
        convene: impactScore.convene ?? 0,
        collaborate: impactScore.collaborate ?? 0,
        contribute: impactScore.contribute ?? 0,
        convey: impactScore.convey ?? 0,
        lastComputedAt: impactScore.lastComputedAt ? new Date(impactScore.lastComputedAt as any) : new Date(),
        trend: impactScore.trend ?? 'stable',
        percentileRank: impactScore.percentileRank ?? 50,
        strongestC: impactScore.strongestC ?? 'connect',
        growthOpportunityC: impactScore.growthOpportunityC ?? 'connect',
      },
      badges: [],
      diaInsight: row.dia_insight ?? null,
      completionPercentage: row.profile_completion_score ?? 0,
      completionChecklist: Array.isArray(row.completion_checklist) ? row.completion_checklist : [],
      verificationStatus: row.verification_status ?? 'unverified',
      tier: row.tier ?? 'free',
      visibility,
      profileViews: row.profile_views_count ?? 0,
      lastActiveAt: row.last_active_at ? new Date(row.last_active_at) : new Date(),
      joinedAt: row.created_at ? new Date(row.created_at) : new Date(),
      updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
    };
  },
};
