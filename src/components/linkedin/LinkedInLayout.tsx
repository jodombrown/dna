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
    <div className="w-full -mt-8 pb-16 md:pb-0">
      {/* Mobile-first: Single column layout below 768px */}
      <div className="block md:hidden">
        <div className="w-full px-2 space-y-4">
          {/* Main content takes full width on mobile */}
          <div className="w-full">
            <div className="min-h-[calc(100vh-180px)] overflow-y-auto">
              {mainContent}
            </div>
          </div>
          
          {/* Left sidebar stacked below main content on mobile */}
          {leftSidebar && (
            <div className="w-full">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                {leftSidebar}
              </div>
            </div>
          )}
          
          {/* Right sidebar stacked at bottom on mobile */}
          {rightSidebar && (
            <div className="w-full">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                {rightSidebar}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop: Grid layout for 768px and above */}
      <div className="hidden md:block">
        <div className="grid grid-cols-12 gap-1 lg:gap-3 2xl:gap-6 max-w-full 2xl:max-w-[2400px] mx-auto px-1 lg:px-2 2xl:px-6">
          {/* Left Sidebar - Hidden until lg */}
          {leftSidebar && (
            <div className="hidden lg:block lg:col-span-2">
              <div className="h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin pr-2">
                {leftSidebar}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className={`col-span-12 ${
            leftSidebar && rightSidebar 
              ? 'lg:col-span-8' 
              : leftSidebar || rightSidebar 
              ? 'lg:col-span-10' 
              : 'lg:col-span-12'
          }`}>
            <div className="min-h-[calc(100vh-180px)] lg:h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin px-1 lg:px-2">
              {mainContent}
            </div>
          </div>

          {/* Right Sidebar - Hidden until lg */}
          {rightSidebar && (
            <div className="hidden lg:block lg:col-span-2">
              <div className="h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin pl-2">
                {rightSidebar}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkedInLayout;