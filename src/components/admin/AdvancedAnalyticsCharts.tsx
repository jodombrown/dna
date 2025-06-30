
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

const AdvancedAnalyticsCharts: React.FC = () => {
  // Mock data for demo purposes
  const userGrowthData = [
    { month: 'Jan', users: 120, active: 85 },
    { month: 'Feb', users: 180, active: 142 },
    { month: 'Mar', users: 220, active: 189 },
    { month: 'Apr', users: 290, active: 245 },
    { month: 'May', users: 350, active: 298 },
    { month: 'Jun', users: 420, active: 365 }
  ];

  const engagementData = [
    { day: 'Mon', posts: 45, comments: 123, likes: 234 },
    { day: 'Tue', posts: 52, comments: 145, likes: 287 },
    { day: 'Wed', posts: 38, comments: 98, likes: 201 },
    { day: 'Thu', posts: 61, comments: 167, likes: 342 },
    { day: 'Fri', posts: 48, comments: 134, likes: 298 },
    { day: 'Sat', posts: 35, comments: 89, likes: 187 },
    { day: 'Sun', posts: 42, comments: 112, likes: 234 }
  ];

  const regionData = [
    { name: 'North America', value: 35, color: '#8884d8' },
    { name: 'Europe', value: 28, color: '#82ca9d' },
    { name: 'Africa', value: 22, color: '#ffc658' },
    { name: 'Asia', value: 12, color: '#ff7300' },
    { name: 'Others', value: 3, color: '#00ff00' }
  ];

  const communityGrowthData = [
    { month: 'Jan', communities: 12, members: 450 },
    { month: 'Feb', communities: 18, members: 720 },
    { month: 'Mar', communities: 25, members: 980 },
    { month: 'Apr', communities: 32, members: 1340 },
    { month: 'May', communities: 41, members: 1680 },
    { month: 'Jun', communities: 48, members: 2120 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* User Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="users" 
                stackId="1" 
                stroke="#8884d8" 
                fill="#8884d8"
                name="Total Users"
              />
              <Area 
                type="monotone" 
                dataKey="active" 
                stackId="1" 
                stroke="#82ca9d" 
                fill="#82ca9d"
                name="Active Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Engagement Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
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

      {/* Community Growth */}
      <Card>
        <CardHeader>
          <CardTitle>Community Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={communityGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="communities" fill="#8884d8" name="Communities" />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="members" 
                stroke="#ff7300" 
                strokeWidth={2}
                name="Total Members"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalyticsCharts;
