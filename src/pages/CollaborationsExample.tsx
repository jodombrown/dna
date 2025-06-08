
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, DollarSign, Target, MessageSquare, FileText, Video, Info } from 'lucide-react';
import FeedbackPanel from '@/components/FeedbackPanel';
import Footer from '@/components/Footer';

const CollaborationsExample = () => {
  const navigate = useNavigate();
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const activeProjects = [
    {
      id: 1,
      title: "Solar Education Initiative",
      description: "Bringing renewable energy education to rural schools across Kenya and Nigeria",
      collaborators: 12,
      countries: 6,
      totalFunding: 2300000,
      currentFunding: 1850000,
      progress: 80,
      stage: "Implementation",
      nextMeeting: "2024-02-15",
      recentUpdate: "Solar panels installed in 15 schools this month",
      tags: ["Education", "Renewable Energy", "Infrastructure"]
    },
    {
      id: 2,
      title: "HealthTech Platform",
      description: "Telemedicine platform connecting diaspora doctors with rural patients",
      collaborators: 8,
      countries: 4,
      totalFunding: 1800000,
      currentFunding: 950000,
      progress: 53,
      stage: "Development",
      nextMeeting: "2024-02-20",
      recentUpdate: "MVP testing completed with 500+ patient consultations",
      tags: ["Healthcare", "Technology", "Telemedicine"]
    },
    {
      id: 3,
      title: "AgriTech Supply Chain",
      description: "Blockchain-based platform for transparent agricultural supply chain management",
      collaborators: 15,
      countries: 8,
      totalFunding: 3200000,
      currentFunding: 2100000,
      progress: 66,
      stage: "Scaling",
      nextMeeting: "2024-02-18",
      recentUpdate: "Onboarded 200+ farmers in Ghana and Nigeria",
      tags: ["Agriculture", "Blockchain", "Supply Chain"]
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
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Active Collaborations</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Manage your collaborative projects</p>
              </div>
            </div>
            <Badge className="bg-dna-copper text-white text-xs sm:text-sm">
              {activeProjects.length} Active
            </Badge>
          </div>
        </div>
      </header>

      {/* Prototype Stage Notice */}
      <div className="bg-gradient-to-r from-dna-copper/10 to-dna-emerald/10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-dna-copper mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Platform Preview - Prototype Stage</h3>
              <p className="text-sm text-gray-700">
                This is a preview of our Collaborate experience! The projects and collaboration tools shown below represent our vision for how diaspora professionals will work together on impactful initiatives across Africa. This prototype showcases the collaborative workspace we're building to facilitate meaningful partnerships and project development.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-xl sm:text-2xl font-bold text-dna-copper mb-1 sm:mb-2">35</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Collaborators</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-xl sm:text-2xl font-bold text-dna-emerald mb-1 sm:mb-2">18</div>
              <div className="text-xs sm:text-sm text-gray-600">Countries Involved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-xl sm:text-2xl font-bold text-dna-forest mb-1 sm:mb-2">$7.3M</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Funding</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-xl sm:text-2xl font-bold text-dna-gold mb-1 sm:mb-2">66%</div>
              <div className="text-xs sm:text-sm text-gray-600">Avg Progress</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Projects */}
        <div className="space-y-6">
          {activeProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-dna-copper/10 to-dna-emerald/10">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg sm:text-xl mb-2">{project.title}</CardTitle>
                    <p className="text-sm sm:text-base text-gray-600">{project.description}</p>
                  </div>
                  <Badge className="bg-dna-emerald text-white">
                    {project.stage}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6">
                <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{project.collaborators} collaborators • {project.countries} countries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Next meeting: {project.nextMeeting}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Funding Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>${(project.currentFunding / 1000000).toFixed(1)}M raised</span>
                      <span>${(project.totalFunding / 1000000).toFixed(1)}M goal</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Recent Update</div>
                    <p className="text-sm text-gray-600">{project.recentUpdate}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="bg-dna-copper hover:bg-dna-gold text-white">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Join Discussion
                  </Button>
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    View Documents
                  </Button>
                  <Button variant="outline">
                    <Video className="w-4 h-4 mr-2" />
                    Meeting Room
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
              Ready to Start Your Own Collaboration?
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Propose a new project and find collaborators who share your vision for Africa's future.
            </p>
            <Button 
              onClick={() => setIsFeedbackPanelOpen(true)}
              className="bg-dna-emerald hover:bg-dna-forest text-white"
            >
              <Target className="w-4 h-4 mr-2" />
              Propose New Project
            </Button>
          </CardContent>
        </Card>
      </main>

      <Footer />
      
      <FeedbackPanel 
        isOpen={isFeedbackPanelOpen}
        onClose={() => setIsFeedbackPanelOpen(false)}
        pageType="collaborate"
      />
    </div>
  );
};

export default CollaborationsExample;
