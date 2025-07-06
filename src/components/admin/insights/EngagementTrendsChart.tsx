import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data - in production this would come from your analytics hook
const mockData = [
  { date: '2024-01-01', posts: 45, comments: 123, reactions: 234 },
  { date: '2024-01-02', posts: 52, comments: 145, reactions: 289 },
  { date: '2024-01-03', posts: 48, comments: 132, reactions: 256 },
  { date: '2024-01-04', posts: 61, comments: 178, reactions: 345 },
  { date: '2024-01-05', posts: 55, comments: 156, reactions: 298 },
  { date: '2024-01-06', posts: 67, comments: 189, reactions: 378 },
  { date: '2024-01-07', posts: 73, comments: 201, reactions: 412 },
];

export function EngagementTrendsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Engagement Trends (Last 7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                stroke="#6b7280"
              />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="posts" 
                stroke="#459c71" 
                strokeWidth={2}
                name="Posts"
                dot={{ fill: '#459c71', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="comments" 
                stroke="#d88d4e" 
                strokeWidth={2}
                name="Comments"
                dot={{ fill: '#d88d4e', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="reactions" 
                stroke="#183c2e" 
                strokeWidth={2}
                name="Reactions"
                dot={{ fill: '#183c2e', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-dna-emerald rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Posts</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-dna-copper rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Comments</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-dna-forest rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Reactions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}