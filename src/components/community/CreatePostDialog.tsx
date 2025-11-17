import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { createCommunityPost, getUserCommunities } from '@/services/communityPostsService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated: () => void;
}

const CreatePostDialog: React.FC<CreatePostDialogProps> = ({
  open,
  onOpenChange,
  onPostCreated
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    community_id: '',
    post_type: 'update'
  });

  useEffect(() => {
    if (open && user) {
      loadUserCommunities();
    }
  }, [open, user]);

  const loadUserCommunities = async () => {
    if (!user) return;
    
    try {
      const userCommunities = await getUserCommunities(user.id);
      setCommunities(userCommunities);
    } catch (error) {
      console.error('Error loading communities:', error);
      toast({
        title: "Error",
        description: "Failed to load your communities",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim() || !formData.community_id) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await createCommunityPost({
        title: formData.title || undefined,
        content: formData.content,
        community_id: formData.community_id,
        post_type: formData.post_type
      });

      // Invalidate universal feed to show new community post
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });

      toast({
        title: "Success",
        description: "Your post has been created!",
      });

      // Reset form
      setFormData({
        title: '',
        content: '',
        community_id: '',
        post_type: 'update'
      });

      onPostCreated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share with the Community</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="community">Community *</Label>
            <Select
              value={formData.community_id}
              onValueChange={(value) => setFormData({ ...formData, community_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a community" />
              </SelectTrigger>
              <SelectContent>
                {communities.map((community) => (
                  <SelectItem key={community.id} value={community.id}>
                    {community.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="post_type">Post Type</Label>
            <Select
              value={formData.post_type}
              onValueChange={(value) => setFormData({ ...formData, post_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="discussion">Discussion</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="question">Question</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Add a title for your post..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="What would you like to share with the community?"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-dna-emerald hover:bg-dna-forest text-white"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Share Post
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;