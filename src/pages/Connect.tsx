
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  MapPin, 
  Building, 
  Users, 
  Filter,
  MessageCircle,
  UserPlus
} from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/CleanAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Connect = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true)
        .neq('id', user?.id || '')
        .limit(20);

      if (error) {
        console.error('Error fetching profiles:', error);
        setProfiles([]);
      } else {
        setProfiles(data || []);
      }
    } catch (error) {
      console.error('Error in fetchProfiles:', error);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (profileId: string, profileName: string) => {
    toast({
      title: "Connection Request Sent",
      description: `Connection request sent to ${profileName}`,
    });
  };

  const handleMessage = (profileId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to send messages",
        variant: "destructive"
      });
      return;
    }
    navigate(`/messages?user=${profileId}`);
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Connect with the Diaspora
          </h1>
          <p className="text-gray-600 text-lg">
            Build meaningful professional relationships across the African diaspora
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, profession, company, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-dna-emerald mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{profiles.length}</div>
              <div className="text-sm text-gray-600">Active Professionals</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="w-8 h-8 text-dna-copper mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">50+</div>
              <div className="text-sm text-gray-600">Countries Represented</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Building className="w-8 h-8 text-dna-gold mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">25+</div>
              <div className="text-sm text-gray-600">Industries</div>
            </CardContent>
          </Card>
        </div>

        {/* Professionals Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-500">Loading professionals...</div>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No professionals found' : 'No professionals yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms or filters'
                  : 'Be among the first to join the DNA community'
                }
              </p>
              {!user && (
                <Button 
                  onClick={() => navigate('/auth')}
                  className="bg-dna-emerald hover:bg-dna-forest text-white"
                >
                  Join the Community
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                      <AvatarFallback className="bg-dna-mint text-dna-forest text-lg">
                        {profile.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {profile.full_name || 'DNA Member'}
                      </h3>
                      {profile.profession && (
                        <p className="text-dna-emerald font-medium text-sm">
                          {profile.profession}
                        </p>
                      )}
                      {profile.company && (
                        <div className="flex items-center text-gray-600 text-sm mt-1">
                          <Building className="w-3 h-3 mr-1" />
                          <span className="truncate">{profile.company}</span>
                        </div>
                      )}
                      {profile.location && (
                        <div className="flex items-center text-gray-600 text-sm mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate">{profile.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {profile.bio && (
                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                      {profile.bio}
                    </p>
                  )}

                  {profile.skills && profile.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {profile.skills.slice(0, 3).map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {profile.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{profile.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleConnect(profile.id, profile.full_name)}
                      className="flex-1 bg-dna-emerald hover:bg-dna-forest text-white"
                      size="sm"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Connect
                    </Button>
                    <Button
                      onClick={() => handleMessage(profile.id)}
                      variant="outline"
                      size="sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => navigate(`/profile/${profile.id}`)}
                      variant="outline"
                      size="sm"
                    >
                      View
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

export default Connect;
