
import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Building, ExternalLink } from 'lucide-react';

const Opportunities = () => {
  const opportunities = [
    {
      id: 1,
      title: "Software Engineer - Fintech Startup",
      company: "AfriTech Solutions",
      location: "Lagos, Nigeria (Remote)",
      type: "Full-time",
      description: "Join a growing fintech startup building payment solutions for Africa. Looking for experienced React/Node.js developers.",
      postedDate: "2 days ago",
      tags: ["React", "Node.js", "Fintech", "Remote"]
    },
    {
      id: 2,
      title: "Investment Opportunity - Renewable Energy",
      company: "Green Africa Fund",
      location: "Accra, Ghana",
      type: "Investment",
      description: "Seeking diaspora investors for solar energy projects across West Africa. Minimum investment $10,000.",
      postedDate: "1 week ago",
      tags: ["Investment", "Renewable Energy", "Impact"]
    },
    {
      id: 3,
      title: "Marketing Director - E-commerce",
      company: "Marketplace Africa",
      location: "Nairobi, Kenya",
      type: "Full-time",
      description: "Lead marketing strategy for Africa's fastest-growing e-commerce platform. Experience in digital marketing required.",
      postedDate: "3 days ago",
      tags: ["Marketing", "E-commerce", "Strategy"]
    },
    {
      id: 4,
      title: "Mentorship Program - Young Entrepreneurs",
      company: "Africa Rising Foundation",
      location: "Multiple locations",
      type: "Volunteer",
      description: "Share your expertise with the next generation of African entrepreneurs. Flexible time commitment.",
      postedDate: "5 days ago",
      tags: ["Mentorship", "Volunteer", "Entrepreneurship"]
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Full-time': return 'bg-dna-copper text-white';
      case 'Investment': return 'bg-dna-gold text-white';
      case 'Volunteer': return 'bg-dna-emerald text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dna-forest mb-2">
            Opportunities
          </h1>
          <p className="text-gray-600">
            Discover career, investment, and volunteer opportunities across Africa
          </p>
        </div>

        <div className="grid gap-6">
          {opportunities.map((opportunity) => (
            <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-dna-forest mb-2">
                      {opportunity.title}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-4 text-base">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-1" />
                        {opportunity.company}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {opportunity.location}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {opportunity.postedDate}
                      </div>
                    </CardDescription>
                  </div>
                  <Badge className={getTypeColor(opportunity.type)}>
                    {opportunity.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{opportunity.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {opportunity.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-dna-forest border-dna-forest">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button className="bg-dna-copper hover:bg-dna-gold text-white">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Opportunities;
