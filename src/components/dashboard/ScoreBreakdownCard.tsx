import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Users, FileText, Building, Eye } from 'lucide-react';
import { usePulseStore } from '@/stores/usePulseStore';
import { cn } from '@/lib/utils';

const scoreBreakdownItems = [
  {
    label: 'Connections',
    valueKey: 'myConnections',
    pointsPerUnit: 2,
    icon: Users,
    color: 'text-dna-emerald'
  },
  {
    label: 'Posts Created',
    valueKey: 'myPosts',
    pointsPerUnit: 3,
    icon: FileText,
    color: 'text-dna-copper'
  },
  {
    label: 'Communities Joined',
    valueKey: 'myCommunities',
    pointsPerUnit: 5,
    icon: Building,
    color: 'text-dna-forest'
  },
  {
    label: 'Profile Views',
    valueKey: 'myViews',
    pointsPerUnit: 1,
    icon: Eye,
    color: 'text-dna-mint'
  }
] as const;

export const ScoreBreakdownCard = () => {
  const { data } = usePulseStore();

  if (!data) return null;

  const calculatedTotal = scoreBreakdownItems.reduce((total, item) => {
    const value = (data[item.valueKey] as number) || 0;
    return total + (value * item.pointsPerUnit);
  }, 0);

  return (
    <Card className="p-4 bg-gradient-to-br from-dna-mint/5 to-dna-emerald/5 border-dna-mint/20">
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="h-4 w-4 text-dna-mint" />
        <h3 className="text-sm font-semibold text-dna-forest">Impact Score Breakdown</h3>
      </div>
      
      <div className="space-y-2">
        {scoreBreakdownItems.map((item) => {
          const Icon = item.icon;
          const value = (data[item.valueKey] as number) || 0;
          const points = value * item.pointsPerUnit;
          
          return (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-3 w-3", item.color)} />
                <span className="text-dna-forest/70">{item.label}</span>
                <Badge variant="outline" className="text-xs px-1 py-0">
                  {value}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-dna-forest/50">×{item.pointsPerUnit}</span>
                <span className="font-medium text-dna-forest">{points}</span>
              </div>
            </div>
          );
        })}
        
        <div className="border-t border-dna-mint/20 pt-2 mt-3">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-dna-forest">Calculated Total</span>
            <span className="text-dna-mint">{calculatedTotal}</span>
          </div>
          {data.impactScore !== calculatedTotal && (
            <p className="text-xs text-dna-forest/50 mt-1">
              * Actual score may include bonus points from badges and streaks
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};