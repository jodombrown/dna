import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldX } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!isAdmin) {
    return fallback || (
      <Alert className="max-w-md mx-auto mt-8">
        <ShieldX className="h-4 w-4" />
        <AlertDescription>
          Access denied. Administrator privileges required.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};