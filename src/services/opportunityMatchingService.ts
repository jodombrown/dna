import { supabase } from '@/integrations/supabase/client';
import type { ContributionNeedWithSpace } from '@/types/contributeTypes';

// ============================================================================
// TYPES
// ============================================================================

export interface OpportunityMatchScore {
  opportunityId: string;
  score: number;
  factors: {
    skills: number;
    interests: number;
    location: number;
    history: number;
    focusAreas: number;
  };
  reasons: string[];
}

export interface MatchingOpportunity extends ContributionNeedWithSpace {
  matchScore: number;
  matchReasons: string[];
}

export interface UserProfileForMatching {
  id: string;
  skills?: string[];
  interests?: string[];
  focus_areas?: string[];
  impact_areas?: string[];
  regional_expertise?: string[];
  current_country?: string;
  current_city?: string;
  location?: string;
  available_for?: string[];
  industries?: string[];
}

export interface ContributionHistory {
  types: string[];
  count: number;
}

// Nudge message templates by context
const NUDGE_TEMPLATES = {
  skills_match: [
    'Your skills in {skills} match this opportunity in {project}',
    '{project} is looking for someone with your {skills} expertise',
    'Your {skills} background makes you a great fit for {project}',
  ],
  interest_match: [
    'Based on your interest in {focus_area}, you might want to contribute to {project}',
    '{project} aligns with your focus on {focus_area}',
    'Interested in {focus_area}? {project} needs your help!',
  ],
  location_match: [
    '{project} is looking for contributors in {region} - you could help!',
    'A project in {region} needs support - matches your location',
    '{project} needs local expertise in {region}',
  ],
  history_match: [
    '{project} is looking for {contribution_type} - you\'ve contributed this before',
    'Based on your past {contribution_type} contributions, {project} could use your help',
    'Your experience with {contribution_type} makes you ideal for {project}',
  ],
  generic: [
    '{project} matches your profile - consider contributing!',
    'You could make an impact at {project}',
    'Looking to contribute? Check out {project}!',
  ],
};

// Contribution type labels for readable messages
const CONTRIBUTION_TYPE_LABELS: Record<string, string> = {
  funding: 'funding',
  skills: 'skills sharing',
  time: 'volunteering',
  access: 'network access',
  resources: 'resource sharing',
};

// African regions for location matching
const AFRICAN_REGIONS: Record<string, string[]> = {
  'West Africa': ['nigeria', 'ghana', 'senegal', 'ivory coast', "côte d'ivoire", 'mali', 'burkina faso', 'niger', 'guinea', 'benin', 'togo', 'sierra leone', 'liberia', 'gambia', 'guinea-bissau', 'cape verde', 'mauritania'],
  'East Africa': ['kenya', 'ethiopia', 'tanzania', 'uganda', 'rwanda', 'burundi', 'south sudan', 'somalia', 'eritrea', 'djibouti'],
  'Southern Africa': ['south africa', 'zimbabwe', 'zambia', 'botswana', 'namibia', 'mozambique', 'malawi', 'lesotho', 'eswatini', 'swaziland', 'angola'],
  'North Africa': ['egypt', 'morocco', 'algeria', 'tunisia', 'libya', 'sudan'],
  'Central Africa': ['cameroon', 'democratic republic of congo', 'drc', 'congo', 'gabon', 'equatorial guinea', 'central african republic', 'chad'],
};

// ============================================================================
// OPPORTUNITY MATCHING SERVICE
// ============================================================================

