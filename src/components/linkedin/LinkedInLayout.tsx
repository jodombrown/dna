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
      <div className="grid grid-cols-12 gap-1 sm:gap-2 lg:gap-3 2xl:gap-6 max-w-full 2xl:max-w-[2400px] mx-auto px-1 sm:px-2 2xl:px-6">
        {/* Left Sidebar - Hidden on mobile/tablet */}
        {leftSidebar && !isMobile && !isTablet && (
          <div className="lg:col-span-2">
            <div className="h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin pr-2">
              {leftSidebar}
            </div>
          </div>
        )}

        {/* Main Content - Responsive width based on device */}
        <div className={`${
          isMobile || isTablet 
            ? 'col-span-12' 
            : leftSidebar && rightSidebar 
            ? 'col-span-8' 
            : leftSidebar || rightSidebar 
            ? 'col-span-10' 
            : 'col-span-12'
        }`}>
          <div 
            className={`
              ${isMobile 
                ? 'min-h-[calc(100vh-200px)] px-2' 
                : isTablet 
                ? 'min-h-[calc(100vh-180px)] px-3'
                : 'h-[calc(100vh-140px)] px-1 sm:px-2'
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
          <div className="lg:col-span-2">
            <div className="h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin pl-2">
              {rightSidebar}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkedInLayout;