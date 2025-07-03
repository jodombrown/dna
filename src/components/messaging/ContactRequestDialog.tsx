
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useContactRequests } from '@/hooks/useContactRequests';
import { Users, Handshake } from 'lucide-react';

interface ContactRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
}

const ContactRequestDialog: React.FC<ContactRequestDialogProps> = ({
  isOpen,
  onClose,
  targetUserId,
  targetUserName
}) => {
  const { sendContactRequest } = useContactRequests();
  const [purpose, setPurpose] = useState<'connect' | 'collaborate'>('connect');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    const success = await sendContactRequest(targetUserId, purpose, message);
    
    if (success) {
      setMessage('');
      setPurpose('connect');
      onClose();
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Request to {targetUserName}</DialogTitle>
          <DialogDescription>
            Connect or collaborate with diaspora professionals to build meaningful relationships.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">Purpose</Label>
            <RadioGroup value={purpose} onValueChange={(value) => setPurpose(value as 'connect' | 'collaborate')}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="connect" id="connect" />
                <Label htmlFor="connect" className="flex items-center cursor-pointer flex-1">
                  <Users className="w-4 h-4 mr-2 text-dna-emerald" />
                  <div>
                    <div className="font-medium">Connect</div>
                    <div className="text-sm text-gray-600">Build professional relationships</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="collaborate" id="collaborate" />
                <Label htmlFor="collaborate" className="flex items-center cursor-pointer flex-1">
                  <Handshake className="w-4 h-4 mr-2 text-dna-copper" />
                  <div>
                    <div className="font-medium">Collaborate</div>
                    <div className="text-sm text-gray-600">Work together on projects</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Introduce yourself and explain why you'd like to connect..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-dna-emerald hover:bg-dna-forest text-white"
            >
              {loading ? 'Sending...' : `Send ${purpose === 'connect' ? 'Connection' : 'Collaboration'} Request`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactRequestDialog;
