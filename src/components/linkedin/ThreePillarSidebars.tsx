import React from 'react';
import { Users, Handshake, Heart, TrendingUp, Calendar, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Connect Sidebar Component
export const ConnectSidebar = () => {
  const recentConnections = [
    { name: "Amara Okafor", title: "FinTech Entrepreneur", location: "Lagos, Nigeria" },
    { name: "Dr. Kwame Asante", title: "Healthcare Innovation", location: "Accra, Ghana" },
    { name: "Zara Mohamed", title: "EdTech Founder", location: "Cairo, Egypt" }
  ];

  const upcomingEvents = [
    { title: "African Tech Summit", date: "Feb 15", attendees: 250 },
    { title: "Diaspora Networking", date: "Feb 18", attendees: 120 }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-dna-emerald" />
            Your Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Connections</span>
              <span className="font-semibold text-dna-forest">1,247</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Views this week</span>
              <span className="font-semibold text-dna-emerald">+23</span>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Grow your network
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Recent Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentConnections.map((connection, index) => (
              <div key={index} className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs bg-dna-mint text-dna-forest">
                    {connection.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{connection.name}</p>
                  <p className="text-xs text-gray-500 truncate">{connection.title}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">{event.title}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">{event.date}</span>
                  <Badge variant="secondary" className="text-xs">
                    {event.attendees} attending
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Contribute Sidebar Component
export const ContributeSidebar = () => {
  const impactStats = [
    { label: "Total Contributed", value: "$2,500", icon: Heart },
    { label: "Projects Supported", value: "8", icon: TrendingUp },
    { label: "Lives Impacted", value: "1,200+", icon: Users }
  ];

  const activeContributions = [
    { project: "Clean Water Initiative", amount: "$500", impact: "50 families" },
    { project: "Tech Education Program", amount: "$1,200", impact: "200 students" }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-dna-copper" />
            Your Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {impactStats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="p-2 bg-dna-mint/20 rounded-lg">
                  <stat.icon className="w-4 h-4 text-dna-copper" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Active Contributions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeContributions.map((contribution, index) => (
              <div key={index} className="p-3 bg-gradient-to-r from-dna-mint/10 to-dna-copper/10 rounded-lg border border-dna-mint/20">
                <p className="text-sm font-medium">{contribution.project}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-dna-copper font-semibold">{contribution.amount}</span>
                  <span className="text-xs text-gray-600">{contribution.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Trending Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
              <p className="text-xs font-medium">🚨 Emergency Relief</p>
              <p className="text-xs text-gray-600">Flood relief in Ghana</p>
            </div>
            <div className="p-2 bg-green-50 rounded border-l-4 border-green-400">
              <p className="text-xs font-medium">📚 Education Fund</p>
              <p className="text-xs text-gray-600">Scholarships for girls</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Discovery Sidebar Component (Right side - dynamic based on active pillar)
export const DiscoverySidebar = ({ activePillar = 'connect' }: { activePillar?: string }) => {
  const trendingTopics = [
    { topic: "African Fintech", posts: "2.1k posts" },
    { topic: "Climate Tech", posts: "890 posts" },
    { topic: "Digital Health", posts: "654 posts" }
  ];

  const suggestedCollaborations = [
    { title: "AgriTech Supply Chain", skills: ["Logistics", "IoT"], urgency: "High" },
    { title: "HealthTech Platform", skills: ["React", "Healthcare"], urgency: "Medium" }
  ];

  const collaborationMetrics = [
    { label: "Active Projects", value: "23", change: "+5" },
    { label: "Open Positions", value: "156", change: "+12" },
    { label: "Skill Matches", value: "89%", change: "+3%" }
  ];

  const contributionOpportunities = [
    { title: "Education Initiative", amount: "$2,500 needed", impact: "500 students", urgency: "Medium" },
    { title: "Water Project", amount: "$5,000 needed", impact: "200 families", urgency: "High" }
  ];

  // Dynamic content based on active pillar
  const renderPillarSpecificContent = () => {
    switch (activePillar) {
      case 'collaborate':
        return (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Handshake className="w-5 h-5 text-dna-emerald" />
                Collaboration Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {collaborationMetrics.map((metric, index) => (
                  <div key={index} className="p-3 bg-dna-emerald/5 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{metric.label}</span>
                      <span className="text-xs text-green-600 font-medium">{metric.change}</span>
                    </div>
                    <p className="text-xl font-bold text-dna-forest">{metric.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      
      case 'contribute':
        return (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-dna-copper" />
                Featured Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contributionOpportunities.map((opp, index) => (
                  <div key={index} className="p-3 bg-dna-copper/5 rounded-lg border border-dna-copper/20">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium">{opp.title}</p>
                      <Badge 
                        variant={opp.urgency === 'High' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {opp.urgency}
                      </Badge>
                    </div>
                    <p className="text-xs text-dna-copper font-semibold">{opp.amount}</p>
                    <p className="text-xs text-gray-600">Impact: {opp.impact}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      
      default: // connect
        return (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Handshake className="w-5 h-5 text-dna-emerald" />
                Suggested for You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suggestedCollaborations.map((collab, index) => (
                  <div key={index} className="p-3 bg-dna-emerald/5 rounded-lg border border-dna-emerald/20">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium">{collab.title}</p>
                      <Badge 
                        variant={collab.urgency === 'High' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {collab.urgency}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {collab.skills.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-4">
      {renderPillarSpecificContent()}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Trending in Africa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trendingTopics.map((trend, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">#{trend.topic}</p>
                  <p className="text-xs text-gray-500">{trend.posts}</p>
                </div>
                <TrendingUp className="w-4 h-4 text-dna-emerald" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Community Pulse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-center p-3 bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10 rounded-lg">
              <p className="text-2xl font-bold text-dna-forest">12.5k</p>
              <p className="text-xs text-gray-600">Active members this week</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-dna-mint/20 rounded">
                <p className="text-sm font-semibold text-dna-forest">348</p>
                <p className="text-xs text-gray-600">New connections</p>
              </div>
              <div className="text-center p-2 bg-dna-copper/20 rounded">
                <p className="text-sm font-semibold text-dna-forest">89</p>
                <p className="text-xs text-gray-600">New projects</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};