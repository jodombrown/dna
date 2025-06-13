
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PieChart } from 'lucide-react';

interface ContributionBreakdownProps {
  impactCategories: Array<{
    name: string;
    percentage: number;
    amount: number;
  }>;
}

const ContributionBreakdown: React.FC<ContributionBreakdownProps> = ({ impactCategories }) => {
  return (
    <Card className="mb-6 sm:mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <PieChart className="w-5 h-5" />
          Your Contribution Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {impactCategories.map((category, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm sm:text-base">{category.name}</span>
                <span className="text-xs sm:text-sm text-gray-600">${category.amount.toLocaleString()}</span>
              </div>
              <Progress value={category.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContributionBreakdown;
