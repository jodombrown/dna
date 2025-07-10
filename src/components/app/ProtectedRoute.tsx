import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthErrorBoundary from '@/components/auth/AuthErrorBoundary';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth' 
}: ProtectedRouteProps) => {
  const { user, loading, session } = useAuth();
  const navigate = useNavigate();
  const [authTimeout, setAuthTimeout] = useState(false);

  // Set timeout for auth loading to prevent infinite loading states
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        setAuthTimeout(true);
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    } else {
      setAuthTimeout(false);
    }
  }, [loading]);

  useEffect(() => {
    if (loading || authTimeout) return;
    
    if (requireAuth && !user) {
      navigate(redirectTo, { replace: true });
      return;
    }
    
    if (!requireAuth && user) {
      navigate('/app', { replace: true });
      return;
    }
  }, [user, loading, navigate, requireAuth, redirectTo, authTimeout]);

  // Handle auth timeout
  if (authTimeout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Authentication Timeout
          </h2>
          <p className="text-gray-600 mb-4">
            Authentication is taking longer than expected.
          </p>
          <div className="space-y-2">
            <Button onClick={() => window.location.reload()} className="w-full">
              Refresh Page
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')}
              className="w-full"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-dna-emerald mx-auto mb-4" />
          <p className="text-gray-600">Authenticating...</p>
          <p className="text-sm text-gray-400 mt-2">This should only take a moment</p>
        </div>
      </div>
    );
  }

  // Handle redirect cases
  if (requireAuth && !user) {
    return null; // Will redirect
  }

  if (!requireAuth && user) {
    return null; // Will redirect
  }

  return (
    <AuthErrorBoundary onRetry={() => window.location.reload()}>
      {children}
    </AuthErrorBoundary>
  );
};

export default ProtectedRoute;