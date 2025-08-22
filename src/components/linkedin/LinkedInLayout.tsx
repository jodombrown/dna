import React from 'react';
import { useMobile } from '@/hooks/useMobile';

interface LinkedInLayoutProps {
  leftSidebar?: React.ReactNode;
  mainContent: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

const LinkedInLayout: React.FC<LinkedInLayoutProps> = ({
  leftSidebar,
  mainContent,
  rightSidebar,
}) => {
  const { isMobile, isTablet } = useMobile();
  
  // Force single column under 768px
  const forceColumn = isMobile || isTablet || window.innerWidth < 768;
  
  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      {forceColumn ? (
        // Single column layout for mobile/small tablet - fully responsive
        <div className="w-full px-2 sm:px-4 py-2 sm:py-4 space-y-3 sm:space-y-4 safe-area-pb">
          <div className="min-h-[60vh] max-h-[80vh] overflow-y-auto bg-background rounded-lg">
            {mainContent}
          </div>
        </div>
      ) : (
        // Multi-column layout for desktop - properly constrained
        <div className="grid grid-cols-12 gap-3 lg:gap-4 xl:gap-6 max-w-7xl mx-auto px-4 lg:px-6 py-4">
          {/* Left Sidebar - Desktop only */}
          {leftSidebar && (
            <div className="col-span-3 xl:col-span-2">
              <div className="h-[75vh] max-h-[800px] overflow-y-auto scrollbar-thin pr-2">
                {leftSidebar}
              </div>
            </div>
          )}

          {/* Main Content - Responsive width based on sidebars */}
          <div className={`${
            leftSidebar && rightSidebar 
              ? 'col-span-6 xl:col-span-8' 
              : leftSidebar || rightSidebar 
              ? 'col-span-9 xl:col-span-10' 
              : 'col-span-12'
          }`}>
            <div 
              className="h-[75vh] max-h-[800px] px-2 lg:px-3 overflow-y-auto scrollbar-thin bg-background rounded-lg"
              data-scroll-container="main"
            >
              {mainContent}
            </div>
          </div>

          {/* Right Sidebar - Desktop only */}
          {rightSidebar && (
            <div className="col-span-3 xl:col-span-2">
              <div className="h-[75vh] max-h-[800px] overflow-y-auto scrollbar-thin pl-2">
                {rightSidebar}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LinkedInLayout;