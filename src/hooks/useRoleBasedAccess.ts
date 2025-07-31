import { useAuth } from '@/contexts/AuthContext';

export const useRoleBasedAccess = () => {
  const { isAdmin, role, profile } = useAuth();

  const canCreateCommunity = isAdmin;
  const canDeleteAnyPost = isAdmin;
  const canDeleteAnyComment = isAdmin;
  const canAccessAnalytics = isAdmin;
  const canAccessAdminPanel = isAdmin;
  const canModerateContent = isAdmin;
  const canViewAllEventRegistrations = isAdmin;
  const canViewAllBetaFeedback = isAdmin;
  
  // For invite limits - admins have no limit, users have 5
  const getInviteLimit = () => isAdmin ? null : 5;
  
  const canSendInvite = (currentInviteCount: number) => {
    if (isAdmin) return true;
    return currentInviteCount < 5;
  };

  return {
    isAdmin,
    role,
    canCreateCommunity,
    canDeleteAnyPost,
    canDeleteAnyComment,
    canAccessAnalytics,
    canAccessAdminPanel,
    canModerateContent,
    canViewAllEventRegistrations,
    canViewAllBetaFeedback,
    getInviteLimit,
    canSendInvite,
  };
};