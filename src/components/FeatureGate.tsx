import React from 'react';
import { useFeatureFlags, FeatureFlags } from '@/hooks/useFeatureFlags';

interface FeatureGateProps {
  feature: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const FeatureGate: React.FC<FeatureGateProps> = ({ 
  feature, 
  children, 
  fallback = null 
}) => {
  const { flags, loading } = useFeatureFlags();

  if (loading) {
    return fallback;
  }

  return flags[feature] ? <>{children}</> : <>{fallback}</>;
};

export default FeatureGate;