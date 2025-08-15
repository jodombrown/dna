import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProfileUrl, getUserInitials } from '@/utils/profileLinks';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  showLink?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8', 
  lg: 'w-10 h-10'
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-xs',
  lg: 'text-sm'
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  showLink = true,
  className,
  onClick
}) => {
  const displayName = user.full_name || user.username || 'User';
  const profileUrl = getProfileUrl(user);
  
  const avatarElement = (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={user.avatar_url} alt={displayName} />
      <AvatarFallback className={cn(
        "bg-dna-mint text-dna-forest font-semibold",
        textSizeClasses[size]
      )}>
        {getUserInitials(displayName)}
      </AvatarFallback>
    </Avatar>
  );

  if (!showLink || onClick) {
    return (
      <div onClick={onClick} className={onClick ? "cursor-pointer" : undefined}>
        {avatarElement}
      </div>
    );
  }

  return (
    <Link to={profileUrl} className="inline-block">
      {avatarElement}
    </Link>
  );
};