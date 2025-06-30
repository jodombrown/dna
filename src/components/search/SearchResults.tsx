import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Briefcase, MessageSquare, UserPlus, Star } from 'lucide-react';
import { Professional, Community, Event } from '@/hooks/useSearch';
import ConnectDialogs from '@/components/connect/ConnectDialogs';

interface SearchResultsProps {
  results: {
    professionals: Professional[];
    communities: Community[];
    events: Event[];
  };
  loading: boolean;
  onConnect: (userId: string) => void;
  onMessage: (userId: string, userName: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  onConnect,
  onMessage
}) => {
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isJoinCommunityDialogOpen, setIsJoinCommunityDialogOpen] = useState(false);
  const [isRegisterEventDialogOpen, setIsRegisterEventDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedUserName, setSelectedUserName] = useState<string>('');

  const handleConnectClick = (userId: string, isLoggedIn: boolean) => {
    if (isLoggedIn) {
      onConnect(userId);
    } else {
      setSelectedUserId(userId);
      setIsConnectDialogOpen(true);
    }
  };

  const handleMessageClick = (userId: string, userName: string, isLoggedIn: boolean) => {
    if (isLoggedIn) {
      onMessage(userId, userName);
    } else {
      setSelectedUserId(userId);
      setSelectedUserName(userName);
      setIsMessageDialogOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="flex space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalResults = results.professionals.length + results.communities.length + results.events.length;

  if (totalResults === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-gray-500">
            <p className="text-lg font-medium mb-2">No results found</p>
            <p>Try adjusting your search criteria or filters</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-4">
          Found {results.professionals.length} professional{results.professionals.length !== 1 ? 's' : ''}, {results.communities.length} communit{results.communities.length !== 1 ? 'ies' : 'y'}, and {results.events.length} event{results.events.length !== 1 ? 's' : ''}
        </div>
        
        {/* Professionals Results */}
        {results.professionals.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Professionals</h3>
            {results.professionals.map((professional) => (
              <Card key={professional.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={professional.avatar_url} alt={professional.full_name} />
                      <AvatarFallback>
                        {professional.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {professional.full_name}
                          </h3>
                          
                          {professional.profession && (
                            <div className="flex items-center text-gray-600 mt-1">
                              <Briefcase className="w-4 h-4 mr-1" />
                              <span className="text-sm">
                                {professional.profession}
                                {professional.company && ` at ${professional.company}`}
                              </span>
                            </div>
                          )}
                          
                          {professional.location && (
                            <div className="flex items-center text-gray-500 mt-1">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span className="text-sm">{professional.location}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMessageClick(professional.id, professional.full_name, false)}
                            className="flex items-center gap-1"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Message
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleConnectClick(professional.id, false)}
                            className="bg-dna-emerald hover:bg-dna-forest text-white flex items-center gap-1"
                          >
                            <UserPlus className="w-4 h-4" />
                            Connect
                          </Button>
                        </div>
                      </div>
                      
                      {professional.bio && (
                        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                          {professional.bio}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {professional.is_mentor && (
                          <Badge variant="secondary" className="bg-dna-emerald/10 text-dna-emerald">
                            <Star className="w-3 h-3 mr-1" />
                            Mentor
                          </Badge>
                        )}
                        {professional.is_investor && (
                          <Badge variant="secondary" className="bg-dna-copper/10 text-dna-copper">
                            Investor
                          </Badge>
                        )}
                        {professional.looking_for_opportunities && (
                          <Badge variant="secondary" className="bg-dna-gold/10 text-dna-gold">
                            Open to Opportunities
                          </Badge>
                        )}
                      </div>
                      
                      {professional.skills && professional.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {professional.skills.slice(0, 4).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {professional.skills.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{professional.skills.length - 4} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Communities Results */}
        {results.communities.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Communities</h3>
            {results.communities.map((community) => (
              <Card key={community.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {community.name}
                      </h3>
                      {community.description && (
                        <p className="text-gray-600 text-sm mt-1">
                          {community.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        {community.category && (
                          <Badge variant="outline">{community.category}</Badge>
                        )}
                        <span className="text-sm text-gray-500">
                          {community.member_count} members
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-dna-emerald hover:bg-dna-forest text-white"
                    >
                      Join Community
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Events Results */}
        {results.events.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Events</h3>
            {results.events.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="text-gray-600 text-sm mt-1">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        {event.type && (
                          <Badge variant="outline">{event.type}</Badge>
                        )}
                        {event.location && (
                          <span className="text-sm text-gray-500">
                            {event.location}
                          </span>
                        )}
                        {event.date_time && (
                          <span className="text-sm text-gray-500">
                            {new Date(event.date_time).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-dna-emerald hover:bg-dna-forest text-white"
                    >
                      Register
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConnectDialogs
        isConnectDialogOpen={isConnectDialogOpen}
        setIsConnectDialogOpen={setIsConnectDialogOpen}
        isMessageDialogOpen={isMessageDialogOpen}
        setIsMessageDialogOpen={setIsMessageDialogOpen}
        isJoinCommunityDialogOpen={isJoinCommunityDialogOpen}
        setIsJoinCommunityDialogOpen={setIsJoinCommunityDialogOpen}
        isRegisterEventDialogOpen={isRegisterEventDialogOpen}
        setIsRegisterEventDialogOpen={setIsRegisterEventDialogOpen}
      />
    </>
  );
};

export default SearchResults;
