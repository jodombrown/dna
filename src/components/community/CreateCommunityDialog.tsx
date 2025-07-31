
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { CreateCommunityData } from '@/types/community';

interface CreateCommunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCommunity: (data: CreateCommunityData) => Promise<any>;
  trigger?: React.ReactNode;
}

const CATEGORIES = [
  'Technology',
  'Business',
  'Healthcare',
  'Education',
  'Arts & Culture',
  'Sports',
  'Finance',
  'Agriculture',
  'Environment',
  'Social Impact',
  'Professional Development',
  'Regional'
];

const CreateCommunityDialog: React.FC<CreateCommunityDialogProps> = ({
  open,
  onOpenChange,
  onCreateCommunity,
  trigger
}) => {
  const [formData, setFormData] = useState<CreateCommunityData>({
    name: '',
    description: '',
    purpose_goals: '',
    category: '',
    tags: [],
    cover_image_url: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    const result = await onCreateCommunity(formData);
    
    if (result) {
      setFormData({
        name: '',
        description: '',
        purpose_goals: '',
        category: '',
        tags: [],
        cover_image_url: ''
      });
      setTagInput('');
      onOpenChange(false);
    }
    setLoading(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Community</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Community Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="African Health Innovators"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Short Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of your community..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="purpose_goals">Purpose & Goals</Label>
            <Textarea
              id="purpose_goals"
              value={formData.purpose_goals}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose_goals: e.target.value }))}
              placeholder="What does this community aim to achieve?"
              rows={3}
            />
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add tags..."
                className="flex-1"
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="cover_image">Cover Image URL (Optional)</Label>
            <Input
              id="cover_image"
              value={formData.cover_image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, cover_image_url: e.target.value }))}
              placeholder="https://example.com/image.jpg"
              type="url"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.name.trim() || loading}
              className="bg-dna-emerald hover:bg-dna-forest text-white"
            >
              {loading ? "Creating..." : "Create Community"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCommunityDialog;
