import React from 'react';
import { Link } from 'react-router-dom';
import { UserAvatar } from './UserAvatar';
import { getProfileUrl } from '@/utils/profileLinks';
import { cn } from '@/lib/utils';

interface UserChipProps {
  user: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
  showLink?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  showName?: boolean;
  avatarSize?: 'sm' | 'md' | 'lg';
}

export const UserChip: React.FC<UserChipProps> = ({
  user,
  showLink = true,
  className,
  onClick,
  showName = true,
  avatarSize = 'md'
}) => {
  const displayName = user.full_name || user.username || 'User';
  const profileUrl = getProfileUrl(user);
  
  const chipContent = (
    <div className={cn(
      "flex items-center gap-2",
      onClick && "cursor-pointer",
      className
    )}>
      <UserAvatar 
        user={user} 
        size={avatarSize}
        showLink={false}
      />
      {showName && (
        <span className="text-sm font-medium truncate">
          {displayName}
        </span>
      )}
    </div>
  );

  if (!showLink || onClick) {
    return (
      <div onClick={onClick}>
        {chipContent}
      </div>
    );
  }

  return (
    <Link to={profileUrl} className="inline-block hover:opacity-80 transition-opacity">
      {chipContent}
    </Link>
  );
};