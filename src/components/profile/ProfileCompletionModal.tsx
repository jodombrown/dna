import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Lock, Star } from 'lucide-react';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScore: number;
  requiredScore: number;
  featureName: string;
}

export const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({
  isOpen,
  onClose,
  currentScore,
  requiredScore,
  featureName,
}) => {
  const navigate = useNavigate();

  const handleCompleteProfile = () => {
    onClose();
    navigate('/app/profile/edit');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-500" />
            Unlock More Features
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
              <Star className="h-4 w-4" />
              {requiredScore}% Profile Required
            </div>
            <p className="text-muted-foreground">
              Complete your profile to access <strong>{featureName}</strong>. 
              You're currently at {currentScore}%.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Profile Completeness</span>
              <span className="font-medium">{currentScore}% / {requiredScore}%</span>
            </div>
            <Progress value={currentScore} className="h-2" />
            <div className="text-xs text-muted-foreground text-center">
              {requiredScore - currentScore}% more to unlock this feature
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Maybe Later
            </Button>
            <Button onClick={handleCompleteProfile} className="flex-1">
              Complete Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};