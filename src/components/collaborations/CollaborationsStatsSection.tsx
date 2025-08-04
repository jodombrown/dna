
import React from 'react';
import { CollaborationStats } from '@/types/collaborationTypes';
import { Users, Globe, DollarSign, TrendingUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/useMobile';

interface CollaborationsStatsSectionProps {
  stats: CollaborationStats;
}

const CollaborationsStatsSection: React.FC<CollaborationsStatsSectionProps> = ({ stats }) => {
  const isMobile = useIsMobile();

  const statItems = [
    {
      icon: TrendingUp,
      value: stats.total_projects.toLocaleString(),
      label: 'Active Initiatives',
      color: 'text-dna-emerald'
    },
    {
      icon: Users,
      value: stats.active_collaborators.toLocaleString(),
      label: 'Contributors',
      color: 'text-dna-copper'
    },
    {
      icon: Globe,
      value: stats.countries_involved.toString(),
      label: 'Countries',
      color: 'text-dna-gold'
    },
    {
      icon: DollarSign,
      value: stats.total_funding,
      label: 'Total Funding',
      color: 'text-dna-forest'
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className={`grid ${isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-4 gap-6'}`}>
          {statItems.map((item, index) => (
            <div key={index} className="text-center">
              <div className={`mx-auto w-12 h-12 ${isMobile ? 'w-10 h-10' : ''} rounded-full bg-gray-50 flex items-center justify-center mb-3`}>
                <item.icon className={`w-6 h-6 ${isMobile ? 'w-5 h-5' : ''} ${item.color}`} />
              </div>
              <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'} text-gray-900 mb-1`}>
                {item.value}
              </div>
              <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollaborationsStatsSection;
