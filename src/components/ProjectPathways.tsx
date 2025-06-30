import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, DollarSign, Calendar, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProjectPathways = () => {
  const navigate = useNavigate();

  const projects = [
    {
      id: 1,
      title: "AgriTech Revolution: Smart Farming Solutions",
      description: "Developing IoT-enabled farming solutions to increase crop yields by 40% across rural Kenya and Nigeria",
      category: "Agriculture Technology",
      image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=250&fit=crop",
      fundingGoal: 250000,
      currentFunding: 185000,
      backers: 156,
      daysLeft: 23,
      stage: "active",
      impactMetrics: "50,000 farmers impacted",
      featured: true,
      tags: ["Technology", "Agriculture", "Sustainability"]
    },
    {
      id: 2,
      title: "FinTech for Financial Inclusion",
      description: "Mobile banking platform providing microfinance and digital payments to unbanked populations",
      category: "Financial Technology",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop",
      fundingGoal: 500000,
      currentFunding: 320000,
      backers: 243,
      daysLeft: 45,
      stage: "testing",
      impactMetrics: "200,000 accounts opened",
      featured: true,
      tags: ["FinTech", "Inclusion", "Mobile"]
    },
    {
      id: 3,
      title: "Renewable Energy Grid Expansion",
      description: "Solar energy infrastructure development across West African communities",
      category: "Clean Energy",
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=250&fit=crop",
      fundingGoal: 1000000,
      currentFunding: 750000,
      backers: 89,
      daysLeft: 67,
      stage: "approved",
      impactMetrics: "25 communities powered",
      featured: false,
      tags: ["Energy", "Infrastructure", "Environment"]
    },
    {
      id: 4,
      title: "EdTech Learning Platform",
      description: "AI-powered educational platform delivering quality education to remote African schools",
      category: "Education Technology",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop",
      fundingGoal: 150000,
      currentFunding: 95000,
      backers: 178,
      daysLeft: 12,
      stage: "planning",
      impactMetrics: "5,000 students enrolled",
      featured: false,
      tags: ["Education", "AI", "Technology"]
    },
    {
      id: 5,
      title: "Healthcare Innovation Hub",
      description: "Telemedicine platform connecting rural patients with diaspora medical professionals",
      category: "Healthcare Technology",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop",
      fundingGoal: 300000,
      currentFunding: 165000,
      backers: 134,
      daysLeft: 38,
      stage: "discovery",
      impactMetrics: "10,000 consultations completed",
      featured: true,
      tags: ["Healthcare", "Telemedicine", "Access"]
    },
    {
      id: 6,
      title: "Supply Chain Transparency Network",
      description: "Blockchain-based platform ensuring fair trade and transparency in African exports",
      category: "Supply Chain Innovation",
      image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=250&fit=crop",
      fundingGoal: 400000,
      currentFunding: 120000,
      backers: 67,
      daysLeft: 56,
      stage: "idea",
      impactMetrics: "100 suppliers onboarded",
      featured: false,
      tags: ["Blockchain", "Trade", "Transparency"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idea':
        return 'bg-gray-100 text-gray-700';
      case 'discovery':
        return 'bg-blue-100 text-blue-700';
      case 'scoping':
        return 'bg-purple-100 text-purple-700';
      case 'planning':
        return 'bg-yellow-100 text-yellow-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'active':
        return 'bg-dna-copper/20 text-dna-copper';
      case 'testing':
        return 'bg-orange-100 text-orange-700';
      case 'complete':
        return 'bg-emerald-100 text-emerald-700';
      case 'maintenance':
        return 'bg-indigo-100 text-indigo-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusDisplayName = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const calculateFundingPercentage = (current: number, goal: number) => {
    return Math.round((current / goal) * 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section id="pathways" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Innovation <span className="text-dna-copper">Pathways</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover, connect, and contribute to transformative projects driving African innovation and development
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {projects.map((project) => (
            <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {project.featured && (
                  <Badge className="absolute top-3 left-3 bg-dna-copper text-white">
                    Featured
                  </Badge>
                )}
                <Badge 
                  variant="secondary" 
                  className={`absolute top-3 right-3 ${getStatusColor(project.stage)}`}
                >
                  {getStatusDisplayName(project.stage)}
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <div className="mb-3">
                  <Badge variant="outline" className="text-xs text-dna-emerald border-dna-emerald">
                    {project.category}
                  </Badge>
                </div>
                
                <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-dna-copper transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {project.description}
                </p>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Funding Progress</span>
                    <span className="text-sm font-bold text-dna-emerald">
                      {calculateFundingPercentage(project.currentFunding, project.fundingGoal)}%
                    </span>
                  </div>
                  <Progress 
                    value={calculateFundingPercentage(project.currentFunding, project.fundingGoal)} 
                    className="h-2 mb-2"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatCurrency(project.currentFunding)} raised</span>
                    <span>{formatCurrency(project.fundingGoal)} goal</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div>
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm font-bold text-gray-900">{project.backers}</span>
                    </div>
                    <span className="text-xs text-gray-500">Contributors</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-1">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm font-bold text-gray-900">{project.daysLeft}</span>
                    </div>
                    <span className="text-xs text-gray-500">Days Left</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-1">
                      <Target className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-xs font-bold text-dna-emerald">Impact</span>
                    </div>
                    <span className="text-xs text-gray-500">{project.impactMetrics}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-dna-copper hover:bg-dna-gold text-white"
                    size="sm"
                    onClick={() => navigate(`/innovation/${project.id}`)}
                  >
                    <DollarSign className="w-4 h-4 mr-1" />
                    Contribute
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
                    onClick={() => navigate(`/innovation/${project.id}`)}
                  >
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            variant="outline" 
            className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
          >
            Explore All Innovation Pathways
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProjectPathways;
