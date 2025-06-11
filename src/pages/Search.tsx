
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import AdvancedSearch, { SearchFilters } from '@/components/search/AdvancedSearch';
import SearchResults from '@/components/search/SearchResults';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { useConnections } from '@/hooks/useConnections';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Search = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { results, loading, searchProfiles, searchProfessionals, clearResults } = useAdvancedSearch();
  const { sendConnectionRequest } = useConnections();
  const { sendMessage } = useMessages();
  const [activeTab, setActiveTab] = useState('profiles');

  const handleSearch = async (filters: SearchFilters) => {
    if (activeTab === 'profiles') {
      await searchProfiles(filters);
    } else {
      await searchProfessionals(filters);
    }
  };

  const handleConnect = async (userId: string) => {
    if (!user) {
      toast.error('Please sign in to connect with professionals');
      navigate('/auth');
      return;
    }

    try {
      await sendConnectionRequest(userId, 'I would like to connect with you!');
      toast.success('Connection request sent successfully!');
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to send connection request');
    }
  };

  const handleMessage = async (recipientId: string, recipientName: string) => {
    if (!user) {
      toast.error('Please sign in to message professionals');
      navigate('/auth');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Diaspora Professionals
          </h1>
          <p className="text-gray-600">
            Find and connect with African diaspora professionals worldwide
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Search Filters */}
          <div className="lg:col-span-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profiles">Profiles</TabsTrigger>
                <TabsTrigger value="professionals">Professionals</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <AdvancedSearch
              onSearch={handleSearch}
              onClear={clearResults}
              loading={loading}
            />
          </div>

          {/* Search Results */}
          <div className="lg:col-span-2">
            <SearchResults
              results={results}
              loading={loading}
              onConnect={handleConnect}
              onMessage={handleMessage}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Search;