class OpportunityMatchingService {
  /**
   * Get matching opportunities for a user based on their profile
   * @param userId - The user's ID
   * @returns Array of opportunities with match scores (top 10)
   */
  async getMatchingOpportunities(userId: string): Promise<MatchingOpportunity[]> {
    try {
      // Get user profile
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        return [];
      }

      // Get user's contribution history
      const contributionHistory = await this.getContributionHistory(userId);

      // Get all open opportunities (excluding user's own)
      const opportunities = await this.getOpenOpportunities(userId);
      if (!opportunities.length) {
        return [];
      }

      // Calculate match scores for each opportunity
      const scoredOpportunities = opportunities.map((opportunity) => {
        const matchData = this.calculateMatchScore(userProfile, opportunity, contributionHistory);
        return {
          ...opportunity,
          matchScore: matchData.score,
          matchReasons: matchData.reasons,
        };
      });

      // Sort by score and return top 10
      return scoredOpportunities
        .filter((opp) => opp.matchScore > 10) // Filter out very low matches
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10);
    } catch {
      return [];
    }
  }

  /**
   * Get detailed match score for a specific user-opportunity pair
   * @param userId - The user's ID
   * @param opportunityId - The opportunity's ID
   * @returns Detailed match score with factors and reasons
   */
  async getMatchScore(userId: string, opportunityId: string): Promise<OpportunityMatchScore | null> {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) return null;

      // Two-step fetch: get need first, then space
      const { data: needData, error: needError } = await supabase
        .from('contribution_needs')
        .select('*')
        .eq('id', opportunityId)
        .maybeSingle();

      if (needError || !needData) return null;

      // Fetch space separately
      let space = null;
      if (needData.space_id) {
        const { data: spaceData } = await supabase
          .from('spaces')
          .select('id, name, slug, tagline, focus_areas, region')
          .eq('id', needData.space_id)
          .maybeSingle();
        space = spaceData;
      }

      const opportunity = { ...needData, space } as ContributionNeedWithSpace;

      const contributionHistory = await this.getContributionHistory(userId);
      return this.calculateMatchScore(userProfile, opportunity, contributionHistory);
    } catch {
      return null;
    }
  }

  /**
   * Generate a contextual nudge message for an opportunity
   * @param userId - The user's ID (for context, not used directly)
   * @param opportunity - The opportunity
   * @param matchData - The match score data
   * @returns A contextual nudge message
   */
  generateOpportunityNudge(
    _userId: string,
    opportunity: ContributionNeedWithSpace,
    matchData: OpportunityMatchScore
  ): string {
    const projectName = opportunity.space?.name || opportunity.title;
    const { factors, reasons } = matchData;

    // Determine the primary match reason
    let templateKey: keyof typeof NUDGE_TEMPLATES = 'generic';
    let templateVars: Record<string, string> = { project: projectName };

    if (factors.skills >= 50 && reasons.some((r) => r.includes('skill'))) {
      templateKey = 'skills_match';
      // Extract skills from reasons
      const skillReason = reasons.find((r) => r.includes('skill'));
      if (skillReason) {
        const match = skillReason.match(/skills?: (.+)/i);
        templateVars.skills = match ? match[1] : 'your expertise';
      } else {
        templateVars.skills = 'your expertise';
      }
    } else if (factors.interests >= 50 || factors.focusAreas >= 50) {
      templateKey = 'interest_match';
      // Extract focus area from reasons
      const focusReason = reasons.find((r) => r.includes('focus') || r.includes('interest') || r.includes('impact'));
      if (focusReason) {
        const match = focusReason.match(/(?:focus|interest|impact)(?:\s+(?:in|on))?\s*:?\s*(.+)/i);
        templateVars.focus_area = match ? match[1] : opportunity.focus_areas?.[0] || 'your interests';
      } else {
        templateVars.focus_area = opportunity.focus_areas?.[0] || 'your interests';
      }
    } else if (factors.location >= 50) {
      templateKey = 'location_match';
      templateVars.region = opportunity.region || opportunity.space?.region || 'your region';
    } else if (factors.history >= 50) {
      templateKey = 'history_match';
      templateVars.contribution_type = CONTRIBUTION_TYPE_LABELS[opportunity.type] || opportunity.type;
    }

    // Select a random template from the category
    const templates = NUDGE_TEMPLATES[templateKey];
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Replace placeholders
    return template.replace(/\{(\w+)\}/g, (_, key) => templateVars[key] || key);
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async getUserProfile(userId: string): Promise<UserProfileForMatching | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        skills,
        interests,
        focus_areas,
        impact_areas,
        regional_expertise,
        current_country,
        current_city,
        location,
        available_for,
        industries
      `)
      .eq('id', userId)
      .single();

    if (error) {
      return null;
    }

    return data as UserProfileForMatching;
  }

  private async getContributionHistory(userId: string): Promise<ContributionHistory> {
    // Get user's past contribution offers - two-step fetch
    const { data: offers } = await supabase
      .from('contribution_offers')
      .select('need_id')
      .eq('created_by', userId)
      .in('status', ['accepted', 'completed']);

    // Get need types separately if we have offers
    let needTypes: string[] = [];
    if (offers && offers.length > 0) {
      const needIds = [...new Set(offers.map(o => o.need_id).filter(Boolean))];
      if (needIds.length > 0) {
        const { data: needs } = await supabase
          .from('contribution_needs')
          .select('id, type')
          .in('id', needIds);
        needTypes = needs?.map(n => n.type).filter(Boolean) || [];
      }
    }

    const types = new Set<string>(needTypes);

    return {
      types: Array.from(types),
      count: offers?.length || 0,
    };
  }

  private async getOpenOpportunities(excludeUserId: string): Promise<ContributionNeedWithSpace[]> {
    // Step 1: Fetch needs
    const { data: needsData, error: needsError } = await supabase
      .from('contribution_needs')
      .select('*')
      .in('status', ['open', 'in_progress'])
      .neq('created_by', excludeUserId)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);

    if (needsError || !needsData || needsData.length === 0) {
      return [];
    }

    // Step 2: Fetch spaces separately
    const spaceIds = [...new Set(needsData.map(n => n.space_id).filter(Boolean))];
    let spacesMap: Record<string, any> = {};
    
    if (spaceIds.length > 0) {
      const { data: spacesData } = await supabase
        .from('spaces')
        .select('id, name, slug, tagline, focus_areas, region')
        .in('id', spaceIds);
      
      if (spacesData) {
        spacesMap = Object.fromEntries(spacesData.map(s => [s.id, s]));
      }
    }

    // Step 3: Merge data
    return needsData.map(need => ({
      ...need,
      space: need.space_id ? spacesMap[need.space_id] || null : null,
    })) as ContributionNeedWithSpace[];
  }

  private calculateMatchScore(
    userProfile: UserProfileForMatching,
    opportunity: ContributionNeedWithSpace,
    contributionHistory: ContributionHistory
  ): OpportunityMatchScore {
    const factors = {
      skills: 0,
      interests: 0,
      location: 0,
      history: 0,
      focusAreas: 0,
    };
    const reasons: string[] = [];

    // =========================================================================
    // 1. SKILLS MATCHING (30% weight)
    // =========================================================================
    if (opportunity.type === 'skills') {
      // For skills-type opportunities, user's skills are highly relevant
      const userSkills = userProfile.skills || [];
      const oppFocusAreas = [
        ...(opportunity.focus_areas || []),
        ...(opportunity.space?.focus_areas || []),
      ];

      const skillsScore = this.calculateArrayMatch(userSkills, oppFocusAreas);
      factors.skills = skillsScore;

      if (skillsScore > 30) {
        const commonSkills = this.getCommonItems(userSkills, oppFocusAreas);
        if (commonSkills.length > 0) {
          reasons.push(`Your skills: ${commonSkills.slice(0, 2).join(', ')}`);
        }
      }
    } else {
      // For other types, skills matching is less critical but still relevant
      factors.skills = 30; // Base score for non-skills opportunities
    }

    // =========================================================================
    // 2. INTERESTS/FOCUS AREAS MATCHING (25% weight)
    // =========================================================================
    const userInterests = [
      ...(userProfile.interests || []),
      ...(userProfile.focus_areas || []),
      ...(userProfile.impact_areas || []),
    ];
    const oppFocusAreas = [
      ...(opportunity.focus_areas || []),
      ...(opportunity.space?.focus_areas || []),
    ];

    const interestScore = this.calculateArrayMatch(userInterests, oppFocusAreas);
    factors.interests = interestScore;
    factors.focusAreas = interestScore;

    if (interestScore > 30) {
      const commonInterests = this.getCommonItems(userInterests, oppFocusAreas);
      if (commonInterests.length > 0) {
        reasons.push(`Focus area: ${commonInterests[0]}`);
      }
    }

    // =========================================================================
    // 3. LOCATION/REGION MATCHING (20% weight)
    // =========================================================================
    const userLocation = userProfile.current_country || userProfile.location || '';
    const oppRegion = opportunity.region || opportunity.space?.region || '';

    const locationScore = this.calculateLocationMatch(userLocation, oppRegion);
    factors.location = locationScore;

    if (locationScore >= 80) {
      reasons.push(`In ${oppRegion || 'your region'}`);
    } else if (locationScore >= 60) {
      reasons.push('Same African region');
    }

    // =========================================================================
    // 4. CONTRIBUTION HISTORY MATCHING (25% weight)
    // =========================================================================
    if (contributionHistory.types.includes(opportunity.type)) {
      factors.history = 80;
      reasons.push(`You've done ${CONTRIBUTION_TYPE_LABELS[opportunity.type]} before`);
    } else if (contributionHistory.count > 0) {
      factors.history = 40; // Has contributed, but not this type
    } else {
      factors.history = 20; // No contribution history
    }

    // Check available_for alignment
    const availableFor = userProfile.available_for || [];
    const typeToAvailability: Record<string, string[]> = {
      funding: ['investing', 'funding_projects'],
      skills: ['advising', 'mentoring', 'consulting'],
      time: ['volunteering', 'advising'],
      access: ['networking', 'introductions', 'partnerships'],
      resources: ['partnerships', 'collaborations'],
    };

    const relevantAvailability = typeToAvailability[opportunity.type] || [];
    if (availableFor.some((a) => relevantAvailability.includes(a))) {
      factors.history += 20;
      if (!reasons.some((r) => r.includes('Available for'))) {
        reasons.push(`Available for ${opportunity.type}`);
      }
    }

    // =========================================================================
    // CALCULATE FINAL SCORE
    // =========================================================================
    const weightedScore =
      factors.skills * 0.30 +
      factors.interests * 0.25 +
      factors.location * 0.20 +
      factors.history * 0.25;

    // Bonus for high-priority opportunities
    let finalScore = weightedScore;
    if (opportunity.priority === 'high' && finalScore > 30) {
      finalScore += 10;
      reasons.push('High priority');
    }

    // Cap at 100
    finalScore = Math.min(100, Math.round(finalScore));

    // Prioritize reasons
    const prioritizedReasons = this.prioritizeReasons(reasons);

    return {
      opportunityId: opportunity.id,
      score: finalScore,
      factors,
      reasons: prioritizedReasons.slice(0, 4),
    };
  }

  private calculateArrayMatch(arr1: string[], arr2: string[]): number {
    if (!arr1?.length || !arr2?.length) return 0;

    const set1 = new Set(arr1.map((s) => s.toLowerCase().trim()));
    const set2 = new Set(arr2.map((s) => s.toLowerCase().trim()));

    let matches = 0;
    for (const item of set1) {
      for (const item2 of set2) {
        if (item === item2 || item.includes(item2) || item2.includes(item)) {
          matches++;
          break;
        }
      }
    }

    return (matches / Math.max(set1.size, set2.size)) * 100;
  }

  private getCommonItems(arr1: string[], arr2: string[]): string[] {
    if (!arr1?.length || !arr2?.length) return [];
    const set2 = new Set(arr2.map((s) => s.toLowerCase().trim()));
    return arr1.filter((item) => {
      const lower = item.toLowerCase().trim();
      return set2.has(lower) || Array.from(set2).some((s) => s.includes(lower) || lower.includes(s));
    });
  }

  private calculateLocationMatch(userLocation: string, oppRegion: string): number {
    if (!userLocation || !oppRegion) return 30;

    const userLoc = userLocation.toLowerCase().trim();
    const oppLoc = oppRegion.toLowerCase().trim();

    // Exact match
    if (userLoc === oppLoc || userLoc.includes(oppLoc) || oppLoc.includes(userLoc)) {
      return 100;
    }

    // Same African region
    const userRegion = this.getAfricanRegion(userLoc);
    const oppAfricanRegion = this.getAfricanRegion(oppLoc);

    if (userRegion && oppAfricanRegion && userRegion === oppAfricanRegion) {
      return 80;
    }

    // Both in Africa
    if (userRegion && oppAfricanRegion) {
      return 60;
    }

    // Global/remote opportunity
    if (oppLoc === 'global' || oppLoc === 'remote' || oppLoc === 'diaspora') {
      return 70;
    }

    return 30;
  }

  private getAfricanRegion(location: string): string | null {
    const loc = location.toLowerCase();
    for (const [region, countries] of Object.entries(AFRICAN_REGIONS)) {
      if (countries.some((c) => loc.includes(c))) {
        return region;
      }
      // Also check if the region name itself is mentioned
      if (loc.includes(region.toLowerCase())) {
        return region;
      }
    }
    return null;
  }

  private prioritizeReasons(reasons: string[]): string[] {
    const priority = [
      "You've done",
      'Your skills',
      'Focus area',
      'Available for',
      'In your region',
      'Same African region',
      'High priority',
    ];

    const seen = new Set<string>();
    const sorted: string[] = [];

    // Add priority items first
    for (const p of priority) {
      for (const r of reasons) {
        if (r.includes(p) && !seen.has(r)) {
          sorted.push(r);
          seen.add(r);
        }
      }
    }

    // Add remaining items
    for (const r of reasons) {
      if (!seen.has(r)) {
        sorted.push(r);
        seen.add(r);
      }
    }

    return sorted;
  }

  // ============================================================================
  // TRENDING & NETWORK OPPORTUNITIES
  // ============================================================================

  /**
   * Get trending opportunities based on offer count and recency
   * @param limit - Maximum number of opportunities to return
   * @returns Array of trending opportunities
   */
  async getTrendingOpportunities(limit: number = 5): Promise<ContributionNeedWithSpace[]> {
    // Step 1: Fetch needs
    const { data: needsData, error: needsError } = await supabase
      .from('contribution_needs')
      .select('*')
      .eq('status', 'open')
      .eq('priority', 'high')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (needsError || !needsData || needsData.length === 0) {
      return [];
    }

    // Step 2: Fetch spaces separately
    const spaceIds = [...new Set(needsData.map(n => n.space_id).filter(Boolean))];
    let spacesMap: Record<string, any> = {};
    
    if (spaceIds.length > 0) {
      const { data: spacesData } = await supabase
        .from('spaces')
        .select('id, name, slug, tagline, focus_areas, region')
        .in('id', spaceIds);
      
      if (spacesData) {
        spacesMap = Object.fromEntries(spacesData.map(s => [s.id, s]));
      }
    }

    // Step 3: Merge data
    return needsData.map(need => ({
      ...need,
      space: need.space_id ? spacesMap[need.space_id] || null : null,
    })) as ContributionNeedWithSpace[];
  }

  /**
   * Get opportunities from user's network (spaces they're members of)
   * @param userId - The user's ID
   * @returns Array of network opportunities
   */
  async getNetworkOpportunities(userId: string): Promise<ContributionNeedWithSpace[]> {
    // Get user's spaces
    const { data: memberships } = await supabase
      .from('space_members')
      .select('space_id')
      .eq('user_id', userId);

    if (!memberships?.length) {
      return [];
    }

    const spaceIds = memberships.map((m) => m.space_id);

    // Step 1: Fetch needs
    const { data: needsData, error: needsError } = await supabase
      .from('contribution_needs')
      .select('*')
      .in('space_id', spaceIds)
      .in('status', ['open', 'in_progress'])
      .neq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (needsError || !needsData || needsData.length === 0) {
      return [];
    }

    // Step 2: Fetch spaces separately
    const needSpaceIds = [...new Set(needsData.map(n => n.space_id).filter(Boolean))];
    let spacesMap: Record<string, any> = {};
    
    if (needSpaceIds.length > 0) {
      const { data: spacesData } = await supabase
        .from('spaces')
        .select('id, name, slug, tagline, focus_areas, region')
        .in('id', needSpaceIds);
      
      if (spacesData) {
        spacesMap = Object.fromEntries(spacesData.map(s => [s.id, s]));
      }
    }

    // Step 3: Merge data
    return needsData.map(need => ({
      ...need,
      space: need.space_id ? spacesMap[need.space_id] || null : null,
    })) as ContributionNeedWithSpace[];
  }

  /**
   * Search opportunities by query and match against user profile
   * @param userId - The user's ID
   * @param query - Search query
   * @returns Array of matching opportunities with relevance info
   */
  async searchOpportunities(
    userId: string,
    query: string
  ): Promise<Array<ContributionNeedWithSpace & { relevance: string; matchScore?: number }>> {
    const searchTerms = query.toLowerCase().split(/\s+/);

    // Step 1: Fetch needs
    const { data: needsData, error: needsError } = await supabase
      .from('contribution_needs')
      .select('*')
      .in('status', ['open', 'in_progress'])
      .neq('created_by', userId)
      .limit(20);

    if (needsError || !needsData || needsData.length === 0) {
      return [];
    }

    // Step 2: Fetch spaces separately
    const spaceIds = [...new Set(needsData.map(n => n.space_id).filter(Boolean))];
    let spacesMap: Record<string, any> = {};
    
    if (spaceIds.length > 0) {
      const { data: spacesData } = await supabase
        .from('spaces')
        .select('id, name, slug, tagline, focus_areas, region')
        .in('id', spaceIds);
      
      if (spacesData) {
        spacesMap = Object.fromEntries(spacesData.map(s => [s.id, s]));
      }
    }

    // Step 3: Merge data
    const data = needsData.map(need => ({
      ...need,
      space: need.space_id ? spacesMap[need.space_id] || null : null,
    }));

    // Get user profile for match scoring
    const userProfile = await this.getUserProfile(userId);
    const contributionHistory = await this.getContributionHistory(userId);

    // Score and filter opportunities based on search relevance
    const scoredResults = data
      .map((opp: any) => {
        const searchableText = [
          opp.title,
          opp.description,
          opp.type,
          opp.region,
          ...(opp.focus_areas || []),
          opp.space?.name,
          opp.space?.tagline,
          ...(opp.space?.focus_areas || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        // Calculate search relevance
        const matchedTerms = searchTerms.filter((term) => searchableText.includes(term));
        const relevanceScore = (matchedTerms.length / searchTerms.length) * 100;

        if (relevanceScore < 30) {
          return null;
        }

        // Calculate profile match score if user profile exists
        let matchScore: number | undefined;
        if (userProfile) {
          const matchData = this.calculateMatchScore(
            userProfile,
            opp as ContributionNeedWithSpace,
            contributionHistory
          );
          matchScore = matchData.score;
        }

        return {
          ...opp,
          relevance: `Matches: ${matchedTerms.join(', ')}`,
          matchScore,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        // Sort by match score if available, otherwise by relevance
        if (a!.matchScore && b!.matchScore) {
          return b!.matchScore - a!.matchScore;
        }
        return 0;
      });

    return scoredResults as Array<ContributionNeedWithSpace & { relevance: string; matchScore?: number }>;
  }
}

export const opportunityMatchingService = new OpportunityMatchingService();
