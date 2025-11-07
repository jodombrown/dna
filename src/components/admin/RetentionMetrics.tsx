import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useRetentionMetrics } from '@/hooks/useEngagementMetrics';
import { Loader2 } from 'lucide-react';

export const RetentionMetrics = () => {
  const { data: retentionData, isLoading } = useRetentionMetrics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Retention Analysis</CardTitle>
          <CardDescription>7-day retention by user cohort</CardDescription>
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
        <CardTitle>Retention Analysis</CardTitle>
        <CardDescription>7-day retention rate by user cohort</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={retentionData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="cohort" className="text-xs" />
            <YAxis domain={[0, 100]} className="text-xs" />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold">{payload[0].payload.cohort}</p>
                      <p className="text-sm text-primary">
                        Retention: {typeof payload[0].value === 'number' ? payload[0].value.toFixed(1) : '0'}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payload[0].payload.users} users
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="retention" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
              name="Retention Rate (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
