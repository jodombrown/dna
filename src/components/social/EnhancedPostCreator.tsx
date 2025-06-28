
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Send, 
  Hash, 
  Calendar,
  Users,
  DollarSign,
  FileText,
  Image,
  Smile
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import ContributionCardCreator from './ContributionCardCreator';
import EventCreator from './EventCreator';
import CommunityCreator from './CommunityCreator';

const EnhancedPostCreator: React.FC = () => {
  const { user } = useAuth();
  const { createPost } = useSocialPosts();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('post');

  const handleSubmit = async () => {
    if (!user || !content.trim()) return;

    setLoading(true);
    try {
      await createPost(content.trim(), 'text');
      setContent('');
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Please sign in to share with the community.</p>
        </CardContent>
      </Card>
    );
  }

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    return text.match(hashtagRegex) || [];
  };

  const hashtagCount = extractHashtags(content).length;

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="post" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Post
            </TabsTrigger>
            <TabsTrigger value="event" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Event
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="contribution" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Opportunity
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Newsletter
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="post" className="mt-6">
            <div className="flex gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user.user_metadata?.avatar_url} alt="Your profile" />
                <AvatarFallback className="bg-dna-mint text-dna-forest">
                  {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts, achievements, or connect with the diaspora community..."
                  rows={4}
                  maxLength={500}
                  className="resize-none border-0 shadow-none focus:ring-0 focus:border-0 p-0 text-lg placeholder:text-gray-400"
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{content.length}/500</span>
                    {hashtagCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Hash className="w-4 h-4" />
                        {hashtagCount} hashtag{hashtagCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Image className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Smile className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!content.trim() || loading}
                      className="bg-dna-copper hover:bg-dna-gold text-white"
                    >
                      {loading ? (
                        "Posting..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Share
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="event" className="mt-6">
            <EventCreator />
          </TabsContent>
          
          <TabsContent value="community" className="mt-6">
            <CommunityCreator />
          </TabsContent>
          
          <TabsContent value="contribution" className="mt-6">
            <ContributionCardCreator />
          </TabsContent>
          
          <TabsContent value="newsletter" className="mt-6">
            <div className="text-center py-8 text-gray-500">
              Newsletter creation coming soon...
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedPostCreator;
