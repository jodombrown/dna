import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Globe, Briefcase, TrendingUp } from 'lucide-react';

interface ConnectStatsProps {
  totalCount: number;
}

const ConnectStats: React.FC<ConnectStatsProps> = ({ totalCount }) => {
  // Mock data - in real app, these would come from API
  const stats = [
    {
      label: 'Active Professionals',
      value: totalCount,
      icon: Users,
      color: 'text-dna-emerald',
      bgColor: 'bg-dna-emerald/10'
    },
    {
      label: 'Countries Represented',
      value: '54+',
      icon: Globe,
      color: 'text-dna-copper',
      bgColor: 'bg-dna-copper/10'
    },
    {
      label: 'Industries',
      value: '120+',
      icon: Briefcase,
      color: 'text-dna-gold',
      bgColor: 'bg-dna-gold/10'
    },
    {
      label: 'Weekly Connections',
      value: '2.4k',
      icon: TrendingUp,
      color: 'text-dna-mint',
      bgColor: 'bg-dna-mint/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-l-4 border-l-primary/20 hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-xl sm:text-2xl font-bold ${stat.color}`}>
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ConnectStats;