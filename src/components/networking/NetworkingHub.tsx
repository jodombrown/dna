import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  MessageCircle, 
  UserPlus,
  Globe,
  Building,
  Star,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/hooks/useProfiles';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NetworkingFilters {
  location?: string;
  skills?: string[];
  profession?: string;
  impact_areas?: string[];
}

const NetworkingHub = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<NetworkingFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'nearby' | 'skills' | 'impact'>('all');

  const { data: profiles, isLoading } = useProfiles({
    location: filters.location,
    skills: filters.skills,
    profession: filters.profession,
    limit: 50
  });

  const handleConnect = async (profileId: string, fullName: string) => {
    try {
      // Create connection request
      const { error } = await supabase.rpc('ensure_connection', {
        u1: user?.id,
        u2: profileId
      });

      if (error) throw error;

      toast({
        title: "Connection request sent",
        description: `Your connection request has been sent to ${fullName}`,
      });
    } catch (error: any) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Failed to send connection request",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleMessage = async (profileId: string, fullName: string) => {
    try {
      // Create or find conversation
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user_1_id.eq.${user?.id},user_2_id.eq.${profileId}),and(user_1_id.eq.${profileId},user_2_id.eq.${user?.id})`)
        .maybeSingle();

      if (error && !error.message.includes('PGRST116')) throw error;

      if (!conversation) {
        const { error: createError } = await supabase
          .from('conversations')
          .insert({
            user_1_id: user?.id,
            user_2_id: profileId
          });

        if (createError) throw createError;
      }

      toast({
        title: "Message started",
        description: `Navigate to Messages to continue your conversation with ${fullName}`,
      });
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Failed to start conversation",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    }
  };

  const filteredProfiles = profiles?.filter(p => {
    if (p.id === user?.id) return false; // Don't show current user
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        p.full_name?.toLowerCase().includes(query) ||
        p.headline?.toLowerCase().includes(query) ||
        p.bio?.toLowerCase().includes(query) ||
        p.profession?.toLowerCase().includes(query) ||
        p.skills?.some(skill => skill.toLowerCase().includes(query))
      );
    }
    return true;
  }) || [];

  const getCategoryProfiles = () => {
    switch (selectedCategory) {
      case 'nearby':
        return filteredProfiles.filter(p => p.location === profile?.location);
      case 'skills':
        return filteredProfiles.filter(p => 
          p.skills?.some(skill => profile?.skills?.includes(skill))
        );
      case 'impact':
        return filteredProfiles.filter(p => 
          p.impact_areas?.some(area => profile?.impact_areas?.includes(area))
        );
      default:
        return filteredProfiles;
    }
  };

  const categoryProfiles = getCategoryProfiles();

  const categories = [
    { id: 'all', label: 'All Members', count: filteredProfiles.length },
    { id: 'nearby', label: 'Same Location', count: filteredProfiles.filter(p => p.location === profile?.location).length },
    { id: 'skills', label: 'Similar Skills', count: filteredProfiles.filter(p => p.skills?.some(skill => profile?.skills?.includes(skill))).length },
    { id: 'impact', label: 'Shared Impact Areas', count: filteredProfiles.filter(p => p.impact_areas?.some(area => profile?.impact_areas?.includes(area))).length }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dna-forest">Networking Hub</h1>
          <p className="text-gray-600">Connect with diaspora professionals worldwide</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, skills, profession, or interests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id as any)}
                className="flex items-center gap-2"
              >
                {category.label}
                <Badge variant="secondary" className="ml-1">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                placeholder="Filter by location..."
                value={filters.location || ''}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Profession</label>
              <Input
                placeholder="Filter by profession..."
                value={filters.profession || ''}
                onChange={(e) => setFilters({ ...filters, profession: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-dna-forest">
            {categoryProfiles.length} Members Found
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : categoryProfiles.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
              <p className="text-gray-600">
                {searchQuery ? 'Try adjusting your search terms' : 'Try different filters or check back later'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryProfiles.map((memberProfile) => (
              <Card key={memberProfile.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Profile Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={memberProfile.avatar_url} />
                      <AvatarFallback>
                        {memberProfile.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-dna-forest truncate">
                        {memberProfile.full_name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {memberProfile.headline || memberProfile.profession}
                      </p>
                    </div>
                  </div>

                  {/* Location & Company */}
                  <div className="space-y-2 mb-4">
                    {memberProfile.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{memberProfile.location}</span>
                      </div>
                    )}
                    {memberProfile.company && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="w-4 h-4" />
                        <span className="truncate">{memberProfile.company}</span>
                      </div>
                    )}
                  </div>

                  {/* Bio Preview */}
                  {memberProfile.bio && (
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                      {memberProfile.bio}
                    </p>
                  )}

                  {/* Skills */}
                  {memberProfile.skills && memberProfile.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {memberProfile.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {memberProfile.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{memberProfile.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleConnect(memberProfile.id, memberProfile.full_name)}
                      className="flex-1 bg-dna-copper hover:bg-dna-copper/90"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Connect
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMessage(memberProfile.id, memberProfile.full_name)}
                      className="flex-1"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkingHub;