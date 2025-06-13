
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsData {
  totalCollaborators: number;
  countriesInvolved: number;
  totalFunding: string;
  avgProgress: number;
}

interface CollaborationsQuickStatsProps {
  stats?: StatsData;
}

const CollaborationsQuickStats: React.FC<CollaborationsQuickStatsProps> = ({ 
  stats = {
    totalCollaborators: 156,
    countriesInvolved: 12,
    totalFunding: '$2.4M',
    avgProgress: 68
  }
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <Card>
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="text-xl sm:text-2xl font-bold text-dna-copper mb-1 sm:mb-2">{stats.totalCollaborators}</div>
          <div className="text-xs sm:text-sm text-gray-600">Total Collaborators</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="text-xl sm:text-2xl font-bold text-dna-emerald mb-1 sm:mb-2">{stats.countriesInvolved}</div>
          <div className="text-xs sm:text-sm text-gray-600">Countries Involved</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="text-xl sm:text-2xl font-bold text-dna-forest mb-1 sm:mb-2">{stats.totalFunding}</div>
          <div className="text-xs sm:text-sm text-gray-600">Total Funding</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="text-xl sm:text-2xl font-bold text-dna-gold mb-1 sm:mb-2">{stats.avgProgress}%</div>
          <div className="text-xs sm:text-sm text-gray-600">Avg Progress</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollaborationsQuickStats;
