
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare, Share, Hash } from 'lucide-react';
import { useCleanSocialPosts } from '@/hooks/useCleanSocialPosts';
import CleanPostCreator from './CleanPostCreator';
import { formatDistanceToNow } from 'date-fns';

const CleanSocialFeed: React.FC = () => {
  const { posts, loading } = useCleanSocialPosts();

  if (loading) {
    return (
      <div className="space-y-6">
        <CleanPostCreator />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CleanPostCreator />
      
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={post.author?.avatar_url} alt={post.author?.full_name} />
                  <AvatarFallback className="bg-dna-mint text-dna-forest">
                    {post.author?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {post.author?.full_name || 'Unknown User'}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {post.author?.profession && (
                        <>
                          <span>{post.author.profession}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{formatDistanceToNow(new Date(post.created_at))} ago</span>
                    </div>
                  </div>
                  
                  <div className="text-gray-900 whitespace-pre-wrap">
                    {post.content}
                  </div>
                  
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.hashtags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 text-sm text-dna-copper hover:text-dna-gold cursor-pointer"
                        >
                          <Hash className="w-3 h-3" />
                          {tag.replace('#', '')}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-6 pt-2 border-t">
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
                      <Heart className="w-4 h-4 mr-1" />
                      {post.likes_count}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {post.comments_count}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-500">
                      <Share className="w-4 h-4 mr-1" />
                      {post.shares_count}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {posts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 text-lg">No posts yet. Be the first to share something!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CleanSocialFeed;
