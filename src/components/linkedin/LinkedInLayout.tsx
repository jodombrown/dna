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
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar */}
        {leftSidebar && (
          <div className="col-span-12 lg:col-span-3">
            {leftSidebar}
          </div>
        )}

        {/* Main Content */}
        <div className={`col-span-12 ${leftSidebar && rightSidebar ? 'lg:col-span-6' : leftSidebar || rightSidebar ? 'lg:col-span-9' : 'lg:col-span-12'}`}>
          {mainContent}
        </div>

        {/* Right Sidebar */}
        {rightSidebar && (
          <div className="col-span-12 lg:col-span-3">
            {rightSidebar}
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkedInLayout;