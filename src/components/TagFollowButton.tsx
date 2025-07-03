
import React from 'react';
import { Button } from '@/components/ui/button';
import { Hash, Plus, Check } from 'lucide-react';
import { useFollowSystem } from '@/hooks/useFollowSystem';
import { useAuth } from '@/contexts/CleanAuthContext';

interface TagFollowButtonProps {
  tag: string;
  size?: 'sm' | 'md';
  minimal?: boolean;
}

const TagFollowButton: React.FC<TagFollowButtonProps> = ({ 
  tag, 
  size = 'sm',
  minimal = true 
}) => {
  const { user } = useAuth();
  const { isFollowing, loading, toggleFollow } = useFollowSystem('tag', tag);

  if (!user || !tag) {
    return null;
  }

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <Button
      onClick={toggleFollow}
      disabled={loading}
      variant="ghost"
      size="sm"
      className={`h-6 px-2 text-xs ${
        isFollowing 
          ? 'text-dna-emerald hover:text-dna-forest' 
          : 'text-gray-500 hover:text-dna-emerald'
      }`}
    >
      {loading ? (
        <div className={`animate-spin rounded-full border border-current border-t-transparent ${iconSize}`} />
      ) : isFollowing ? (
        <>
          <Check className={`mr-1 ${iconSize}`} />
          {!minimal && 'Following'}
        </>
      ) : (
        <>
          <Plus className={`mr-1 ${iconSize}`} />
          {!minimal && 'Follow'}
        </>
      )}
    </Button>
  );
};

export default TagFollowButton;
