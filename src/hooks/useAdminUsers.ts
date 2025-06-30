
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  permissions: any;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

interface RegularUser {
  id: string;
  email: string;
  full_name?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  location?: string;
  profession?: string;
  bio?: string;
}

export const useAdminUsers = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [regularUsers, setRegularUsers] = useState<RegularUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdminUsers(data || []);
    } catch (err: any) {
      console.error('Error fetching admin users:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch admin users",
        variant: "destructive"
      });
    }
  };

  const fetchRegularUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setRegularUsers(data || []);
    } catch (err: any) {
      console.error('Error fetching regular users:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    }
  };

  const refetch = async () => {
    setLoading(true);
    await Promise.all([fetchAdminUsers(), fetchRegularUsers()]);
    setLoading(false);
  };

  useEffect(() => {
    refetch();
  }, []);

  return {
    adminUsers,
    regularUsers,
    loading,
    error,
    refetch
  };
};
