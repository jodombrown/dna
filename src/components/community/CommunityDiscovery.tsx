import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Users, 
  TrendingUp, 
  Star, 
  MapPin, 
  Filter,
  Plus,
  ArrowRight,
  Heart,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { searchCommunities, requestToJoinCommunity } from '@/services/communityService';
import { CommunityWithMembership } from '@/types/community';
import CommunityCreationDialog from './CommunityCreationDialog';

const COMMUNITY_CATEGORIES = [
  'All',
  'Technology',
  'Healthcare', 
  'Business',
  'Education',
  'Arts & Culture',
  'Sports & Recreation',
  'Social Impact',
  'Professional Development',
  'Research & Academia',
  'Government & Policy'
];

const CommunityDiscovery = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'members' | 'recent' | 'active'>('members');

  const { data: communities = [], isLoading, refetch } = useQuery({
    queryKey: ['communitiesDiscovery', searchTerm, selectedCategory, sortBy],
    queryFn: () => searchCommunities(searchTerm, selectedCategory === 'All' ? undefined : selectedCategory),
    staleTime: 30000 // Cache for 30 seconds
  });

  const handleJoinCommunity = async (communityId: string, community: CommunityWithMembership) => {
    if (community.is_member) {
      navigate(`/community/${communityId}`);
      return;
    }

    if (community.user_membership?.status === 'pending') {
      toast({
        title: "Request Pending",
        description: "Your join request is still pending approval.",
      });
      return;
    }

    try {
      await requestToJoinCommunity(communityId);
      toast({
        title: "Join Request Sent",
        description: `Your request to join "${community.name}" has been sent for approval.`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send join request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getCommunityInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').slice(0, 2);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Healthcare': 'bg-green-100 text-green-800',
      'Business': 'bg-purple-100 text-purple-800',
      'Education': 'bg-yellow-100 text-yellow-800',
      'Arts & Culture': 'bg-pink-100 text-pink-800',
      'Sports & Recreation': 'bg-orange-100 text-orange-800',
      'Social Impact': 'bg-emerald-100 text-emerald-800',
      'Professional Development': 'bg-indigo-100 text-indigo-800',
      'Research & Academia': 'bg-cyan-100 text-cyan-800',
      'Government & Policy': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getJoinButtonVariant = (community: CommunityWithMembership) => {
    if (community.is_member) {
      return { text: 'View Community', variant: 'default' as const, icon: ArrowRight };
    }
    if (community.user_membership?.status === 'pending') {
      return { text: 'Request Pending', variant: 'secondary' as const, icon: Calendar };
    }
    return { text: 'Request to Join', variant: 'outline' as const, icon: Plus };
  };

  // Sort communities based on selected sort option
  const sortedCommunities = [...communities].sort((a, b) => {
    switch (sortBy) {
      case 'members':
        return (b.member_count || 0) - (a.member_count || 0);
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'active':
        // For now, sort by member count as proxy for activity
        return (b.member_count || 0) - (a.member_count || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dna-forest">Discover Communities</h1>
          <p className="text-gray-600">Find and join communities that align with your interests and goals</p>
        </div>
        <CommunityCreationDialog onSuccess={refetch} />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search communities by name or description..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {COMMUNITY_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="w-full lg:w-48">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="members">Most Members</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="active">Most Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading State
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedCommunities.length === 0 ? (
          // Empty State
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No communities found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 
                  `No communities match "${searchTerm}". Try adjusting your search or filters.` :
                  "Be the first to create a community in this category!"
                }
              </p>
              <CommunityCreationDialog 
                trigger={
                  <Button className="bg-dna-emerald hover:bg-dna-forest text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Community
                  </Button>
                }
                onSuccess={refetch}
              />
            </CardContent>
          </Card>
        ) : (
          // Communities Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCommunities.map((community) => {
              const joinButton = getJoinButtonVariant(community);
              return (
                <Card key={community.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    {/* Community Header */}
                    <div className="flex items-start space-x-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={community.image_url} />
                        <AvatarFallback className="bg-dna-emerald text-white font-semibold">
                          {getCommunityInitials(community.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-dna-forest text-lg truncate">
                            {community.name}
                          </h3>
                          {community.is_featured && (
                            <Star className="h-4 w-4 text-dna-gold fill-current ml-2 flex-shrink-0" />
                          )}
                        </div>
                        
                        <Badge 
                          variant="secondary" 
                          className={`text-xs mt-1 ${getCategoryColor(community.category || '')}`}
                        >
                          {community.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {community.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {community.member_count?.toLocaleString() || 0} members
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Active
                      </div>
                    </div>

                    {/* Tags */}
                    {community.tags && community.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {community.tags.slice(0, 3).map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="outline" 
                            className="text-xs px-2 py-1 text-dna-emerald border-dna-emerald/30"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {community.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs px-2 py-1 text-gray-500">
                            +{community.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Join Button */}
                    <Button
                      onClick={() => handleJoinCommunity(community.id, community)}
                      variant={joinButton.variant}
                      disabled={joinButton.text === 'Request Pending'}
                      className={`w-full ${
                        joinButton.variant === 'default' 
                          ? 'bg-dna-emerald hover:bg-dna-forest text-white' 
                          : joinButton.text === 'Request Pending'
                          ? 'cursor-not-allowed'
                          : 'text-dna-emerald border-dna-emerald hover:bg-dna-emerald hover:text-white'
                      }`}
                    >
                      <joinButton.icon className="h-4 w-4 mr-2" />
                      {joinButton.text}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityDiscovery;