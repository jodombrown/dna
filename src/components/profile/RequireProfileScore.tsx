import React, { useState } from 'react';
import { useProfileAccess } from '@/hooks/useProfileAccess';
import { ProfileCompletionModal } from './ProfileCompletionModal';
import { useToast } from '@/hooks/use-toast';

interface RequireProfileScoreProps {
  min: number;
  children: React.ReactNode;
  featureName: string;
  fallback?: React.ReactNode;
  showToast?: boolean;
  showModal?: boolean;
}

export const RequireProfileScore: React.FC<RequireProfileScoreProps> = ({
  min,
  children,
  featureName,
  fallback,
  showToast = false,
  showModal = true,
}) => {
  const { meetsMinScore, completenessScore } = useProfileAccess();
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  const hasAccess = meetsMinScore(min);

  const handleAccessDenied = () => {
    if (showToast) {
      toast({
        title: "Profile Incomplete",
        description: `Complete your profile to access ${featureName}. You're at ${completenessScore}%.`,
        variant: "destructive",
      });
    }
    
    if (showModal) {
      setModalOpen(true);
    }
  };

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Wrap children to intercept clicks/interactions
    return (
      <>
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAccessDenied();
          }}
          className="cursor-not-allowed opacity-60"
        >
          {children}
        </div>
        
        <ProfileCompletionModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          currentScore={completenessScore}
          requiredScore={min}
          featureName={featureName}
        />
      </>
    );
  }

  return <>{children}</>;
};