import React, { useState } from 'react';
import { Users, Handshake, Heart, Calendar, MapPin, Clock, Star, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SocialFeed } from '@/components/feed/SocialFeed';
import { EnhancedPostComposer } from '@/components/feed/EnhancedPostComposer';

interface PillarMainContentProps {
  activePillar: string;
}

export const PillarMainContent: React.FC<PillarMainContentProps> = ({ activePillar }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const connectContent = () => (
    <div className="space-y-4">
      <EnhancedPostComposer defaultPillar="connect" onPostCreated={handlePostCreated} />
      <SocialFeed key={`connect-${refreshKey}`} pillar="connect" limit={5} />
      
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
            {[
              { 
                title: "African Tech Leaders Summit", 
                date: "Feb 15, 2024", 
                location: "Lagos, Nigeria", 
                attendees: 250,
                type: "In-person"
              },
              { 
                title: "Diaspora Innovation Network", 
                date: "Feb 18, 2024", 
                location: "Virtual", 
                attendees: 450,
                type: "Virtual"
              },
              { 
                title: "FinTech Connect Africa", 
                date: "Feb 22, 2024", 
                location: "Cape Town, SA", 
                attendees: 180,
                type: "Hybrid"
              }
            ].map((event, index) => (
              <div key={index} className="p-4 border border-dna-emerald/20 rounded-lg hover:bg-dna-emerald/5 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-dna-forest">{event.title}</h3>
                  <Badge variant={event.type === 'Virtual' ? 'secondary' : 'outline'}>
                    {event.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {event.attendees} attending
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
            ))}
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
      <EnhancedPostComposer defaultPillar="collaborate" onPostCreated={handlePostCreated} />
      <SocialFeed key={`collaborate-${refreshKey}`} pillar="collaborate" limit={5} />
      
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
      <EnhancedPostComposer defaultPillar="contribute" onPostCreated={handlePostCreated} />
      <SocialFeed key={`contribute-${refreshKey}`} pillar="contribute" limit={5} />
      
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
            {[
              {
                title: "Clean Water Initiative - Ghana",
                description: "Providing clean water access to 500 families in rural communities",
                needed: "$15,000",
                raised: "$8,500",
                deadline: "30 days",
                impact: "500 families",
                urgency: "High"
              },
              {
                title: "Girls Education Fund - Kenya",
                description: "Scholarships for 200 girls to complete secondary education",
                needed: "$25,000",
                raised: "$12,800",
                deadline: "45 days",
                impact: "200 students",
                urgency: "Medium"
              },
              {
                title: "Tech Training Center - Nigeria",
                description: "Equipment and training materials for coding bootcamp",
                needed: "$30,000",
                raised: "$22,000",
                deadline: "60 days",
                impact: "300 youth",
                urgency: "Medium"
              }
            ].map((opportunity, index) => (
              <div key={index} className="p-4 border border-dna-copper/20 rounded-lg hover:bg-dna-copper/5 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-dna-forest mb-1">{opportunity.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{opportunity.description}</p>
                  </div>
                  <Badge variant={opportunity.urgency === 'High' ? 'destructive' : 'secondary'}>
                    {opportunity.urgency}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{opportunity.raised} of {opportunity.needed}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-dna-copper h-2 rounded-full" 
                      style={{ width: `${(parseInt(opportunity.raised.replace('$', '').replace(',', '')) / parseInt(opportunity.needed.replace('$', '').replace(',', ''))) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {opportunity.deadline}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {opportunity.impact}
                    </span>
                  </div>
                  <Button size="sm" className="bg-dna-copper hover:bg-dna-forest">
                    Contribute
                  </Button>
                </div>
              </div>
            ))}
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