
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MessageSquare, FileText, Video } from 'lucide-react';

interface CollaborationsDialogsProps {
  isDiscussionDialogOpen: boolean;
  setIsDiscussionDialogOpen: (open: boolean) => void;
  isDocumentsDialogOpen: boolean;
  setIsDocumentsDialogOpen: (open: boolean) => void;
  isMeetingDialogOpen: boolean;
  setIsMeetingDialogOpen: (open: boolean) => void;
}

const CollaborationsDialogs: React.FC<CollaborationsDialogsProps> = ({
  isDiscussionDialogOpen,
  setIsDiscussionDialogOpen,
  isDocumentsDialogOpen,
  setIsDocumentsDialogOpen,
  isMeetingDialogOpen,
  setIsMeetingDialogOpen
}) => {
  return (
    <>
      {/* Discussion Dialog */}
      <Dialog open={isDiscussionDialogOpen} onOpenChange={setIsDiscussionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-dna-copper" />
              Project Discussion Spaces
            </DialogTitle>
            <DialogDescription className="text-left space-y-4 pt-4">
              <p>
                Our collaboration platform will feature integrated discussion spaces where team members can:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Participate in real-time project discussions and updates</li>
                <li>Share ideas and provide feedback on project milestones</li>
                <li>Access threaded conversations organized by project phases</li>
                <li>Receive notifications for important project announcements</li>
                <li>Connect with subject matter experts and advisors</li>
                <li>Vote on project decisions and resource allocation</li>
              </ul>
              <p className="text-sm text-gray-600 bg-dna-copper/10 p-3 rounded">
                This will be your central hub for all project-related communication and decision-making.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setIsDiscussionDialogOpen(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Documents Dialog */}
      <Dialog open={isDocumentsDialogOpen} onOpenChange={setIsDocumentsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-dna-emerald" />
              Collaborative Document Management
            </DialogTitle>
            <DialogDescription className="text-left space-y-4 pt-4">
              <p>
                Our document management system will provide secure access to:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Project proposals, budgets, and implementation plans</li>
                <li>Real-time collaborative editing capabilities</li>
                <li>Version control and change tracking</li>
                <li>Legal agreements and compliance documentation</li>
                <li>Progress reports and impact measurements</li>
                <li>Resource libraries and best practice guides</li>
              </ul>
              <p className="text-sm text-gray-600 bg-dna-emerald/10 p-3 rounded">
                All documents will be encrypted and accessible based on your role and permission level within each project.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setIsDocumentsDialogOpen(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Meeting Dialog */}
      <Dialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-dna-forest" />
              Virtual Meeting Spaces
            </DialogTitle>
            <DialogDescription className="text-left space-y-4 pt-4">
              <p>
                Integrated video conferencing will enable seamless collaboration:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Scheduled project meetings with automatic calendar integration</li>
                <li>Breakout rooms for specialized working groups</li>
                <li>Screen sharing and collaborative whiteboarding</li>
                <li>Meeting recordings and automated transcriptions</li>
                <li>Multi-language interpretation services</li>
                <li>Mobile-optimized participation for global accessibility</li>
              </ul>
              <p className="text-sm text-gray-600 bg-dna-forest/10 p-3 rounded">
                Meeting rooms will be available 24/7 with timezone-friendly scheduling to accommodate our global diaspora community.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setIsMeetingDialogOpen(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CollaborationsDialogs;
