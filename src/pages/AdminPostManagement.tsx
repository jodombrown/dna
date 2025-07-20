import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopNav } from '@/components/admin/AdminTopNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Trash2, 
  Flag, 
  Calendar,
  MessageSquare,
  Heart,
  Share
} from 'lucide-react';
import { useRealtimeQuery } from '@/hooks/useRealtimeQuery';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import AdminAuthWrapper from '@/components/admin/AdminAuthWrapper';

interface AdminPost {
  id: string;
  content: string;
  pillar: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  media_url?: string;
  hashtags?: string[];
  visibility: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
    id: string;
  };
}

const AdminPostManagement = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [pillarFilter, setPillarFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');

  const { data: posts = [], loading, error, refetch } = useRealtimeQuery<AdminPost>('admin-posts', {
    table: 'posts',
    select: `
      *,
      profiles:author_id (
        full_name,
        avatar_url,
        id
      )
    `,
    orderBy: { column: 'created_at', ascending: false },
    limit: 50,
    enabled: true
  });

  // Filter posts based on search and filters
  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPillar = pillarFilter === 'all' || post.pillar === pillarFilter;
    const matchesVisibility = visibilityFilter === 'all' || post.visibility === visibilityFilter;
    
    return matchesSearch && matchesPillar && matchesVisibility;
  });

  const handleDeletePost = async (postId: string, postContent: string) => {
    if (!confirm(`Are you sure you want to delete this post? This action cannot be undone.\n\nPost: "${postContent.substring(0, 100)}..."`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Post Deleted",
        description: "The post has been deleted successfully.",
        variant: "destructive"
      });

      refetch();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete post",
        variant: "destructive"
      });
    }
  };

  const handleFlagPost = async (postId: string) => {
    try {
      // Create a content flag
      const { error } = await supabase
        .from('content_flags')
        .insert({
          content_id: postId,
          content_type: 'post',
          reason: 'admin_flagged',
          flagged_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Post Flagged",
        description: "The post has been flagged for review.",
      });
    } catch (error) {
      console.error('Error flagging post:', error);
      toast({
        title: "Flag Failed",
        description: error instanceof Error ? error.message : "Failed to flag post",
        variant: "destructive"
      });
    }
  };

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case 'connect':
        return 'bg-blue-100 text-blue-800';
      case 'collaborate':
        return 'bg-green-100 text-green-800';
      case 'contribute':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Calculate stats
  const totalPosts = posts.length;
  const connectPosts = posts.filter(p => p.pillar === 'connect').length;
  const collaboratePosts = posts.filter(p => p.pillar === 'collaborate').length;
  const contributePosts = posts.filter(p => p.pillar === 'contribute').length;

  return (
    <AdminAuthWrapper>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AdminSidebar />
          
          <div className="flex-1 flex flex-col">
            <AdminTopNav />
            
            <main className="flex-1 p-6 overflow-auto">
              {/* Page Header */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Post Management</h1>
                    <p className="text-gray-600">
                      Monitor, moderate, and manage all posts across the platform.
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refetch}
                      disabled={loading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                        <p className="text-2xl font-bold text-dna-forest">{totalPosts}</p>
                      </div>
                      <MessageSquare className="h-8 w-8 text-dna-emerald" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Connect Posts</p>
                        <p className="text-2xl font-bold text-dna-forest">{connectPosts}</p>
                      </div>
                      <Heart className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Collaborate Posts</p>
                        <p className="text-2xl font-bold text-dna-forest">{collaboratePosts}</p>
                      </div>
                      <Share className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Contribute Posts</p>
                        <p className="text-2xl font-bold text-dna-forest">{contributePosts}</p>
                      </div>
                      <Calendar className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filters */}
              <div className="mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search posts by content or author..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select value={pillarFilter} onValueChange={setPillarFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by pillar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Pillars</SelectItem>
                        <SelectItem value="connect">Connect</SelectItem>
                        <SelectItem value="collaborate">Collaborate</SelectItem>
                        <SelectItem value="contribute">Contribute</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Visibility</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Posts List */}
              <div className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="flex space-x-3">
                            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                      <p className="text-gray-500">
                        {searchQuery ? 
                          `No posts match "${searchQuery}". Try adjusting your search or filters.` :
                          "No posts available to display."
                        }
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredPosts.map((post) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={post.profiles?.avatar_url} />
                            <AvatarFallback className="bg-dna-emerald text-white">
                              {post.profiles?.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-gray-900">
                                  {post.profiles?.full_name || 'Unknown User'}
                                </p>
                                <Badge className={getPillarColor(post.pillar)}>
                                  {post.pillar}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {post.visibility}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFlagPost(post.id)}
                                  className="text-yellow-600 hover:text-yellow-700"
                                >
                                  <Flag className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePost(post.id, post.content)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <p className="text-gray-800 mb-3 line-clamp-3">{post.content}</p>
                            
                            {post.hashtags && post.hashtags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {post.hashtags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            {post.media_url && (
                              <div className="mb-3">
                                <img 
                                  src={post.media_url} 
                                  alt="Post media" 
                                  className="max-h-48 rounded-lg border"
                                />
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>{formatDate(post.created_at)}</span>
                              <span className="text-xs">ID: {post.id.substring(0, 8)}...</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminAuthWrapper>
  );
};

export default AdminPostManagement;