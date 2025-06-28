
import React, { useState } from 'react';
import Header from '@/components/Header';
import SocialFeed from '@/components/social/SocialFeed';
import ContributionCardsGrid from '@/components/social/ContributionCardsGrid';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  DollarSign, 
  Calendar, 
  Users,
  FileText
} from 'lucide-react';

const SocialFeedPage = () => {
  const [activeTab, setActiveTab] = useState('feed');

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Hub</h1>
              <p className="text-gray-600">
                Connect, share, and collaborate with the diaspora community
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-8">
                <TabsTrigger value="feed" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Feed</span>
                </TabsTrigger>
                <TabsTrigger value="contributions" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="hidden sm:inline">Opportunities</span>
                </TabsTrigger>
                <TabsTrigger value="events" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Events</span>
                </TabsTrigger>
                <TabsTrigger value="communities" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Communities</span>
                </TabsTrigger>
                <TabsTrigger value="newsletters" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Newsletters</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="feed">
                <SocialFeed />
              </TabsContent>
              
              <TabsContent value="contributions">
                <ContributionCardsGrid />
              </TabsContent>
              
              <TabsContent value="events">
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">Events Coming Soon</h3>
                  <p>Discover and create diaspora events in your area.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="communities">
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">Communities Coming Soon</h3>
                  <p>Join topic-based communities and regional groups.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="newsletters">
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">Newsletters Coming Soon</h3>
                  <p>Create and subscribe to community newsletters.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SocialFeedPage;
