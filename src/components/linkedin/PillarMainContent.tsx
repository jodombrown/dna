import React, { useState } from 'react';
import { Users, Handshake, Heart, Calendar, MapPin, Clock, Star, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FeedContainer } from '@/components/social-feed/FeedContainer';
import { PostComposer } from '@/components/social-feed/PostComposer';
import { useLiveEvents } from '@/hooks/useLiveEvents';
import { useLiveContributions } from '@/hooks/useLiveContributions';

interface PillarMainContentProps {
  activePillar: string;
}

export const PillarMainContent: React.FC<PillarMainContentProps> = ({ activePillar }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { events, loading: eventsLoading } = useLiveEvents(3);
  const { contributions, loading: contributionsLoading } = useLiveContributions(3);

  const handlePostCreated = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const connectContent = () => (
    <div className="space-y-4">
      <PostComposer defaultPillar="connect" onPostCreated={handlePostCreated} />
      <FeedContainer defaultPillar="connect" showComposer={false} />
      
      {/* Networking Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-dna-emerald" />
            Upcoming Networking Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {eventsLoading ? (
              <div className="text-center py-4">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No upcoming events</div>
            ) : (
              events.map((event, index) => (
                <div key={index} className="p-4 border border-dna-emerald/20 rounded-lg hover:bg-dna-emerald/5 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-dna-forest">{event.title}</h3>
                    <Badge variant={event.is_virtual ? 'secondary' : 'outline'}>
                      {event.is_virtual ? 'Virtual' : event.type || 'In-person'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {event.date_time ? new Date(event.date_time).toLocaleDateString() : 'TBD'}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.location || 'TBD'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {event.attendee_count || 0} attending
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex -space-x-2">
                      {[1,2,3,4].map((i) => (
                        <Avatar key={i} className="w-6 h-6 border-2 border-white">
                          <AvatarFallback className="text-xs bg-dna-mint text-dna-forest">
                            U{i}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <Button size="sm" className="bg-dna-emerald hover:bg-dna-forest">
                      Register
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Professional Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-dna-emerald" />
            People You Should Know
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Dr. Amara Okafor", title: "FinTech CEO", company: "PayLink Africa", mutual: 12 },
              { name: "Kwame Asante", title: "Impact Investor", company: "Growth Capital", mutual: 8 },
              { name: "Zara Mohamed", title: "EdTech Founder", company: "LearnAfrica", mutual: 15 }
            ].map((person, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-dna-mint text-dna-forest">
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{person.name}</p>
                    <p className="text-sm text-gray-600">{person.title} at {person.company}</p>
                    <p className="text-xs text-gray-500">{person.mutual} mutual connections</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Connect</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const collaborateContent = () => (
    <div className="space-y-4">
      <PostComposer defaultPillar="collaborate" onPostCreated={handlePostCreated} />
      <FeedContainer defaultPillar="collaborate" showComposer={false} />
      
      {/* Featured Project Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Handshake className="w-5 h-5 text-dna-emerald" />
            Featured Project Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                title: "AgriTech Supply Chain Platform",
                description: "Building a blockchain-based supply chain solution for African farmers",
                skills: ["React", "Blockchain", "Supply Chain"],
                team: 6,
                funding: "$75k",
                urgency: "High",
                deadline: "Q2 2024"
              },
              {
                title: "Healthcare Data Analytics",
                description: "AI-powered health insights platform for rural communities",
                skills: ["Python", "AI/ML", "Healthcare"],
                team: 8,
                funding: "$120k",
                urgency: "Medium",
                deadline: "Q3 2024"
              },
              {
                title: "Education Mobile App",
                description: "Offline-first learning platform for students in remote areas",
                skills: ["React Native", "EdTech", "Mobile"],
                team: 4,
                funding: "$45k",
                urgency: "High",
                deadline: "Q2 2024"
              }
            ].map((project, index) => (
              <div key={index} className="p-4 border border-dna-emerald/20 rounded-lg hover:bg-dna-emerald/5 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-dna-forest mb-1">{project.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                  </div>
                  <Badge variant={project.urgency === 'High' ? 'destructive' : 'secondary'}>
                    {project.urgency}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.skills.map((skill, skillIndex) => (
                    <Badge key={skillIndex} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {project.team} team members
                    </span>
                    <span className="text-dna-copper font-semibold">{project.funding}</span>
                    <span>{project.deadline}</span>
                  </div>
                  <Button size="sm" className="bg-dna-emerald hover:bg-dna-forest">
                    Join Project
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skill Matching */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-dna-emerald" />
            Perfect Skill Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { skill: "React Development", projects: 12, match: 95 },
              { skill: "Product Management", projects: 8, match: 88 },
              { skill: "UI/UX Design", projects: 15, match: 92 }
            ].map((match, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-dna-emerald/10 to-dna-mint/10 rounded-lg">
                <div>
                  <p className="font-medium">{match.skill}</p>
                  <p className="text-sm text-gray-600">{match.projects} open positions</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-dna-emerald">{match.match}%</p>
                  <p className="text-xs text-gray-500">match</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const contributeContent = () => (
    <div className="space-y-4">
      <PostComposer defaultPillar="contribute" onPostCreated={handlePostCreated} />
      <FeedContainer defaultPillar="contribute" showComposer={false} />
      
      {/* Featured Impact Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-dna-copper" />
            High-Impact Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contributionsLoading ? (
              <div className="text-center py-4">Loading opportunities...</div>
            ) : contributions.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No active opportunities</div>
            ) : (
              contributions.map((opportunity, index) => (
                <div key={index} className="p-4 border border-dna-copper/20 rounded-lg hover:bg-dna-copper/5 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-dna-forest mb-1">{opportunity.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{opportunity.description}</p>
                    </div>
                    <Badge variant={opportunity.impact_area === 'urgent' ? 'destructive' : 'secondary'}>
                      {opportunity.impact_area || 'General'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">
                        ${(opportunity.amount_raised || 0).toLocaleString()} of ${(opportunity.amount_needed || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-dna-copper h-2 rounded-full" 
                        style={{ 
                          width: `${opportunity.amount_needed && opportunity.amount_needed > 0 
                            ? Math.min(((opportunity.amount_raised || 0) / opportunity.amount_needed) * 100, 100) 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {opportunity.target_date ? new Date(opportunity.target_date).toLocaleDateString() : 'Ongoing'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {opportunity.location || 'Multiple locations'}
                      </span>
                    </div>
                    <Button size="sm" className="bg-dna-copper hover:bg-dna-forest">
                      Contribute
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Impact Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-dna-copper" />
            Community Impact This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-dna-copper/10 to-dna-mint/10 rounded-lg">
              <p className="text-2xl font-bold text-dna-copper">$125k</p>
              <p className="text-sm text-gray-600">Total Raised</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-dna-mint/10 to-dna-emerald/10 rounded-lg">
              <p className="text-2xl font-bold text-dna-emerald">15</p>
              <p className="text-sm text-gray-600">Projects Funded</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10 rounded-lg">
              <p className="text-2xl font-bold text-dna-forest">2.5k</p>
              <p className="text-sm text-gray-600">Lives Impacted</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-dna-mint/10 to-dna-forest/10 rounded-lg">
              <p className="text-2xl font-bold text-dna-forest">89%</p>
              <p className="text-sm text-gray-600">Success Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  switch (activePillar) {
    case 'connect':
      return connectContent();
    case 'collaborate':
      return collaborateContent();
    case 'contribute':
      return contributeContent();
    default:
      return connectContent();
  }
};