
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Filter } from 'lucide-react';
import { useCommunities } from '@/hooks/useCommunities';
import { useAuth } from '@/contexts/CleanAuthContext';
import CommunityCard from '@/components/community/CommunityCard';
import { useToast } from '@/hooks/use-toast';

const Communities = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { communities, loading, createCommunity, joinCommunity, leaveCommunity } = useCommunities();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = !searchTerm || 
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || community.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(communities.map(c => c.category).filter(Boolean)));

  const handleViewDetails = (communityId: string) => {
    navigate(`/communities/${communityId}`);
  };

  const handleCreateCommunity = () => {
    toast({
      title: "Coming Soon!",
      description: "Community creation will be available in a future update. Stay tuned!",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
              <p className="text-gray-600 mt-2">
                Join purpose-driven communities and build meaningful connections across the African Diaspora
              </p>
            </div>
            
            {user && (
              <Button 
                onClick={handleCreateCommunity}
                className="bg-gray-400 hover:bg-gray-500 text-white cursor-not-allowed"
                disabled
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Community (Coming Soon)
              </Button>
            )}
          </div>

          {/* Search and Filter */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search communities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category!}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Communities Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-dna-emerald"></div>
            <p className="mt-4 text-gray-600">Loading communities...</p>
          </div>
        ) : filteredCommunities.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || selectedCategory ? "No communities found" : "No communities yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory 
                  ? "Try adjusting your search or filter criteria"
                  : "Communities will appear here once they're available!"
                }
              </p>
              {user && !searchTerm && !selectedCategory && (
                <Button 
                  onClick={handleCreateCommunity}
                  className="bg-gray-400 hover:bg-gray-500 text-white cursor-not-allowed"
                  disabled
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Community (Coming Soon)
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {filteredCommunities.length} communit{filteredCommunities.length === 1 ? 'y' : 'ies'} found
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommunities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  onJoin={joinCommunity}
                  onLeave={leaveCommunity}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Communities;
