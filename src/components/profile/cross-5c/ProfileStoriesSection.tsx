import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface ProfileStoriesSectionProps {
  userId: string;
  limit?: number;
}

export const ProfileStoriesSection: React.FC<ProfileStoriesSectionProps> = ({ 
  userId, 
  limit = 5 
}) => {
  const navigate = useNavigate();

  const { data: stories, isLoading } = useQuery({
    queryKey: ['profile-stories', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          post_type,
          title,
          subtitle,
          content,
          created_at,
          slug,
          space_id,
          spaces (name)
        `)
        .eq('author_id', userId)
        .eq('post_type', 'story')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      // Map to expected shape
      return (data || []).map((item: any) => ({
        id: item.id,
        type: 'story',
        title: item.title,
        subtitle: item.subtitle,
        body: item.content,
        published_at: item.created_at,
        slug: item.slug,
        spaces: item.spaces,
      }));
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Stories & Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading stories...</div>
        </CardContent>
      </Card>
    );
  }

  if (!stories || stories.length === 0) {
    return null; // Hide section if no stories
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'story':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'update':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'impact':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getExcerpt = (body: string | null, maxLength: number = 120) => {
    if (!body) return '';
    const text = body.replace(/<[^>]*>/g, '').replace(/[#*`]/g, '');
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Stories & Highlights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stories.map((story: any) => (
            <div
              key={story.id}
              className="flex items-start justify-between p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
              onClick={() => navigate(`/dna/story/${story.slug}`)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className="font-semibold text-sm">{story.title}</h4>
                  <Badge className={`text-xs ${getTypeColor(story.type)}`}>
                    {story.type}
                  </Badge>
                  {story.spaces?.name && (
                    <Badge variant="outline" className="text-xs">
                      {story.spaces.name}
                    </Badge>
                  )}
                </div>
                {story.subtitle && (
                  <p className="text-xs text-muted-foreground mb-1">{story.subtitle}</p>
                )}
                {story.body && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {getExcerpt(story.body)}
                  </p>
                )}
                {story.published_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(story.published_at), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-2 flex-shrink-0" />
            </div>
          ))}

          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => navigate('/dna/convey')}
          >
            View all stories
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
