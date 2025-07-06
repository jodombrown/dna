import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  is_public: boolean | null;
  onboarding_completed_at: string | null;
  last_activity?: string;
  post_count?: number;
  community_count?: number;
  status: 'active' | 'suspended' | 'pending';
}

interface UseAdminUsersResult {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  refreshUsers: () => void;
}

export function useAdminUsers(pageSize: number = 10): UseAdminUsersResult {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');


  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          avatar_url,
          created_at,
          is_public,
          onboarding_completed_at
        `);

      // Apply search filter if provided
      if (searchQuery.trim()) {
        const searchTerm = searchQuery.toLowerCase();
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      // Get total count first
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Apply pagination
      const startIndex = (currentPage - 1) * pageSize;
      query = query.range(startIndex, startIndex + pageSize - 1);

      const { data: profilesData, error: profilesError } = await query;

      if (profilesError) {
        throw profilesError;
      }

      // Transform data to match AdminUser interface
      const transformedUsers: AdminUser[] = (profilesData || []).map(profile => ({
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        is_public: profile.is_public,
        onboarding_completed_at: profile.onboarding_completed_at,
        status: profile.onboarding_completed_at ? 'active' : 'pending' as const,
        post_count: 0, // Will be enhanced in future phases
        community_count: 0, // Will be enhanced in future phases
      }));

      setUsers(transformedUsers);
      setTotalCount(count || 0);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const refreshUsers = () => {
    fetchUsers();
  };

  return {
    users,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    refreshUsers
  };
}