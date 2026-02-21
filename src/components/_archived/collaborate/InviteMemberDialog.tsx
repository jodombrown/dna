import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { SpaceRole } from '@/types/collaborate';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string;
  roles: SpaceRole[];
}

interface SearchResult {
  id: string;
  full_name: string;
  username?: string;
  avatar_url?: string;
}

export function InviteMemberDialog({ open, onOpenChange, spaceId, roles }: InviteMemberDialogProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(5);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const inviteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) throw new Error('No user selected');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('space_members')
        .insert({
          space_id: spaceId,
          user_id: selectedUser.id,
          role_id: selectedRole || null,
          status: 'active',
          invited_by: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-members', spaceId] });
      toast.success('Member invited!');
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to invite member', { description: error.message });
    },
  });

  const resetForm = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setSelectedRole('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    inviteMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Search for a member</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
                placeholder="Search by name or username..."
                className="pl-10"
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && !selectedUser && (
              <div className="mt-2 border rounded-lg divide-y">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(user);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 text-left"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar_url || ''} />
                      <AvatarFallback>{user.full_name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{user.full_name}</p>
                      {user.username && (
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected User */}
          {selectedUser && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedUser.avatar_url || ''} />
                <AvatarFallback>{selectedUser.full_name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{selectedUser.full_name}</p>
                {selectedUser.username && (
                  <p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUser(null)}
              >
                Change
              </Button>
            </div>
          )}

          {/* Role Selection */}
          {roles.length > 0 && (
            <div>
              <Label>Assign a role (optional)</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedUser || inviteMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {inviteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Invite Member
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
