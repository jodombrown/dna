import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { ContributionFormData } from '@/types/projectTypes';
import { useToast } from '@/hooks/use-toast';

interface ContributionFormProps {
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ContributionForm: React.FC<ContributionFormProps> = ({
  projectId,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ContributionFormData>({
    contribution_type: 'interest',
    message: ''
  });

  const contributionTypes = [
    { value: 'interest', label: 'General Interest' },
    { value: 'time', label: 'Time & Volunteer Work' },
    { value: 'skills', label: 'Skills & Expertise' },
    { value: 'funding', label: 'Financial Support' }
  ];

  const timeCommitments = [
    'A few hours per week',
    'Half day per week',
    'One day per week',
    'A few days per week',
    'Full time',
    'Project-based'
  ];

  const skillOptions = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Data Analysis',
    'Project Management',
    'Marketing',
    'Content Writing',
    'Business Strategy',
    'Legal Advice',
    'Financial Planning'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      toast({
        title: "Error",
        description: "Please provide a message explaining your interest",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('project_contributions')
        .insert({
          project_id: projectId,
          contributor_id: user.user.id,
          contribution_type: formData.contribution_type,
          time_commitment: formData.time_commitment,
          skills_offered: formData.skills_offered,
          funding_interest: formData.funding_interest,
          message: formData.message,
          status: 'pending'
        });

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error('Error submitting contribution:', error);
      toast({
        title: "Error",
        description: "Failed to submit contribution",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>How would you like to contribute?</Label>
        <Select 
          value={formData.contribution_type} 
          onValueChange={(value: any) => setFormData(prev => ({ ...prev, contribution_type: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {contributionTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.contribution_type === 'time' && (
        <div className="space-y-2">
          <Label>Time Commitment</Label>
          <Select 
            value={formData.time_commitment || ''} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, time_commitment: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your availability" />
            </SelectTrigger>
            <SelectContent>
              {timeCommitments.map((commitment) => (
                <SelectItem key={commitment} value={commitment}>
                  {commitment}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.contribution_type === 'skills' && (
        <div className="space-y-2">
          <Label>Your Skills</Label>
          <div className="grid grid-cols-2 gap-2">
            {skillOptions.map((skill) => (
              <div key={skill} className="flex items-center space-x-2">
                <Checkbox
                  id={skill}
                  checked={formData.skills_offered?.includes(skill) || false}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData(prev => ({
                        ...prev,
                        skills_offered: [...(prev.skills_offered || []), skill]
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        skills_offered: prev.skills_offered?.filter(s => s !== skill) || []
                      }));
                    }
                  }}
                />
                <Label htmlFor={skill} className="text-sm">{skill}</Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {formData.contribution_type === 'funding' && (
        <div className="space-y-2">
          <Label>Potential Funding Amount (USD)</Label>
          <Input
            type="number"
            placeholder="Enter amount you might consider contributing"
            value={formData.funding_interest || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              funding_interest: e.target.value ? parseFloat(e.target.value) : undefined 
            }))}
          />
          <p className="text-xs text-muted-foreground">
            This is just an estimate to help the project owner understand potential support.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          placeholder="Tell the project owner about your interest, relevant experience, or how you'd like to help..."
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          rows={4}
          required
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Contribution'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ContributionForm;