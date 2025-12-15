import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { FeedbackChatPanel } from './FeedbackChatPanel';

interface FeedbackChatWidgetProps {
  className?: string;
}

/**
 * Floating feedback chat widget - appears on all authenticated pages
 * Opens a DM-style conversation with the engineering team
 */
export const FeedbackChatWidget: React.FC<FeedbackChatWidgetProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // Only show for authenticated users
  if (!user) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-5 right-5 z-40",
          "flex items-center gap-2 px-4 py-2.5",
          "bg-emerald-600 hover:bg-emerald-700 text-white",
          "rounded-full shadow-lg hover:shadow-xl",
          "transition-all duration-200 ease-in-out",
          "hover:scale-105 active:scale-95",
          "border border-emerald-500/20",
          isOpen && "opacity-0 pointer-events-none",
          className
        )}
        aria-label="Open feedback chat"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Feedback</span>
      </button>

      {/* Chat Panel */}
      <FeedbackChatPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default FeedbackChatWidget;
