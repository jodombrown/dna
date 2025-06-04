
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Users, 
  DollarSign, 
  Calendar, 
  Target, 
  MapPin, 
  Building, 
  TrendingUp,
  FileText,
  Video,
  MessageSquare
} from 'lucide-react';
import Header from '@/components/Header';

const InnovationPathwayDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - in real app this would come from API based on id
  const project = {
    id: 1,
    title: "AgriTech Revolution: Smart Farming Solutions",
    description: "Developing IoT-enabled farming solutions to increase crop yields by 40% across rural Kenya and Nigeria",
    category: "Agriculture Technology",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop",
    fundingGoal: 250000,
    currentFunding: 185000,
    backers: 156,
    daysLeft: 23,
    stage: "Go-to-Market",
    impactMetrics: "50,000 farmers impacted",
    location: "Kenya, Nigeria",
    founder: "Dr. Amara Okafor",
    founded: "2023",
    tags: ["Technology", "Agriculture", "Sustainability"],
    detailedDescription: `
      Our AgriTech Revolution project is transforming subsistence farming across East and West Africa through innovative IoT solutions. 
      We've developed a comprehensive smart farming ecosystem that includes soil sensors, weather monitoring, automated irrigation systems, 
      and a mobile app that provides real-time insights to farmers.
      
      The platform uses machine learning to analyze soil conditions, weather patterns, and crop health to provide personalized 
      recommendations that can increase yields by up to 40% while reducing water usage by 30%.
    `,
    impact: {
      farmers: 50000,
      countries: 2,
      yieldIncrease: 40,
      waterSaving: 30
    },
    timeline: [
      { phase: "Research & Development", status: "completed", date: "Q1 2023" },
      { phase: "Pilot Testing", status: "completed", date: "Q2 2023" },
      { phase: "Market Validation", status: "completed", date: "Q3 2023" },
      { phase: "Scale Production", status: "current", date: "Q4 2023" },
      { phase: "Regional Expansion", status: "upcoming", date: "Q1 2024" }
    ]
  };

  const calculateFundingPercentage = () => {
    return Math.round((project.currentFunding / project.fundingGoal) * 100);
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Innovation Pathways
        </Button>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
            
            <div className="mb-4">
              <Badge className="bg-dna-emerald text-white mb-2">
                {project.category}
              </Badge>
              <Badge variant="outline" className="ml-2">
                {project.stage}
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {project.title}
            </h1>
            
            <p className="text-lg text-gray-600 mb-6">
              {project.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Funding Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Funding Progress</span>
                    <span className="text-sm font-bold text-dna-emerald">
                      {calculateFundingPercentage()}%
                    </span>
                  </div>
                  <Progress value={calculateFundingPercentage()} className="h-3 mb-3" />
                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <span>{formatCurrency(project.currentFunding)} raised</span>
                    <span>{formatCurrency(project.fundingGoal)} goal</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-lg font-bold text-gray-900">{project.backers}</span>
                    </div>
                    <span className="text-xs text-gray-500">Supporters</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-lg font-bold text-gray-900">{project.daysLeft}</span>
                    </div>
                    <span className="text-xs text-gray-500">Days Left</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button className="w-full bg-dna-copper hover:bg-dna-gold text-white">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Support This Project
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Founder
                  </Button>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Building className="w-4 h-4 mr-2" />
                      <span>Founded: {project.founded}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{project.location}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {project.detailedDescription}
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• IoT soil and weather sensors</li>
                      <li>• AI-powered crop recommendations</li>
                      <li>• Mobile app for farmers</li>
                      <li>• Automated irrigation systems</li>
                      <li>• Real-time monitoring dashboard</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Technology Stack</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• IoT sensors and hardware</li>
                      <li>• Machine learning algorithms</li>
                      <li>• Mobile application (iOS/Android)</li>
                      <li>• Cloud infrastructure</li>
                      <li>• Data analytics platform</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="impact">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-dna-emerald" />
                  Impact Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-dna-copper mb-2">
                      {project.impact.farmers.toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-600">Farmers Reached</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-dna-emerald mb-2">
                      {project.impact.countries}
                    </div>
                    <p className="text-sm text-gray-600">Countries</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-dna-gold mb-2">
                      {project.impact.yieldIncrease}%
                    </div>
                    <p className="text-sm text-gray-600">Yield Increase</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-dna-mint mb-2">
                      {project.impact.waterSaving}%
                    </div>
                    <p className="text-sm text-gray-600">Water Savings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {project.timeline.map((phase, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className={`w-4 h-4 rounded-full mt-1 ${
                        phase.status === 'completed' ? 'bg-dna-emerald' :
                        phase.status === 'current' ? 'bg-dna-copper' :
                        'bg-gray-300'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{phase.phase}</h4>
                          <span className="text-sm text-gray-500">{phase.date}</span>
                        </div>
                        <Badge 
                          variant={phase.status === 'completed' ? 'default' : 'secondary'}
                          className={`mt-1 ${
                            phase.status === 'completed' ? 'bg-dna-emerald' :
                            phase.status === 'current' ? 'bg-dna-copper' :
                            'bg-gray-400'
                          }`}
                        >
                          {phase.status.charAt(0).toUpperCase() + phase.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="updates">
            <Card>
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-l-4 border-dna-emerald pl-4">
                  <h4 className="font-semibold text-gray-900">Major Milestone: 10,000 Farmers Onboarded</h4>
                  <p className="text-sm text-gray-500 mb-2">3 days ago</p>
                  <p className="text-gray-700">
                    We've successfully onboarded our 10,000th farmer in Kenya, exceeding our Q4 target ahead of schedule.
                  </p>
                </div>
                <div className="border-l-4 border-dna-copper pl-4">
                  <h4 className="font-semibold text-gray-900">New Partnership with Local Cooperatives</h4>
                  <p className="text-sm text-gray-500 mb-2">1 week ago</p>
                  <p className="text-gray-700">
                    Signed agreements with 15 farmer cooperatives to expand our reach in rural Nigeria.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InnovationPathwayDetail;
