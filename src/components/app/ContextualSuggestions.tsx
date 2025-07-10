import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building, 
  Calendar, 
  Target, 
  Sparkles,
  UserPlus,
  MessageCircle,
  Bookmark
} from 'lucide-react';
import { useContextualSuggestions, ContextualSuggestion } from '@/hooks/useContextualSuggestions';
import { useToast } from '@/hooks/use-toast';

interface ContextualSuggestionsProps {
  currentPostContext?: {
    pillar?: string;
    hashtags?: string[];
    authorId?: string;
  };
}

const ContextualSuggestions: React.FC<ContextualSuggestionsProps> = ({ currentPostContext }) => {
  const { suggestions, loading, handleQuickAction } = useContextualSuggestions(currentPostContext);
  const { toast } = useToast();

  const getTypeIcon = (type: ContextualSuggestion['type']) => {
    switch (type) {
      case 'person':
        return Users;
      case 'community':
        return Building;
      case 'event':
        return Calendar;
      case 'initiative':
        return Target;
      default:
        return Sparkles;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'follow':
      case 'connect':
        return UserPlus;
      case 'message':
        return MessageCircle;
      case 'save':
      case 'bookmark':
        return Bookmark;
      default:
        return Sparkles;
    }
  };

  const handleAction = async (suggestionId: string, action: string) => {
    await handleQuickAction(suggestionId, action);
    toast({
      title: `${action} action completed`,
      description: 'Action processed successfully!',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-dna-emerald" />
            Context Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">No contextual suggestions available</p>
            <p className="text-xs text-gray-400">Engage with posts to see relevant suggestions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-dna-emerald" />
          Related to this post
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion) => {
          const TypeIcon = getTypeIcon(suggestion.type);
          return (
            <div key={suggestion.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-3">
                {suggestion.type === 'person' ? (
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={suggestion.avatar_url} />
                    <AvatarFallback className="bg-dna-emerald text-white text-sm">
                      {suggestion.title.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-10 w-10 bg-dna-emerald/10 rounded-full flex items-center justify-center">
                    <TypeIcon className="h-5 w-5 text-dna-emerald" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.title}
                    </h4>
                    <Badge variant="outline" className="text-xs ml-2">
                      {suggestion.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{suggestion.subtitle}</p>
                  <p className="text-xs text-gray-500 mb-2">{suggestion.match_reason}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {suggestion.quick_actions.slice(0, 2).map((action, index) => {
                      const ActionIcon = getActionIcon(action);
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleAction(suggestion.id, action)}
                        >
                          <ActionIcon className="h-3 w-3 mr-1" />
                          {action}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ContextualSuggestions;