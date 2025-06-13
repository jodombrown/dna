
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';

interface ImpactDashboardProps {
  myContributions: {
    totalContributed: number;
    livesImpacted: number;
    projectsFunded: number;
    impactScore: number;
  };
}

const ImpactDashboard: React.FC<ImpactDashboardProps> = ({ myContributions }) => {
  return (
    <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Heart className="w-5 h-5 text-dna-emerald" />
          Your Impact Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="text-xl sm:text-3xl font-bold text-dna-emerald mb-1 sm:mb-2">
              ${myContributions.totalContributed.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Total Contributed</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-3xl font-bold text-dna-copper mb-1 sm:mb-2">
              {myContributions.livesImpacted}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Lives Impacted</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-3xl font-bold text-dna-forest mb-1 sm:mb-2">
              {myContributions.projectsFunded}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Projects Funded</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-3xl font-bold text-dna-gold mb-1 sm:mb-2">
              {myContributions.impactScore}%
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Impact Score</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImpactDashboard;
