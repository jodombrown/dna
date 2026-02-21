import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FEATURE_FLAGS } from '@/config/featureFlags';
import { AlphaFeedbackForm } from './AlphaFeedbackForm';

export function AlphaFeedbackButton() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  if (!FEATURE_FLAGS.isAlphaTest || !FEATURE_FLAGS.enableFeedbackWidget) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsFormOpen(true)}
        className={cn(
          'fixed z-50',
          'bottom-24 right-4 lg:bottom-6 lg:right-6',
          'h-12 w-12 rounded-full',
          'bg-primary text-primary-foreground shadow-lg',
          'hover:bg-primary/90 hover:shadow-xl hover:scale-105',
          'transition-all duration-200',
          'flex items-center justify-center',
          'group'
        )}
        aria-label="Give feedback"
      >
        <MessageSquare className="h-5 w-5" />
        {/* Tooltip */}
        <span
          className={cn(
            'absolute right-full mr-2 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap',
            'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900',
            'opacity-0 group-hover:opacity-100 pointer-events-none',
            'transition-opacity duration-150'
          )}
        >
          Give Feedback
        </span>
      </button>

      <AlphaFeedbackForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </>
  );
}
