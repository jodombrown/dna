
import React from 'react';
import UnifiedHeader from '@/components/UnifiedHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Calendar, Star } from 'lucide-react';

const InnovationPathways = () => {
  const navigate = useNavigate();

  const pathways = [
    {
      id: 1,
      title: "Tech Entrepreneur Accelerator",
      description: "12-week intensive program for tech startups focused on African markets",
      duration: "12 weeks",
      participants: "50+ entrepreneurs",
      rating: 4.8,
      status: "Applications Open",
      tags: ["Technology", "Startups", "Accelerator"],
      highlights: [
        "Seed funding up to $50,000",
        "Mentorship from industry leaders",
        "Market access across 15 African countries"
      ]
    },
    {
      id: 2,
      title: "Sustainable Agriculture Innovation",
      description: "Program for agricultural innovations addressing food security in Africa",
      duration: "16 weeks",
      participants: "30+ innovators",
      rating: 4.9,
      status: "Starting Soon",
      tags: ["Agriculture", "Sustainability", "Innovation"],
      highlights: [
        "Access to research facilities",
        "Partnership with major agri-corps",
        "Field testing opportunities"
      ]
    },
    {
      id: 3,
      title: "FinTech for Financial Inclusion",
      description: "Building financial solutions for the unbanked population in Africa",
      duration: "10 weeks",
      participants: "40+ developers",
      rating: 4.7,
      status: "In Progress",
      tags: ["FinTech", "Financial Inclusion", "Mobile"],
      highlights: [
        "Regulatory guidance included",
        "Banking partnerships available",
        "Real user testing with 10,000+ users"
      ]
    },
    {
      id: 4,
      title: "Healthcare Innovation Lab",
      description: "Developing healthcare solutions for rural and underserved communities",
      duration: "14 weeks",
      participants: "25+ health innovators",
      rating: 4.6,
      status: "Applications Open",
      tags: ["Healthcare", "Rural Development", "Innovation"],
      highlights: [
        "Clinical trial support",
        "WHO partnership program",
        "Deployment in 5+ countries"
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applications Open': return 'bg-dna-emerald text-white';
      case 'Starting Soon': return 'bg-dna-gold text-white';
      case 'In Progress': return 'bg-dna-copper text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dna-forest mb-2">
            Innovation Pathways
          </h1>
          <p className="text-gray-600">
            Join structured programs to turn your ideas into impactful solutions for Africa
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {pathways.map((pathway) => (
            <Card key={pathway.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl text-dna-forest">
                    {pathway.title}
                  </CardTitle>
                  <Badge className={getStatusColor(pathway.status)}>
                    {pathway.status}
                  </Badge>
                </div>
                <CardDescription className="text-base">
                  {pathway.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {pathway.duration}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {pathway.participants}
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    {pathway.rating}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {pathway.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-dna-forest border-dna-forest">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold text-dna-forest mb-2">Program Highlights:</h4>
                  <ul className="space-y-1">
                    {pathway.highlights.map((highlight, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-1.5 h-1.5 bg-dna-copper rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  onClick={() => navigate(`/innovation/${pathway.id}`)}
                  className="w-full bg-dna-copper hover:bg-dna-gold text-white"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InnovationPathways;
