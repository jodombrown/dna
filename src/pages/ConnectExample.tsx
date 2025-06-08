import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '@/hooks/useSearch';
import { useConnections } from '@/hooks/useConnections';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Info, Users, Calendar, UserPlus } from 'lucide-react';
import ConnectHeader from '@/components/connect/ConnectHeader';
import SearchSection from '@/components/connect/SearchSection';
import ProfessionalCard from '@/components/connect/ProfessionalCard';
import CommunityCard from '@/components/connect/CommunityCard';
import EventCard from '@/components/connect/EventCard';
import EmptyState from '@/components/connect/EmptyState';
import FeedbackPanel from '@/components/FeedbackPanel';
import Footer from '@/components/Footer';

const ConnectExample = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { professionals, communities, events, loading, searchProfessionals, searchCommunities, searchEvents, getAllData } = useSearch();
  const { sendConnectionRequest, checkConnectionStatus } = useConnections();
  const { sendMessage } = useMessages();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('professionals');
  const [initializing, setInitializing] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);
  
  // Dialog states
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isJoinCommunityDialogOpen, setIsJoinCommunityDialogOpen] = useState(false);
  const [isRegisterEventDialogOpen, setIsRegisterEventDialogOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    initializeData();
  }, []);

  const initializeData = async () => {
    console.log('Loading network data...');
    setInitializing(true);
    setDataError(null);
    
    try {
      await getAllData();
      console.log('Data loaded successfully:', { 
        professionals: professionals.length, 
        communities: communities.length, 
        events: events.length 
      });
    } catch (error) {
      console.error('Error loading data:', error);
      setDataError('Failed to load network data. Please refresh the page.');
      toast.error('Failed to load network data. Please refresh the page.');
    } finally {
      setInitializing(false);
    }
  };

  const handleSearch = async () => {
    if (activeTab === 'professionals') {
      await searchProfessionals(searchTerm);
    } else if (activeTab === 'communities') {
      await searchCommunities(searchTerm);
    } else if (activeTab === 'events') {
      await searchEvents(searchTerm);
    }
  };

  const handleConnect = (professionalId: string) => {
    console.log('Connect button clicked for professional:', professionalId);
    if (!user) {
      console.log('User not logged in, showing connect dialog');
      setIsConnectDialogOpen(true);
      return;
    }

    try {
      sendConnectionRequest(professionalId, 'I would like to connect with you!');
      toast.success('Connection request sent successfully!');
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to send connection request');
    }
  };

  const handleMessage = (recipientId: string, recipientName: string) => {
    console.log('Message button clicked for professional:', recipientId, recipientName);
    if (!user) {
      console.log('User not logged in, showing message dialog');
      setIsMessageDialogOpen(true);
      return;
    }

    try {
      sendMessage(recipientId, `Hi ${recipientName}, I'd like to connect and learn more about your work!`);
      toast.success('Message sent successfully!');
    } catch (error) {
      console.error('Message error:', error);
      toast.error('Failed to send message');
    }
  };

  const handleJoinCommunity = () => {
    console.log('Join community button clicked');
    if (!user) {
      setIsJoinCommunityDialogOpen(true);
      return;
    }
    toast.success('Community join request sent!');
  };

  const handleRegisterEvent = () => {
    console.log('Register event button clicked');
    if (!user) {
      setIsRegisterEventDialogOpen(true);
      return;
    }
    toast.success('Event registration successful!');
  };

  const getConnectionStatus = (professionalId: string) => {
    if (!user) return null;
    return checkConnectionStatus(professionalId);
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Loading Professional Network...</div>
          <div className="text-gray-600">Connecting you with the diaspora community</div>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-xl font-semibold mb-2 text-red-600">Failed to Load Network</div>
          <div className="text-gray-600 mb-4">{dataError}</div>
          <button 
            onClick={initializeData}
            className="bg-dna-emerald hover:bg-dna-forest text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalCount = professionals.length + communities.length + events.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <ConnectHeader totalCount={totalCount} />

      {/* Prototype Stage Notice */}
      <div className="bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-dna-emerald mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Platform Preview - Prototype Stage</h3>
              <p className="text-sm text-gray-700">
                Welcome to a preview of our Connect experience! What you see below represents our vision for how diaspora professionals will discover and network with each other once the DNA platform is fully built. This prototype demonstrates the seamless connection capabilities we're developing to unite the African diaspora globally.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <SearchSection
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          loading={loading}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="professionals">Professionals ({professionals.length})</TabsTrigger>
            <TabsTrigger value="communities">Communities ({communities.length})</TabsTrigger>
            <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="professionals">
            {professionals.length === 0 ? (
              <EmptyState type="professionals" onRefresh={initializeData} />
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {professionals.map((professional) => (
                  <ProfessionalCard
                    key={professional.id}
                    professional={professional}
                    onConnect={() => handleConnect(professional.id)}
                    onMessage={() => handleMessage(professional.id, professional.full_name)}
                    connectionStatus={getConnectionStatus(professional.id)}
                    isLoggedIn={!!user}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="communities">
            {communities.length === 0 ? (
              <EmptyState type="communities" onRefresh={initializeData} />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.map((community) => (
                  <CommunityCard 
                    key={community.id} 
                    community={community} 
                    onJoin={handleJoinCommunity}
                    isLoggedIn={!!user}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="events">
            {events.length === 0 ? (
              <EmptyState type="events" onRefresh={initializeData} />
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {events.map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onRegister={handleRegisterEvent}
                    isLoggedIn={!!user}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {loading && (
          <div className="text-center py-12">
            <div className="text-lg">Loading...</div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-8 bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10 rounded-2xl p-6 sm:p-8 text-center">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Have an Idea for Better Connections?
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Help us build the ultimate networking experience for the African diaspora.
          </p>
          <Button 
            onClick={() => setIsFeedbackPanelOpen(true)}
            className="bg-dna-emerald hover:bg-dna-forest text-white"
          >
            <Users className="w-4 h-4 mr-2" />
            Share Your Connection Ideas
          </Button>
        </div>
      </main>

      <Footer />
      
      {/* Connect Dialog */}
      <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-dna-emerald" />
              How Professional Connections Work
            </DialogTitle>
            <DialogDescription className="text-left space-y-4 pt-4">
              <p>
                In our fully built platform, the Connect feature will enable you to:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Send personalized connection requests with custom messages</li>
                <li>Build your professional network across the African diaspora</li>
                <li>Access detailed professional profiles and expertise areas</li>
                <li>Receive intelligent matching suggestions based on your interests</li>
                <li>Join professional groups and industry-specific communities</li>
                <li>Participate in networking events and virtual meetups</li>
              </ul>
              <p className="text-sm text-gray-600 bg-dna-emerald/10 p-3 rounded">
                Right now, you would need to create an account to access these networking features. We're building this to be the premier professional network for the African diaspora.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/auth')} className="flex-1 bg-dna-emerald hover:bg-dna-forest text-white">
              Create Account
            </Button>
            <Button variant="outline" onClick={() => setIsConnectDialogOpen(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-dna-copper" />
              How Messaging Works
            </DialogTitle>
            <DialogDescription className="text-left space-y-4 pt-4">
              <p>
                Our messaging system will provide secure, professional communication:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Direct messaging with diaspora professionals worldwide</li>
                <li>Group messaging for project collaborations</li>
                <li>File sharing and document collaboration tools</li>
                <li>Video call integration for face-to-face conversations</li>
                <li>Translation services for cross-language communication</li>
                <li>Professional networking etiquette guidelines</li>
              </ul>
              <p className="text-sm text-gray-600 bg-dna-copper/10 p-3 rounded">
                To use messaging features, you'll need to be a registered member of our platform.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/auth')} className="flex-1 bg-dna-copper hover:bg-dna-gold text-white">
              Join Platform
            </Button>
            <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Community Dialog */}
      <Dialog open={isJoinCommunityDialogOpen} onOpenChange={setIsJoinCommunityDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-dna-emerald" />
              How Community Joining Works
            </DialogTitle>
            <DialogDescription className="text-left space-y-4 pt-4">
              <p>
                Our community platform will offer rich, engaging experiences:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Join interest-based and professional communities</li>
                <li>Participate in community discussions and forums</li>
                <li>Access exclusive community resources and tools</li>
                <li>Connect with like-minded diaspora members</li>
                <li>Organize and attend community events</li>
                <li>Share knowledge and collaborate on projects</li>
              </ul>
              <p className="text-sm text-gray-600 bg-dna-emerald/10 p-3 rounded">
                Community membership requires platform registration to ensure quality interactions and member safety.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/auth')} className="flex-1 bg-dna-emerald hover:bg-dna-forest text-white">
              Join Platform
            </Button>
            <Button variant="outline" onClick={() => setIsJoinCommunityDialogOpen(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Register Event Dialog */}
      <Dialog open={isRegisterEventDialogOpen} onOpenChange={setIsRegisterEventDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-dna-copper" />
              How Event Registration Works
            </DialogTitle>
            <DialogDescription className="text-left space-y-4 pt-4">
              <p>
                Our event system will provide comprehensive networking opportunities:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Register for professional development workshops</li>
                <li>Attend virtual and in-person networking events</li>
                <li>Participate in cultural celebrations and meetups</li>
                <li>Access industry-specific conferences and panels</li>
                <li>Connect with event attendees before and after</li>
                <li>Receive event recordings and follow-up resources</li>
              </ul>
              <p className="text-sm text-gray-600 bg-dna-copper/10 p-3 rounded">
                Event registration requires an account to manage your attendance and provide personalized recommendations.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/auth')} className="flex-1 bg-dna-copper hover:bg-dna-gold text-white">
              Create Account
            </Button>
            <Button variant="outline" onClick={() => setIsRegisterEventDialogOpen(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <FeedbackPanel 
        isOpen={isFeedbackPanelOpen}
        onClose={() => setIsFeedbackPanelOpen(false)}
        pageType="connect"
      />
    </div>
  );
};

export default ConnectExample;
