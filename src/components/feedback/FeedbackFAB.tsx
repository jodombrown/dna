import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { isOptedIn, isLoading } = useFeedbackMembership();

  // Only show on authenticated /dna/* routes
  const isDnaRoute = location.pathname.startsWith('/dna');

  // Don't show if not authenticated, not on DNA routes, or opted out
  if (!user || !isDnaRoute || isLoading || !isOptedIn) {
    return null;
  }

  const handleClick = () => {
    setIsDrawerOpen(true);
  };

  return (
    <>
      {/* Right-edge tab trigger */}
      <button
        onClick={handleClick}
        className={cn(
          'fixed right-0 top-1/2 -translate-y-1/2 z-40',
          'flex items-center justify-center',
          'w-6 h-16 md:w-8 md:h-20',
          'bg-primary/90 hover:bg-primary',
          'rounded-l-lg shadow-lg hover:shadow-xl',
          'transition-all duration-200',
          'hover:w-8 md:hover:w-10',
          className
        )}
        aria-label="Open Feedback Hub"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
      </button>

      <FeedbackDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
