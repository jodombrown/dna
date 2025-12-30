import { supabase } from '@/integrations/supabase/client';

/**
 * ADA Phase 4 - M1: Adaptive Config Service
 * Resolves policies for users based on experiments, cohorts, and defaults
 */

export type PolicyType = 'layout' | 'modules' | 'cta' | 'nudge' | 'other';
export type PolicyScope = 'global' | 'cohort' | 'experiment_variant';

export interface AdaPolicy {
  id: string;
  name: string;
  description?: string;
  type: PolicyType;
  scope: PolicyScope;
  config: Record<string, unknown>;
  is_active: boolean;
}

// Internal types for query results with nested relations
interface ExperimentAssignmentWithRelations {
  id: string;
  experiment_id: string;
  variant_id: string;
  ada_experiment_variants: {
    id: string;
    name: string;
    policy_id: string;
    ada_policies: AdaPolicy;
  };
  ada_experiments: {
    id: string;
    status: string;
    target_policy_type: string;
    target_route?: string;
    start_at?: string;
    end_at?: string;
  };
}

interface CohortResult {
  cohort_id: string;
}

export interface PolicyResolution {
  policy: AdaPolicy | null;
  source: 'experiment' | 'cohort' | 'global' | 'fallback';
  experimentId?: string;
  variantId?: string;
}

/**
 * Adaptive Config Service
 * Central service for resolving ADA policies
 */
export class AdaptiveConfigService {
  private static instance: AdaptiveConfigService;
  private policyCache: Map<string, AdaPolicy[]> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): AdaptiveConfigService {
    if (!AdaptiveConfigService.instance) {
      AdaptiveConfigService.instance = new AdaptiveConfigService();
    }
    return AdaptiveConfigService.instance;
  }

  /**
   * Get policy for a user with full resolution chain:
   * 1. Experiment variant (if active and assigned)
   * 2. Cohort-specific policy
   * 3. Global default policy
   * 4. Hardcoded fallback
   */
  async getPolicyForUser(
    userId: string,
    type: PolicyType,
    context?: { route?: string; viewState?: string }
  ): Promise<PolicyResolution> {
    try {
      // 1. Check for active experiment assignment
      const experimentPolicy = await this.getExperimentPolicy(userId, type, context);
      if (experimentPolicy) {
        return experimentPolicy;
      }

      // 2. Check for cohort-specific policy
      const cohortPolicy = await this.getCohortPolicy(userId, type);
      if (cohortPolicy) {
        return cohortPolicy;
      }

      // 3. Get global default policy
      const globalPolicy = await this.getGlobalPolicy(type);
      if (globalPolicy) {
        return {
          policy: globalPolicy,
          source: 'global',
        };
      }

      // 4. Return fallback (null policy)
      return {
        policy: null,
        source: 'fallback',
      };
    } catch (error) {
      return {
        policy: null,
        source: 'fallback',
      };
    }
  }

  /**
   * Get all active policies of a given type
   */
  async getActivePolicies(type: PolicyType): Promise<AdaPolicy[]> {
    const cacheKey = `policies_${type}`;
    const cached = this.policyCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const { data, error } = await supabase
      .from('ada_policies')
      .select('*')
      .eq('type', type)
      .eq('is_active', true);

    if (error) {
      return [];
    }

    const policies = data as AdaPolicy[];
    this.policyCache.set(cacheKey, policies);
    
    // Clear cache after expiry
    setTimeout(() => {
      this.policyCache.delete(cacheKey);
    }, this.cacheExpiry);

    return policies;
  }

  /**
   * Resolve layout policy for a user
   */
  async resolveLayoutPolicy(userId: string, viewState?: string): Promise<PolicyResolution> {
    return this.getPolicyForUser(userId, 'layout', { viewState });
  }

  /**
   * Resolve module configuration policy
   * Now ViewState-aware for 5C-specific module configurations
   */
  async resolveModulePolicy(
    userId: string, 
    viewState?: string,
    route?: string
  ): Promise<PolicyResolution> {
    return this.getPolicyForUser(userId, 'modules', { viewState, route });
  }

  /**
   * Resolve CTA strategy policy
   */
  async resolveCTAPolicy(userId: string, entityType?: string): Promise<PolicyResolution> {
    return this.getPolicyForUser(userId, 'cta', { route: entityType });
  }

  /**
   * Resolve nudge frequency policy
   */
  async resolveNudgePolicy(userId: string): Promise<PolicyResolution> {
    return this.getPolicyForUser(userId, 'nudge');
  }

  // Private helper methods

  private async getExperimentPolicy(
    userId: string,
    type: PolicyType,
    context?: { route?: string; viewState?: string }
  ): Promise<PolicyResolution | null> {
    // Check if user has an active experiment assignment
    const { data: assignment } = await supabase
      .from('ada_experiment_assignments')
      .select(`
        id,
        experiment_id,
        variant_id,
        ada_experiment_variants!inner(
          id,
          name,
          policy_id,
          ada_policies!inner(*)
        ),
        ada_experiments!inner(
          id,
          status,
          target_policy_type,
          target_route,
          start_at,
          end_at
        )
      `)
      .eq('user_id', userId)
      .single();

    if (!assignment) {
      return null;
    }

    const typedAssignment = assignment as unknown as ExperimentAssignmentWithRelations;
    const experiment = typedAssignment.ada_experiments;
    const variant = typedAssignment.ada_experiment_variants;
    const policy = variant.ada_policies;

    // Verify experiment is running and matches criteria
    if (
      experiment.status !== 'running' ||
      experiment.target_policy_type !== type ||
      (experiment.start_at && new Date(experiment.start_at) > new Date()) ||
      (experiment.end_at && new Date(experiment.end_at) < new Date())
    ) {
      return null;
    }

    // Check route/context match if specified
    if (experiment.target_route && context?.route) {
      if (!context.route.includes(experiment.target_route)) {
        return null;
      }
    }

    return {
      policy,
      source: 'experiment',
      experimentId: experiment.id,
      variantId: variant.id,
    };
  }

  private async getCohortPolicy(
    userId: string,
    type: PolicyType
  ): Promise<PolicyResolution | null> {
    // Get user's cohorts
    const { data: cohorts } = await supabase
      .rpc('get_user_cohorts', { p_user_id: userId });

    if (!cohorts || cohorts.length === 0) {
      return null;
    }

    const typedCohorts = cohorts as CohortResult[];
    const cohortIds = typedCohorts.map(c => c.cohort_id);

    // Find highest priority cohort-specific policy
    const { data: policies } = await supabase
      .from('ada_policies')
      .select('*')
      .eq('type', type)
      .eq('scope', 'cohort')
      .eq('is_active', true);

    if (!policies || policies.length === 0) {
      return null;
    }

    // For now, return first match (can add priority logic later)
    const policy = policies[0] as AdaPolicy;

    return {
      policy,
      source: 'cohort',
    };
  }

  private async getGlobalPolicy(type: PolicyType): Promise<AdaPolicy | null> {
    const { data } = await supabase
      .from('ada_policies')
      .select('*')
      .eq('type', type)
      .eq('scope', 'global')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return data as AdaPolicy | null;
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.policyCache.clear();
  }
}

export const adaptiveConfigService = AdaptiveConfigService.getInstance();
