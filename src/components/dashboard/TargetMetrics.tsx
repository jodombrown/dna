
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Progress } from '@/components/ui/progress';
import { platformData } from '@/data/platformData';

const chartConfig = {
  current: {
    label: "Current",
    color: "#459c71",
  },
  target: {
    label: "Target",
    color: "#183c2e",
  },
};

const TargetMetrics = () => {
  return (
    <div className="space-y-6">
      {/* Bar Chart Comparison */}
      <div className="h-64">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={platformData.target_metrics} layout="horizontal">
              <XAxis type="number" />
              <YAxis 
                dataKey="metric" 
                type="category" 
                tick={{ fontSize: 12 }}
                width={120}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="current" fill="var(--color-current)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="target" fill="var(--color-target)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Progress Breakdown */}
      <div className="space-y-4">
        {platformData.target_metrics.map((metric, index) => {
          const progress = (metric.current / metric.target) * 100;
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-dna-forest">{metric.metric}</span>
                <span className="text-sm text-gray-600">{metric.timeframe}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-dna-emerald">
                  Current: {metric.current.toLocaleString()}
                </span>
                <span className="text-dna-forest">
                  Target: {metric.target.toLocaleString()}
                </span>
              </div>
              <div className="text-center text-sm font-medium">
                {progress.toFixed(1)}% Complete
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TargetMetrics;
