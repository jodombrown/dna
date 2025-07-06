import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';

interface AdminAuthWrapperProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'superadmin' | 'moderator';
}

const AdminAuthWrapper: React.FC<AdminAuthWrapperProps> = ({ 
  children, 
  requiredRole = 'admin' 
}) => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        navigate('/admin/login');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (error || !data) {
          console.error('Admin access check failed:', error);
          navigate('/admin/login');
          return;
        }

        // Check role hierarchy
        const hasAccess = checkRoleAccess(data.role, requiredRole);
        
        if (hasAccess) {
          setIsAuthorized(true);
        } else {
          navigate('/admin/login');
        }
      } catch (err) {
        console.error('Error checking admin access:', err);
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [user, navigate, requiredRole, location.pathname]);

  const checkRoleAccess = (userRole: string, requiredRole: string): boolean => {
    const roleHierarchy = {
      'moderator': 1,
      'admin': 2,
      'superadmin': 3
    };

    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    return userLevel >= requiredLevel;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner className="mx-auto mb-4" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Navigation will happen in useEffect
  }

  return <>{children}</>;
};

export default AdminAuthWrapper;