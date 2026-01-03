import React from 'react';
import { FileText, Calendar, Users, Briefcase, MessageCircle, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PostType, getPostTypeStyles } from '@/lib/dna/postTypeColors';

const POST_TYPE_ICONS: Record<PostType, React.ComponentType<{ className?: string }>> = {
  story: FileText,
  event: Calendar,
  project: Users,
  opportunity: Briefcase,
  post: MessageCircle,
  connection: UserPlus,
};

interface PostTypeBadgeProps {
  type: PostType;
  className?: string;
}

export function PostTypeBadge({ type, className }: PostTypeBadgeProps) {
  const styles = getPostTypeStyles(type);
  const Icon = POST_TYPE_ICONS[type];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        styles.bg,
        // Text color derived from border color
        type === 'story' && 'text-amber-700',
        type === 'event' && 'text-emerald-700',
        type === 'project' && 'text-blue-700',
        type === 'opportunity' && 'text-orange-700',
        type === 'post' && 'text-gray-600',
        type === 'connection' && 'text-purple-700',
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {styles.label}
    </span>
  );
}
