
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CollaborationsPageHeader from '@/components/collaborations/CollaborationsPageHeader';
import ProjectCard from '@/components/collaborations/ProjectCard';
import CollaborationsCallToAction from '@/components/collaborations/CollaborationsCallToAction';
import FeedbackPanel from '@/components/FeedbackPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Collaborate = () => {
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration - in real implementation this would come from API
  const mockProjects = [
    {
      id: 1,
      title: "AgriTech Solutions for East Africa",
      description: "Developing sustainable farming technologies for small-scale farmers across Kenya, Uganda, and Tanzania.",
      collaborators: 12,
      countries: 3,
      totalFunding: 2500000,
      currentFunding: 1800000,
      progress: 72,
      stage: "Development",
      nextMeeting: "Jan 20, 2025",
      recentUpdate: "Successfully completed pilot testing in 5 communities",
      tags: ["Agriculture", "Technology", "Sustainability", "East Africa"]
    },
    {
      id: 2,
      title: "Digital Education Platform",
      description: "Creating accessible online learning resources for African youth in STEM fields.",
      collaborators: 8,
      countries: 5,
      totalFunding: 1200000,
      currentFunding: 900000,
      progress: 75,
      stage: "Beta Testing",
      nextMeeting: "Jan 22, 2025",
      recentUpdate: "Launched beta version with 1000+ student testers",
      tags: ["Education", "Digital", "STEM", "Youth Development"]
    },
    {
      id: 3,
      title: "Clean Water Initiative",
      description: "Installing solar-powered water purification systems in rural communities.",
      collaborators: 15,
      countries: 4,
      totalFunding: 3000000,
      currentFunding: 1500000,
      progress: 50,
      stage: "Fundraising",
      nextMeeting: "Jan 25, 2025",
      recentUpdate: "Secured partnership with local government agencies",
      tags: ["Water", "Clean Energy", "Health", "Infrastructure"]
    }
  ];

  const handleDiscussion = () => {
    console.log('Opening project discussion');
    // In real implementation, this would navigate to discussion board
  };

  const handleDocuments = () => {
    console.log('Opening project documents');
    // In real implementation, this would open document repository
  };

  const handleMeeting = () => {
    console.log('Joining meeting room');
    // In real implementation, this would open video conferencing
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <CollaborationsPageHeader activeProjectsCount={mockProjects.length} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Notice */}
        <div className="mb-6 p-4 bg-dna-copper/10 border border-dna-copper/20 rounded-lg">
          <h2 className="text-lg font-semibold text-dna-forest mb-2">
            🔧 Admin Access - Main Collaborate Platform
          </h2>
          <p className="text-sm text-gray-700">
            This is the main Collaborate page with full project management functionality. 
            Admin features are enabled for project creation and management.
          </p>
        </div>

        {/* Search and Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search projects, skills, or collaborators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-dna-copper hover:bg-dna-gold text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Project Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            <div className="space-y-6">
              {mockProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDiscussionClick={handleDiscussion}
                  onDocumentsClick={handleDocuments}
                  onMeetingClick={handleMeeting}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No pending collaborations at the moment.</p>
                <Button className="mt-4 bg-dna-copper hover:bg-dna-gold text-white">
                  Browse Available Projects
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">Completed projects will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-projects" className="mt-6">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">Your created projects will appear here.</p>
                <Button className="mt-4 bg-dna-copper hover:bg-dna-gold text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <CollaborationsCallToAction onFeedbackClick={() => setIsFeedbackPanelOpen(true)} />
      </div>

      <FeedbackPanel 
        isOpen={isFeedbackPanelOpen}
        onClose={() => setIsFeedbackPanelOpen(false)}
        type="collaborate"
      />

      <Footer />
    </div>
  );
};

export default Collaborate;
