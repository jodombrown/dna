
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, MessageSquare, UserPlus, MoreHorizontal, Share, ThumbsUp } from 'lucide-react';

interface ProfessionalsTabProps {
  searchTerm: string;
}

const ProfessionalsTab: React.FC<ProfessionalsTabProps> = ({ searchTerm }) => {
  // Mock data for professionals with diverse African images
  const professionals = [
    {
      id: '1',
      name: 'Dr. Amara Okafor',
      title: 'Senior FinTech Product Manager',
      company: 'Stripe',
      location: 'London, UK',
      origin: 'Lagos, Nigeria',
      avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face',
      followers: 2340,
      connections: 890,
      skills: ['Product Strategy', 'Financial Technology', 'Team Leadership'],
      bio: 'Passionate about building financial infrastructure that empowers African businesses globally. 5+ years at top fintech companies.',
      connectionStatus: null,
      recentActivity: 'Published: "The Future of Cross-Border Payments in Africa"',
      isOnline: true,
      mutualConnections: 12
    },
    {
      id: '2',
      name: 'Prof. Kwame Asante',
      title: 'Agricultural Innovation Lead',
      company: 'World Bank Group',
      location: 'Toronto, Canada',
      origin: 'Accra, Ghana',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      followers: 5670,
      connections: 1200,
      skills: ['AgriTech', 'Sustainable Development', 'Research'],
      bio: 'Leading agricultural transformation initiatives across sub-Saharan Africa. PhD in Agricultural Economics.',
      connectionStatus: 'connected',
      recentActivity: 'Shared insights on climate-smart farming',
      isOnline: false,
      mutualConnections: 8
    },
    {
      id: '3',
      name: 'Sarah Mwangi',
      title: 'Impact Investment Principal',
      company: 'TLcom Capital',
      location: 'Nairobi, Kenya',
      origin: 'Nairobi, Kenya',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
      followers: 3450,
      connections: 750,
      skills: ['Impact Investing', 'Venture Capital', 'ESG'],
      bio: 'Investing in early-stage African startups solving real problems. Former McKinsey consultant with 8+ years experience.',
      connectionStatus: 'pending',
      recentActivity: 'Attended African Startup Summit 2024',
      isOnline: true,
      mutualConnections: 15
    },
    {
      id: '4',
      name: 'Ibrahim Hassan',
      title: 'Tech Entrepreneur',
      company: 'Flutterwave',
      location: 'San Francisco, USA',
      origin: 'Cairo, Egypt',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      followers: 4200,
      connections: 980,
      skills: ['Fintech', 'Entrepreneurship', 'Market Expansion'],
      bio: 'Building payment solutions for Africa. Previously scaled tech teams across 3 continents.',
      connectionStatus: null,
      recentActivity: 'Launched new payment gateway for SMEs',
      isOnline: true,
      mutualConnections: 22
    },
    {
      id: '5',
      name: 'Dr. Fatima Al-Rashid',
      title: 'Climate Tech Researcher',
      company: 'MIT',
      location: 'Boston, USA',
      origin: 'Marrakech, Morocco',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
      followers: 2890,
      connections: 650,
      skills: ['Climate Technology', 'Renewable Energy', 'Policy'],
      bio: 'PhD researcher focusing on scalable climate solutions for MENA and Sub-Saharan Africa.',
      connectionStatus: null,
      recentActivity: 'Published research on solar energy adoption',
      isOnline: false,
      mutualConnections: 7
    },
    {
      id: '6',
      name: 'Kofi Mensah',
      title: 'Digital Health Innovator',
      company: 'mPharma',
      location: 'Accra, Ghana',
      origin: 'Accra, Ghana',
      avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
      followers: 1850,
      connections: 420,
      skills: ['Healthcare Technology', 'Digital Health', 'Operations'],
      bio: 'Revolutionizing healthcare access across Africa through technology and innovative supply chain solutions.',
      connectionStatus: 'connected',
      recentActivity: 'Expanded operations to 3 new countries',
      isOnline: true,
      mutualConnections: 5
    }
  ];

  const getConnectionButton = (status: string | null, professionalName: string) => {
    switch (status) {
      case 'connected':
        return (
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            Message
          </Button>
        );
      case 'pending':
        return (
          <Button variant="outline" size="sm" disabled>
            Request Sent
          </Button>
        );
      default:
        return (
          <Button size="sm" className="bg-dna-emerald hover:bg-dna-forest text-white flex items-center gap-1">
            <UserPlus className="w-4 h-4" />
            Connect
          </Button>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Showing {professionals.length} professionals {searchTerm && `matching "${searchTerm}"`}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Recent Activity</Button>
          <Button variant="outline" size="sm">Mutual Connections</Button>
          <Button variant="outline" size="sm">Location</Button>
        </div>
      </div>

      <div className="grid gap-6">
        {professionals.map((professional) => (
          <Card key={professional.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={professional.avatar} alt={professional.name} />
                    <AvatarFallback className="bg-gradient-to-br from-dna-copper to-dna-emerald text-white">
                      {professional.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {professional.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg mb-1">{professional.name}</CardTitle>
                      <p className="text-dna-copper font-medium">{professional.title}</p>
                      <p className="text-gray-600 text-sm">{professional.company}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getConnectionButton(professional.connectionStatus, professional.name)}
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{professional.location}</span>
                    </div>
                    <span>•</span>
                    <span>Originally from {professional.origin}</span>
                    {professional.mutualConnections > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-dna-emerald">{professional.mutualConnections} mutual connections</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-700">{professional.bio}</p>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Key Skills</div>
                <div className="flex flex-wrap gap-2">
                  {professional.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">Recent Activity:</div>
                <div className="text-sm font-medium">{professional.recentActivity}</div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex gap-6 text-sm text-gray-600">
                  <span>{professional.followers.toLocaleString()} followers</span>
                  <span>{professional.connections.toLocaleString()} connections</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    Endorse
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Share className="w-4 h-4" />
                    Share Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProfessionalsTab;
