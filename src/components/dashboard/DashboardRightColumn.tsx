import React from 'react';
import { Profile } from '@/services/profilesService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Lightbulb, ArrowRight, Heart } from 'lucide-react';

interface DashboardRightColumnProps {
  profile: Profile;
  isOwnProfile: boolean;
}

const DashboardRightColumn: React.FC<DashboardRightColumnProps> = ({
  profile,
  isOwnProfile
}) => {
  // Mock data for suggestions - in real implementation, these would come from API
  const suggestedConnections = [
    {
      id: '1',
      name: 'Amara Okafor',
      title: 'Tech Entrepreneur',
      location: 'Lagos, Nigeria',
      avatar: null,
      commonInterests: ['Tech', 'Startups']
    },
    {
      id: '2', 
      name: 'Kwame Asante',
      title: 'Social Impact Investor',
      location: 'Accra, Ghana',
      avatar: null,
      commonInterests: ['Impact Investing', 'Education']
    }
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'African Tech Summit',
      date: '2024-08-15',
      location: 'Virtual',
      attendees: 247
    },
    {
      id: '2',
      title: 'Diaspora Investment Forum',
      date: '2024-08-22',
      location: 'New York',
      attendees: 156
    }
  ];

  const contributionOpportunities = [
    {
      id: '1',
      title: 'EdTech for Rural Schools',
      type: 'Project',
      needType: 'Technical Skills',
      urgency: 'High'
    },
    {
      id: '2',
      title: 'Renewable Energy Initiative',
      type: 'Investment',
      needType: 'Funding',
      urgency: 'Medium'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Suggested Connections */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            People You May Know
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suggestedConnections.map((person) => (
              <div key={person.id} className="flex items-start space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={person.avatar || ''} alt={person.name} />
                  <AvatarFallback className="bg-dna-copper text-white text-sm">
                    {person.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {person.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {person.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {person.location}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {person.commonInterests.slice(0, 2).map((interest, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            <Button variant="ghost" size="sm" className="w-full text-dna-copper">
              View All Suggestions
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="border-l-4 border-dna-mint pl-3">
                <h4 className="text-sm font-medium text-gray-900">
                  {event.title}
                </h4>
                <p className="text-xs text-gray-500">
                  {new Date(event.date).toLocaleDateString()} • {event.location}
                </p>
                <p className="text-xs text-gray-400">
                  {event.attendees} attending
                </p>
              </div>
            ))}
            
            <Button variant="ghost" size="sm" className="w-full text-dna-copper">
              View All Events
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contribution Opportunities */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
            <Heart className="w-4 h-4 mr-2" />
            Ways to Contribute
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contributionOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    {opportunity.title}
                  </h4>
                  <Badge 
                    variant={opportunity.urgency === 'High' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {opportunity.urgency}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {opportunity.type} • Needs: {opportunity.needType}
                </p>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Learn More
                </Button>
              </div>
            ))}
            
            <Button variant="ghost" size="sm" className="w-full text-dna-copper">
              View All Opportunities
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Community Insights */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
            <Lightbulb className="w-4 h-4 mr-2" />
            Community Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Active Members</span>
              <span className="font-medium">2,847</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">This Week's Connections</span>
              <span className="font-medium text-dna-emerald">+127</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">New Projects</span>
              <span className="font-medium text-dna-copper">23</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Impact Score</span>
              <span className="font-medium text-dna-gold">8.4/10</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardRightColumn;