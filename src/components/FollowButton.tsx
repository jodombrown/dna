
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Users } from 'lucide-react';
import { useFollowSystem, FollowTargetType } from '@/hooks/useFollowSystem';
import { useAuth } from '@/contexts/CleanAuthContext';

interface FollowButtonProps {
  targetType: FollowTargetType;
  targetId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  targetType,
  targetId,
  variant = 'default',
  size = 'md',
  showCount = true,
  className = ''
}) => {
  const { user } = useAuth();
  const { isFollowing, followerCount, loading, toggleFollow } = useFollowSystem(targetType, targetId);

  if (!user) {
    return null; // Don't show follow button if user is not logged in
  }

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';
  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        onClick={toggleFollow}
        disabled={loading}
        variant={isFollowing ? 'outline' : variant}
        size={buttonSize}
        className={`transition-all ${
          isFollowing 
            ? 'border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white' 
            : 'bg-dna-emerald hover:bg-dna-forest text-white'
        }`}
      >
        {loading ? (
          <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${iconSize}`} />
        ) : isFollowing ? (
          <UserMinus className={`mr-1 ${iconSize}`} />
        ) : (
          <UserPlus className={`mr-1 ${iconSize}`} />
        )}
        {loading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
      </Button>
      
      {showCount && (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Users className="w-3 h-3" />
          <span>{followerCount}</span>
        </div>
      )}
    </div>
  );
};

export default FollowButton;
