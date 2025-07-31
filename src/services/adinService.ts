import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type AdinProfile = Tables<'adin_profiles'>;
export type UserContribution = Tables<'user_contributions'>;
export type ImpactLog = Tables<'impact_log'>;
export type AdinSignal = Tables<'adin_signals'>;


export const adinService = {
  // Get user's ADIN profile
  async getAdinProfile(userId: string): Promise<AdinProfile | null> {
    const { data, error } = await supabase
      .from('adin_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Create or update ADIN profile
  async upsertAdinProfile(userId: string, updates: Partial<AdinProfile>) {
    const { data, error } = await supabase
      .from('adin_profiles')
      .upsert({
        id: userId,
        ...updates,
        last_updated: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get user contributions
  async getUserContributions(userId: string, limit = 10): Promise<UserContribution[]> {
    const { data, error } = await supabase
      .from('user_contributions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  // Get impact logs
  async getImpactLogs(userId: string, limit = 20): Promise<ImpactLog[]> {
    const { data, error } = await supabase
      .from('impact_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  // Get ADIN signals
  async getAdinSignals(userId: string, unseenOnly = false): Promise<AdinSignal[]> {
    let query = supabase
      .from('adin_signals')
      .select('*')
      .eq('user_id', userId);
    
    if (unseenOnly) {
      query = query.eq('seen', false);
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Mark signal as seen
  async markSignalSeen(signalId: string) {
    const { error } = await supabase
      .from('adin_signals')
      .update({ seen: true })
      .eq('id', signalId);
    
    if (error) throw error;
  },

  // Update influence score (admin function)
  async updateInfluenceScore(userId: string) {
    const { error } = await supabase.rpc('update_all_influence_scores');
    if (error) throw error;
  }
};