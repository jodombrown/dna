import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, MessageCircle, Heart, Share2, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  community: {
    name: string;
    category: string;
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  timestamp: string;
  tags: string[];
}

const CommunityFeed = () => {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for now - this will be replaced with real data from Supabase
  useEffect(() => {
    const mockPosts: CommunityPost[] = [
      {
        id: '1',
        title: 'New Tech Hub Opening in Lagos',
        content: 'Excited to announce our new innovation center! Looking for partnerships with African diaspora tech professionals.',
        author: {
          name: 'Adaora Okonkwo',
          avatar: '',
          role: 'Community Leader'
        },
        community: {
          name: 'African Tech Network',
          category: 'Technology'
        },
        engagement: {
          likes: 24,
          comments: 8,
          shares: 5
        },
        timestamp: '2 hours ago',
        tags: ['Technology', 'Innovation', 'Nigeria']
      },
      {
        id: '2',
        title: 'Cultural Exchange Program',
        content: 'Join our cultural exchange initiative connecting diaspora youth with local communities across Africa.',
        author: {
          name: 'Kwame Asante',
          avatar: '',
          role: 'Program Director'
        },
        community: {
          name: 'Pan-African Culture',
          category: 'Culture'
        },
        engagement: {
          likes: 18,
          comments: 12,
          shares: 7
        },
        timestamp: '4 hours ago',
        tags: ['Culture', 'Youth', 'Exchange']
      },
      {
        id: '3',
        title: 'Investment Opportunities in Renewable Energy',
        content: 'Seeking diaspora investors for solar energy projects across West Africa. Great returns and positive impact.',
        author: {
          name: 'Fatima Al-Hassan',
          avatar: '',
          role: 'Investment Coordinator'
        },
        community: {
          name: 'Sustainable Africa',
          category: 'Environment'
        },
        engagement: {
          likes: 31,
          comments: 15,
          shares: 9
        },
        timestamp: '6 hours ago',
        tags: ['Investment', 'Renewable Energy', 'West Africa']
      }
    ];

    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreatePost = () => {
    // This will open a create post dialog/modal
    console.log('Create new post');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback>
                {profile?.display_name?.charAt(0) || profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <Button 
              variant="outline" 
              className="flex-1 justify-start text-gray-500"
              onClick={handleCreatePost}
            >
              Share an update with the community...
            </Button>
            <Button size="sm" className="bg-dna-emerald hover:bg-dna-forest text-white">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>
                      {post.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{post.author.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {post.author.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{post.community.name}</span>
                      <span>•</span>
                      <span>{post.timestamp}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {post.community.category}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-gray-700 text-sm">{post.content}</p>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <Heart className="w-4 h-4 mr-1" />
                      {post.engagement.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {post.engagement.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <Share2 className="w-4 h-4 mr-1" />
                      {post.engagement.shares}
                    </Button>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CommunityFeed;