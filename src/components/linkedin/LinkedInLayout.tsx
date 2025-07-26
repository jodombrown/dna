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
    <div className="w-full min-h-screen px-2 py-4 2xl:px-6">
      <div className="grid grid-cols-12 gap-3 2xl:gap-6 max-w-[2400px] mx-auto">
        {/* Left Sidebar - Fixed width for better dashboard feel */}
        {leftSidebar && (
          <div className="col-span-12 lg:col-span-3 xl:col-span-2.5 2xl:col-span-3">
            <div className="sticky top-20">
              {leftSidebar}
            </div>
          </div>
        )}

        {/* Main Content - Expandable center area */}
        <div className={`col-span-12 ${
          leftSidebar && rightSidebar 
            ? 'lg:col-span-6 xl:col-span-7 2xl:col-span-6' 
            : leftSidebar || rightSidebar 
            ? 'lg:col-span-9 xl:col-span-9.5 2xl:col-span-9' 
            : 'lg:col-span-12'
        }`}>
          {mainContent}
        </div>

        {/* Right Sidebar - Fixed width for consistent dashboard experience */}
        {rightSidebar && (
          <div className="col-span-12 lg:col-span-3 xl:col-span-2.5 2xl:col-span-3">
            <div className="sticky top-20">
              {rightSidebar}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkedInLayout;