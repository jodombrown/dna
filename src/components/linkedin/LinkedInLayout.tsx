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
  
  return (
    <div className="w-full -mt-8 pb-16 lg:pb-0">
      <div className="grid grid-cols-12 gap-2 lg:gap-4 2xl:gap-6 max-w-full 2xl:max-w-[2400px] mx-auto px-2 sm:px-3 2xl:px-6">
        {/* Left Sidebar - Hidden on mobile/tablet */}
        {leftSidebar && !isMobile && !isTablet && (
          <div className="col-span-3">
            <div className="h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin pr-3">
              {leftSidebar}
            </div>
          </div>
        )}

        {/* Main Content - Responsive width based on device */}
        <div className={`${
          isMobile || isTablet 
            ? 'col-span-12' 
            : leftSidebar && rightSidebar 
            ? 'col-span-6' 
            : leftSidebar || rightSidebar 
            ? 'col-span-9' 
            : 'col-span-12'
        }`}>
          <div 
            className={`
              ${isMobile 
                ? 'min-h-[calc(100vh-200px)] px-3' 
                : isTablet 
                ? 'min-h-[calc(100vh-180px)] px-4'
                : 'h-[calc(100vh-140px)] px-3'
              } 
              overflow-y-auto scrollbar-thin
            `}
            data-scroll-container="main"
          >
            {mainContent}
          </div>
        </div>

        {/* Right Sidebar - Hidden on mobile/tablet */}
        {rightSidebar && !isMobile && !isTablet && (
          <div className="col-span-3">
            <div className="h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin pl-3">
              {rightSidebar}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkedInLayout;