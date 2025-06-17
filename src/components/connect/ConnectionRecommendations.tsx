
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, TrendingUp, Calendar, MessageSquare } from 'lucide-react';

const ConnectionRecommendations = () => {
  const recommendations = [
    {
      id: '1',
      name: 'Ibrahim Hassan',
      title: 'Tech Entrepreneur',
      company: 'Flutterwave',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      reason: 'Similar background in fintech',
      mutualConnections: 5
    },
    {
      id: '2',
      name: 'Zara Mbeki',
      title: 'Climate Tech Investor',
      company: 'GreenTech Capital',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
      reason: 'Shared interest in sustainability',
      mutualConnections: 3
    }
  ];

  const trendingTopics = [
    { topic: 'African Startup Ecosystem', posts: 234 },
    { topic: 'Diaspora Investment', posts: 156 },
    { topic: 'Tech for Africa', posts: 189 },
    { topic: 'Climate Solutions', posts: 98 }
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'African Tech Leaders Summit',
      date: 'Dec 15, 2024',
      attendees: 450,
      type: 'Virtual'
    },
    {
      id: '2',
      title: 'Diaspora Investment Forum',
      date: 'Jan 22, 2025',
      attendees: 280,
      type: 'Hybrid'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Connection Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5" />
            People You May Know
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((person) => (
            <div key={person.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <Avatar className="w-12 h-12">
                <AvatarImage src={person.avatar} alt={person.name} />
                <AvatarFallback className="bg-dna-copper text-white">
                  {person.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{person.name}</p>
                <p className="text-xs text-gray-600">{person.title}</p>
                <p className="text-xs text-dna-emerald">{person.reason}</p>
                <p className="text-xs text-gray-500">{person.mutualConnections} mutual</p>
              </div>
              <Button size="sm" className="bg-dna-emerald hover:bg-dna-forest text-white">
                Connect
              </Button>
            </div>
          ))}
          <Button variant="outline" className="w-full">
            See All Suggestions
          </Button>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5" />
            Trending in Your Network
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingTopics.map((trend, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">#{trend.topic}</p>
                <p className="text-xs text-gray-600">{trend.posts} posts</p>
              </div>
              <Button variant="ghost" size="sm">
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="p-3 border rounded-lg">
              <p className="font-medium text-sm">{event.title}</p>
              <p className="text-xs text-gray-600">{event.date}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{event.type}</Badge>
                  <span className="text-xs text-gray-600">{event.attendees} attending</span>
                </div>
                <Button size="sm" variant="outline">
                  Register
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionRecommendations;
