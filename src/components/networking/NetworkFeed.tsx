import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, MessageSquare, UserPlus, TrendingUp, Activity, Clock } from 'lucide-react';
import { ConnectionButton } from '@/components/connections/ConnectionButton';

// Mock data for network activity
const networkActivities = [
  {
    id: '1',
    type: 'new_connection',
    user: {
      id: 'user1',
      name: 'Amara Okafor',
      profession: 'Product Manager',
      company: 'Microsoft',
      avatar: null,
      location: 'Seattle, WA'
    },
    connectedWith: {
      id: 'user2',
      name: 'Kwame Asante',
      profession: 'Software Engineer',
      avatar: null
    },
    timestamp: '2 hours ago',
    mutualConnections: 5
  },
  {
    id: '2',
    type: 'profile_update',
    user: {
      id: 'user3',
      name: 'Fatima Al-Rashid',
      profession: 'Data Scientist',
      company: 'Google',
      avatar: null,
      location: 'London, UK'
    },
    update: 'Started a new position as Senior Data Scientist',
    timestamp: '5 hours ago',
    mutualConnections: 12
  },
  {
    id: '3',
    type: 'new_skill',
    user: {
      id: 'user4',
      name: 'Tadesse Bekele',
      profession: 'DevOps Engineer',
      company: 'Amazon',
      avatar: null,
      location: 'Berlin, Germany'
    },
    skills: ['Kubernetes', 'Docker', 'AWS'],
    timestamp: '1 day ago',
    mutualConnections: 8
  }
];

const NetworkFeed: React.FC = () => {
  const renderActivityIcon = (type: string) => {
    switch (type) {
      case 'new_connection':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'profile_update':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'new_skill':
        return <Activity className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const renderActivityContent = (activity: any) => {
    switch (activity.type) {
      case 'new_connection':
        return (
          <div>
            <p className="text-sm text-gray-900 mb-2">
              <span className="font-semibold">{activity.user.name}</span> connected with{' '}
              <span className="font-semibold">{activity.connectedWith.name}</span>
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{activity.mutualConnections} mutual connections</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {activity.timestamp}
              </span>
            </div>
          </div>
        );
      
      case 'profile_update':
        return (
          <div>
            <p className="text-sm text-gray-900 mb-2">
              <span className="font-semibold">{activity.user.name}</span> {activity.update}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{activity.mutualConnections} mutual connections</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {activity.timestamp}
              </span>
            </div>
          </div>
        );
      
      case 'new_skill':
        return (
          <div>
            <p className="text-sm text-gray-900 mb-2">
              <span className="font-semibold">{activity.user.name}</span> added new skills
            </p>
            <div className="flex flex-wrap gap-1 mb-2">
              {activity.skills.map((skill: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{activity.mutualConnections} mutual connections</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {activity.timestamp}
              </span>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Network Activity Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Network Activity
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Activity Feed */}
      <div className="space-y-4">
        {networkActivities.map((activity) => (
          <Card key={activity.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex space-x-4">
                {/* Activity Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {renderActivityIcon(activity.type)}
                  </div>
                </div>
                
                {/* Activity Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {renderActivityContent(activity)}
                    </div>
                    
                    {/* User Avatar and Info */}
                    <div className="flex items-center space-x-3 ml-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{activity.user.name}</p>
                        <p className="text-xs text-gray-500">
                          {activity.user.profession}
                          {activity.user.company && ` at ${activity.user.company}`}
                        </p>
                        {activity.user.location && (
                          <p className="text-xs text-gray-400">{activity.user.location}</p>
                        )}
                      </div>
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white">
                          {activity.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2 mt-4">
                    <ConnectionButton
                      targetUserId={activity.user.id}
                      targetUserName={activity.user.name}
                      size="sm"
                      variant="outline"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex items-center gap-1"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" className="w-full">
          Load More Activity
        </Button>
      </div>
    </div>
  );
};

export default NetworkFeed;