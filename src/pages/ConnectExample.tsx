import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MapPin, Briefcase, GraduationCap, MessageSquare, User, Globe } from 'lucide-react';

const ConnectExample = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const professionals = [
    {
      id: 1,
      name: "Dr. Amara Okafor",
      title: "FinTech Innovation Lead",
      company: "JPMorgan Chase",
      location: "London, UK",
      origin: "Lagos, Nigeria",
      expertise: ["Financial Technology", "Investment Banking", "Cryptocurrency"],
      connections: 847,
      mutualConnections: 23,
      availableFor: ["Mentorship", "Investment", "Advisory"],
      recentActivity: "Shared insights on African fintech trends"
    },
    {
      id: 2,
      name: "Prof. Kwame Asante",
      title: "Chief Technology Officer",
      company: "AgriTech Solutions",
      location: "Toronto, Canada",
      origin: "Accra, Ghana",
      expertise: ["Agricultural Technology", "IoT", "Data Analytics"],
      connections: 1205,
      mutualConnections: 31,
      availableFor: ["Collaboration", "Research", "Funding"],
      recentActivity: "Published research on smart farming solutions"
    },
    {
      id: 3,
      name: "Sarah Kimani",
      title: "Healthcare Innovation Director",
      company: "Kaiser Permanente",
      location: "San Francisco, USA",
      origin: "Nairobi, Kenya",
      expertise: ["Digital Health", "Telemedicine", "Medical Devices"],
      connections: 692,
      mutualConnections: 18,
      availableFor: ["Mentorship", "Advisory", "Investment"],
      recentActivity: "Launched telemedicine pilot in East Africa"
    },
    {
      id: 4,
      name: "Michael Adebayo",
      title: "Renewable Energy Engineer",
      company: "Tesla Energy",
      location: "Austin, USA",
      origin: "Ibadan, Nigeria",
      expertise: ["Solar Energy", "Battery Technology", "Grid Systems"],
      connections: 534,
      mutualConnections: 12,
      availableFor: ["Collaboration", "Technical Advisory"],
      recentActivity: "Completed solar installation project in rural Nigeria"
    }
  ];

  const suggestions = [
    {
      category: "Based on Location",
      count: 127,
      description: "Professionals in your current city"
    },
    {
      category: "Same Origin Country",
      count: 89,
      description: "Diaspora from your home country"
    },
    {
      category: "Similar Expertise",
      count: 156,
      description: "Professionals in your field"
    },
    {
      category: "Investment Interests",
      count: 73,
      description: "Active investors in African projects"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 hover:bg-dna-mint"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="border-l border-gray-300 h-6 hidden sm:block"></div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Professional Network</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Connect with diaspora professionals</p>
              </div>
            </div>
            <Badge className="bg-dna-emerald text-white text-xs sm:text-sm">
              2,847 Active
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search Section */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Search className="w-5 h-5" />
              Find Your Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Input 
                placeholder="Search by name, expertise, company..." 
                className="flex-1"
              />
              <Button className="bg-dna-emerald hover:bg-dna-forest text-white">
                Search
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">FinTech</Badge>
              <Badge variant="outline">Healthcare</Badge>
              <Badge variant="outline">AgriTech</Badge>
              <Badge variant="outline">Renewable Energy</Badge>
              <Badge variant="outline">Education</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Suggestions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 sm:mb-8">
          {suggestions.map((suggestion, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="text-lg sm:text-xl font-bold text-dna-copper mb-2">{suggestion.count}</div>
                <div className="font-medium text-xs sm:text-sm mb-1">{suggestion.category}</div>
                <div className="text-xs text-gray-600 hidden sm:block">{suggestion.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Professional Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {professionals.map((professional) => (
            <Card key={professional.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-dna-copper to-dna-emerald rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg mb-1">{professional.name}</CardTitle>
                    <p className="text-dna-copper font-medium text-sm sm:text-base">{professional.title}</p>
                    <p className="text-gray-600 text-xs sm:text-sm">{professional.company}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{professional.location} • Originally from {professional.origin}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Globe className="w-4 h-4" />
                  <span>{professional.connections} connections • {professional.mutualConnections} mutual</span>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Expertise</div>
                  <div className="flex flex-wrap gap-1">
                    {professional.expertise.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Available For</div>
                  <div className="flex flex-wrap gap-1">
                    {professional.availableFor.map((service, index) => (
                      <Badge key={index} className="text-xs bg-dna-emerald/20 text-dna-emerald">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Recent Activity</div>
                  <div className="text-sm">{professional.recentActivity}</div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button className="flex-1 bg-dna-emerald hover:bg-dna-forest text-white">
                    Connect
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10">
          <CardContent className="p-6 sm:p-8 text-center">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              Expand Your Professional Circle
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Join communities, attend virtual events, and participate in mentorship programs to grow your network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-dna-emerald hover:bg-dna-forest text-white">
                Join Communities
              </Button>
              <Button variant="outline">
                Browse Events
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ConnectExample;
