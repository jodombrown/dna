import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ReleaseCategory = 'CONNECT' | 'CONVENE' | 'COLLABORATE' | 'CONTRIBUTE' | 'CONVEY' | 'PLATFORM';
export type ReleaseStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type HeroType = 'gradient' | 'image' | 'video' | 'animation' | 'map' | 'chat' | 'network' | 'notification';

export interface Release {
  id: string;
  slug: string;
  version: string | null;
  title: string;
  subtitle: string | null;
  description: string;
  category: ReleaseCategory;
  tags: string[] | null;
  release_date: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  status: ReleaseStatus;
  is_pinned: boolean;
  hero_type: HeroType;
  hero_image_url: string | null;
  hero_video_url: string | null;
  cta_text: string;
  cta_link: string | null;
  meta_title: string | null;
  meta_description: string | null;
  view_count: number;
  created_by: string | null;
  features?: ReleaseFeature[];
}

export interface ReleaseFeature {
  id: string;
  release_id: string;
  feature_text: string;
  sort_order: number;
  created_at: string;
}

export type FilterType = 'all' | 'featured' | 'recent' | 'archived';

interface UseReleasesOptions {
  filter?: FilterType;
  category?: ReleaseCategory | null;
  search?: string;
}

// Get status badge based on release date
export const getReleaseBadgeStatus = (releaseDate: string): 'new' | 'recent' | 'archived' => {
  const now = new Date();
  const release = new Date(releaseDate);
  const diffDays = Math.floor((now.getTime() - release.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 30) return 'new';
  if (diffDays <= 90) return 'recent';
  return 'archived';
};

export const useReleases = (options: UseReleasesOptions = {}) => {
  const { filter = 'all', category = null, search = '' } = options;

  return useQuery({
    queryKey: ['releases', filter, category, search],
    queryFn: async () => {
      // Use type assertion to bypass TypeScript until types are regenerated
      let query = (supabase as any)
        .from('releases')
        .select(`
          *,
          features:release_features(*)
        `)
        .order('release_date', { ascending: false });

      // Apply filters based on status
      if (filter === 'featured') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query
          .eq('status', 'published')
          .gte('release_date', thirtyDaysAgo.toISOString().split('T')[0]);
      } else if (filter === 'recent') {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        query = query
          .eq('status', 'published')
          .gte('release_date', ninetyDaysAgo.toISOString().split('T')[0]);
      } else if (filter === 'archived') {
        query = query.eq('status', 'archived');
      } else {
        // 'all' - show published and archived
        query = query.in('status', ['published', 'archived']);
      }

      // Apply category filter
      if (category) {
        query = query.eq('category', category);
      }

      // Apply search filter
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as Release[];
    },
  });
};

// Hook for getting count of new releases (last 30 days)
export const useFeaturedCount = () => {
  return useQuery({
    queryKey: ['releases-featured-count'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count, error } = await (supabase as any)
        .from('releases')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .gte('release_date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 60000, // Refetch every minute
  });
};

// Group releases by month
export const groupReleasesByMonth = (releases: Release[]): Record<string, Release[]> => {
  return releases.reduce((groups, release) => {
    const date = new Date(release.release_date);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
    
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(release);
    return groups;
  }, {} as Record<string, Release[]>);
};
