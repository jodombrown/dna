import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UserPlus, Users, TrendingUp } from 'lucide-react';

// Mock data - in production this would come from your analytics hook
const mockWaitlistData = [
  { date: '2024-01-01', signups: 45, total: 1245 },
  { date: '2024-01-02', signups: 32, total: 1277 },
  { date: '2024-01-03', signups: 58, total: 1335 },
  { date: '2024-01-04', signups: 67, total: 1402 },
  { date: '2024-01-05', signups: 43, total: 1445 },
  { date: '2024-01-06', signups: 71, total: 1516 },
  { date: '2024-01-07', signups: 89, total: 1605 },
];

export function WaitlistTracker() {
  const totalSignups = mockWaitlistData[mockWaitlistData.length - 1]?.total || 0;
  const dailyAverage = Math.round(mockWaitlistData.reduce((sum, day) => sum + day.signups, 0) / mockWaitlistData.length);
  const conversionRate = 68; // Mock conversion rate percentage

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-dna-emerald" />
          Waitlist Growth
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalSignups.toLocaleString()}</div>
            <div className="text-xs text-blue-800">Total Signups</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{dailyAverage}</div>
            <div className="text-xs text-green-800">Daily Average</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{conversionRate}%</div>
            <div className="text-xs text-purple-800">Conversion Rate</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockWaitlistData}>
              <defs>
                <linearGradient id="waitlistGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#459c71" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#459c71" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value, name) => [value, name === 'signups' ? 'Daily Signups' : 'Total Signups']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="signups" 
                stroke="#459c71" 
                fill="url(#waitlistGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Growth Indicator */}
        <div className="flex items-center justify-center mt-4 text-sm">
          <div className="flex items-center text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="font-medium">+15% growth this week</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}