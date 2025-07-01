
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageCircle, 
  Bell, 
  Heart, 
  Share2,
  Calendar,
  MapPin,
  Zap,
  Award,
  TrendingUp
} from 'lucide-react';

const ContributionEngagementPanel = () => {
  const [notifications] = useState([
    {
      id: 1,
      type: 'update',
      title: 'Solar Education Initiative',
      message: 'Project milestone reached: 25 schools now powered!',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'comment',
      title: 'FinTech Mentorship Program',
      message: 'Sarah Mbeki commented on your contribution',
      time: '5 hours ago',
      read: false
    },
    {
      id: 3,
      type: 'milestone',
      title: 'Clean Water Campaign',
      message: 'Funding goal reached - project now launching!',
      time: '1 day ago',
      read: true
    }
  ]);

  const communityHighlights = [
    {
      id: 1,
      title: 'Top Contributors This Month',
      contributors: [
        { name: 'Dr. Amina Hassan', amount: '$25,000', projects: 5 },
        { name: 'Joseph Asante', amount: '$18,500', projects: 3 },
        { name: 'Maria Santos', amount: '$15,200', projects: 4 }
      ]
    },
    {
      id: 2,
      title: 'Rising Impact Areas',
      areas: [
        { name: 'Clean Energy', growth: '+45%', projects: 23 },
        { name: 'EdTech', growth: '+38%', projects: 18 },
        { name: 'HealthTech', growth: '+32%', projects: 15 }
      ]
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'African Diaspora Impact Summit',
      date: 'March 15, 2024',
      location: 'Lagos, Nigeria',
      type: 'Conference',
      attendees: 250,
      isVirtual: false
    },
    {
      id: 2,
      title: 'FinTech Innovation Webinar',
      date: 'March 22, 2024',
      location: 'Online',
      type: 'Webinar',
      attendees: 500,
      isVirtual: true
    },
    {
      id: 3,
      title: 'Sustainable Agriculture Workshop',
      date: 'April 5, 2024',
      location: 'Nairobi, Kenya',
      type: 'Workshop',
      attendees: 80,
      isVirtual: false
    }
  ];

  const leaderboard = [
    { rank: 1, name: 'Dr. Amina Hassan', points: 2450, badge: 'Impact Champion' },
    { rank: 2, name: 'Joseph Asante', points: 2280, badge: 'Community Builder' },
    { rank: 3, name: 'Maria Santos', points: 2150, badge: 'Innovation Leader' },
    { rank: 4, name: 'Sarah Mbeki', points: 1980, badge: 'Mentor' },
    { rank: 5, name: 'David Osei', points: 1850, badge: 'Connector' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Community Engagement</h2>
        <p className="text-gray-600">
          Stay connected with the community, track updates, and celebrate collective achievements
        </p>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-dna-emerald" />
                Recent Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      notification.read
                        ? 'bg-gray-50 border-gray-300'
                        : 'bg-dna-emerald/5 border-dna-emerald'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-gray-600 text-sm mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-gray-500">{notification.time}</span>
                          <Badge
                            variant={notification.type === 'milestone' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {notification.type}
                          </Badge>
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-dna-emerald rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Button variant="outline">View All Notifications</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {communityHighlights.map((highlight) => (
              <Card key={highlight.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-dna-copper" />
                    {highlight.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {highlight.contributors && (
                    <div className="space-y-3">
                      {highlight.contributors.map((contributor, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-dna-emerald rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{contributor.name}</p>
                              <p className="text-sm text-gray-600">{contributor.projects} projects</p>
                            </div>
                          </div>
                          <Badge className="bg-dna-emerald text-white">
                            {contributor.amount}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  {highlight.areas && (
                    <div className="space-y-3">
                      {highlight.areas.map((area, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{area.name}</p>
                            <p className="text-sm text-gray-600">{area.projects} active projects</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            {area.growth}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-dna-gold" />
                Community Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-dna-emerald mb-1">2,847</div>
                  <div className="text-sm text-gray-600">Active Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-dna-copper mb-1">156</div>
                  <div className="text-sm text-gray-600">Projects This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-dna-gold mb-1">89%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-dna-mint mb-1">54</div>
                  <div className="text-sm text-gray-600">Countries Represented</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-dna-emerald" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {event.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{event.type}</Badge>
                        {event.isVirtual && (
                          <Badge className="bg-blue-100 text-blue-800">Virtual</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {event.attendees} attendees expected
                      </span>
                      <Button size="sm" className="bg-dna-emerald hover:bg-dna-forest text-white">
                        Register
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-dna-gold" />
                Impact Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((member) => (
                  <div
                    key={member.rank}
                    className={`p-4 rounded-lg flex items-center justify-between ${
                      member.rank <= 3 ? 'bg-gradient-to-r from-dna-gold/10 to-dna-copper/10' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        member.rank === 1 ? 'bg-yellow-500 text-white' :
                        member.rank === 2 ? 'bg-gray-400 text-white' :
                        member.rank === 3 ? 'bg-orange-500 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {member.rank}
                      </div>
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {member.badge}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-dna-emerald">{member.points.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">impact points</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-dna-emerald/10 rounded-lg text-center">
                <p className="text-sm text-gray-700 mb-2">
                  Your current ranking: #47 with 1,245 impact points
                </p>
                <Button size="sm" variant="outline">
                  View Full Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContributionEngagementPanel;
