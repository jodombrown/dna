
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ProfessionalCard from './ProfessionalCard';
import CommunityCard from './CommunityCard';
import EmptyState from './EmptyState';
import EventDetailDialog from "./EventDetailDialog";
import { Professional, Community, Event } from '@/types/search';
import PopularEventsSection from './PopularEventsSection';
import EventCategoriesSection from './EventCategoriesSection';
import FeaturedCalendarsSection from './FeaturedCalendarsSection';
import LocalEventsSection from './LocalEventsSection';

interface ConnectTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  professionals: Professional[];
  communities: Community[];
  events: Event[];
  onConnect: (professionalId: string) => void;
  onMessage: (recipientId: string, recipientName: string) => void;
  onJoinCommunity: () => void;
  onRegisterEvent: () => void;
  getConnectionStatus: (professionalId: string) => any;
  isLoggedIn: boolean;
  onRefresh: () => void;
}

const ConnectTabs: React.FC<ConnectTabsProps> = ({
  activeTab,
  setActiveTab,
  professionals,
  communities,
  events,
  onConnect,
  onMessage,
  onJoinCommunity,
  onRegisterEvent,
  getConnectionStatus,
  isLoggedIn,
  onRefresh
}) => {
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const [selectedProfessional, setSelectedProfessional] = React.useState<Professional | null>(null);
  const [professionalDialogOpen, setProfessionalDialogOpen] = React.useState(false);
  const [demoExplanationOpen, setDemoExplanationOpen] = React.useState(false);

  const openEventDialog = (event: Event) => {
    setSelectedEvent(event);
    setDetailDialogOpen(true);
  };

  const openProfessionalDialog = (professionalId: string) => {
    const professional = professionals.find(p => p.id === professionalId);
    if (professional) {
      setSelectedProfessional(professional);
      setProfessionalDialogOpen(true);
    }
  };

  const handleViewAll = () => {
    setDemoExplanationOpen(true);
  };

  return (
    <>
      <div className="sticky top-20 z-10 bg-gray-50 pb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="professionals">Professionals ({professionals.length})</TabsTrigger>
            <TabsTrigger value="communities">Communities ({communities.length})</TabsTrigger>
            <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="professionals">
            {professionals.length === 0 ? (
              <EmptyState type="professionals" onRefresh={onRefresh} />
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {professionals.map((professional) => (
                  <ProfessionalCard
                    key={professional.id}
                    professional={professional}
                    onConnect={() => onConnect(professional.id)}
                    onMessage={() => onMessage(professional.id, professional.full_name)}
                    connectionStatus={getConnectionStatus(professional.id)}
                    isLoggedIn={isLoggedIn}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="communities">
            {communities.length === 0 ? (
              <EmptyState type="communities" onRefresh={onRefresh} />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.map((community) => (
                  <CommunityCard 
                    key={community.id} 
                    community={community} 
                    onJoin={onJoinCommunity}
                    isLoggedIn={isLoggedIn}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="events">
            {events.length === 0 ? (
              <EmptyState type="events" onRefresh={onRefresh} />
            ) : (
              <div className="space-y-12">
                {/* Header */}
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Discover Events</h2>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Explore, share, and create events near you, building meaningful connections through gatherings that matter
                  </p>
                </div>

                <PopularEventsSection 
                  events={events}
                  onEventClick={openEventDialog}
                  onRegisterEvent={onRegisterEvent}
                  onCreatorClick={openProfessionalDialog}
                  onViewAll={handleViewAll}
                />

                <EventCategoriesSection />

                <FeaturedCalendarsSection />

                <LocalEventsSection />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <EventDetailDialog
        open={detailDialogOpen}
        onOpenChange={(open) => {
          setDetailDialogOpen(open);
          if (!open) setTimeout(() => setSelectedEvent(null), 200);
        }}
        event={selectedEvent}
        onRegister={onRegisterEvent}
        isLoggedIn={isLoggedIn}
      />

      {/* Professional Profile Dialog */}
      <Dialog open={professionalDialogOpen} onOpenChange={setProfessionalDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Professional Profile</DialogTitle>
          </DialogHeader>
          {selectedProfessional && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <img
                  src={selectedProfessional.avatar_url}
                  alt={selectedProfessional.full_name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{selectedProfessional.full_name}</h3>
                  <p className="text-lg text-dna-emerald font-medium">{selectedProfessional.profession}</p>
                  <p className="text-gray-600">{selectedProfessional.company}</p>
                  <p className="text-gray-500 text-sm">{selectedProfessional.location}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                <p className="text-gray-600">{selectedProfessional.bio}</p>
              </div>

              {selectedProfessional.skills && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfessional.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-dna-emerald/10 text-dna-emerald rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  className="bg-dna-emerald hover:bg-dna-forest text-white"
                  onClick={() => {
                    onConnect(selectedProfessional.id);
                    setProfessionalDialogOpen(false);
                  }}
                >
                  Connect
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    onMessage(selectedProfessional.id, selectedProfessional.full_name);
                    setProfessionalDialogOpen(false);
                  }}
                >
                  Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Demo Explanation Dialog */}
      <Dialog open={demoExplanationOpen} onOpenChange={setDemoExplanationOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>DNA Platform Demo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Welcome to the DNA platform demo! This prototype showcases our core Connect pillar functionality.
            </p>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900">What you're seeing:</h4>
                <ul className="text-sm text-gray-600 space-y-1 mt-1">
                  <li>• Sample professionals from the African diaspora</li>
                  <li>• Community groups focused on impact areas</li>
                  <li>• Events created by diaspora leaders</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">In our MVP, you'll have:</h4>
                <ul className="text-sm text-gray-600 space-y-1 mt-1">
                  <li>• Real user profiles with verified credentials</li>
                  <li>• Advanced matching algorithms</li>
                  <li>• Live event registration and management</li>
                  <li>• Direct messaging and video calls</li>
                  <li>• Impact tracking and collaboration tools</li>
                </ul>
              </div>
            </div>
            <Button 
              onClick={() => setDemoExplanationOpen(false)}
              className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConnectTabs;
