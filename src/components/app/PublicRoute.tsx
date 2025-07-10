import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * PublicRoute - Restricts authenticated users from accessing marketing/landing pages
 * 
 * LEGACY/MARKETING PAGES ONLY - These pages are promotional content and will be 
 * deprecated soon. Authenticated users should operate entirely within the app dashboard.
 * 
 * Allows controlled access via query parameter: ?public=true (for footer links, admin override)
 */
const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for controlled access override (e.g., from footer links)
  const searchParams = new URLSearchParams(location.search);
  const allowPublicAccess = searchParams.get('public') === 'true';

  useEffect(() => {
    // Wait for auth loading to complete to avoid flicker
    if (loading) return;
    
    // If user is authenticated and no override is present, redirect to dashboard
    if (user && !allowPublicAccess) {
      navigate('/app', { replace: true });
      return;
    }
  }, [user, loading, navigate, allowPublicAccess]);

  // Show loading state while resolving auth
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-dna-emerald mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users (will be handled by useEffect)
  if (user && !allowPublicAccess) {
    return null;
  }

  // Allow access for unauthenticated users or controlled access
  return <>{children}</>;
};

export default PublicRoute;