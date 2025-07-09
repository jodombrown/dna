import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Plus, Search } from 'lucide-react';
import { useConversations } from '@/hooks/useMessaging';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  headline?: string;
}

interface NewConversationModalProps {
  onConversationCreated: (conversationId: string) => void;
}

export const NewConversationModal: React.FC<NewConversationModalProps> = ({ onConversationCreated }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const { user } = useAuth();
  const { createConversation } = useConversations();

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, headline')
        .neq('id', user?.id) // Exclude current user
        .ilike('full_name', `%${query}%`)
        .eq('is_public', true)
        .limit(10);

      if (error) {
        console.error('Error searching users:', error);
        return;
      }

      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleStartConversation = async (otherUserId: string) => {
    try {
      const conversationId = await createConversation(otherUserId);
      if (conversationId) {
        onConversationCreated(conversationId);
        toast.success('Conversation started!');
      } else {
        toast.error('Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold text-dna-forest">Start New Conversation</h3>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search for people..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            searchUsers(e.target.value);
          }}
          className="pl-10"
        />
      </div>

      {searching && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600">Searching...</p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {searchResults.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="bg-dna-emerald text-white">
                    {profile.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-dna-forest">{profile.full_name}</p>
                  {profile.headline && (
                    <p className="text-xs text-gray-500">{profile.headline}</p>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleStartConversation(profile.id)}
                className="bg-dna-emerald hover:bg-dna-emerald/90"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Message
              </Button>
            </div>
          ))}
        </div>
      )}

      {searchQuery && !searching && searchResults.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">No users found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};