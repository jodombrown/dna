
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MessageSquare, FileText, Video, Rocket, Users } from 'lucide-react';

interface CollaborationsDialogsProps {
  isStartProjectDialogOpen: boolean;
  setIsStartProjectDialogOpen: (open: boolean) => void;
  isJoinProjectDialogOpen: boolean;
  setIsJoinProjectDialogOpen: (open: boolean) => void;
}

const CollaborationsDialogs: React.FC<CollaborationsDialogsProps> = ({
  isStartProjectDialogOpen,
  setIsStartProjectDialogOpen,
  isJoinProjectDialogOpen,
  setIsJoinProjectDialogOpen
}) => {
  return (
    <>
      {/* Start Project Dialog */}
      <Dialog open={isStartProjectDialogOpen} onOpenChange={setIsStartProjectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-dna-copper" />
              Start a New Project
            </DialogTitle>
            <DialogDescription className="text-left space-y-4 pt-4">
              <p>
                Ready to turn your idea into impact? Our project creation platform will help you:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Define your project vision and impact goals</li>
                <li>Set up collaborative workspaces and milestones</li>
                <li>Connect with skilled diaspora professionals</li>
                <li>Access funding opportunities and resources</li>
                <li>Track progress and measure real-world impact</li>
                <li>Build sustainable partnerships for long-term success</li>
              </ul>
              <p className="text-sm text-gray-600 bg-dna-copper/10 p-3 rounded">
                This feature will be available in our beta launch. Join our waitlist to be among the first to start your project!
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setIsStartProjectDialogOpen(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Project Dialog */}
      <Dialog open={isJoinProjectDialogOpen} onOpenChange={setIsJoinProjectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-dna-emerald" />
              Join an Existing Project
            </DialogTitle>
            <DialogDescription className="text-left space-y-4 pt-4">
              <p>
                Find meaningful ways to contribute your skills and expertise:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Browse projects by impact area and skill requirements</li>
                <li>Apply to join teams that match your expertise</li>
                <li>Contribute part-time or full-time based on availability</li>
                <li>Work remotely with global diaspora teams</li>
                <li>Build your portfolio while creating social impact</li>
                <li>Network with like-minded professionals worldwide</li>
              </ul>
              <p className="text-sm text-gray-600 bg-dna-emerald/10 p-3 rounded">
                Our project matching system will connect you with opportunities that align with your skills and interests.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setIsJoinProjectDialogOpen(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CollaborationsDialogs;
