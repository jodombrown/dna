import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Trash2, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Draft {
  id: string;
  content: string;
  media_url?: string;
  type: string;
  pillar: string;
  created_at: string;
  embed_metadata?: any;
}

export const DraftsView: React.FC = () => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case 'connect': return 'bg-dna-emerald text-white';
      case 'collaborate': return 'bg-dna-copper text-white';
      case 'contribute': return 'bg-dna-gold text-black';
      default: return 'bg-dna-forest text-white';
    }
  };

  const fetchDrafts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user.id)
        .eq('status', 'draft')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDrafts(data || []);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      toast({
        title: "Error",
        description: "Failed to load drafts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [user]);

  const handlePublish = async (draftId: string) => {
    setPublishing(draftId);
    try {
      const { error } = await supabase
        .from('posts')
        .update({ status: 'published' })
        .eq('id', draftId)
        .eq('author_id', user?.id);

      if (error) throw error;

      toast({
        title: "Draft published!",
        description: "Your draft has been published successfully.",
      });

      // Remove from drafts list
      setDrafts(prev => prev.filter(draft => draft.id !== draftId));
    } catch (error) {
      console.error('Error publishing draft:', error);
      toast({
        title: "Error",
        description: "Failed to publish draft.",
        variant: "destructive",
      });
    } finally {
      setPublishing(null);
    }
  };

  const handleDelete = async (draftId: string) => {
    setDeleting(draftId);
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', draftId)
        .eq('author_id', user?.id);

      if (error) throw error;

      toast({
        title: "Draft deleted",
        description: "Your draft has been deleted successfully.",
      });

      // Remove from drafts list
      setDrafts(prev => prev.filter(draft => draft.id !== draftId));
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast({
        title: "Error",
        description: "Failed to delete draft.",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-muted-foreground">Loading drafts...</span>
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No drafts found.</p>
          <p className="text-sm text-muted-foreground mt-2">Start writing a post and save it as a draft!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-xl">Your Drafts ({drafts.length})</CardTitle>
      </CardHeader>

      {drafts.map((draft) => (
        <Card key={draft.id} className="bg-background border-border">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
                <AvatarFallback className="bg-dna-forest text-white text-sm">
                  {user?.user_metadata?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getPillarColor(draft.pillar)}`}
                  >
                    {draft.pillar.charAt(0).toUpperCase() + draft.pillar.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Draft
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(draft.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {draft.content}
                </p>

                {draft.media_url && (
                  <div className="rounded-lg overflow-hidden border max-w-sm">
                    {draft.type === 'video' ? (
                      <video 
                        src={draft.media_url} 
                        controls
                        className="w-full h-auto max-h-48 object-cover"
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img 
                        src={draft.media_url} 
                        alt="Draft media" 
                        className="w-full h-auto max-h-48 object-cover"
                      />
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  
                  <Button
                    onClick={() => handlePublish(draft.id)}
                    disabled={publishing === draft.id}
                    size="sm"
                    className="gap-2 bg-dna-forest hover:bg-dna-forest/90"
                  >
                    {publishing === draft.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {publishing === draft.id ? 'Publishing...' : 'Publish'}
                  </Button>

                  <Button
                    onClick={() => handleDelete(draft.id)}
                    disabled={deleting === draft.id}
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    {deleting === draft.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    {deleting === draft.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};