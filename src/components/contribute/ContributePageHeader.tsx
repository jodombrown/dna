
import React from 'react';
import { Badge } from '@/components/ui/badge';
import MobileNavigation from '@/components/header/MobileNavigation';

const ContributePageHeader: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <MobileNavigation />
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Contribute to Africa</h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Make a lasting impact</p>
            </div>
          </div>
          <Badge className="bg-dna-gold text-white text-xs sm:text-sm">
            $2.1M+ Raised
          </Badge>
        </div>
      </div>
    </header>
  );
};

export default ContributePageHeader;
