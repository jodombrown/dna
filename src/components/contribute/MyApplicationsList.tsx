import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import { contributeApplicationService } from '@/services/contributeApplicationService';
import type { ApplicationStatus } from '@/types/applicationTypes';
import { HandHeart, Clock, X } from 'lucide-react';
import { toast } from 'sonner';

const statusMessages: Record<string, string> = {
  pending: 'Under review',
  shortlisted: "You've been shortlisted! The poster may reach out.",
  accepted: 'Accepted -- View your fulfillment',
  rejected: 'This opportunity has been filled',
  withdrawn: 'You withdrew this application',
};

export function MyApplicationsList() {
  const { user } = useAuth();
  const [withdrawTarget, setWithdrawTarget] = useState<string | null>(null);

  const { data: applications = [], isLoading, refetch } = useQuery({
    queryKey: ['my-applications', user?.id],
    queryFn: () => contributeApplicationService.getMyApplications(),
    enabled: !!user,
  });

  // Real-time subscription
  const channelRef = useState<ReturnType<typeof supabase.channel> | null>(null);
  if (user && !channelRef[0]) {
    const channel = supabase
      .channel('my-applications-rt')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'opportunity_applications',
        filter: `applicant_id=eq.${user.id}`,
      }, () => {
        refetch();
      })
      .subscribe();
    channelRef[1](channel);
  }

  const handleWithdraw = async () => {
    if (!withdrawTarget) return;
    try {
      await contributeApplicationService.withdrawApplication(withdrawTarget);
      toast.success('Application withdrawn');
      refetch();
    } catch {
      toast.error('Failed to withdraw application');
    }
    setWithdrawTarget(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <HandHeart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-1">No applications yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Browse opportunities and submit your first application</p>
          <Button asChild>
            <Link to="/dna/contribute/needs">Browse Opportunities</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {applications.map((app: Record<string, unknown>) => {
          const opportunity = app.opportunity as Record<string, unknown> | null;
          const poster = opportunity?.poster as Record<string, unknown> | null;
          const status = (app.status as string) || 'pending';
          const statusMessage = statusMessages[status] || 'Under review';

          return (
            <Card key={app.id as string} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  {poster && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={(poster.avatar_url as string) || undefined} />
                      <AvatarFallback>{((poster.full_name as string) || 'U')[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link to={`/dna/contribute/needs/${app.opportunity_id as string}`}>
                      <CardTitle className="text-sm hover:text-primary transition-colors line-clamp-1">
                        {(opportunity?.title as string) || 'Opportunity'}
                      </CardTitle>
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {poster ? (poster.full_name as string) : 'Unknown poster'}
                    </p>
                  </div>
                  <ApplicationStatusBadge status={status as ApplicationStatus} />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground mb-2">{statusMessage}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Applied {new Date(app.created_at as string).toLocaleDateString()}
                  </div>
                  {status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive h-7"
                      onClick={() => setWithdrawTarget(app.id as string)}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Withdraw
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!withdrawTarget} onOpenChange={(open) => !open && setWithdrawTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Application?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your application. You can reapply later if the opportunity is still open.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleWithdraw} className="bg-destructive hover:bg-destructive/90">
              Withdraw
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
