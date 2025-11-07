import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useOnboardingFunnel } from '@/hooks/useEngagementMetrics';
import { Loader2 } from 'lucide-react';

export const OnboardingFunnel = () => {
  const { data: funnelData, isLoading } = useOnboardingFunnel();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Funnel</CardTitle>
          <CardDescription>User progression through onboarding steps</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const colors = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Onboarding Funnel</CardTitle>
        <CardDescription>User progression through onboarding steps</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={funnelData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" domain={[0, 100]} className="text-xs" />
            <YAxis type="category" dataKey="step" width={150} className="text-xs" />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold">{payload[0].payload.step}</p>
                      <p className="text-sm text-muted-foreground">
                        {payload[0].payload.count} users ({typeof payload[0].value === 'number' ? payload[0].value.toFixed(1) : '0'}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="percentage" radius={[0, 8, 8, 0]}>
              {funnelData?.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
