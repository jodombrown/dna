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
    <div className="w-full -mt-8 pb-16 lg:pb-0 overflow-x-hidden">
      {forceColumn ? (
        // Single column layout for mobile/small tablet
        <div className="w-full px-3 py-4 space-y-4">
          <div className="min-h-[calc(100vh-200px)] overflow-y-auto">
            {mainContent}
          </div>
        </div>
      ) : (
        // Multi-column layout for desktop
        <div className="grid grid-cols-12 gap-2 lg:gap-4 2xl:gap-6 max-w-full 2xl:max-w-[2400px] mx-auto px-2 sm:px-3 2xl:px-6">
          {/* Left Sidebar - Desktop only */}
          {leftSidebar && (
            <div className="col-span-3">
              <div className="h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin pr-3">
                {leftSidebar}
              </div>
            </div>
          )}

          {/* Main Content - Responsive width based on sidebars */}
          <div className={`${
            leftSidebar && rightSidebar 
              ? 'col-span-6' 
              : leftSidebar || rightSidebar 
              ? 'col-span-9' 
              : 'col-span-12'
          }`}>
            <div 
              className="h-[calc(100vh-140px)] px-3 overflow-y-auto scrollbar-thin"
              data-scroll-container="main"
            >
              {mainContent}
            </div>
          </div>

          {/* Right Sidebar - Desktop only */}
          {rightSidebar && (
            <div className="col-span-3">
              <div className="h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin pl-3">
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