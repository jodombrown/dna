import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import type { OpportunityApplication, ApplicationStatus } from '@/types/applicationTypes';
import { UserCheck, UserX, Star } from 'lucide-react';

interface ApplicationCardProps {
  application: OpportunityApplication;
  onStatusChange: (applicationId: string, newStatus: ApplicationStatus) => void;
  onSelect: (application: OpportunityApplication) => void;
  isUpdating?: boolean;
}

export function ApplicationCard({ application, onStatusChange, onSelect, isUpdating }: ApplicationCardProps) {
  const initials = (application.applicant_name || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2);

  return (
    <div
      className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => onSelect(application)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(application)}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={application.applicant_avatar || undefined} alt={application.applicant_name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-foreground truncate">
              {application.applicant_name}
            </span>
            <ApplicationStatusBadge status={application.status} />
          </div>
          {application.applicant_headline && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {application.applicant_headline}
            </p>
          )}
          {application.cover_letter && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {application.cover_letter}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Applied {new Date(application.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Action buttons - only for actionable statuses */}
      {(application.status === 'pending' || application.status === 'shortlisted') && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          {application.status === 'pending' && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => { e.stopPropagation(); onStatusChange(application.id, 'shortlisted'); }}
              disabled={isUpdating}
              className="text-xs"
            >
              <Star className="h-3 w-3 mr-1" />
              Shortlist
            </Button>
          )}
          <Button
            size="sm"
            onClick={(e) => { e.stopPropagation(); onStatusChange(application.id, 'accepted'); }}
            disabled={isUpdating}
            className="text-xs bg-[#4A8D77] hover:bg-[#3d7563]"
          >
            <UserCheck className="h-3 w-3 mr-1" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => { e.stopPropagation(); onStatusChange(application.id, 'rejected'); }}
            disabled={isUpdating}
            className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <UserX className="h-3 w-3 mr-1" />
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}
