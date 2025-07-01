
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ResponsiveHeading } from '@/components/ui/responsive-typography';
import MobileNavigation from '@/components/header/MobileNavigation';

interface ConnectPageHeaderProps {
  totalCount: number;
}

const navigationItems = [
  { path: "/", label: "Home" },
  { path: "/connect", label: "Connect" },
  { path: "/collaborations", label: "Collaborate" },
  { path: "/events", label: "Events" },
  { path: "/calendar", label: "Calendar" },
];

const ConnectPageHeader: React.FC<ConnectPageHeaderProps> = ({ totalCount }) => {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50 safe-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 min-h-[64px]">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <MobileNavigation navigationItems={navigationItems} />
            <div className="min-w-0">
              <ResponsiveHeading level={3} className="text-gray-900 truncate">
                Professional Network
              </ResponsiveHeading>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block truncate">
                Connect with diaspora professionals
              </p>
            </div>
          </div>
          <Badge className="bg-dna-emerald text-white text-xs sm:text-sm flex-shrink-0 ml-2">
            {totalCount}+ Members
          </Badge>
        </div>
      </div>
    </header>
  );
};

export default ConnectPageHeader;
