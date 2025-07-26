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
    <div className="w-full h-screen overflow-hidden">
      <div className="grid grid-cols-12 gap-3 2xl:gap-6 max-w-[2400px] mx-auto h-full pt-20 px-2 2xl:px-6">
        {/* Left Sidebar - Sticky with independent scroll */}
        {leftSidebar && (
          <div className="col-span-12 lg:col-span-3 xl:col-span-2.5 2xl:col-span-3 h-full">
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2">
              <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 pb-4">
                <div className="h-2"></div>
              </div>
              {leftSidebar}
            </div>
          </div>
        )}

        {/* Main Content - Expandable center area with independent scroll */}
        <div className={`col-span-12 h-full ${
          leftSidebar && rightSidebar 
            ? 'lg:col-span-6 xl:col-span-7 2xl:col-span-6' 
            : leftSidebar || rightSidebar 
            ? 'lg:col-span-9 xl:col-span-9.5 2xl:col-span-9' 
            : 'lg:col-span-12'
        }`}>
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-2">
            <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 pb-4">
              <div className="h-2"></div>
            </div>
            {mainContent}
          </div>
        </div>

        {/* Right Sidebar - Sticky with independent scroll */}
        {rightSidebar && (
          <div className="col-span-12 lg:col-span-3 xl:col-span-2.5 2xl:col-span-3 h-full">
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pl-2">
              <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 pb-4">
                <div className="h-2"></div>
              </div>
              {rightSidebar}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkedInLayout;