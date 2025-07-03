
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, Users, AlertCircle } from 'lucide-react';
import { useNewsletterEmail } from '@/hooks/useNewsletterEmail';

interface NewsletterEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newsletter: {
    id: string;
    title: string;
    created_by: string;
    email_sent_at?: string;
    email_recipient_count?: number;
  };
  onEmailSent?: (stats: { sent: number; total: number }) => void;
}

const NewsletterEmailDialog: React.FC<NewsletterEmailDialogProps> = ({
  isOpen,
  onClose,
  newsletter,
  onEmailSent
}) => {
  const { loading, sendNewsletterEmail, getFollowerCount } = useNewsletterEmail();
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState(true);

  useEffect(() => {
    if (isOpen && newsletter.created_by) {
      fetchFollowerCount();
    }
  }, [isOpen, newsletter.created_by]);

  const fetchFollowerCount = async () => {
    setLoadingCount(true);
    const count = await getFollowerCount(newsletter.created_by);
    setFollowerCount(count);
    setLoadingCount(false);
  };

  const handleSendEmail = async () => {
    const result = await sendNewsletterEmail(newsletter.id);
    if (result) {
      onEmailSent?.(result);
      onClose();
    }
  };

  const alreadySent = newsletter.email_sent_at;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-dna-emerald" />
            Send Newsletter to Followers
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">{newsletter.title}</h3>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              {loadingCount ? (
                "Loading follower count..."
              ) : (
                `${followerCount} followers with email notifications enabled`
              )}
            </div>
          </div>

          {alreadySent && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="text-amber-800 font-medium">Already sent</p>
                <p className="text-amber-700">
                  This newsletter was sent to {newsletter.email_recipient_count} recipients on{' '}
                  {new Date(newsletter.email_sent_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {followerCount === 0 && !loadingCount && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                You don't have any followers with email notifications enabled yet. 
                Encourage people to follow you and opt-in to newsletter emails in their profile settings.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={loading || followerCount === 0 || loadingCount}
              className="flex-1 bg-dna-emerald hover:bg-dna-forest text-white"
            >
              {loading ? 'Sending...' : alreadySent ? 'Send Again' : 'Send Newsletter'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsletterEmailDialog;
