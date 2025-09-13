import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Briefcase, Users, MessageSquare, Search, Filter } from 'lucide-react';
import { useProfiles } from '@/hooks/useProfiles';
import { ConnectionButton } from '@/components/connections/ConnectionButton';
import { useAuth } from '@/contexts/AuthContext';

interface PeopleDiscoveryProps {
  onMessage?: (userId: string, userName: string) => void;
}

const PeopleDiscovery: React.FC<PeopleDiscoveryProps> = ({ onMessage }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [professionFilter, setProfessionFilter] = useState('');
  const [filters, setFilters] = useState({});

  // Update filters when search parameters change
  useEffect(() => {
    const newFilters: any = {};
    if (locationFilter && locationFilter !== 'all') newFilters.location = locationFilter;
    if (professionFilter && professionFilter !== 'all') newFilters.profession = professionFilter;
    if (searchTerm) newFilters.searchTerm = searchTerm;
    setFilters(newFilters);
  }, [searchTerm, locationFilter, professionFilter]);

  const { data: profiles, isLoading: loading, error } = useProfiles(filters);

  const filteredProfiles = profiles?.filter(profile => {
    // Filter out current user
    if (profile.id === user?.id) return false;
    
    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        profile.full_name?.toLowerCase().includes(searchLower) ||
        profile.profession?.toLowerCase().includes(searchLower) ||
        profile.company?.toLowerCase().includes(searchLower) ||
        profile.bio?.toLowerCase().includes(searchLower) ||
        profile.skills?.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  }) || [];

  const handleMessage = (userId: string, userName: string) => {
    if (onMessage) {
      onMessage(userId, userName);
    } else {
      // Default navigation to messages
      window.location.href = '/app/messages';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Discover Diaspora Professionals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, skills, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="Germany">Germany</SelectItem>
                <SelectItem value="France">France</SelectItem>
                <SelectItem value="Australia">Australia</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={professionFilter} onValueChange={setProfessionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by profession" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Professions</SelectItem>
                <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                <SelectItem value="Product Manager">Product Manager</SelectItem>
                <SelectItem value="Consultant">Consultant</SelectItem>
                <SelectItem value="Entrepreneur">Entrepreneur</SelectItem>
                <SelectItem value="Academic">Academic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {filteredProfiles.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No professionals found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredProfiles.map((profile) => (
            <Card key={profile.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  {/* Avatar */}
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white text-lg">
                      {profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Profile Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {profile.full_name}
                        </h3>
                        
                        {profile.headline && (
                          <p className="text-sm text-gray-600 mb-1">{profile.headline}</p>
                        )}
                        
                        {profile.profession && (
                          <div className="flex items-center text-gray-600 mb-1">
                            <Briefcase className="w-4 h-4 mr-1" />
                            <span className="text-sm">
                              {profile.profession}
                              {profile.company && ` at ${profile.company}`}
                            </span>
                          </div>
                        )}
                        
                        {profile.location && (
                          <div className="flex items-center text-gray-500 mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">{profile.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Bio */}
                    {profile.bio && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {profile.bio}
                      </p>
                    )}
                    
                    {/* Skills */}
                    {profile.skills && profile.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {profile.skills.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {profile.skills.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{profile.skills.length - 4} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <ConnectionButton
                        targetUserId={profile.id}
                        targetUserName={profile.full_name || 'User'}
                        size="sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMessage(profile.id, profile.full_name || 'User')}
                        disabled={!user}
                        className="flex items-center gap-1"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PeopleDiscovery;