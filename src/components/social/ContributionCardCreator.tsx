import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useContributionCards } from '@/hooks/useContributionCards';
import { useCleanSocialPosts } from '@/hooks/useCleanSocialPosts';

const ContributionCardCreator: React.FC = () => {
  const { createCard } = useContributionCards();
  const { createPost } = useCleanSocialPosts();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contribution_type: '',
    impact_area: '',
    location: '',
    amount_needed: '',
    target_date: ''
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.contribution_type) return;

    setLoading(true);
    try {
      const cardData = {
        ...formData,
        contribution_type: formData.contribution_type as 'funding' | 'skills' | 'time' | 'network' | 'advocacy' | 'mentorship' | 'resources',
        amount_needed: formData.amount_needed ? parseFloat(formData.amount_needed) : undefined,
        target_date: formData.target_date || undefined,
        status: 'active' as const
      };

      const newCard = await createCard(cardData);
      
      if (newCard) {
        // Also create a post about this contribution opportunity
        await createPost(
          `🚀 New contribution opportunity: ${formData.title}\n\n${formData.description}\n\n#ContributeToAfrica #${formData.contribution_type}`,
          'contribution_card'
        );
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        contribution_type: '',
        impact_area: '',
        location: '',
        amount_needed: '',
        target_date: ''
      });
    } catch (error) {
      console.error('Error creating contribution card:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Opportunity Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Solar panels for rural school"
          />
        </div>
        
        <div>
          <Label htmlFor="contribution_type">Contribution Type</Label>
          <Select
            value={formData.contribution_type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, contribution_type: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="funding">Funding</SelectItem>
              <SelectItem value="skills">Skills</SelectItem>
              <SelectItem value="time">Time</SelectItem>
              <SelectItem value="network">Network</SelectItem>
              <SelectItem value="advocacy">Advocacy</SelectItem>
              <SelectItem value="mentorship">Mentorship</SelectItem>
              <SelectItem value="resources">Resources</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the opportunity and its impact..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="impact_area">Impact Area</Label>
          <Input
            id="impact_area"
            value={formData.impact_area}
            onChange={(e) => setFormData(prev => ({ ...prev, impact_area: e.target.value }))}
            placeholder="Education, Health, Tech..."
          />
        </div>
        
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Lagos, Nigeria"
          />
        </div>

        <div>
          <Label htmlFor="amount_needed">Amount Needed ($)</Label>
          <Input
            id="amount_needed"
            type="number"
            value={formData.amount_needed}
            onChange={(e) => setFormData(prev => ({ ...prev, amount_needed: e.target.value }))}
            placeholder="5000"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="target_date">Target Date</Label>
          <Input
            id="target_date"
            type="date"
            value={formData.target_date}
            onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
          />
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={!formData.title || !formData.contribution_type || loading}
          className="bg-dna-emerald hover:bg-dna-forest text-white"
        >
          {loading ? "Creating..." : "Create Opportunity"}
        </Button>
      </div>
    </div>
  );
};

export default ContributionCardCreator;
