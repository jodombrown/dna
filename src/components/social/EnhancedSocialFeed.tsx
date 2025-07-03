
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ThumbsUp, 
  Heart, 
  MessageCircle,
  Share,
  MoreHorizontal
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useCleanSocialPosts } from '@/hooks/useCleanSocialPosts';
import { useRichContent } from '@/hooks/useRichContent';
import { useAuth } from '@/contexts/CleanAuthContext';
import CleanPostCreator from '@/components/CleanPostCreator';
import RichContentCreator from './RichContentCreator';
import EventCard from './EventCard';
import InitiativeCard from './InitiativeCard';
import OpportunityCard from './OpportunityCard';
import FollowButton from '@/components/FollowButton';
import TagFollowButton from '@/components/TagFollowButton';

const EnhancedSocialFeed: React.FC = () => {
  const { user } = useAuth();
  const { posts, loading: postsLoading } = useCleanSocialPosts();
  const { richContent, loading: richLoading } = useRichContent();

  // Combine posts and rich content, then sort by date
  const allContent = React.useMemo(() => {
    const combined = [
      ...posts.map(post => ({ ...post, contentType: 'post' as const })),
      ...richContent.map(item => ({ ...item, contentType: 'rich' as const }))
    ];
    
    return combined.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [posts, richContent]);

  const loading = postsLoading || richLoading;

  const renderContent = (content: string) => {
    return content.split(/(\s+)/).map((word, index) => {
      if (word.startsWith('#')) {
        const tag = word.slice(1); // Remove the # symbol
        return (
          <div key={index} className="inline-flex items-center gap-1">
            <Badge variant="secondary" className="inline-block bg-dna-mint text-dna-forest">
              {word}
            </Badge>
            <TagFollowButton tag={tag} />
          </div>
        );
      }
      return word;
    });
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 mb-4">Sign in to see posts from the diaspora community</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Post Creator */}
      <CleanPostCreator />
      
      {/* Rich Content Creator */}
      <RichContentCreator />

      {/* Combined Feed */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Loading content...</p>
            </CardContent>
          </Card>
        ) : allContent.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to DNA!</h3>
              <p className="text-gray-500 text-lg">No content yet. Be the first to share something with the community!</p>
            </CardContent>
          </Card>
        ) : (
          allContent.map((item) => {
            if (item.contentType === 'post') {
              // Render regular post
              return (
                <Card key={`post-${item.id}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={item.author?.avatar_url} alt={item.author?.full_name} />
                          <AvatarFallback className="bg-dna-mint text-dna-forest">
                            {item.author?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">
                              {item.author?.display_name || item.author?.full_name || 'Community Member'}
                            </p>
                            {item.author?.id && item.author.id !== user.id && (
                              <FollowButton 
                                targetType="user" 
                                targetId={item.author.id} 
                                size="sm" 
                                variant="ghost"
                                showCount={false}
                              />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {item.author?.profession && `${item.author.profession} • `}
                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {renderContent(item.content)}
                      </p>
                    </div>

                    {item.image_url && (
                      <div className="mb-4">
                        <img 
                          src={item.image_url} 
                          alt="Post content" 
                          className="max-w-full h-auto rounded-lg border max-h-96 object-cover"
                        />
                      </div>
                    )}

                    {item.hashtags && item.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.hashtags.map((tag, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <Badge
                              variant="secondary"
                              className="bg-dna-mint text-dna-forest hover:bg-dna-emerald hover:text-white text-xs"
                            >
                              #{tag}
                            </Badge>
                            <TagFollowButton tag={tag} />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500 transition-colors">
                          <Heart className="w-4 h-4 mr-1" />
                          <span className="text-sm">{item.likes_count}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500 transition-colors">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm">{item.comments_count}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-500 transition-colors">
                          <Share className="w-4 h-4 mr-1" />
                          <span className="text-sm">{item.shares_count}</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            } else {
              // Render rich content with author info
              return (
                <Card key={`rich-${item.id}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    {/* Author header */}
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={item.author?.avatar_url} alt={item.author?.full_name} />
                        <AvatarFallback className="bg-dna-mint text-dna-forest">
                          {item.author?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">
                            {item.author?.full_name || 'Community Member'}
                          </p>
                          {item.author?.id && item.created_by !== user.id && (
                            <FollowButton 
                              targetType="user" 
                              targetId={item.created_by || item.author.id} 
                              size="sm" 
                              variant="ghost"
                              showCount={false}
                            />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {item.author?.professional_role && `${item.author.professional_role} • `}
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {/* Rich content card */}
                    <div className="mb-4">
                      {item.type === 'event' && (
                        <EventCard event={item.data} showInFeed={true} />
                      )}
                      {item.type === 'initiative' && (
                        <InitiativeCard initiative={item.data} showInFeed={true} />
                      )}
                      {item.type === 'opportunity' && (
                        <OpportunityCard opportunity={item.data} showInFeed={true} />
                      )}
                    </div>

                    {/* Interaction buttons */}
                    <div className="flex items-center gap-4 pt-4 border-t">
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4 mr-1" />
                        <span className="text-sm">0</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm">0</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-500 transition-colors">
                        <Share className="w-4 h-4 mr-1" />
                        <span className="text-sm">0</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            }
          })
        )}
      </div>
    </div>
  );
};

export default EnhancedSocialFeed;
