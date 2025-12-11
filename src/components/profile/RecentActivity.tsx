import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  UserPlus, 
  Heart, 
  MessageCircle, 
  BookOpen,
  Clock,
  ArrowRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'post' | 'story' | 'connection_sent' | 'connection_accepted' | 'like' | 'comment';
  title: string;
  description?: string;
  timestamp: string;
  linkTo?: string;
  icon: React.ReactNode;
  metadata?: {
    avatarUrl?: string;
    name?: string;
  };
}

export function RecentActivity() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: activities, isLoading } = useQuery({
    queryKey: ['recent-activity', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const activityItems: ActivityItem[] = [];

      // Fetch recent posts by user
      const { data: posts } = await supabase
        .from('posts')
        .select('id, content, post_type, created_at')
        .eq('author_id', user.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (posts) {
        posts.forEach(post => {
          const isStory = post.post_type === 'story';
          activityItems.push({
            id: `post-${post.id}`,
            type: isStory ? 'story' : 'post',
            title: isStory ? 'You shared a story' : 'You created a post',
            description: post.content?.substring(0, 80) + (post.content?.length > 80 ? '...' : ''),
            timestamp: post.created_at,
            linkTo: isStory ? `/dna/feed/story/${post.id}` : `/dna/feed`,
            icon: isStory ? <BookOpen className="h-4 w-4" /> : <FileText className="h-4 w-4" />,
          });
        });
      }

      // Fetch connection requests sent
      const { data: sentConnections } = await supabase
        .from('connections')
        .select(`
          id,
          status,
          created_at,
          recipient:profiles!connections_recipient_id_fkey(id, username, full_name, avatar_url)
        `)
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (sentConnections) {
        sentConnections.forEach(conn => {
          const recipient = conn.recipient as any;
          if (recipient) {
            activityItems.push({
              id: `conn-sent-${conn.id}`,
              type: 'connection_sent',
              title: conn.status === 'accepted' 
                ? `Connected with ${recipient.full_name || recipient.username}`
                : `Connection request sent to ${recipient.full_name || recipient.username}`,
              timestamp: conn.created_at,
              linkTo: `/dna/${recipient.username}`,
              icon: <UserPlus className="h-4 w-4" />,
              metadata: {
                avatarUrl: recipient.avatar_url,
                name: recipient.full_name || recipient.username,
              },
            });
          }
        });
      }

      // Fetch accepted connection requests (where user was recipient)
      const { data: acceptedConnections } = await supabase
        .from('connections')
        .select(`
          id,
          updated_at,
          requester:profiles!connections_requester_id_fkey(id, username, full_name, avatar_url)
        `)
        .eq('recipient_id', user.id)
        .eq('status', 'accepted')
        .order('updated_at', { ascending: false })
        .limit(5);

      if (acceptedConnections) {
        acceptedConnections.forEach(conn => {
          const requester = conn.requester as any;
          if (requester) {
            activityItems.push({
              id: `conn-accepted-${conn.id}`,
              type: 'connection_accepted',
              title: `${requester.full_name || requester.username} connected with you`,
              timestamp: conn.updated_at,
              linkTo: `/dna/${requester.username}`,
              icon: <UserPlus className="h-4 w-4" />,
              metadata: {
                avatarUrl: requester.avatar_url,
                name: requester.full_name || requester.username,
              },
            });
          }
        });
      }

      // Fetch recent likes on user's posts
      const { data: likes } = await supabase
        .from('post_likes')
        .select(`
          id,
          created_at,
          post_id,
          user:profiles!post_likes_user_id_fkey(id, username, full_name, avatar_url),
          post:posts!post_likes_post_id_fkey(id, author_id, content)
        `)
        .eq('post.author_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (likes) {
        likes.forEach(like => {
          const liker = like.user as any;
          const post = like.post as any;
          if (liker && post && liker.id !== user.id) {
            activityItems.push({
              id: `like-${like.id}`,
              type: 'like',
              title: `${liker.full_name || liker.username} liked your post`,
              description: post.content?.substring(0, 50) + '...',
              timestamp: like.created_at,
              linkTo: `/dna/feed`,
              icon: <Heart className="h-4 w-4 text-red-500" />,
              metadata: {
                avatarUrl: liker.avatar_url,
                name: liker.full_name || liker.username,
              },
            });
          }
        });
      }

      // Fetch recent comments on user's posts
      const { data: comments } = await supabase
        .from('post_comments')
        .select(`
          id,
          content,
          created_at,
          post_id,
          author:profiles!post_comments_author_id_fkey(id, username, full_name, avatar_url),
          post:posts!post_comments_post_id_fkey(id, author_id)
        `)
        .eq('post.author_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (comments) {
        comments.forEach(comment => {
          const commenter = comment.author as any;
          if (commenter && commenter.id !== user.id) {
            activityItems.push({
              id: `comment-${comment.id}`,
              type: 'comment',
              title: `${commenter.full_name || commenter.username} commented on your post`,
              description: comment.content?.substring(0, 50) + '...',
              timestamp: comment.created_at,
              linkTo: `/dna/feed`,
              icon: <MessageCircle className="h-4 w-4 text-blue-500" />,
              metadata: {
                avatarUrl: commenter.avatar_url,
                name: commenter.full_name || commenter.username,
              },
            });
          }
        });
      }

      // Sort all activities by timestamp (most recent first)
      activityItems.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Return only the 10 most recent
      return activityItems.slice(0, 10);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground font-medium">No activity yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start connecting, posting, and engaging to see your activity here
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/dna/feed')}
            >
              Go to Feed
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/dna/feed')}
        >
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map(activity => (
            <div 
              key={activity.id}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => activity.linkTo && navigate(activity.linkTo)}
            >
              {/* Icon or Avatar */}
              <div className="flex-shrink-0">
                {activity.metadata?.avatarUrl ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.metadata.avatarUrl} alt={activity.metadata.name} />
                    <AvatarFallback className="text-xs">
                      {activity.metadata.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    {activity.icon}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.title}</p>
                {activity.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {activity.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
