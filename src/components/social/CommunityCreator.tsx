
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useToast } from '@/hooks/use-toast';

const CommunityCreator: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: ''
  });

  const handleSubmit = async () => {
    if (!user || !formData.name || !formData.category) return;

    setLoading(true);
    try {
      toast({
        title: "Feature Coming Soon",
        description: "Community creation will be implemented in a future update",
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        category: ''
      });
    } catch (error) {
      console.error('Error creating community:', error);
      toast({
        title: "Error",
        description: "Failed to create community",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="community_name">Community Name</Label>
        <Input
          id="community_name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="African Tech Entrepreneurs"
        />
      </div>

      <div>
        <Label htmlFor="community_description">Description</Label>
        <Textarea
          id="community_description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your community's purpose and goals..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="community_category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Technology">Technology</SelectItem>
            <SelectItem value="Business">Business</SelectItem>
            <SelectItem value="Education">Education</SelectItem>
            <SelectItem value="Healthcare">Healthcare</SelectItem>
            <SelectItem value="Arts & Culture">Arts & Culture</SelectItem>
            <SelectItem value="Sports">Sports</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
            <SelectItem value="Agriculture">Agriculture</SelectItem>
            <SelectItem value="Environment">Environment</SelectItem>
            <SelectItem value="Social Impact">Social Impact</SelectItem>
            <SelectItem value="Professional Development">Professional Development</SelectItem>
            <SelectItem value="Regional">Regional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!formData.name || !formData.category || loading}
          className="bg-dna-emerald hover:bg-dna-forest text-white"
        >
          {loading ? "Creating..." : "Create Community"}
        </Button>
      </div>
    </div>
  );
};

export default CommunityCreator;
