import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface BetaAccessGateProps {
  children: React.ReactNode;
}

const BetaAccessGate: React.FC<BetaAccessGateProps> = ({ children }) => {
  const { user, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile?.beta_access) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Beta Access Required</h2>
          <p className="text-muted-foreground">
            You need beta access to view this content. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default BetaAccessGate;