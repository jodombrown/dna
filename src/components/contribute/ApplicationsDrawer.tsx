import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ApplicationCard } from './ApplicationCard';
import { ApplicationDetailDrawer } from './ApplicationDetailDrawer';
import { contributeApplicationService } from '@/services/contributeApplicationService';
import type { OpportunityApplication, ApplicationStatus } from '@/types/applicationTypes';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/useMobile';
import { Users } from 'lucide-react';

interface ApplicationsDrawerProps {
  opportunityId: string;
  opportunityTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplicationsDrawer({ opportunityId, opportunityTitle, isOpen, onClose }: ApplicationsDrawerProps) {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [statusTab, setStatusTab] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<OpportunityApplication | null>(null);
  const [confirmAccept, setConfirmAccept] = useState<OpportunityApplication | null>(null);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['opportunity-applications', opportunityId, statusTab],
    queryFn: () => contributeApplicationService.getApplicationsForOpportunity(
      opportunityId,
      statusTab === 'all' ? undefined : statusTab
    ),
    enabled: isOpen,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ applicationId, newStatus, notes }: { applicationId: string; newStatus: ApplicationStatus; notes?: string }) => {
      return contributeApplicationService.updateApplicationStatus(applicationId, newStatus, notes);
    },
    onSuccess: (_, variables) => {
      const statusLabel = variables.newStatus === 'accepted' ? 'accepted' : variables.newStatus === 'rejected' ? 'declined' : variables.newStatus;
      toast.success(`Application ${statusLabel}`);
      queryClient.invalidateQueries({ queryKey: ['opportunity-applications', opportunityId] });
      setConfirmAccept(null);
    },
    onError: () => {
      toast.error('Failed to update application status');
    },
  });

  const handleStatusChange = (applicationId: string, newStatus: ApplicationStatus) => {
    if (newStatus === 'accepted') {
      const app = applications.find(a => a.id === applicationId);
      if (app) {
        setConfirmAccept(app);
        return;
      }
    }
    statusMutation.mutate({ applicationId, newStatus });
  };

  const handleConfirmAccept = () => {
    if (!confirmAccept) return;
    statusMutation.mutate({ applicationId: confirmAccept.id, newStatus: 'accepted' });
  };

  const content = (
    <div className="flex flex-col h-full">
      <Tabs value={statusTab} onValueChange={setStatusTab} className="flex-1">
        <TabsList className="grid grid-cols-5 mx-4 mb-4">
          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
          <TabsTrigger value="shortlisted" className="text-xs">Shortlisted</TabsTrigger>
          <TabsTrigger value="accepted" className="text-xs">Accepted</TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={statusTab} className="px-4 space-y-3 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No {statusTab === 'all' ? '' : statusTab} applications
              </p>
            </div>
          ) : (
            applications.map(app => (
              <ApplicationCard
                key={app.id}
                application={app}
                onStatusChange={handleStatusChange}
                onSelect={setSelectedApp}
                isUpdating={statusMutation.isPending}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  const title = (
    <div className="flex items-center gap-2">
      <span>{opportunityTitle}</span>
      <span className="text-sm font-normal text-muted-foreground">
        ({applications.length} applicant{applications.length !== 1 ? 's' : ''})
      </span>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DrawerContent className="h-[85dvh]">
            <DrawerHeader>
              <DrawerTitle className="text-left">{title}</DrawerTitle>
            </DrawerHeader>
            {content}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            {content}
          </DialogContent>
        </Dialog>
      )}

      {/* Accept Confirmation */}
      <AlertDialog open={!!confirmAccept} onOpenChange={(open) => !open && setConfirmAccept(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept {confirmAccept?.applicant_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will start a fulfillment process with {confirmAccept?.applicant_name}. 
              The opportunity will remain open for other applications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAccept}
              className="bg-[#4A8D77] hover:bg-[#3d7563]"
            >
              Confirm Accept
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Application Detail */}
      {selectedApp && (
        <ApplicationDetailDrawer
          application={selectedApp}
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusChange={handleStatusChange}
          isUpdating={statusMutation.isPending}
        />
      )}
    </>
  );
}
