
import React from 'react';
import { Badge } from '@/components/ui/badge';
import UnifiedHeader from '@/components/UnifiedHeader';

interface CollaborationsPageHeaderProps {
  activeProjectsCount?: number;
}

const CollaborationsPageHeader: React.FC<CollaborationsPageHeaderProps> = ({ 
  activeProjectsCount = 0 
}) => {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Active Collaborations</h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Manage your collaborative projects</p>
            </div>
          </div>
          <Badge className="bg-dna-copper text-white text-xs sm:text-sm">
            {activeProjectsCount} Active
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default CollaborationsPageHeader;
