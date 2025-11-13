import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { calculateProfileCompletion } from '@/components/profile/ProfileCompletionBar';

export const useProfileUnlock = () => {
  const { profile, user } = useAuth();
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [hasShownModal, setHasShownModal] = useState(false);

  useEffect(() => {
    if (!profile || !user || hasShownModal) return;

    const currentScore = calculateProfileCompletion(profile);

    // Check if user has just crossed the 40% threshold
    const checkAndShowUnlockModal = async () => {
      // User has >= 40% completion
      if (currentScore >= 40) {
        // Check if profile_unlocked_at is null (first time crossing threshold)
        const profileUnlockedAt = (profile as any).profile_unlocked_at;
        
        if (!profileUnlockedAt) {
          // Set the unlock timestamp using raw update to avoid type issues
          const { error } = await supabase
            .from('profiles')
            .update({ profile_unlocked_at: new Date().toISOString() } as any)
            .eq('id', user.id);

          if (!error) {
            setShowUnlockModal(true);
            setHasShownModal(true);
          }
        }
      }
    };

    checkAndShowUnlockModal();
  }, [profile, user, hasShownModal]);

  return {
    showUnlockModal,
    closeUnlockModal: () => setShowUnlockModal(false),
  };
};
