import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GroupCard } from '@/components/groups/GroupCard';
import { CreateGroupDialog } from '@/components/groups/CreateGroupDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { GroupListItem } from '@/types/groups';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Profile } from '@/services/profilesService';

interface DashboardGroupsColumnProps {
  profile: Profile;
  isOwnProfile: boolean;
}

type GroupFilter = 'all' | 'my_groups' | 'popular' | 'recommended';

export default function DashboardGroupsColumn({ profile, isOwnProfile }: DashboardGroupsColumnProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<GroupFilter>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: groups, refetch, isLoading } = useQuery({
    queryKey: ['groups', user?.id, activeTab, categoryFilter],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase.rpc('get_groups', {
        p_user_id: user.id,
        p_filter: activeTab,
        p_category: categoryFilter === 'all' ? null : categoryFilter,
        p_search: null,
        p_limit: 50,
        p_offset: 0,
      });

      if (error) throw error;
      return (data || []) as GroupListItem[];
    },
    enabled: !!user,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('groups_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'groups',
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, refetch]);

  const filteredGroups = groups?.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Groups</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Connect with communities that share your interests
          </p>
        </div>
        {isOwnProfile && (
          <Button
            onClick={() => setShowCreateDialog(true)}
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <Tabs 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as GroupFilter)}
        >
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="my_groups">My Groups</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="culture">Culture & Arts</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="health">Health & Wellness</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="regional">Regional</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Groups Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading groups...
        </div>
      ) : filteredGroups && filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredGroups.map((group) => (
            <GroupCard key={group.group_id} group={group} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-base font-semibold mb-1">
            {searchQuery ? 'No groups found' : 'No groups yet'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery
              ? 'Try a different search term'
              : activeTab === 'my_groups'
              ? "You haven't joined any groups yet"
              : 'Be the first to create a community!'}
          </p>
          {!searchQuery && isOwnProfile && (
            <Button
              onClick={() => setShowCreateDialog(true)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          )}
        </div>
      )}

      {isOwnProfile && (
        <CreateGroupDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          currentUserId={user?.id || ''}
          onSuccess={(slug) => {
            refetch();
            navigate(`/dna/convene/groups/${slug}`);
          }}
        />
      )}
    </div>
  );
}
