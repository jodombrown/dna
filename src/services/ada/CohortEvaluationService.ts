import { supabase } from '@/integrations/supabase/client';

/**
 * ADA Phase 4 - M1: Cohort Evaluation Service
 * Determines which cohorts a user belongs to based on criteria
 */

export interface CohortCriteria {
  role_in?: string[];
  region_in?: string[];
  min_events_attended?: number;
  max_account_age_days?: number;
  dominant_c?: 'Connect' | 'Convene' | 'Collaborate' | 'Contribute' | 'Convey';
  min_weekly_active_days?: number;
  [key: string]: any;
}

export interface Cohort {
  id: string;
  name: string;
  description?: string;
  criteria: CohortCriteria;
  is_active: boolean;
}

export interface CohortMembership {
  cohort_id: string;
  cohort_name: string;
  computed_at: Date;
}

/**
 * Cohort Evaluation Service
 * Evaluates and caches user cohort memberships
 */
export class CohortEvaluationService {
  private static instance: CohortEvaluationService;
  private membershipCache: Map<string, CohortMembership[]> = new Map();
  private cacheExpiry: number = 60 * 60 * 1000; // 1 hour

  private constructor() {}

  static getInstance(): CohortEvaluationService {
    if (!CohortEvaluationService.instance) {
      CohortEvaluationService.instance = new CohortEvaluationService();
    }
    return CohortEvaluationService.instance;
  }

  /**
   * Get all cohorts a user belongs to (with caching)
   */
  async getUserCohorts(userId: string, forceRefresh: boolean = false): Promise<CohortMembership[]> {
    // Check cache first
    if (!forceRefresh) {
      const cached = this.membershipCache.get(userId);
      if (cached) {
        return cached;
      }

      // Check database cache
      const { data: cachedMemberships } = await supabase
        .from('ada_cohort_memberships')
        .select('cohort_id, ada_cohorts!inner(name)')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString());

      if (cachedMemberships && cachedMemberships.length > 0) {
        const memberships = cachedMemberships.map(m => ({
          cohort_id: m.cohort_id,
          cohort_name: (m as any).ada_cohorts.name,
          computed_at: new Date(),
        }));

        this.membershipCache.set(userId, memberships);
        return memberships;
      }
    }

    // Compute cohorts using RPC function
    const { data: cohortResults, error } = await supabase
      .rpc('get_user_cohorts', { p_user_id: userId });

    if (error) {
      return [];
    }

    if (!cohortResults || cohortResults.length === 0) {
      return [];
    }

    const memberships: CohortMembership[] = cohortResults.map((c: any) => ({
      cohort_id: c.cohort_id,
      cohort_name: c.cohort_name,
      computed_at: new Date(),
    }));

    // Cache in database
    await this.cacheMemberships(userId, memberships);

    // Cache in memory
    this.membershipCache.set(userId, memberships);

    // Clear memory cache after expiry
    setTimeout(() => {
      this.membershipCache.delete(userId);
    }, this.cacheExpiry);

    return memberships;
  }

  /**
   * Check if user belongs to a specific cohort
   */
  async isUserInCohort(userId: string, cohortId: string): Promise<boolean> {
    const memberships = await this.getUserCohorts(userId);
    return memberships.some(m => m.cohort_id === cohortId);
  }

  /**
   * Get all active cohorts
   */
  async getActiveCohorts(): Promise<Cohort[]> {
    const { data, error } = await supabase
      .from('ada_cohorts')
      .select('*')
      .eq('is_active', true);

    if (error) {
      return [];
    }

    return data as Cohort[];
  }

  /**
   * Estimate cohort size (approximate)
   */
  async estimateCohortSize(cohortId: string): Promise<number> {
    const { count, error } = await supabase
      .from('ada_cohort_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('cohort_id', cohortId)
      .gt('expires_at', new Date().toISOString());

    if (error) {
      return 0;
    }

    return count || 0;
  }

  /**
   * Refresh cohort membership for a user
   */
  async refreshUserCohorts(userId: string): Promise<CohortMembership[]> {
    return this.getUserCohorts(userId, true);
  }

  /**
   * Clear membership cache for a user
   */
  clearUserCache(userId: string) {
    this.membershipCache.delete(userId);
  }

  /**
   * Clear all caches
   */
  clearAllCaches() {
    this.membershipCache.clear();
  }

  // Private helper methods

  private async cacheMemberships(userId: string, memberships: CohortMembership[]) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const records = memberships.map(m => ({
      user_id: userId,
      cohort_id: m.cohort_id,
      computed_at: m.computed_at.toISOString(),
      expires_at: expiresAt.toISOString(),
    }));

    // Upsert memberships
    const { error } = await supabase
      .from('ada_cohort_memberships')
      .upsert(records, {
        onConflict: 'user_id,cohort_id',
      });

    if (error) {
      // Silently fail - caching is non-critical
    }
  }
}

export const cohortEvaluationService = CohortEvaluationService.getInstance();
