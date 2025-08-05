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
      } else if (!isScrollingDown && scrollY > 50) {
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
        "sticky top-0 z-40 transition-all duration-300 ease-out",
        "bg-white/95 backdrop-blur-sm border-b border-gray-200/50",
        isMobile ? "mx-2 mb-4" : "mb-6"
      )}
    >
      <div className={cn("w-full", isMobile ? "px-2 py-3" : "px-4 py-4")}>
        {isExpanded ? (
          <div 
            className={cn(
              "relative animate-fade-in",
              "bg-white rounded-xl shadow-lg border border-gray-200",
              "transition-all duration-300 ease-out"
            )}
          >
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
                className="absolute top-3 right-3 h-8 w-8 p-0 bg-white/90 hover:bg-white border border-gray-200 shadow-sm"
                aria-label="Minimize composer"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div 
            className={cn(
              "animate-scale-in",
              "bg-white border border-gray-200 rounded-xl shadow-md transition-all duration-300"
            )}
          >
            <Button
              variant="ghost"
              onClick={handleExpand}
              className={cn(
                "w-full justify-start text-left h-auto p-4",
                "bg-gradient-to-r from-gray-50 to-white",
                "hover:from-gray-100 hover:to-gray-50",
                "border-0 rounded-xl transition-all duration-200",
                "hover-scale",
                isMobile ? "text-sm" : "text-base"
              )}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-dna-mint to-dna-sage rounded-full flex items-center justify-center shadow-sm">
                    <Pencil className="w-5 h-5 text-dna-forest" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-gray-600 font-medium">Share something with the community...</span>
                </div>
                <div className="flex-shrink-0">
                  <ChevronUp className="w-5 h-5 text-gray-400 transition-transform duration-200 group-hover:text-gray-600" />
                </div>
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};