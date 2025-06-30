
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';

const AdvancedAnalyticsCharts: React.FC = () => {
  const { userGrowthData, engagementData, loading } = useAnalytics();

  // Mock region data for now - this could be enhanced with real geolocation data
  const regionData = [
    { name: 'North America', value: 35, color: '#8884d8' },
    { name: 'Europe', value: 28, color: '#82ca9d' },
    { name: 'Africa', value: 22, color: '#ffc658' },
    { name: 'Asia', value: 12, color: '#ff7300' },
    { name: 'Others', value: 3, color: '#00ff00' }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* User Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth Trend (30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="total_users" 
                stackId="1" 
                stroke="#8884d8" 
                fill="#8884d8"
                name="Total Users"
              />
              <Area 
                type="monotone" 
                dataKey="new_users" 
                stackId="2" 
                stroke="#82ca9d" 
                fill="#82ca9d"
                name="New Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Engagement Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Engagement (7 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <Bar dataKey="posts" fill="#8884d8" name="Posts" />
              <Bar dataKey="comments" fill="#82ca9d" name="Comments" />
              <Bar dataKey="likes" fill="#ffc658" name="Likes" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Regional Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>User Distribution by Region</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={regionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {regionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Growth Rate Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Growth Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="new_users" 
                stroke="#ff7300" 
                strokeWidth={2}
                name="New Users Per Day"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalyticsCharts;
