import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateOpportunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateOpportunityDialog: React.FC<CreateOpportunityDialogProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    type: 'volunteer' as 'investment' | 'volunteer' | 'partnership' | 'donation',
    requirements: '',
    location: '',
    external_link: '',
    org_id: '',
    skills_needed: [] as string[],
    causes: [] as string[],
    time_commitment_hours: 0,
    duration_months: 0,
  });

  const { data: organizations } = useQuery({
    queryKey: ['user-organizations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_user_id', user?.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: skills = [] } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('skills').select('id, name');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: causes = [] } = useQuery({
    queryKey: ['causes'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('causes').select('id, name');
      if (error) throw error;
      return data || [];
    },
  });

  const toggleSkill = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      skills_needed: prev.skills_needed.includes(skillId)
        ? prev.skills_needed.filter(id => id !== skillId)
        : [...prev.skills_needed, skillId]
    }));
  };

  const toggleCause = (causeId: string) => {
    setFormData(prev => ({
      ...prev,
      causes: prev.causes.includes(causeId)
        ? prev.causes.filter(id => id !== causeId)
        : [...prev.causes, causeId]
    }));
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('opportunities').insert({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        requirements: formData.requirements || null,
        location: formData.location || null,
        external_link: formData.external_link || null,
        org_id: formData.org_id || null,
        skills_needed: formData.skills_needed.length > 0 ? formData.skills_needed : null,
        causes: formData.causes.length > 0 ? formData.causes : null,
        time_commitment_hours: formData.time_commitment_hours || null,
        duration_months: formData.duration_months || null,
        created_by: user?.id,
        status: 'active',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Opportunity posted!',
        description: 'Your opportunity is now live on the marketplace.',
      });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      onOpenChange(false);
      setFormData({
        title: '',
        description: '',
        type: 'volunteer',
        requirements: '',
        location: '',
        external_link: '',
        org_id: '',
        skills_needed: [],
        causes: [],
        time_commitment_hours: 0,
        duration_months: 0,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create opportunity',
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post New Opportunity</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {organizations && organizations.length > 0 && (
            <div>
              <Label htmlFor="org">Organization (Optional)</Label>
              <Select value={formData.org_id} onValueChange={(value) => setFormData({ ...formData, org_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="title">Opportunity Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Volunteer Teachers Needed in Kenya"
            />
          </div>

          <div>
            <Label htmlFor="type">Opportunity Type *</Label>
            <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="volunteer">Volunteer</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="donation">Donation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the opportunity, impact, and what you're looking for"
              className="min-h-[120px]"
            />
          </div>

          <div>
            <Label>Required Skills</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map((skill: any) => (
                <Badge
                  key={skill.id}
                  variant={formData.skills_needed.includes(skill.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleSkill(skill.id)}
                >
                  {skill.name}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Impact Areas</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {causes.map((cause: any) => (
                <Badge
                  key={cause.id}
                  variant={formData.causes.includes(cause.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleCause(cause.id)}
                >
                  {cause.name}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="Skills, qualifications, or resources needed"
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time_commitment">Time Commitment (hours/week)</Label>
              <Input
                id="time_commitment"
                type="number"
                min="0"
                value={formData.time_commitment_hours}
                onChange={(e) => setFormData({ ...formData, time_commitment_hours: parseInt(e.target.value) || 0 })}
                placeholder="10"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (months)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                value={formData.duration_months}
                onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) || 0 })}
                placeholder="6"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, Country or 'Remote'"
            />
          </div>

          <div>
            <Label htmlFor="external_link">External Link</Label>
            <Input
              id="external_link"
              type="url"
              value={formData.external_link}
              onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
              placeholder="https://your-website.com/learn-more"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!formData.title.trim() || !formData.description.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? 'Posting...' : 'Post Opportunity'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOpportunityDialog;
