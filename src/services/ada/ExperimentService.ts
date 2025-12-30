import { supabase } from '@/integrations/supabase/client';
import { adaptiveConfigService, type AdaPolicy } from './AdaptiveConfigService';

/**
 * ADA Phase 4 - M1: Experiment Service
 * Manages experiment assignments and variant selection
 */

export interface Experiment {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  target_policy_type: 'layout' | 'modules' | 'cta' | 'nudge' | 'other';
  target_route?: string;
  cohort_id?: string;
  start_at?: Date;
  end_at?: Date;
}

export interface ExperimentVariant {
  id: string;
  experiment_id: string;
  name: string;
  policy_id: string;
  policy?: AdaPolicy;
  allocation: number;
}

export interface ExperimentAssignment {
  id: string;
  experiment_id: string;
  user_id: string;
  variant_id: string;
  assigned_at: Date;
}

// Internal types for query results with nested relations
interface VariantAssignmentWithRelations {
  id: string;
  variant_id: string;
  ada_experiment_variants: {
    id: string;
    name: string;
    policy_id: string;
    allocation: number;
    ada_policies: AdaPolicy;
  };
}

interface VariantStatsRow {
  variant_id: string;
  ada_experiment_variants: {
    name: string;
  };
}

interface VariantWithPolicy {
  id: string;
  name: string;
  policy_id: string;
  allocation: number;
  ada_policies: AdaPolicy;
}

/**
 * Experiment Service
 * Handles variant assignment and experiment resolution
 */
export class ExperimentService {
  private static instance: ExperimentService;

  private constructor() {}

  static getInstance(): ExperimentService {
    if (!ExperimentService.instance) {
      ExperimentService.instance = new ExperimentService();
    }
    return ExperimentService.instance;
  }

  /**
   * Get or create variant assignment for a user in an experiment
   */
  async getVariantForUser(
    userId: string,
    experimentId: string
  ): Promise<ExperimentVariant | null> {
    // Check for existing assignment
    const { data: existingAssignment } = await supabase
      .from('ada_experiment_assignments')
      .select(`
        id,
        variant_id,
        ada_experiment_variants!inner(
          id,
          name,
          policy_id,
          allocation,
          ada_policies!inner(*)
        )
      `)
      .eq('user_id', userId)
      .eq('experiment_id', experimentId)
      .single();

    if (existingAssignment) {
      const typedAssignment = existingAssignment as unknown as VariantAssignmentWithRelations;
      const variant = typedAssignment.ada_experiment_variants;
      return {
        id: variant.id,
        experiment_id: experimentId,
        name: variant.name,
        policy_id: variant.policy_id,
        policy: variant.ada_policies,
        allocation: variant.allocation,
      };
    }

    // No assignment yet - create one
    return this.assignUserToVariant(userId, experimentId);
  }

  /**
   * Get eligible experiments for a user in a context
   */
  async getEligibleExperiments(
    userId: string,
    policyType: string,
    route?: string
  ): Promise<Experiment[]> {
    let query = supabase
      .from('ada_experiments')
      .select('*')
      .eq('status', 'running')
      .eq('target_policy_type', policyType);

    // Filter by current time
    const now = new Date().toISOString();
    query = query.or(`start_at.is.null,start_at.lte.${now}`);
    query = query.or(`end_at.is.null,end_at.gte.${now}`);

    const { data, error } = await query;

    if (error) {
      return [];
    }

    let experiments = (data || []).map(exp => ({
      ...exp,
      start_at: exp.start_at ? new Date(exp.start_at) : undefined,
      end_at: exp.end_at ? new Date(exp.end_at) : undefined,
    })) as Experiment[];

    // Filter by route if specified
    if (route) {
      experiments = experiments.filter(
        exp => !exp.target_route || route.includes(exp.target_route)
      );
    }

    return experiments;
  }

  /**
   * Resolve experiment policy for user
   */
  async resolveExperimentPolicy(
    userId: string,
    policyType: string,
    route?: string
  ): Promise<AdaPolicy | null> {
    const eligibleExperiments = await this.getEligibleExperiments(
      userId,
      policyType,
      route
    );

    if (eligibleExperiments.length === 0) {
      return null;
    }

    // For now, use first eligible experiment
    // TODO: Add priority logic if multiple experiments match
    const experiment = eligibleExperiments[0];

    const variant = await this.getVariantForUser(userId, experiment.id);
    
    return variant?.policy || null;
  }

  /**
   * Get experiment statistics
   */
  async getExperimentStats(experimentId: string) {
    // Get total assignments per variant
    const { data: variantStats } = await supabase
      .from('ada_experiment_assignments')
      .select('variant_id, ada_experiment_variants!inner(name)')
      .eq('experiment_id', experimentId);

    if (!variantStats) {
      return null;
    }

    // Count assignments per variant
    const stats: Record<string, { name: string; count: number }> = {};
    const typedStats = variantStats as unknown as VariantStatsRow[];

    typedStats.forEach((assignment) => {
      const variantId = assignment.variant_id;
      const variantName = assignment.ada_experiment_variants.name;

      if (!stats[variantId]) {
        stats[variantId] = { name: variantName, count: 0 };
      }
      stats[variantId].count++;
    });

    return {
      total_assignments: variantStats.length,
      variants: Object.values(stats),
    };
  }

  /**
   * Get all running experiments
   */
  async getRunningExperiments(): Promise<Experiment[]> {
    const { data, error } = await supabase
      .from('ada_experiments')
      .select('*')
      .eq('status', 'running')
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return (data || []).map(exp => ({
      ...exp,
      start_at: exp.start_at ? new Date(exp.start_at) : undefined,
      end_at: exp.end_at ? new Date(exp.end_at) : undefined,
    })) as Experiment[];
  }

  // Private helper methods

  private async assignUserToVariant(
    userId: string,
    experimentId: string
  ): Promise<ExperimentVariant | null> {
    // Get experiment variants
    const { data: variants } = await supabase
      .from('ada_experiment_variants')
      .select('*, ada_policies!inner(*)')
      .eq('experiment_id', experimentId);

    if (!variants || variants.length === 0) {
      return null;
    }

    // Weighted random selection based on allocation
    const selectedVariant = this.selectVariantByAllocation(variants);

    if (!selectedVariant) {
      return null;
    }

    // Create assignment
    const { error } = await supabase
      .from('ada_experiment_assignments')
      .insert({
        user_id: userId,
        experiment_id: experimentId,
        variant_id: selectedVariant.id,
      });

    if (error) {
      return null;
    }

    const typedVariant = selectedVariant as unknown as VariantWithPolicy;
    return {
      id: typedVariant.id,
      experiment_id: experimentId,
      name: typedVariant.name,
      policy_id: typedVariant.policy_id,
      policy: typedVariant.ada_policies,
      allocation: typedVariant.allocation,
    };
  }

  private selectVariantByAllocation(variants: VariantWithPolicy[]): VariantWithPolicy | null {
    // Calculate cumulative weights
    let cumulative = 0;
    const cumulativeWeights = variants.map(v => {
      cumulative += v.allocation;
      return cumulative;
    });

    // Random selection
    const random = Math.random() * cumulative;
    
    for (let i = 0; i < cumulativeWeights.length; i++) {
      if (random <= cumulativeWeights[i]) {
        return variants[i];
      }
    }

    // Fallback to first variant
    return variants[0];
  }
}

export const experimentService = ExperimentService.getInstance();
