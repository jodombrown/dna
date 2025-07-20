import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CommunityCreationDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const COMMUNITY_CATEGORIES = [
  'Technology',
  'Healthcare',
  'Business',
  'Education',
  'Arts & Culture',
  'Sports & Recreation',
  'Social Impact',
  'Professional Development',
  'Research & Academia',
  'Government & Policy'
];

const SUGGESTED_TAGS = [
  'networking', 'mentorship', 'innovation', 'leadership', 'entrepreneurship',
  'development', 'collaboration', 'impact', 'growth', 'learning',
  'community', 'professional', 'career', 'startup', 'investment'
];

const CommunityCreationDialog: React.FC<CommunityCreationDialogProps> = ({ trigger, onSuccess }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    purpose_goals: '',
    tags: [] as string[]
  });

  const createCommunityMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: community, error } = await supabase
        .from('communities')
        .insert([{
          ...data,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          is_active: true,
          member_count: 1
        }])
        .select()
        .single();

      if (error) throw error;
      return community;
    },
    onSuccess: (community) => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      setIsOpen(false);
      setFormData({
        name: '',
        description: '',
        category: '',
        purpose_goals: '',
        tags: []
      });
      toast({
        title: "Community Created!",
        description: `${community.name} has been created successfully.`,
      });
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Community creation error:', error);
      toast({
        title: "Creation Failed",
        description: "Unable to create community. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      addTag(currentTag);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim() || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    createCommunityMutation.mutate(formData);
  };

  const defaultTrigger = (
    <Button className="bg-dna-emerald hover:bg-dna-forest text-white">
      <Plus className="h-4 w-4 mr-2" />
      Create Community
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-dna-emerald" />
            Create New Community
          </DialogTitle>
          <DialogDescription>
            Build a space for collaboration and connection around shared interests or goals.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Community Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Community Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., African Tech Leaders"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Briefly describe what your community is about..."
              className="min-h-[80px]"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {COMMUNITY_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Purpose & Goals */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose & Goals</Label>
            <Textarea
              id="purpose"
              value={formData.purpose_goals}
              onChange={(e) => handleInputChange('purpose_goals', e.target.value)}
              placeholder="What are the main goals and objectives of this community?"
              className="min-h-[60px]"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (up to 5)</Label>
            <div className="space-y-2">
              <Input
                id="tags"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Type a tag and press Enter"
                disabled={formData.tags.length >= 5}
              />
              
              {/* Current Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-dna-mint text-dna-forest">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Suggested Tags */}
              {formData.tags.length < 5 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Suggested tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {SUGGESTED_TAGS.filter(tag => !formData.tags.includes(tag)).slice(0, 8).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createCommunityMutation.isPending}
              className="w-full sm:w-auto bg-dna-emerald hover:bg-dna-forest text-white"
            >
              {createCommunityMutation.isPending ? 'Creating...' : 'Create Community'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityCreationDialog;