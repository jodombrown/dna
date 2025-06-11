
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Briefcase, MessageSquare, UserPlus, Star } from 'lucide-react';

interface SearchResult {
  id: string;
  full_name: string;
  profession?: string;
  company?: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
  skills?: string[];
  is_mentor?: boolean;
  is_investor?: boolean;
  looking_for_opportunities?: boolean;
  years_experience?: number;
}

interface SearchResultsProps {
  results: SearchResult[];
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

  if (results.length === 0) {
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
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Found {results.length} professional{results.length !== 1 ? 's' : ''}
      </div>
      
      {results.map((result) => (
        <Card key={result.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={result.avatar_url} alt={result.full_name} />
                <AvatarFallback>
                  {result.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {result.full_name}
                    </h3>
                    
                    {result.profession && (
                      <div className="flex items-center text-gray-600 mt-1">
                        <Briefcase className="w-4 h-4 mr-1" />
                        <span className="text-sm">
                          {result.profession}
                          {result.company && ` at ${result.company}`}
                        </span>
                      </div>
                    )}
                    
                    {result.location && (
                      <div className="flex items-center text-gray-500 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{result.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onMessage(result.id, result.full_name)}
                      className="flex items-center gap-1"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onConnect(result.id)}
                      className="bg-dna-emerald hover:bg-dna-forest text-white flex items-center gap-1"
                    >
                      <UserPlus className="w-4 h-4" />
                      Connect
                    </Button>
                  </div>
                </div>
                
                {result.bio && (
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                    {result.bio}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {result.is_mentor && (
                    <Badge variant="secondary" className="bg-dna-emerald/10 text-dna-emerald">
                      <Star className="w-3 h-3 mr-1" />
                      Mentor
                    </Badge>
                  )}
                  {result.is_investor && (
                    <Badge variant="secondary" className="bg-dna-copper/10 text-dna-copper">
                      Investor
                    </Badge>
                  )}
                  {result.looking_for_opportunities && (
                    <Badge variant="secondary" className="bg-dna-gold/10 text-dna-gold">
                      Open to Opportunities
                    </Badge>
                  )}
                  {result.years_experience && (
                    <Badge variant="outline">
                      {result.years_experience} years experience
                    </Badge>
                  )}
                </div>
                
                {result.skills && result.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {result.skills.slice(0, 4).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {result.skills.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{result.skills.length - 4} more
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
  );
};

export default SearchResults;
