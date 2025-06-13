
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CollaborationsPageHeader from '@/components/collaborations/CollaborationsPageHeader';
import CollaborationsQuickStats from '@/components/collaborations/CollaborationsQuickStats';
import CollaborationsPrototypeNotice from '@/components/collaborations/CollaborationsPrototypeNotice';
import CollaborationsCallToAction from '@/components/collaborations/CollaborationsCallToAction';
import CollaborationsDialogs from '@/components/collaborations/CollaborationsDialogs';
import ProjectCard from '@/components/collaborations/ProjectCard';
import FeedbackPanel from '@/components/FeedbackPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Rocket, 
  Users, 
  Globe, 
  Target,
  Heart,
  Lightbulb,
  Handshake,
  TrendingUp
} from 'lucide-react';

const Collaborate = () => {
  const [activeTab, setActiveTab] = React.useState('projects');
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = React.useState(false);
  const [isStartProjectDialogOpen, setIsStartProjectDialogOpen] = React.useState(false);
  const [isJoinProjectDialogOpen, setIsJoinProjectDialogOpen] = React.useState(false);

  // Mock data for demonstration
  const projects = [
    {
      id: '1',
      title: 'African EdTech Platform',
      description: 'Building an educational technology platform to improve access to quality education across Africa',
      phase: 'Prototyping',
      impact_area: 'Education',
      team_size: 8,
      skills_needed: ['React', 'Node.js', 'UI/UX Design', 'Education Expertise'],
      creator: {
        name: 'Amara Okafor',
        avatar: '/lovable-uploads/aaee598a-95b1-4777-a456-a833d148a286.png'
      }
    },
    {
      id: '2',
      title: 'Diaspora Investment Network',
      description: 'Connecting diaspora investors with high-potential startups in home countries',
      phase: 'MVP',
      impact_area: 'Economic Development',
      team_size: 12,
      skills_needed: ['Finance', 'Legal', 'Marketing', 'Software Development'],
      creator: {
        name: 'Kwame Asante',
        avatar: null
      }
    }
  ];

  const initiatives = [
    {
      id: '1',
      title: 'Youth Mentorship Program',
      description: 'Connecting experienced diaspora professionals with young people in Africa',
      participants: 45,
      impact: 'Mentored 200+ youth',
      category: 'Education'
    },
    {
      id: '2',
      title: 'Healthcare Innovation Lab',
      description: 'Developing affordable healthcare solutions for underserved communities',
      participants: 23,
      impact: '3 solutions in pilot',
      category: 'Health'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <CollaborationsPageHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CollaborationsPrototypeNotice />
        
        <CollaborationsQuickStats />

        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-dna-forest mb-4">
            Transform Ideas into Impact
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Join forces with diaspora professionals to create meaningful change. 
            From early-stage ideas to scaling solutions, find your collaboration space.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              onClick={() => setIsStartProjectDialogOpen(true)}
              className="bg-dna-copper hover:bg-dna-gold text-white"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Start a Project
            </Button>
            <Button 
              variant="outline"
              onClick={() => setIsJoinProjectDialogOpen(true)}
              className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              Join a Project
            </Button>
          </div>
        </div>

        {/* Collaboration Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-dna-copper/20 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-dna-copper rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-dna-forest">Innovation Projects</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Develop cutting-edge solutions to address African challenges using technology and innovation.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline">Tech Solutions</Badge>
                <Badge variant="outline">Social Innovation</Badge>
                <Badge variant="outline">Green Tech</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dna-emerald/20 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-dna-emerald rounded-full flex items-center justify-center mx-auto mb-4">
                <Handshake className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-dna-forest">Community Initiatives</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Organize community-driven programs that strengthen diaspora connections and support.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline">Mentorship</Badge>
                <Badge variant="outline">Cultural Events</Badge>
                <Badge variant="outline">Networking</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dna-gold/20 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-dna-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-dna-forest">Investment Ventures</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Pool resources and expertise to fund and scale impactful business ventures.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline">Startups</Badge>
                <Badge variant="outline">Real Estate</Badge>
                <Badge variant="outline">Agriculture</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Collaborations */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects">Active Projects ({projects.length})</TabsTrigger>
            <TabsTrigger value="initiatives">Community Initiatives ({initiatives.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onJoin={() => setIsJoinProjectDialogOpen(true)}
                />
              ))}
            </div>
            {projects.length === 0 && (
              <div className="text-center py-12">
                <Rocket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Projects Yet</h3>
                <p className="text-gray-500 mb-4">Be the first to start a collaboration project!</p>
                <Button 
                  onClick={() => setIsStartProjectDialogOpen(true)}
                  className="bg-dna-copper hover:bg-dna-gold text-white"
                >
                  Start the First Project
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="initiatives" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {initiatives.map((initiative) => (
                <Card key={initiative.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-dna-forest mb-2">{initiative.title}</CardTitle>
                        <Badge className="bg-dna-mint text-dna-forest">{initiative.category}</Badge>
                      </div>
                      <Heart className="w-5 h-5 text-dna-coral" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{initiative.description}</p>
                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                      <span><Users className="w-4 h-4 inline mr-1" />{initiative.participants} participants</span>
                      <span><Target className="w-4 h-4 inline mr-1" />{initiative.impact}</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      Join Initiative
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <CollaborationsCallToAction onFeedbackClick={() => setIsFeedbackPanelOpen(true)} />
      </div>

      <CollaborationsDialogs
        isStartProjectDialogOpen={isStartProjectDialogOpen}
        setIsStartProjectDialogOpen={setIsStartProjectDialogOpen}
        isJoinProjectDialogOpen={isJoinProjectDialogOpen}
        setIsJoinProjectDialogOpen={setIsJoinProjectDialogOpen}
      />

      <FeedbackPanel 
        isOpen={isFeedbackPanelOpen}
        onClose={() => setIsFeedbackPanelOpen(false)}
        pageType="collaborate"
      />

      <Footer />
    </div>
  );
};

export default Collaborate;
