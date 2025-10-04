import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, ExternalLink, Heart, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import ApplyDialog from './ApplyDialog';

interface OpportunityDetailsDialogProps {
  opportunity: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OpportunityDetailsDialog: React.FC<OpportunityDetailsDialogProps> = ({
  opportunity,
  open,
  onOpenChange,
}) => {
  const { user } = useAuth();
  const [showApply, setShowApply] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="text-2xl pr-8">{opportunity.title}</DialogTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Organization Info */}
            {opportunity.organization && (
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={opportunity.organization.logo_url} />
                  <AvatarFallback>{opportunity.organization.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{opportunity.organization.name}</p>
                  <p className="text-sm text-muted-foreground">Verified Organization</p>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-sm">
              <Badge className="px-3 py-1">{opportunity.type}</Badge>
              {opportunity.location && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {opportunity.location}
                </span>
              )}
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Posted {formatDistanceToNow(new Date(opportunity.created_at), { addSuffix: true })}
              </span>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">About this opportunity</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{opportunity.description}</p>
            </div>

            {/* Requirements */}
            {opportunity.requirements && (
              <div>
                <h3 className="font-semibold mb-2">Requirements</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{opportunity.requirements}</p>
              </div>
            )}

            {/* Skills */}
            {opportunity.skills && opportunity.skills.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Skills needed</h3>
                <div className="flex flex-wrap gap-2">
                  {opportunity.skills.map((skill: any) => (
                    <Badge key={skill.id} variant="secondary">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Causes */}
            {opportunity.causes && (
              <div>
                <h3 className="font-semibold mb-2">Impact areas</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{opportunity.causes.icon}</span>
                  <div>
                    <p className="font-medium">{opportunity.causes.name}</p>
                    <p className="text-sm text-muted-foreground">{opportunity.causes.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* External Link */}
            {opportunity.external_link && (
              <a
                href={opportunity.external_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Learn more
              </a>
            )}

            <Separator />

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                className="flex-1"
                size="lg"
                onClick={() => {
                  if (user) {
                    setShowApply(true);
                  } else {
                    window.location.href = '/auth';
                  }
                }}
              >
                Apply Now
              </Button>
              <Button variant="outline" size="lg">
                Save for Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ApplyDialog
        opportunity={opportunity}
        open={showApply}
        onOpenChange={setShowApply}
      />
    </>
  );
};

export default OpportunityDetailsDialog;
