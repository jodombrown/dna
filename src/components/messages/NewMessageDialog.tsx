import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { messageService } from '@/services/messageService';

interface NewMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewMessageDialog: React.FC<NewMessageDialogProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadConnections();
    }
  }, [isOpen, user]);

  const loadConnections = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_connections', {
        p_user_id: user.id,
        p_limit: 50,
        p_offset: 0,
      });

      if (error) throw error;
      setConnections(data || []);
    } catch (error: any) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConnection = async (connectionId: string) => {
    if (!user) return;

    setCreating(true);
    try {
      const conversation = await messageService.getOrCreateConversation(connectionId);

      onClose();
      navigate(`/dna/messages/${conversation.id}`);
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create conversation',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const filteredConnections = connections.filter(
    (conn) =>
      conn.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.headline?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>
            Start a conversation with one of your connections
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredConnections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {connections.length === 0 ? (
                  <p>No connections yet</p>
                ) : (
                  <p>No connections match your search</p>
                )}
              </div>
            ) : (
              filteredConnections.map((connection) => (
                <Button
                  key={connection.id}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => handleSelectConnection(connection.id)}
                  disabled={creating}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={connection.avatar_url} alt={connection.full_name} />
                    <AvatarFallback>
                      {connection.full_name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{connection.full_name}</p>
                    {connection.headline && (
                      <p className="text-sm text-muted-foreground truncate">
                        {connection.headline}
                      </p>
                    )}
                  </div>
                </Button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
