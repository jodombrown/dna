import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, MessageCircle, Calendar, MapPin, Archive, AlertCircle } from 'lucide-react';

const Connect = () => {
  // Mock v1 connection data
  const legacyConnections = [
    {
      id: '1',
      name: 'Amara Okafor',
      title: 'Fintech Entrepreneur',
      location: 'Lagos, Nigeria',
      avatar: '/api/placeholder/40/40',
      mutualConnections: 12,
      lastActive: '2 days ago'
    },
    {
      id: '2',
      name: 'Kwame Asante',
      title: 'Agricultural Tech Founder',
      location: 'Accra, Ghana',
      avatar: '/api/placeholder/40/40',
      mutualConnections: 8,
      lastActive: '1 week ago'
    },
    {
      id: '3',
      name: 'Zara Okoye',
      title: 'Investment Banker',
      location: 'London, UK',
      avatar: '/api/placeholder/40/40',
      mutualConnections: 15,
      lastActive: '3 days ago'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Legacy Connect Header */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Archive className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-amber-800">Legacy Connect System</CardTitle>
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
              v1 Archive
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-700 text-sm mb-2">
                This is the archived v1 connection system. All connections and relationships are preserved but in read-only mode.
              </p>
              <p className="text-amber-600 text-xs">
                Active networking features are available in the v2 platform.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Connections</CardTitle>
              <Users className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">1,247</div>
            <p className="text-xs text-gray-500 mt-1">Legacy v1 network</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Messages Sent</CardTitle>
              <MessageCircle className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">2,341</div>
            <p className="text-xs text-gray-500 mt-1">v1 conversations</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Events Attended</CardTitle>
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">47</div>
            <p className="text-xs text-gray-500 mt-1">v1 platform events</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Recent Connections</span>
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">Legacy v1</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {legacyConnections.map((connection) => (
              <div key={connection.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={connection.avatar} />
                    <AvatarFallback>{connection.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{connection.name}</h3>
                    <p className="text-sm text-gray-600">{connection.title}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        {connection.location}
                      </div>
                      <div className="text-xs text-gray-500">
                        {connection.mutualConnections} mutual connections
                      </div>
                      <div className="text-xs text-gray-500">
                        Active {connection.lastActive}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled className="text-gray-500">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm" disabled className="text-gray-500">
                    View Profile
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connection Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Insights (v1 Archive)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Geographic Distribution</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nigeria</span>
                  <span className="font-medium">387 connections</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ghana</span>
                  <span className="font-medium">245 connections</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kenya</span>
                  <span className="font-medium">198 connections</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">UK Diaspora</span>
                  <span className="font-medium">156 connections</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">US Diaspora</span>
                  <span className="font-medium">124 connections</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Industry Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Technology</span>
                  <span className="font-medium">423 connections</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Finance</span>
                  <span className="font-medium">298 connections</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Healthcare</span>
                  <span className="font-medium">187 connections</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Agriculture</span>
                  <span className="font-medium">145 connections</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Education</span>
                  <span className="font-medium">194 connections</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Connect;