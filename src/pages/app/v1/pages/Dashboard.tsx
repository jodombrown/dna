import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, Calendar, MessageCircle, Archive } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Legacy Status Card */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Archive className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-amber-800">Legacy Dashboard Archive</CardTitle>
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
              Version 1.0
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700 text-sm">
            This is the archived v1 LinkedIn-style dashboard. All functionality is preserved for reference and review. 
            New development continues on the v2 platform.
          </p>
          <div className="flex space-x-2 mt-4">
            <Button variant="outline" size="sm" className="text-amber-700 border-amber-300 hover:bg-amber-100">
              View v1 Features
            </Button>
            <Button variant="outline" size="sm" className="text-amber-700 border-amber-300 hover:bg-amber-100">
              Export v1 Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Connections</CardTitle>
              <Users className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">1,247</div>
            <p className="text-xs text-gray-500 mt-1">Legacy v1 connections</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Engagement</CardTitle>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">89%</div>
            <p className="text-xs text-gray-500 mt-1">v1 platform metrics</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Events</CardTitle>
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">156</div>
            <p className="text-xs text-gray-500 mt-1">Hosted in v1</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Messages</CardTitle>
              <MessageCircle className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">2,341</div>
            <p className="text-xs text-gray-500 mt-1">v1 conversations</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Recent Activity</span>
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">Legacy</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New connection request from Sarah Johnson</p>
                <p className="text-xs text-gray-500">2 hours ago • Legacy v1 system</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Event "AfriTech Summit 2024" updated</p>
                <p className="text-xs text-gray-500">5 hours ago • Legacy v1 system</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New message in "Diaspora Entrepreneurs" group</p>
                <p className="text-xs text-gray-500">1 day ago • Legacy v1 system</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Status */}
      <Card>
        <CardHeader>
          <CardTitle>v1 Feature Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Preserved Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ LinkedIn-style layout</li>
                <li>✓ Social feed system</li>
                <li>✓ Profile management</li>
                <li>✓ Messaging system</li>
                <li>✓ Events & communities</li>
                <li>✓ Admin panel</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Data Status</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ All user data preserved</li>
                <li>✓ Complete conversation history</li>
                <li>✓ Event and community records</li>
                <li>✓ Profile and connection data</li>
                <li>⚠️ Read-only mode active</li>
                <li>⚠️ No new data mutations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;