
import React from 'react';
import { Mail, Check, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NewsletterEmailStatusProps {
  newsletter: {
    email_sent_at?: string;
    email_recipient_count?: number;
  };
}

const NewsletterEmailStatus: React.FC<NewsletterEmailStatusProps> = ({ newsletter }) => {
  if (!newsletter.email_sent_at) {
    return (
      <Badge variant="outline" className="text-gray-600">
        <Clock className="w-3 h-3 mr-1" />
        Not sent
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-green-600 border-green-200">
      <Check className="w-3 h-3 mr-1" />
      Sent to {newsletter.email_recipient_count || 0}
    </Badge>
  );
};

export default NewsletterEmailStatus;
