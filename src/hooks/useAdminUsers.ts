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

  // Mock data for Phase 2 - will be replaced with real Supabase data in Phase 3
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Filter users based on search query
      let filteredUsers = mockUsers;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredUsers = mockUsers.filter(user => 
          user.full_name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
        );
      }

      // Pagination
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      setUsers(paginatedUsers);
      setTotalCount(filteredUsers.length);
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