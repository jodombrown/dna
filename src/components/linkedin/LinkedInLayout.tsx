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
    <div className="w-full">
      <div className="grid grid-cols-12 gap-3 2xl:gap-6 max-w-[2400px] mx-auto px-2 2xl:px-6">
        {/* Left Sidebar - Scrollable content */}
        {leftSidebar && (
          <div className="col-span-12 lg:col-span-3 xl:col-span-2.5 2xl:col-span-3">
            <div className="h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin pr-2">
              {leftSidebar}
            </div>
          </div>
        )}

        {/* Main Content - Scrollable content */}
        <div className={`col-span-12 ${
          leftSidebar && rightSidebar 
            ? 'lg:col-span-6 xl:col-span-7 2xl:col-span-6' 
            : leftSidebar || rightSidebar 
            ? 'lg:col-span-9 xl:col-span-9.5 2xl:col-span-9' 
            : 'lg:col-span-12'
        }`}>
          <div className="h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin px-2">
            {mainContent}
          </div>
        </div>

        {/* Right Sidebar - Scrollable content */}
        {rightSidebar && (
          <div className="col-span-12 lg:col-span-3 xl:col-span-2.5 2xl:col-span-3">
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