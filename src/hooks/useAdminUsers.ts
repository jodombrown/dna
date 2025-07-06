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

  // Mock data for fallback when no real users exist
  const mockUsers: AdminUser[] = [
    {
      id: '1',
      full_name: 'Sarah Okonkwo',
      email: 'sarah.okonkwo@example.com',
      avatar_url: null,
      created_at: '2024-01-15T10:30:00Z',
      is_public: true,
      onboarding_completed_at: '2024-01-15T11:00:00Z',
      last_activity: '2024-07-06T09:15:00Z',
      post_count: 12,
      community_count: 3,
      status: 'active'
    },
    {
      id: '2',
      full_name: 'Kwame Asante',
      email: 'kwame.asante@example.com',
      avatar_url: null,
      created_at: '2024-02-20T14:20:00Z',
      is_public: true,
      onboarding_completed_at: '2024-02-20T15:30:00Z',
      last_activity: '2024-07-05T16:45:00Z',
      post_count: 8,
      community_count: 2,
      status: 'active'
    },
    {
      id: '3',
      full_name: 'Amara Diallo',
      email: 'amara.diallo@example.com',
      avatar_url: null,
      created_at: '2024-03-10T08:45:00Z',
      is_public: false,
      onboarding_completed_at: null,
      last_activity: '2024-06-30T12:20:00Z',
      post_count: 2,
      community_count: 1,
      status: 'pending'
    },
    {
      id: '4',
      full_name: 'Tunde Adebayo',
      email: 'tunde.adebayo@example.com',
      avatar_url: null,
      created_at: '2024-04-05T16:10:00Z',
      is_public: true,
      onboarding_completed_at: '2024-04-05T17:00:00Z',
      last_activity: '2024-07-06T08:30:00Z',
      post_count: 15,
      community_count: 4,
      status: 'active'
    },
    {
      id: '5',
      full_name: 'Fatima El-Rashid',
      email: 'fatima.elrashid@example.com',
      avatar_url: null,
      created_at: '2024-05-12T11:25:00Z',
      is_public: true,
      onboarding_completed_at: '2024-05-12T12:15:00Z',
      last_activity: '2024-07-04T19:10:00Z',
      post_count: 6,
      community_count: 2,
      status: 'suspended'
    },
    {
      id: '6',
      full_name: 'Emmanuel Kone',
      email: 'emmanuel.kone@example.com',
      avatar_url: null,
      created_at: '2024-06-18T13:40:00Z',
      is_public: true,
      onboarding_completed_at: '2024-06-18T14:20:00Z',
      last_activity: '2024-07-06T11:55:00Z',
      post_count: 4,
      community_count: 1,
      status: 'active'
    }
  ];


  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      // First, check if we have any real users in the database
      const { count: totalRealUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // If we have real users, use them; otherwise fall back to mock data
      if (totalRealUsers && totalRealUsers > 0) {
        // Use real Supabase data
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
        setTotalCount(totalRealUsers);
      } else {
        // Fall back to mock data
        console.info('No real users found, using mock data for admin interface');
        
        // Filter mock users based on search query
        let filteredUsers = mockUsers;
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filteredUsers = mockUsers.filter(user => 
            user.full_name?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query)
          );
        }

        // Apply pagination to mock data
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

        setUsers(paginatedUsers);
        setTotalCount(filteredUsers.length);
      }
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