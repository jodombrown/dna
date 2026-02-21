import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import FeedbackPanel from '@/components/FeedbackPanel';

interface FloatingFeedbackWidgetProps {
  pageType?: 'connect' | 'collaborate' | 'contribute';
}

const FloatingFeedbackWidget: React.FC<FloatingFeedbackWidgetProps> = ({ pageType = 'connect' }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open beta feedback"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 shadow-md hover:bg-accent/60 transition-colors"
      >
        <MessageSquare className="h-4 w-4" />
        <span className="text-sm font-medium">Beta feedback</span>
      </button>
      <FeedbackPanel isOpen={open} onClose={() => setOpen(false)} pageType={pageType} />
    </>
  );
};

export default FloatingFeedbackWidget;
