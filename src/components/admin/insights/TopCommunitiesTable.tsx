import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Building, Users, MessageSquare, TrendingUp } from 'lucide-react';

// Mock data - in production this would come from your analytics hook
const mockCommunities = [
  {
    id: '1',
    name: 'Tech Innovators Africa',
    description: 'Building the future of technology across Africa',
    memberCount: 2847,
    postCount: 156,
    growthRate: '+23%',
    category: 'Technology',
    avatar: null
  },
  {
    id: '2',
    name: 'African Entrepreneurs Network',
    description: 'Connecting entrepreneurs across the diaspora',
    memberCount: 1923,
    postCount: 89,
    growthRate: '+18%',
    category: 'Business',
    avatar: null
  },
  {
    id: '3',
    name: 'Cultural Heritage Preservation',
    description: 'Preserving and celebrating African culture',
    memberCount: 1456,
    postCount: 67,
    growthRate: '+15%',
    category: 'Culture',
    avatar: null
  },
  {
    id: '4',
    name: 'Healthcare Innovation Hub',
    description: 'Advancing healthcare solutions for Africa',
    memberCount: 1234,
    postCount: 45,
    growthRate: '+12%',
    category: 'Healthcare',
    avatar: null
  },
  {
    id: '5',
    name: 'Sustainable Development Goals',
    description: 'Working together for sustainable development',
    memberCount: 987,
    postCount: 34,
    growthRate: '+8%',
    category: 'Environment',
    avatar: null
  }
];

export function TopCommunitiesTable() {
  const getCategoryColor = (category: string) => {
    const colors = {
      Technology: 'bg-blue-100 text-blue-800',
      Business: 'bg-green-100 text-green-800',
      Culture: 'bg-purple-100 text-purple-800',
      Healthcare: 'bg-red-100 text-red-800',
      Environment: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Building className="h-5 w-5 text-dna-emerald" />
          Top Communities by Engagement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockCommunities.map((community, index) => (
            <div key={community.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-400 w-6">
                    #{index + 1}
                  </span>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={community.avatar || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-dna-emerald to-dna-copper text-white">
                      {community.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900">{community.name}</h3>
                    <Badge className={getCategoryColor(community.category)}>
                      {community.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{community.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="font-medium">{community.memberCount.toLocaleString()}</span>
                  </div>
                  <span className="text-xs text-gray-500">Members</span>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center text-gray-600">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span className="font-medium">{community.postCount}</span>
                  </div>
                  <span className="text-xs text-gray-500">Posts</span>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="font-medium">{community.growthRate}</span>
                  </div>
                  <span className="text-xs text-gray-500">Growth</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}