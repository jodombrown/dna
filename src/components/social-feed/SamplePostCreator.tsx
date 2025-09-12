import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const SAMPLE_POSTS = [
  {
    content: "🎯 Just launched a new initiative to connect diaspora entrepreneurs with African startups! Looking for mentors and partners who share our vision of building sustainable bridges between continents. #DiasporaInnovation #AfricaRising",
    type: 'text',
    pillar: 'connect',
    visibility: 'public',
    status: 'published'
  },
  {
    content: "💡 Collaborative opportunity: Building a fintech solution for cross-border payments between diaspora communities and home countries. We need blockchain developers, regulatory experts, and community ambassadors. Who's interested in joining forces? 🤝",
    type: 'text', 
    pillar: 'collaborate',
    visibility: 'public',
    status: 'published'
  },
  {
    content: "🌍 Contributing to education infrastructure in Kenya through our tech skills program. Over 200 students now have access to coding bootcamps and mentorship. This is what meaningful impact looks like! Share your contribution stories below. 👇",
    type: 'text',
    pillar: 'contribute', 
    visibility: 'public',
    status: 'published'
  },
  {
    content: "📈 Exciting news! Our agricultural tech startup just secured Series A funding to expand operations across 5 African countries. Thank you to everyone in the DNA network who supported us through connections, advice, and partnerships. Community wins! 🎉",
    type: 'text',
    pillar: 'connect',
    visibility: 'public', 
    status: 'published'
  },
  {
    content: "🤔 Question for the community: What are the biggest challenges you face when trying to invest in African markets from the diaspora? Let's discuss solutions and share resources that have worked for you.",
    type: 'text',
    pillar: 'collaborate',
    visibility: 'public',
    status: 'published'
  }
];

export const SamplePostCreator: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const createSamplePosts = async () => {
    if (!user) {
      toast({
        title: "Authentication required", 
        description: "Please log in to create sample posts",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    let successCount = 0;

    try {
      for (const post of SAMPLE_POSTS) {
        try {
          const { data: postId, error } = await supabase.rpc('rpc_create_post', { p: post });
          
          if (error) {
            console.error('Error creating sample post:', error);
            continue;
          }
          
          successCount++;
          setCreatedCount(successCount);
          
          // Small delay between posts to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          console.error('Sample post creation failed:', err);
        }
      }

      toast({
        title: "Sample posts created!",
        description: `Successfully created ${successCount} sample posts for testing the social feed.`,
      });

    } catch (error) {
      console.error('Batch post creation error:', error);
      toast({
        title: "Error creating sample posts",
        description: "Some posts may have failed to create. Check the console for details.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-muted">
      <CardHeader className="pb-3">
        <CardTitle className="text-center text-muted-foreground text-sm sm:text-base">Development Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <p className="text-xs sm:text-sm text-muted-foreground text-center">
          Create sample posts to test the social feed functionality
        </p>
        <div className="text-center">
          <Button 
            onClick={createSamplePosts}
            disabled={isCreating}
            variant="outline"
            className="w-full text-xs sm:text-sm"
            size="sm"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating posts... ({createdCount}/{SAMPLE_POSTS.length})
              </>
            ) : (
              'Create Sample Posts'
            )}
          </Button>
        </div>
        {createdCount > 0 && (
          <p className="text-xs text-green-600 text-center">
            {createdCount} posts created successfully
          </p>
        )}
      </CardContent>
    </Card>
  );
};