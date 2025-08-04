import React from 'react';

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
  return (
    <div className="w-full -mt-8 pb-16 lg:pb-0">
      <div className="grid grid-cols-12 gap-1 sm:gap-2 lg:gap-3 2xl:gap-6 max-w-full 2xl:max-w-[2400px] mx-auto px-1 sm:px-2 2xl:px-6">
        {/* Left Sidebar - Hidden on mobile/tablet */}
        {leftSidebar && (
          <div className="hidden lg:block lg:col-span-2">
            <div className="h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin pr-2">
              {leftSidebar}
            </div>
          </div>
        )}

        {/* Main Content - Full width on mobile */}
        <div className={`col-span-12 ${
          leftSidebar && rightSidebar 
            ? 'lg:col-span-8' 
            : leftSidebar || rightSidebar 
            ? 'lg:col-span-10' 
            : 'lg:col-span-12'
        }`}>
          <div className="min-h-[calc(100vh-240px)] sm:min-h-[calc(100vh-200px)] lg:h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin px-1 sm:px-2">
            {mainContent}
          </div>
        </div>

        {/* Right Sidebar - Hidden on mobile/tablet */}
        {rightSidebar && (
          <div className="hidden lg:block lg:col-span-2">
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