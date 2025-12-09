import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Briefcase, User, FileText, ExternalLink } from 'lucide-react';
import { ConversationOriginType, OriginMetadata } from '@/types/messaging';
import { cn } from '@/lib/utils';

interface ConversationContextProps {
  originType: ConversationOriginType;
  originId?: string | null;
  originMetadata?: OriginMetadata;
  className?: string;
}

/**
 * ConversationContext - Origin banner for contextual messaging
 *
 * Displays where the conversation originated from per PRD requirements:
 * - Event (CONVENE)
 * - Project (COLLABORATE)
 * - Profile
 * - Post
 *
 * Provides clickable link to view the origin entity.
 */
const ConversationContext: React.FC<ConversationContextProps> = ({
  originType,
  originId,
  originMetadata,
  className,
}) => {
  if (!originType) return null;

  const getIcon = () => {
    switch (originType) {
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'project':
        return <Briefcase className="h-4 w-4" />;
      case 'profile':
        return <User className="h-4 w-4" />;
      case 'post':
        return <FileText className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getLabel = () => {
    switch (originType) {
      case 'event':
        return 'Started from event';
      case 'project':
        return 'Started from project';
      case 'profile':
        return 'Started from profile';
      case 'post':
        return 'Started from post';
      default:
        return 'Conversation started';
    }
  };

  const getLink = () => {
    if (originMetadata?.url) return originMetadata.url;
    if (!originId) return null;

    switch (originType) {
      case 'event':
        return `/dna/convene/events/${originId}`;
      case 'project':
        return `/dna/collaborate/projects/${originId}`;
      case 'profile':
        return `/dna/connect/profile/${originId}`;
      case 'post':
        return `/dna/connect/feed?post=${originId}`;
      default:
        return null;
    }
  };

  const link = getLink();
  const title = originMetadata?.title;
  const date = originMetadata?.date;

  const content = (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-md text-sm',
        'bg-primary/5 border border-primary/10',
        link && 'hover:bg-primary/10 transition-colors cursor-pointer',
        className
      )}
    >
      <span className="text-primary">{getIcon()}</span>
      <div className="flex-1 min-w-0">
        <span className="text-muted-foreground">{getLabel()}</span>
        {title && (
          <span className="font-medium text-foreground ml-1">: {title}</span>
        )}
        {date && (
          <span className="text-muted-foreground text-xs ml-2">({date})</span>
        )}
      </div>
      {link && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
    </div>
  );

  if (link) {
    return (
      <Link to={link} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

export default ConversationContext;

/**
 * Compact version for message lists
 */
export const ConversationContextBadge: React.FC<{
  originType: ConversationOriginType;
  className?: string;
}> = ({ originType, className }) => {
  if (!originType) return null;

  const getIcon = () => {
    switch (originType) {
      case 'event':
        return <Calendar className="h-3 w-3" />;
      case 'project':
        return <Briefcase className="h-3 w-3" />;
      case 'profile':
        return <User className="h-3 w-3" />;
      case 'post':
        return <FileText className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs',
        'bg-muted text-muted-foreground',
        className
      )}
      title={`From ${originType}`}
    >
      {getIcon()}
    </span>
  );
};
