
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/CleanAuthContext';
import ContactRequestDialog from '@/components/messaging/ContactRequestDialog';
import NewMessageDialog from '@/components/messaging/NewMessageDialog';
import { MessageSquare, Users, UserPlus } from 'lucide-react';

interface ProfileActionButtonsProps {
  targetUserId: string;
  targetUserName: string;
  isOwnProfile: boolean;
  onConversationCreated?: (conversationId: string) => void;
}

const ProfileActionButtons: React.FC<ProfileActionButtonsProps> = ({
  targetUserId,
  targetUserName,
  isOwnProfile,
  onConversationCreated
}) => {
  const { user } = useAuth();
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  if (isOwnProfile || !user) {
    return null;
  }

  return (
    <>
      <div className="flex gap-3">
        <Button
          onClick={() => setShowMessageDialog(true)}
          className="bg-dna-emerald hover:bg-dna-forest text-white"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Message
        </Button>
        
        <Button
          onClick={() => setShowContactDialog(true)}
          variant="outline"
          className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Connect
        </Button>
      </div>

      <ContactRequestDialog
        isOpen={showContactDialog}
        onClose={() => setShowContactDialog(false)}
        targetUserId={targetUserId}
        targetUserName={targetUserName}
      />

      <NewMessageDialog
        isOpen={showMessageDialog}
        onClose={() => setShowMessageDialog(false)}
        targetUserId={targetUserId}
        targetUserName={targetUserName}
        onConversationCreated={onConversationCreated}
      />
    </>
  );
};

export default ProfileActionButtons;
