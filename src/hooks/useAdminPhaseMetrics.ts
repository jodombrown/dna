
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';

export interface PhaseMetric {
  id: string;
  phase_slug: string;
  label: string;
  value: string;
  target?: string;
  icon?: string;
  color?: string;
  updated_at: string;
}

export const useAdminPhaseMetrics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<PhaseMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async (phaseSlug?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase.from('phase_metrics').select('*');
      
      if (phaseSlug) {
        query = query.eq('phase_slug', phaseSlug);
      }
      
      const { data, error } = await query.order('updated_at', { ascending: false });
      
      if (error) throw error;
      setMetrics(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  const addMetric = async (metric: Omit<PhaseMetric, 'id' | 'updated_at'>) => {
    if (!user) throw new Error('User must be authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      // For now, skip role checking since we removed the role system
      const { data, error } = await supabase
        .from('phase_metrics')
        .insert(metric)
        .select()
        .single();
      
      if (error) throw error;
      setMetrics(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add metric');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMetric = async (id: string, updates: Partial<PhaseMetric>) => {
    if (!user) throw new Error('User must be authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('phase_metrics')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setMetrics(prev => prev.map(m => m.id === id ? data : m));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update metric');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMetric = async (id: string) => {
    if (!user) throw new Error('User must be authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('phase_metrics')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setMetrics(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete metric');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    metrics,
    loading,
    error,
    fetchMetrics,
    addMetric,
    updateMetric,
    deleteMetric
  };
};
