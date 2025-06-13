
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const ContributeOverviewStats: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <Card>
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="text-xl sm:text-2xl font-bold text-dna-gold mb-1 sm:mb-2">$2.1M</div>
          <div className="text-xs sm:text-sm text-gray-600">Total Contributions</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="text-xl sm:text-2xl font-bold text-dna-emerald mb-1 sm:mb-2">1,250</div>
          <div className="text-xs sm:text-sm text-gray-600">Active Contributors</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="text-xl sm:text-2xl font-bold text-dna-copper mb-1 sm:mb-2">45</div>
          <div className="text-xs sm:text-sm text-gray-600">Countries Reached</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="text-xl sm:text-2xl font-bold text-dna-forest mb-1 sm:mb-2">89K</div>
          <div className="text-xs sm:text-sm text-gray-600">Lives Impacted</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContributeOverviewStats;
