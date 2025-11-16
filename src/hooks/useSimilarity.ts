import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { EntityType } from '@/services/interactionLogger';

interface SimilarUser {
  user_id: string;
  similarity_score: number;
}

interface SimilarEntity {
  entity_type: EntityType;
  entity_id: string;
  similarity_score: number;
}

/**
 * M4: Hook for finding similar users
 */
export function useSimilarUsers(userId: string | undefined, limit: number = 10) {
  return useQuery({
    queryKey: ['similar-users', userId, limit],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .rpc('get_similar_users', {
          target_user_id: userId,
          limit_count: limit,
        });

      if (error) throw error;
      return (data || []) as SimilarUser[];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * M4: Hook for finding similar entities
 */
export function useSimilarEntities(
  entityType: EntityType | undefined,
  entityId: string | undefined,
  limit: number = 10
) {
  return useQuery({
    queryKey: ['similar-entities', entityType, entityId, limit],
    queryFn: async () => {
      if (!entityType || !entityId) return [];

      const { data, error } = await supabase
        .rpc('get_similar_entities', {
          target_entity_type: entityType,
          target_entity_id: entityId,
          limit_count: limit,
        });

      if (error) throw error;
      return (data || []) as SimilarEntity[];
    },
    enabled: !!entityType && !!entityId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * M4: Hook for getting personalized recommendations
 */
export function usePersonalizedRecommendations(entityType: EntityType, limit: number = 10) {
  return useQuery({
    queryKey: ['personalized-recommendations', entityType, limit],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get user vector
      const { data: userVector } = await supabase
        .from('user_vectors')
        .select('vector')
        .eq('user_id', user.id)
        .single();

      if (!userVector) return [];

      // Get all entity vectors of this type
      const { data: entityVectors } = await supabase
        .from('entity_vectors')
        .select('entity_id, vector')
        .eq('entity_type', entityType)
        .limit(100);

      if (!entityVectors || entityVectors.length === 0) return [];

      // Calculate similarity scores (client-side for now)
      const userVec = JSON.parse(userVector.vector as unknown as string);
      
      const scored = entityVectors.map(ev => {
        const entityVec = JSON.parse(ev.vector as unknown as string);
        const score = calculateCosineSimilarity(userVec, entityVec);
        return {
          entity_type: entityType,
          entity_id: ev.entity_id,
          similarity_score: score,
        };
      });

      // Sort by score and return top N
      return scored
        .sort((a, b) => b.similarity_score - a.similarity_score)
        .slice(0, limit);
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Helper function
function calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) return 0;

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    magnitude1 += vec1[i] * vec1[i];
    magnitude2 += vec2[i] * vec2[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) return 0;

  return dotProduct / (magnitude1 * magnitude2);
}
