
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Users, Calendar, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConnectDialogsProps {
  isConnectDialogOpen: boolean;
  setIsConnectDialogOpen: (open: boolean) => void;
  isMessageDialogOpen: boolean;
  setIsMessageDialogOpen: (open: boolean) => void;
  isJoinCommunityDialogOpen: boolean;
  setIsJoinCommunityDialogOpen: (open: boolean) => void;
  isRegisterEventDialogOpen: boolean;
  setIsRegisterEventDialogOpen: (open: boolean) => void;
}

const ConnectDialogs: React.FC<ConnectDialogsProps> = ({
  isConnectDialogOpen,
  setIsConnectDialogOpen,
  isMessageDialogOpen,
  setIsMessageDialogOpen,
  isJoinCommunityDialogOpen,
  setIsJoinCommunityDialogOpen,
  isRegisterEventDialogOpen,
  setIsRegisterEventDialogOpen
}) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Connect Dialog */}
      <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-dna-emerald" />
              How Professional Connections Work
            </DialogTitle>
            <DialogDescription className="text-left space-y-4 pt-4">
              <p>
                In our fully built platform, the Connect feature will enable you to:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Send personalized connection requests with custom messages</li>
                <li>Build your professional network across the African diaspora</li>
                <li>Access detailed professional profiles and expertise areas</li>
                <li>Receive intelligent matching suggestions based on your interests</li>
                <li>Join professional groups and industry-specific communities</li>
                <li>Participate in networking events and virtual meetups</li>
              </ul>
              <p className="text-sm text-gray-600 bg-dna-emerald/10 p-3 rounded">
                Right now, you would need to create an account to access these networking features. We're building this to be the premier professional network for the African diaspora.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/auth')} className="flex-1 bg-dna-emerald hover:bg-dna-forest text-white">
              Create Account
            </Button>
            <Button variant="outline" onClick={() => setIsConnectDialogOpen(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-dna-copper" />
              How Messaging Works
            </DialogTitle>
            <DialogDescription className="text-left space-y-4 pt-4">
              <p>
                Our messaging system will provide secure, professional communication:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Direct messaging with diaspora professionals worldwide</li>
                <li>Group messaging for project collaborations</li>
                <li>File sharing and document collaboration tools</li>
                <li>Video call integration for face-to-face conversations</li>
                <li>Translation services for cross-language communication</li>
                <li>Professional networking etiquette guidelines</li>
              </ul>
              <p className="text-sm text-gray-600 bg-dna-copper/10 p-3 rounded">
                To use messaging features, you'll need to be a registered member of our platform.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/auth')} className="flex-1 bg-dna-copper hover:bg-dna-gold text-white">
              Join Platform
            </Button>
            <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Community Dialog */}
      <Dialog open={isJoinCommunityDialogOpen} onOpenChange={setIsJoinCommunityDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-dna-emerald" />
              How Community Joining Works
            </DialogTitle>
            <DialogDescription className="text-left space-y-4 pt-4">
              <p>
                Our community platform will offer rich, engaging experiences:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Join interest-based and professional communities</li>
                <li>Participate in community discussions and forums</li>
                <li>Access exclusive community resources and tools</li>
                <li>Connect with like-minded diaspora members</li>
                <li>Organize and attend community events</li>
                <li>Share knowledge and collaborate on projects</li>
              </ul>
              <p className="text-sm text-gray-600 bg-dna-emerald/10 p-3 rounded">
                Community membership requires platform registration to ensure quality interactions and member safety.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/auth')} className="flex-1 bg-dna-emerald hover:bg-dna-forest text-white">
              Join Platform
            </Button>
            <Button variant="outline" onClick={() => setIsJoinCommunityDialogOpen(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Register Event Dialog */}
      <Dialog open={isRegisterEventDialogOpen} onOpenChange={setIsRegisterEventDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-dna-copper" />
              How Event Registration Works
            </DialogTitle>
            <DialogDescription className="text-left space-y-4 pt-4">
              <p>
                Our event system will provide comprehensive networking opportunities:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Register for professional development workshops</li>
                <li>Attend virtual and in-person networking events</li>
                <li>Participate in cultural celebrations and meetups</li>
                <li>Access industry-specific conferences and panels</li>
                <li>Connect with event attendees before and after</li>
                <li>Receive event recordings and follow-up resources</li>
              </ul>
              <p className="text-sm text-gray-600 bg-dna-copper/10 p-3 rounded">
                Event registration requires an account to manage your attendance and provide personalized recommendations.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/auth')} className="flex-1 bg-dna-copper hover:bg-dna-gold text-white">
              Create Account
            </Button>
            <Button variant="outline" onClick={() => setIsRegisterEventDialogOpen(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConnectDialogs;
