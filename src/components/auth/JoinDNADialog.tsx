import React, { useState } from 'react';
import {
  ResponsiveModal,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import BetaSignupDialog from './BetaSignupDialog';

interface JoinDNADialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTakeSurvey: () => void;
}

const JoinDNADialog: React.FC<JoinDNADialogProps> = ({ isOpen, onClose, onTakeSurvey }) => {
  const [isBetaSignupOpen, setIsBetaSignupOpen] = useState(false);

  const handleJoinBeta = () => {
    onClose();
    setIsBetaSignupOpen(true);
  };

  return (
    <>
      <ResponsiveModal open={isOpen} onOpenChange={onClose} className="max-w-md">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-dna-emerald" />
            Join the DNA Community
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-left space-y-4 pt-4">
            <p>
              We're building something amazing for the African diaspora! Here's how you can be part of our journey:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Share your voice through our market validation survey</li>
              <li>Help us understand the needs of our community</li>
              <li>Get early access updates on our development progress</li>
              <li>Be the first to know when we launch new features</li>
              <li>Join focus groups and beta testing opportunities</li>
            </ul>
            <div className="bg-dna-emerald/10 p-3 rounded">
              <p className="text-sm text-muted-foreground">
                <strong>Beta Program Available:</strong> Join our beta testing program to get hands-on experience 
                with the platform and help shape its development!
              </p>
            </div>
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <div className="flex gap-3 px-4 pb-4">
          <Button 
            onClick={handleJoinBeta}
            className="flex-1 bg-dna-emerald hover:bg-dna-forest text-white"
          >
            Join Beta Program
          </Button>
          <Button 
            onClick={() => {
              onClose();
              onTakeSurvey();
            }} 
            variant="outline"
          >
            Take Survey
          </Button>
        </div>
      </ResponsiveModal>

      <BetaSignupDialog 
        isOpen={isBetaSignupOpen} 
        onClose={() => setIsBetaSignupOpen(false)} 
      />
    </>
  );
};

export default JoinDNADialog;
