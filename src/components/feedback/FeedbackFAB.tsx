import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { FeedbackDrawer } from './FeedbackDrawer';
import { useFeedbackMembership } from '@/hooks/useFeedbackMembership';

interface FeedbackFABProps {
  className?: string;
}

export function FeedbackFAB({ className }: FeedbackFABProps) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { isOptedIn, isLoading } = useFeedbackMembership();

  // Only show on authenticated /dna/* routes
  const isDnaRoute = location.pathname.startsWith('/dna');

  // Don't show on the feedback page itself
  const isFeedbackPage = location.pathname === '/dna/feedback';

  // Don't show if not authenticated, not on DNA routes, on feedback page, or opted out
  if (!user || !isDnaRoute || isFeedbackPage || isLoading || !isOptedIn) {
    return null;
  }

  const handleClick = () => {
    // On desktop, navigate to the full page
    // On mobile, open the drawer
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setIsDrawerOpen(true);
    } else {
      navigate('/dna/feedback');
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        size="lg"
        className={cn(
          'fixed bottom-24 right-4 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all z-40',
          'md:bottom-6 md:right-6 md:h-14 md:w-14',
          'bg-primary hover:bg-primary/90',
          className
        )}
        aria-label="Open Feedback Hub"
      >
        <MessageSquarePlus className="h-5 w-5 md:h-6 md:w-6" />
      </Button>

      <FeedbackDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
