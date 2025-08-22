import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Plus, 
  Users, 
  FolderOpen, 
  Calendar, 
  CheckSquare, 
  MessageSquare,
  Settings,
  UserPlus,
  Crown,
  Shield
} from 'lucide-react';

interface CollaborationSpace {
  id: string;
  title: string;
  description: string;
  visibility: string;
  status: string;
  created_by: string;
  created_at: string;
  tags: string[];
  image_url?: string;
  member_count?: number;
}

interface SpaceMember {
  id: string;
  user_id: string;
  role: string;
  status: string;
  joined_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
    username: string;
  };
}

const CollaborationSpaces = () => {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<CollaborationSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<CollaborationSpace | null>(null);
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const [newSpace, setNewSpace] = useState({
    title: '',
    description: '',
    visibility: 'private',
    tags: [] as string[]
  });

  useEffect(() => {
    if (user) {
      fetchSpaces();
    }
  }, [user]);

  const fetchSpaces = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('collaboration_spaces')
        .select(`
          *,
          collaboration_memberships!inner (
            user_id,
            role,
            status
          )
        `)
        .eq('collaboration_memberships.user_id', user.id)
        .eq('collaboration_memberships.status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSpaces(data || []);
    } catch (error) {
      console.error('Error fetching spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpaceMembers = async (spaceId: string) => {
    try {
      // First get the memberships
      const { data: memberships, error: membershipError } = await supabase
        .from('collaboration_memberships')
        .select('id, user_id, role, status, joined_at')
        .eq('space_id', spaceId)
        .eq('status', 'approved');

      if (membershipError) throw membershipError;

      if (!memberships || memberships.length === 0) {
        setMembers([]);
        return;
      }

      // Then get the profiles for those users
      const userIds = memberships.map(m => m.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, username')
        .in('id', userIds);

      if (profileError) throw profileError;

      // Combine the data
      const memberData = memberships.map(membership => {
        const profile = profiles?.find(p => p.id === membership.user_id);
        return {
          ...membership,
          profiles: profile || {
            full_name: 'Unknown User',
            avatar_url: '',
            username: 'unknown'
          }
        };
      });

      setMembers(memberData as SpaceMember[]);
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers([]);
    }
  };

  const createSpace = async () => {
    if (!user || !newSpace.title.trim()) return;

    try {
      // Create the space
      const { data: spaceData, error: spaceError } = await supabase
        .from('collaboration_spaces')
        .insert({
          title: newSpace.title,
          description: newSpace.description,
          visibility: newSpace.visibility,
          tags: newSpace.tags,
          created_by: user.id
        })
        .select()
        .single();

      if (spaceError) throw spaceError;

      // Add creator as owner
      const { error: memberError } = await supabase
        .from('collaboration_memberships')
        .insert({
          space_id: spaceData.id,
          user_id: user.id,
          role: 'owner',
          status: 'approved'
        });

      if (memberError) throw memberError;

      setCreateDialogOpen(false);
      setNewSpace({ title: '', description: '', visibility: 'private', tags: [] });
      fetchSpaces();
      toast.success('Collaboration space created successfully');
    } catch (error) {
      console.error('Error creating space:', error);
      toast.error('Failed to create collaboration space');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />;
      default: return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const SpaceCard = ({ space }: { space: CollaborationSpace }) => (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => {
        setSelectedSpace(space);
        fetchSpaceMembers(space.id);
      }}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{space.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {space.description || 'No description provided'}
            </p>
          </div>
          <Badge variant={space.visibility === 'public' ? 'default' : 'secondary'}>
            {space.visibility}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{space.member_count || 0} members</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {space.tags?.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {(space.tags?.length || 0) > 2 && (
              <Badge variant="outline" className="text-xs">
                +{(space.tags?.length || 0) - 2}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Collaboration Spaces</h2>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Create Space
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Collaboration Spaces</h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Space
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collaboration Space</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Space Name</Label>
                <Input
                  id="title"
                  value={newSpace.title}
                  onChange={(e) => setNewSpace(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter space name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newSpace.description}
                  onChange={(e) => setNewSpace(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose of this space"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="visibility">Visibility</Label>
                <Select 
                  value={newSpace.visibility} 
                  onValueChange={(value) => setNewSpace(prev => ({ ...prev, visibility: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createSpace} disabled={!newSpace.title.trim()}>
                  Create Space
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {selectedSpace ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{selectedSpace.title}</CardTitle>
                <p className="text-muted-foreground">{selectedSpace.description}</p>
              </div>
              <Button variant="outline" onClick={() => setSelectedSpace(null)}>
                Back to Spaces
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">{members.length}</p>
                      <p className="text-sm text-muted-foreground">Members</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <CheckSquare className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-muted-foreground">Active Tasks</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <FolderOpen className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-muted-foreground">Files</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="members" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Space Members</h3>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Members
                  </Button>
                </div>
                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={member.profiles?.avatar_url} />
                          <AvatarFallback>
                            {member.profiles?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.profiles?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            @{member.profiles?.username}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(member.role)}
                        <Badge variant="outline">{member.role}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="tasks" className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks yet</p>
                  <p className="text-sm">Create your first task to get started</p>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="files" className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No files shared yet</p>
                  <p className="text-sm">Upload files to share with your team</p>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No collaboration spaces yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first space to start collaborating with others
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Space
                </Button>
              </CardContent>
            </Card>
          ) : (
            spaces.map((space) => (
              <SpaceCard key={space.id} space={space} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CollaborationSpaces;