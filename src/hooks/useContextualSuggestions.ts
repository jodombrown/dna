import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ContextualSuggestion {
  id: string;
  type: 'person' | 'community' | 'initiative' | 'event';
  title: string;
  subtitle: string;
  description?: string;
  avatar_url?: string;
  match_reason: string;
  relevance_score: number;
  quick_actions: string[];
}

export const useContextualSuggestions = (currentPostContext?: {
  pillar?: string;
  hashtags?: string[];
  authorId?: string;
}) => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<ContextualSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchContextualSuggestions = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const suggestions: ContextualSuggestion[] = [];

      // Get context-aware people suggestions
      if (currentPostContext?.pillar) {
        const { data: similarUsers } = await supabase
          .from('profiles')
          .select('id, full_name, bio, avatar_url, impact_areas')
          .neq('id', user.id)
          .neq('id', currentPostContext.authorId || '')
          .contains('impact_areas', [currentPostContext.pillar])
          .limit(3);

        similarUsers?.forEach(profile => {
          suggestions.push({
            id: profile.id,
            type: 'person',
            title: profile.full_name || 'DNA Member',
            subtitle: profile.bio?.substring(0, 50) + '...' || 'Professional in your field',
            description: profile.bio,
            avatar_url: profile.avatar_url,
            match_reason: `Also interested in ${currentPostContext.pillar}`,
            relevance_score: 0.8,
            quick_actions: ['Follow', 'Message', 'Connect']
          });
        });
      }

      // Get related communities
      const { data: communities } = await supabase
        .from('communities')
        .select('id, name, description, category, member_count')
        .eq('is_active', true)
        .limit(2);

      communities?.forEach(community => {
        suggestions.push({
          id: community.id,
          type: 'community',
          title: community.name,
          subtitle: `${community.member_count || 0} members`,
          description: community.description,
          match_reason: `Related to ${currentPostContext?.pillar || 'your interests'}`,
          relevance_score: 0.7,
          quick_actions: ['Join', 'View', 'Save']
        });
      });

      // Sort by relevance score
      suggestions.sort((a, b) => b.relevance_score - a.relevance_score);
      setSuggestions(suggestions.slice(0, 5));

    } catch (error) {
      console.error('Error fetching contextual suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContextualSuggestions();
  }, [currentPostContext?.pillar, currentPostContext?.authorId, user?.id]);

  const handleQuickAction = async (suggestionId: string, action: string) => {
    // Placeholder for quick actions - would integrate with actual follow/join/message logic
    console.log(`Action ${action} on suggestion ${suggestionId}`);
    
    // Remove suggestion after action for better UX
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  return {
    suggestions,
    loading,
    handleQuickAction,
    refresh: fetchContextualSuggestions
  };
};