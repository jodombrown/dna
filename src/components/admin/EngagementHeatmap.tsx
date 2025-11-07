import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useActivityHeatmap } from '@/hooks/useEngagementMetrics';
import { Loader2 } from 'lucide-react';

export const EngagementHeatmap = () => {
  const { data: activityData, isLoading } = useActivityHeatmap();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feature Engagement</CardTitle>
          <CardDescription>User activity across platform features</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Engagement</CardTitle>
        <CardDescription>User activity across platform features</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="feature" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold">{payload[0].payload.feature}</p>
                      <p className="text-sm text-primary">
                        {payload[0].value} users active
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="activity" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
