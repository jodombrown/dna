import React, { useState } from 'react';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useNavigate } from 'react-router-dom';
import NewsletterCreator from '@/components/newsletters/NewsletterCreator';
import NewsletterList from '@/components/newsletters/NewsletterList';
import { FileText, Plus, Send, Users } from 'lucide-react';

const Newsletters = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('browse');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNewsletterCreated = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('mine');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-dna-forest mb-4">Join DNA to Access Newsletters</h2>
              <p className="text-gray-600 mb-6">
                Create and read newsletters from the African diaspora community
              </p>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-dna-copper hover:bg-dna-gold text-white"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-dna-copper mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-dna-forest">Newsletters</h1>
                <p className="text-gray-600">
                  Share insights and stay connected with the diaspora community
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="browse" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Browse
              </TabsTrigger>
              <TabsTrigger value="mine" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                My Newsletters
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create
              </TabsTrigger>
            </TabsList>
            
            {activeTab !== 'create' && (
              <Button
                onClick={() => setActiveTab('create')}
                className="bg-dna-emerald hover:bg-dna-forest text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Newsletter
              </Button>
            )}
          </div>

          {/* Tab Content */}
          <TabsContent value="browse" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Published Newsletters
              </h2>
              <p className="text-gray-600">
                Discover insights and stories from the diaspora community
              </p>
            </div>
            <NewsletterList key={`browse-${refreshKey}`} showOnlyPublished={true} />
          </TabsContent>

          <TabsContent value="mine" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                My Newsletters
              </h2>
              <p className="text-gray-600">
                Manage your published newsletters and drafts
              </p>
            </div>
            <NewsletterList key={`mine-${refreshKey}`} showOnlyPublished={false} />
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <NewsletterCreator onNewsletterCreated={handleNewsletterCreated} />
          </TabsContent>
        </Tabs>

        {/* Newsletter Stats */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-dna-copper mb-2">--</div>
                <div className="text-sm text-gray-600">Total Newsletters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-dna-emerald mb-2">--</div>
                <div className="text-sm text-gray-600">Active Subscribers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-dna-gold mb-2">--</div>
                <div className="text-sm text-gray-600">Emails Delivered</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Newsletters;