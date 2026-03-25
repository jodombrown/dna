import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import type { OpportunityApplication, ApplicationStatus } from '@/types/applicationTypes';
import { ExternalLink, Star, UserCheck, UserX } from 'lucide-react';

interface ApplicationDetailDrawerProps {
  application: OpportunityApplication;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (applicationId: string, newStatus: ApplicationStatus) => void;
  isUpdating?: boolean;
}

export function ApplicationDetailDrawer({
  application,
  isOpen,
  onClose,
  onStatusChange,
  isUpdating,
}: ApplicationDetailDrawerProps) {
  const [posterNotes, setPosterNotes] = useState(application.poster_notes || '');
  const initials = (application.applicant_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2);

  const isActionable = application.status === 'pending' || application.status === 'shortlisted';

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="h-[90dvh]">
        <DrawerHeader>
          <DrawerTitle className="text-left">Application Details</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-6 overflow-y-auto flex-1">
          {/* Applicant Profile */}
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={application.applicant_avatar || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground">{application.applicant_name}</h3>
                <ApplicationStatusBadge status={application.status} />
              </div>
              {application.applicant_headline && (
                <p className="text-sm text-muted-foreground mt-0.5">{application.applicant_headline}</p>
              )}
              {application.applicant_username && (
                <Link
                  to={`/dna/connect/profile/${application.applicant_username}`}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                >
                  View full profile <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>

          {/* Cover Message */}
          <div>
            <Label className="text-sm font-medium text-foreground">Cover Message</Label>
            <div className="mt-2 p-3 bg-muted rounded-lg">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {application.cover_letter || 'No cover message provided.'}
              </p>
            </div>
          </div>

          {/* Contribution Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-muted-foreground text-xs">Contribution Type</p>
              <p className="font-medium capitalize">{application.proposed_contribution_type}</p>
            </div>
            {application.proposed_hours_per_month && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-muted-foreground text-xs">Hours/Month</p>
                <p className="font-medium">{application.proposed_hours_per_month}</p>
              </div>
            )}
          </div>

          {/* Private Notes */}
          <div>
            <Label className="text-sm font-medium text-foreground">
              Private notes (not shared with applicant)
            </Label>
            <Textarea
              value={posterNotes}
              onChange={(e) => setPosterNotes(e.target.value)}
              placeholder="Add notes about this applicant..."
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Timeline */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Applied: {new Date(application.created_at).toLocaleDateString()}</p>
            {application.status_updated_at && (
              <p>Status updated: {new Date(application.status_updated_at).toLocaleDateString()}</p>
            )}
          </div>

          {/* Actions */}
          {isActionable && (
            <div className="flex items-center gap-2 pt-4 border-t border-border">
              {application.status === 'pending' && (
                <Button
                  variant="outline"
                  onClick={() => onStatusChange(application.id, 'shortlisted')}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Shortlist
                </Button>
              )}
              <Button
                onClick={() => onStatusChange(application.id, 'accepted')}
                disabled={isUpdating}
                className="flex-1 bg-[#4A8D77] hover:bg-[#3d7563]"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Accept
              </Button>
              <Button
                variant="outline"
                onClick={() => onStatusChange(application.id, 'rejected')}
                disabled={isUpdating}
                className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <UserX className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
