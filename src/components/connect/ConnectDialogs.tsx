
import React, { useState } from 'react';
import {
  ResponsiveModal,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Users, Calendar, UserPlus, MessageCircle } from 'lucide-react';
import BetaSignupDialog from '@/components/auth/BetaSignupDialog';

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

interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: React.ReactNode;
  title: string;
  items: string[];
  note: string;
  noteColor: string;
  ctaColor: string;
  onJoinBeta: () => void;
}

const InfoDialog: React.FC<InfoDialogProps> = ({
  open, onOpenChange, icon, title, items, note, noteColor, ctaColor, onJoinBeta,
}) => (
  <ResponsiveModal open={open} onOpenChange={onOpenChange}>
    <ResponsiveModalHeader>
      <ResponsiveModalTitle className="flex items-center gap-2">
        {icon}
        {title}
      </ResponsiveModalTitle>
    </ResponsiveModalHeader>
    <div className="px-4 pb-6 space-y-4">
      <ul className="list-disc pl-5 space-y-2 text-sm">
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
      <p className={`text-sm p-3 rounded ${noteColor}`}>{note}</p>
      <div className="flex gap-3">
        <Button onClick={onJoinBeta} className={`flex-1 text-white ${ctaColor}`}>
          Join Beta Program
        </Button>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Got it</Button>
      </div>
    </div>
  </ResponsiveModal>
);

const ConnectDialogs: React.FC<ConnectDialogsProps> = ({
  isConnectDialogOpen, setIsConnectDialogOpen,
  isMessageDialogOpen, setIsMessageDialogOpen,
  isJoinCommunityDialogOpen, setIsJoinCommunityDialogOpen,
  isRegisterEventDialogOpen, setIsRegisterEventDialogOpen,
}) => {
  const [isBetaSignupOpen, setIsBetaSignupOpen] = useState(false);

  const handleJoinBeta = (dialogSetter: (open: boolean) => void) => {
    dialogSetter(false);
    setIsBetaSignupOpen(true);
  };

  return (
    <>
      <InfoDialog
        open={isConnectDialogOpen}
        onOpenChange={setIsConnectDialogOpen}
        icon={<Users className="w-5 h-5 text-dna-emerald" />}
        title="How Professional Connections Work"
        items={[
          'Send personalized connection requests with custom messages',
          'Build your professional network across the African diaspora',
          'Access detailed professional profiles and expertise areas',
          'Receive intelligent matching suggestions based on your interests',
          'Join professional groups and industry-specific communities',
          'Participate in networking events and virtual meetups',
        ]}
        note="Right now, you would need to create an account to access these networking features. We're building this to be the premier professional network for the African diaspora."
        noteColor="text-muted-foreground bg-dna-emerald/10"
        ctaColor="bg-dna-emerald hover:bg-dna-forest"
        onJoinBeta={() => handleJoinBeta(setIsConnectDialogOpen)}
      />

      <InfoDialog
        open={isMessageDialogOpen}
        onOpenChange={setIsMessageDialogOpen}
        icon={<MessageCircle className="w-5 h-5 text-dna-copper" />}
        title="How Messaging Works"
        items={[
          'Direct messaging with diaspora professionals worldwide',
          'Group messaging for project collaborations',
          'File sharing and document collaboration tools',
          'Video call integration for face-to-face conversations',
          'Translation services for cross-language communication',
          'Professional networking etiquette guidelines',
        ]}
        note="To use messaging features, you'll need to be a registered member of our platform."
        noteColor="text-muted-foreground bg-dna-copper/10"
        ctaColor="bg-dna-copper hover:bg-dna-gold"
        onJoinBeta={() => handleJoinBeta(setIsMessageDialogOpen)}
      />

      <InfoDialog
        open={isJoinCommunityDialogOpen}
        onOpenChange={setIsJoinCommunityDialogOpen}
        icon={<UserPlus className="w-5 h-5 text-dna-emerald" />}
        title="How Community Joining Works"
        items={[
          'Join interest-based and professional communities',
          'Participate in community discussions and forums',
          'Access exclusive community resources and tools',
          'Connect with like-minded diaspora members',
          'Organize and attend community events',
          'Share knowledge and collaborate on projects',
        ]}
        note="Community membership requires platform registration to ensure quality interactions and member safety."
        noteColor="text-muted-foreground bg-dna-emerald/10"
        ctaColor="bg-dna-emerald hover:bg-dna-forest"
        onJoinBeta={() => handleJoinBeta(setIsJoinCommunityDialogOpen)}
      />

      <InfoDialog
        open={isRegisterEventDialogOpen}
        onOpenChange={setIsRegisterEventDialogOpen}
        icon={<Calendar className="w-5 h-5 text-dna-copper" />}
        title="How Event Registration Works"
        items={[
          'Register for professional development workshops',
          'Attend virtual and in-person networking events',
          'Participate in cultural celebrations and meetups',
          'Access industry-specific conferences and panels',
          'Connect with event attendees before and after',
          'Receive event recordings and follow-up resources',
        ]}
        note="Event registration requires an account to manage your attendance and provide personalized recommendations."
        noteColor="text-muted-foreground bg-dna-copper/10"
        ctaColor="bg-dna-copper hover:bg-dna-gold"
        onJoinBeta={() => handleJoinBeta(setIsRegisterEventDialogOpen)}
      />

      <BetaSignupDialog
        isOpen={isBetaSignupOpen}
        onClose={() => setIsBetaSignupOpen(false)}
      />
    </>
  );
};

export default ConnectDialogs;
