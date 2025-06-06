import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MapPin, Briefcase, GraduationCap, MessageSquare, User, Globe, Calendar, Users as UsersIcon } from 'lucide-react';
import { useSearch, Professional, Community, Event } from '@/hooks/useSearch';
import { useConnections } from '@/hooks/useConnections';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { seedProfessionals, seedCommunities, seedEvents } from '@/utils/seedData';

const ConnectExample = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { professionals, communities, events, loading, searchProfessionals, searchCommunities, searchEvents, getAllData } = useSearch();
  const { sendConnectionRequest, checkConnectionStatus } = useConnections();
  const { sendMessage } = useMessages();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('professionals');
  const [hasSeeded, setHasSeeded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      await getAllData();
      
      // Check if we have any data, if not seed it
      const { data: existingProfessionals } = await supabase
        .from('professionals')
        .select('id')
        .limit(1);
      
      if (!existingProfessionals || existingProfessionals.length === 0) {
        console.log('Seeding database with sample data...');
        await Promise.all([
          seedProfessionals(),
          seedCommunities(),
          seedEvents()
        ]);
        setHasSeeded(true);
        await getAllData();
      }
    } catch (error) {
      console.error('Error initializing data:', error);
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

  const handleConnect = async (professionalId: string) => {
    if (!user) {
      toast.error('Please log in to connect with professionals');
      navigate('/auth');
      return;
    }

    try {
      await sendConnectionRequest(professionalId, 'I would like to connect with you!');
      toast.success('Connection request sent successfully!');
    } catch (error) {
      toast.error('Failed to send connection request');
    }
  };

  const handleMessage = async (recipientId: string, recipientName: string) => {
    if (!user) {
      toast.error('Please log in to send messages');
      navigate('/auth');
      return;
    }

    try {
      await sendMessage(recipientId, `Hi ${recipientName}, I'd like to connect and learn more about your work!`);
      toast.success('Message sent successfully!');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const getConnectionStatus = (professionalId: string) => {
    if (!user) return null;
    return checkConnectionStatus(professionalId);
  };

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
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Professional Network</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Connect with diaspora professionals</p>
              </div>
            </div>
            <Badge className="bg-dna-emerald text-white text-xs sm:text-sm">
              {professionals.length} Active
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search Section */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Search className="w-5 h-5" />
              Find Your Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Input 
                placeholder="Search by name, expertise, company..." 
                className="flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                className="bg-dna-emerald hover:bg-dna-forest text-white"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different content types */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="professionals">Professionals ({professionals.length})</TabsTrigger>
            <TabsTrigger value="communities">Communities ({communities.length})</TabsTrigger>
            <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="professionals">
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
          </TabsContent>

          <TabsContent value="communities">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events">
            <div className="grid md:grid-cols-2 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {loading && (
          <div className="text-center py-12">
            <div className="text-lg">Loading...</div>
          </div>
        )}
      </main>
    </div>
  );
};

// Professional Card Component
const ProfessionalCard: React.FC<{
  professional: Professional;
  onConnect: () => void;
  onMessage: () => void;
  connectionStatus: string | null;
  isLoggedIn: boolean;
}> = ({ professional, onConnect, onMessage, connectionStatus, isLoggedIn }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-dna-copper to-dna-emerald rounded-full flex items-center justify-center">
          <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base sm:text-lg mb-1">{professional.full_name}</CardTitle>
          <p className="text-dna-copper font-medium text-sm sm:text-base">{professional.profession}</p>
          <p className="text-gray-600 text-xs sm:text-sm">{professional.company}</p>
        </div>
      </div>
    </CardHeader>
    
    <CardContent className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <MapPin className="w-4 h-4" />
        <span className="truncate">{professional.location} • Originally from {professional.country_of_origin}</span>
      </div>
      
      {professional.expertise && (
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Expertise</div>
          <div className="flex flex-wrap gap-1">
            {professional.expertise.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {professional.availability_for && (
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Available For</div>
          <div className="flex flex-wrap gap-1">
            {professional.availability_for.map((service, index) => (
              <Badge key={index} className="text-xs bg-dna-emerald/20 text-dna-emerald">
                {service}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {professional.bio && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm">{professional.bio.substring(0, 100)}...</div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {connectionStatus === 'accepted' ? (
          <Badge className="bg-green-100 text-green-800">Connected</Badge>
        ) : connectionStatus === 'pending' ? (
          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
        ) : (
          <Button 
            className="flex-1 bg-dna-emerald hover:bg-dna-forest text-white"
            onClick={onConnect}
            disabled={!isLoggedIn}
          >
            Connect
          </Button>
        )}
        
        <Button 
          variant="outline"
          onClick={onMessage}
          disabled={!isLoggedIn}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Message
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Community Card Component
const CommunityCard: React.FC<{ community: Community }> = ({ community }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader>
      <CardTitle className="text-lg">{community.name}</CardTitle>
      <Badge variant="outline">{community.category}</Badge>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600 mb-4">{community.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <UsersIcon className="w-4 h-4" />
          {community.member_count} members
        </div>
        <Button size="sm" className="bg-dna-emerald hover:bg-dna-forest text-white">
          Join
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Event Card Component
const EventCard: React.FC<{ event: Event }> = ({ event }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader>
      <CardTitle className="text-lg">{event.title}</CardTitle>
      <div className="flex gap-2">
        <Badge variant="outline">{event.type}</Badge>
        {event.is_virtual && <Badge className="bg-blue-100 text-blue-800">Virtual</Badge>}
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600 mb-4">{event.description}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          {event.date_time ? new Date(event.date_time).toLocaleDateString() : 'TBD'}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          {event.location}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <UsersIcon className="w-4 h-4" />
          {event.attendee_count} attending
        </div>
      </div>
      
      <Button 
        className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
        onClick={() => event.registration_url && window.open(event.registration_url, '_blank')}
      >
        Register
      </Button>
    </CardContent>
  </Card>
);

export default ConnectExample;
