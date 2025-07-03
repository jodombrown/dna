
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Calendar, User } from 'lucide-react';
import { useAuth } from '@/contexts/CleanAuthContext';
import NewsletterEmailDialog from './NewsletterEmailDialog';
import NewsletterEmailStatus from './NewsletterEmailStatus';

interface NewsletterCardProps {
  newsletter: {
    id: string;
    title: string;
    summary?: string;
    content: string;
    created_by: string;
    created_at: string;
    is_published: boolean;
    email_sent_at?: string;
    email_recipient_count?: number;
    publication_date?: string;
  };
  author?: {
    full_name?: string;
    avatar_url?: string;
  };
}

const NewsletterCard: React.FC<NewsletterCardProps> = ({ newsletter, author }) => {
  const { user } = useAuth();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailStats, setEmailStats] = useState({
    email_sent_at: newsletter.email_sent_at,
    email_recipient_count: newsletter.email_recipient_count
  });

  const isAuthor = user?.id === newsletter.created_by;
  const canSendEmail = isAuthor && newsletter.is_published;

  const handleEmailSent = (stats: { sent: number; total: number }) => {
    setEmailStats({
      email_sent_at: new Date().toISOString(),
      email_recipient_count: stats.sent
    });
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
              {newsletter.title}
            </h3>
            {canSendEmail && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEmailDialogOpen(true)}
                className="ml-2 shrink-0"
              >
                <Mail className="w-4 h-4 mr-1" />
                Send to Followers
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {author && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{author.full_name || 'Anonymous'}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {newsletter.publication_date 
                    ? new Date(newsletter.publication_date).toLocaleDateString()
                    : new Date(newsletter.created_at).toLocaleDateString()
                  }
                </span>
              </div>
            </div>

            <NewsletterEmailStatus newsletter={emailStats} />
          </div>
        </CardHeader>

        <CardContent>
          {newsletter.summary && (
            <p className="text-gray-600 mb-4 line-clamp-2">
              {newsletter.summary}
            </p>
          )}
          
          <div 
            className="text-gray-700 line-clamp-3"
            dangerouslySetInnerHTML={{ 
              __html: newsletter.content.substring(0, 200) + (newsletter.content.length > 200 ? '...' : '')
            }}
          />
        </CardContent>
      </Card>

      <NewsletterEmailDialog
        isOpen={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        newsletter={newsletter}
        onEmailSent={handleEmailSent}
      />
    </>
  );
};

export default NewsletterCard;
