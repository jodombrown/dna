import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Heart, Users, DollarSign, HandHeart } from 'lucide-react';
import { ContributionModalData, ContributionAction } from '@/types/projectTypes';
import { useProjects } from '@/hooks/useProjects';

interface ContributionModalProps {
  data: ContributionModalData | null;
  onClose: () => void;
}

const ContributionModal = ({ data, onClose }: ContributionModalProps) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { createContribution } = useProjects();

  if (!data) return null;

  const getActionIcon = (action: ContributionAction) => {
    switch (action) {
      case 'mentor': return <Heart className="h-5 w-5" />;
      case 'join': return <Users className="h-5 w-5" />;
      case 'fund': return <DollarSign className="h-5 w-5" />;
      case 'support': return <HandHeart className="h-5 w-5" />;
    }
  };

  const getActionTitle = (action: ContributionAction) => {
    switch (action) {
      case 'mentor': return 'Offer Mentorship';
      case 'join': return 'Join Project Team';
      case 'fund': return 'Support Funding';
      case 'support': return 'Show Support';
    }
  };

  const getActionDescription = (action: ContributionAction) => {
    switch (action) {
      case 'mentor': return 'Share your expertise and guide this project toward success';
      case 'join': return 'Become an active contributor to this project';
      case 'fund': return 'Provide financial support to help this project grow';
      case 'support': return 'Show your encouragement and spread awareness';
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const success = await createContribution(data.project.id, data.action, message);
    if (success) {
      onClose();
      setMessage('');
    }
    setLoading(false);
  };

  return (
    <Dialog open={!!data} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getActionIcon(data.action)}
            {getActionTitle(data.action)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-1">{data.project.title}</h4>
            <p className="text-sm text-muted-foreground">
              {data.project.description?.substring(0, 100)}...
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            {getActionDescription(data.action)}
          </p>

          <div className="space-y-2">
            <Label htmlFor="message">
              Message {data.action === 'mentor' ? '(Tell them about your expertise)' : '(Optional)'}
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                data.action === 'mentor' 
                  ? "I have experience in... and would love to help with..."
                  : "Share your thoughts or ask questions..."
              }
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || (data.action === 'mentor' && !message.trim())}
              className="flex-1"
            >
              {loading ? 'Submitting...' : `${getActionTitle(data.action).split(' ')[0]}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContributionModal;