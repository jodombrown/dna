
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Users, Calendar, UserPlus } from 'lucide-react';

interface JoinDNADialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTakeSurvey: () => void;
}

const JoinDNADialog: React.FC<JoinDNADialogProps> = ({ isOpen, onClose, onTakeSurvey }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-dna-emerald" />
            Join the DNA Community
          </DialogTitle>
          <DialogDescription className="text-left space-y-4 pt-4">
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
              <p className="text-sm text-gray-600">
                <strong>Phase 3 Update:</strong> Public sign-up will be available in Phase 3 of our development. 
                For now, help us build better by sharing your insights!
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3">
          <Button 
            onClick={() => {
              onClose();
              onTakeSurvey();
            }} 
            className="flex-1 bg-dna-emerald hover:bg-dna-forest text-white"
          >
            Take Survey
          </Button>
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinDNADialog;
