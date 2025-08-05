import React, { useState, useEffect } from 'react';
import { PostComposer } from './PostComposer';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { useMobile } from '@/hooks/useMobile';
import { Button } from '@/components/ui/button';
import { Pencil, X, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingPostComposerProps {
  defaultPillar?: string;
  onPostCreated?: () => void;
}

export const FloatingPostComposer: React.FC<FloatingPostComposerProps> = ({
  defaultPillar,
  onPostCreated
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isManuallyCollapsed, setIsManuallyCollapsed] = useState(false);
  const { isScrollingDown, isAtTop, scrollY } = useScrollDirection(30);
  const { isMobile } = useMobile();

  // Auto-collapse/expand based on scroll direction
  useEffect(() => {
    if (!isManuallyCollapsed) {
      if (isAtTop) {
        setIsExpanded(true);
      } else if (isScrollingDown && scrollY > 100) {
        setIsExpanded(false);
      } else if (!isScrollingDown) {
        setIsExpanded(true);
      }
    }
  }, [isScrollingDown, isAtTop, scrollY, isManuallyCollapsed]);

  const handleExpand = () => {
    setIsExpanded(true);
    setIsManuallyCollapsed(false);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setIsManuallyCollapsed(true);
  };

  const handlePostCreated = () => {
    // Collapse after posting
    setIsExpanded(false);
    setIsManuallyCollapsed(true);
    onPostCreated?.();
    
    // Reset manual collapse after a delay
    setTimeout(() => {
      setIsManuallyCollapsed(false);
    }, 2000);
  };

  return (
    <div 
      className={cn(
        "sticky z-40 transition-all duration-300 ease-out",
        isMobile ? "top-16" : "top-16",
        isExpanded ? "mb-6" : "mb-2"
      )}
    >
      {isExpanded ? (
        <div className="relative">
          <PostComposer 
            defaultPillar={defaultPillar}
            onPostCreated={handlePostCreated}
          />
          {/* Collapse button - only show when scrolled */}
          {!isAtTop && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCollapse}
              className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white border border-gray-200 shadow-sm"
              aria-label="Minimize composer"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className={cn(
          "bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-300",
          isMobile ? "mx-2 p-3" : "p-4"
        )}>
          <Button
            variant="ghost"
            onClick={handleExpand}
            className={cn(
              "w-full justify-start text-left h-auto p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200",
              isMobile ? "text-sm" : "text-base"
            )}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-dna-mint rounded-full flex items-center justify-center">
                  <Pencil className="w-4 h-4 text-dna-forest" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-gray-600">Share something with the community...</span>
              </div>
              <div className="flex-shrink-0">
                <ChevronUp className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </Button>
        </div>
      )}
    </div>
  );
};