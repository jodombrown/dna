/**
 * DNA Platform: Releases & Features Management System
 * API functions for releases data fetching and mutations
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  Release,
  ReleaseWithDetails,
  ReleaseFilters,
  RelatedRelease,
  ReleaseCategory,
  ReleaseLifecycleStage,
  getLifecycleStage,
} from '@/types/releases';

// =============================================================================
// READ OPERATIONS
// =============================================================================

/**
 * Fetch all published releases with filters
 */
export async function fetchReleases(
  filters?: ReleaseFilters,
  page = 1,
  limit = 20
): Promise<{ releases: ReleaseWithDetails[]; total: number }> {
  // Use the releases table directly with type assertion for views that may not be in types
  let query = (supabase as any)
    .from('v_all_releases')
    .select('*', { count: 'exact' });

  // Apply lifecycle filter
  if (filters?.filter && filters.filter !== 'all') {
    query = query.eq('lifecycle_stage', filters.filter);
  }

  // Apply category filter
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  // Apply search filter
  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,subtitle.ilike.%${filters.search}%`
    );
  }

  // Apply tag filter
  if (filters?.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags);
  }

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  // Order by release date
  query = query.order('release_date', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching releases:', error);
    throw new Error(`Failed to fetch releases: ${error.message}`);
  }

  return {
    releases: (data || []) as ReleaseWithDetails[],
    total: count || 0,
  };
}

/**
 * Fetch featured releases (last 30 days)
 */
export async function fetchFeaturedReleases(): Promise<ReleaseWithDetails[]> {
  const { data, error } = await (supabase as any)
    .from('v_featured_releases')
    .select('*')
    .order('release_date', { ascending: false });

  if (error) {
    console.error('Error fetching featured releases:', error);
    throw new Error(`Failed to fetch featured releases: ${error.message}`);
  }

  return (data || []) as ReleaseWithDetails[];
}

/**
 * Fetch recent releases (31-90 days)
 */
export async function fetchRecentReleases(): Promise<ReleaseWithDetails[]> {
  const { data, error } = await (supabase as any)
    .from('v_recent_releases')
    .select('*')
    .order('release_date', { ascending: false });

  if (error) {
    console.error('Error fetching recent releases:', error);
    throw new Error(`Failed to fetch recent releases: ${error.message}`);
  }

  return (data || []) as ReleaseWithDetails[];
}

/**
 * Fetch archived releases
 */
export async function fetchArchivedReleases(): Promise<ReleaseWithDetails[]> {
  const { data, error } = await (supabase as any)
    .from('v_archived_releases')
    .select('*')
    .order('release_date', { ascending: false });

  if (error) {
    console.error('Error fetching archived releases:', error);
    throw new Error(`Failed to fetch archived releases: ${error.message}`);
  }

  return (data || []) as ReleaseWithDetails[];
}

/**
 * Fetch a single release by slug
 */
export async function fetchReleaseBySlug(
  slug: string
): Promise<ReleaseWithDetails | null> {
  const { data, error } = await (supabase as any)
    .from('v_all_releases')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching release:', error);
    throw new Error(`Failed to fetch release: ${error.message}`);
  }

  return data as ReleaseWithDetails;
}

/**
 * Get count of featured releases (for pill badge)
 */
export async function getFeaturedReleasesCount(): Promise<number> {
  const { data, error } = await (supabase as any).rpc('get_featured_releases_count');

  if (error) {
    console.error('Error getting featured count:', error);
    return 0;
  }

  return (data as number) || 0;
}

/**
 * Fetch related releases for a given release
 */
export async function fetchRelatedReleases(
  releaseId: string,
  category?: ReleaseCategory,
  limit = 3
): Promise<RelatedRelease[]> {
  const { data, error } = await (supabase as any).rpc('get_related_releases', {
    p_release_id: releaseId,
    p_category: category || null,
    p_limit: limit,
  });

  if (error) {
    console.error('Error fetching related releases:', error);
    return [];
  }

  return (data as RelatedRelease[]) || [];
}

/**
 * Increment view count for a release
 */
export async function incrementViewCount(slug: string): Promise<void> {
  const { error } = await (supabase as any).rpc('increment_release_view_count', {
    release_slug: slug,
  });

  if (error) {
    console.error('Error incrementing view count:', error);
  }
}

// =============================================================================
// SEARCH & FILTER UTILITIES
// =============================================================================

/**
 * Get all unique tags from releases
 */
export async function fetchAllReleaseTags(): Promise<string[]> {
  const { data, error } = await supabase
    .from('releases')
    .select('tags')
    .in('status', ['published', 'archived']);

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  // Flatten and deduplicate tags
  const allTags = (data || [])
    .flatMap((r) => r.tags || [])
    .filter((tag, index, self) => self.indexOf(tag) === index)
    .sort();

  return allTags;
}

/**
 * Search releases by query string
 */
export async function searchReleases(
  query: string,
  limit = 10
): Promise<ReleaseWithDetails[]> {
  const { data, error } = await (supabase as any)
    .from('v_all_releases')
    .select('*')
    .or(
      `title.ilike.%${query}%,description.ilike.%${query}%,subtitle.ilike.%${query}%`
    )
    .order('release_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error searching releases:', error);
    throw new Error(`Failed to search releases: ${error.message}`);
  }

  return (data || []) as ReleaseWithDetails[];
}

// =============================================================================
// ADMIN OPERATIONS (requires authenticated user with admin role)
// =============================================================================

/**
 * Create a new release
 */
export async function createRelease(
  release: {
    slug: string;
    title: string;
    subtitle?: string;
    description: string;
    category: ReleaseCategory;
    tags?: string[];
    release_date: string;
    status?: string;
    is_pinned?: boolean;
    hero_type?: string;
    hero_image_url?: string;
    hero_video_url?: string;
    cta_text?: string;
    cta_link?: string;
    version?: string;
    meta_title?: string;
    meta_description?: string;
  },
  features?: string[]
): Promise<Release> {
  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated to create releases');
  }

  // Create release
  const { data: releaseData, error: releaseError } = await supabase
    .from('releases')
    .insert({
      ...release,
      created_by: user.id,
    })
    .select()
    .single();

  if (releaseError) {
    console.error('Error creating release:', releaseError);
    throw new Error(`Failed to create release: ${releaseError.message}`);
  }

  // Add features if provided
  if (features && features.length > 0) {
    const featureInserts = features.map((text, index) => ({
      release_id: releaseData.id,
      feature_text: text,
      sort_order: index,
    }));

    const { error: featuresError } = await supabase
      .from('release_features')
      .insert(featureInserts);

    if (featuresError) {
      console.error('Error adding features:', featuresError);
      // Don't throw - release was created successfully
    }
  }

  return releaseData as Release;
}

/**
 * Update an existing release
 */
export async function updateRelease(
  id: string,
  updates: Partial<Release>,
  features?: string[]
): Promise<Release> {
  const { data: releaseData, error: releaseError } = await supabase
    .from('releases')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (releaseError) {
    console.error('Error updating release:', releaseError);
    throw new Error(`Failed to update release: ${releaseError.message}`);
  }

  // Update features if provided
  if (features !== undefined) {
    // Delete existing features
    await supabase.from('release_features').delete().eq('release_id', id);

    // Insert new features
    if (features.length > 0) {
      const featureInserts = features.map((text, index) => ({
        release_id: id,
        feature_text: text,
        sort_order: index,
      }));

      const { error: featuresError } = await supabase
        .from('release_features')
        .insert(featureInserts);

      if (featuresError) {
        console.error('Error updating features:', featuresError);
      }
    }
  }

  return releaseData as Release;
}

/**
 * Delete a release
 */
export async function deleteRelease(id: string): Promise<void> {
  const { error } = await supabase.from('releases').delete().eq('id', id);

  if (error) {
    console.error('Error deleting release:', error);
    throw new Error(`Failed to delete release: ${error.message}`);
  }
}

/**
 * Archive a release manually
 */
export async function archiveRelease(id: string): Promise<Release> {
  return updateRelease(id, {
    status: 'archived',
    archived_at: new Date().toISOString(),
  } as Partial<Release>);
}

/**
 * Unarchive a release (restore to published)
 */
export async function unarchiveRelease(id: string): Promise<Release> {
  return updateRelease(id, {
    status: 'published',
    archived_at: undefined,
  } as Partial<Release>);
}

/**
 * Pin/unpin a release to prevent auto-archiving
 */
export async function togglePinRelease(
  id: string,
  isPinned: boolean
): Promise<Release> {
  return updateRelease(id, { is_pinned: isPinned } as Partial<Release>);
}

// =============================================================================
// MEDIA OPERATIONS
// =============================================================================

/**
 * Add media to a release
 */
export async function addReleaseMedia(
  releaseId: string,
  media: {
    media_type: 'image' | 'video' | 'gif';
    url: string;
    alt_text?: string;
    caption?: string;
    sort_order?: number;
  }
): Promise<void> {
  const { error } = await (supabase as any).from('release_media').insert({
    release_id: releaseId,
    ...media,
  });

  if (error) {
    console.error('Error adding media:', error);
    throw new Error(`Failed to add media: ${error.message}`);
  }
}

/**
 * Remove media from a release
 */
export async function removeReleaseMedia(mediaId: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('release_media')
    .delete()
    .eq('id', mediaId);

  if (error) {
    console.error('Error removing media:', error);
    throw new Error(`Failed to remove media: ${error.message}`);
  }
}

// =============================================================================
// CHANGELOG OPERATIONS
// =============================================================================

/**
 * Add changelog entry to a release
 */
export async function addChangelogEntry(
  releaseId: string,
  entry: {
    change_type: 'added' | 'improved' | 'fixed' | 'removed' | 'security';
    description: string;
  }
): Promise<void> {
  const { error } = await (supabase as any).from('release_changelog').insert({
    release_id: releaseId,
    ...entry,
  });

  if (error) {
    console.error('Error adding changelog:', error);
    throw new Error(`Failed to add changelog entry: ${error.message}`);
  }
}

/**
 * Remove changelog entry
 */
export async function removeChangelogEntry(entryId: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('release_changelog')
    .delete()
    .eq('id', entryId);

  if (error) {
    console.error('Error removing changelog:', error);
    throw new Error(`Failed to remove changelog entry: ${error.message}`);
  }
}
