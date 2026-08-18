import React from 'react';
import { Navigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';

// Silent redirect, not an "insufficient permissions" page — a debug route
// shouldn't announce its own existence to a non-admin who finds the URL.
export const AdminOnlyDebugRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, loading } = useIsAdmin();
  if (loading) return null;
  if (!isAdmin) return <Navigate to="/dna/connect" replace />;
  return <>{children}</>;
};
export default AdminOnlyDebugRoute;
