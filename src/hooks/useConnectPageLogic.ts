
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '@/hooks/useSearch';
import { useConnections } from '@/hooks/useConnections';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useConnectPageLogic = () => {
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

  const handleMessage = async (recipientId: string, recipientName: string) => {
    console.log('Message button clicked for professional:', recipientId, recipientName);
    if (!user) {
      console.log('User not logged in, showing message dialog');
      setIsMessageDialogOpen(true);
      return;
    }

    try {
      await sendMessage(recipientId, `Hi ${recipientName}, I'd like to connect and learn more about your work!`);
      toast.success('Message sent successfully!');
      navigate('/messages');
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

  useEffect(() => {
    window.scrollTo(0, 0);
    initializeData();
  }, []);

  return {
    // Data
    professionals,
    communities,
    events,
    loading,
    initializing,
    dataError,
    user,
    
    // Search state
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    
    // Dialog states
    isConnectDialogOpen,
    setIsConnectDialogOpen,
    isMessageDialogOpen,
    setIsMessageDialogOpen,
    isJoinCommunityDialogOpen,
    setIsJoinCommunityDialogOpen,
    isRegisterEventDialogOpen,
    setIsRegisterEventDialogOpen,
    isFeedbackPanelOpen,
    setIsFeedbackPanelOpen,
    
    // Handlers
    handleSearch,
    handleConnect,
    handleMessage,
    handleJoinCommunity,
    handleRegisterEvent,
    getConnectionStatus,
    initializeData
  };
};
