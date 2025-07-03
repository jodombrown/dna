import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/CleanAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, MapPin, DollarSign, X } from 'lucide-react';

interface JobCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated?: () => void;
}

const JobCreationDialog: React.FC<JobCreationDialogProps> = ({
  isOpen,
  onClose,
  onJobCreated
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    location: '',
    job_type: 'full-time',
    salary_range: '',
    application_url: '',
    application_email: ''
  });
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const jobTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' },
    { value: 'remote', label: 'Remote' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const jobData = {
        title: formData.title,
        company: formData.company,
        description: formData.description,
        requirements: formData.requirements,
        location: formData.location,
        job_type: formData.job_type,
        salary_range: formData.salary_range || null,
        application_url: formData.application_url || null,
        application_email: formData.application_email || null,
        tags: tags.length > 0 ? tags : null,
        posted_by: user.id,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      };

      const { error } = await supabase
        .from('job_posts')
        .insert(jobData);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Job posting created successfully",
      });

      // Reset form
      setFormData({
        title: '',
        company: '',
        description: '',
        requirements: '',
        location: '',
        job_type: 'full-time',
        salary_range: '',
        application_url: '',
        application_email: ''
      });
      setTags([]);
      setNewTag('');
      
      onJobCreated?.();
      onClose();
    } catch (error: any) {
      console.error('Error creating job posting:', error);
      toast({
        title: "Error",
        description: "Failed to create job posting",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-dna-copper" />
            Post a Job
          </DialogTitle>
          <DialogDescription>
            Share job opportunities with the diaspora community
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Senior Software Engineer"
                required
              />
            </div>

            <div>
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Acme Corporation"
                required
              />
            </div>

            <div>
              <Label htmlFor="location" className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="New York, NY or Remote"
              />
            </div>

            <div>
              <Label>Job Type</Label>
              <Select value={formData.job_type} onValueChange={(value) => setFormData({ ...formData, job_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="salary_range" className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Salary Range
              </Label>
              <Input
                id="salary_range"
                value={formData.salary_range}
                onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                placeholder="$80,000 - $120,000"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                rows={4}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="List the required skills, experience, and qualifications..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="application_url">Application URL</Label>
              <Input
                id="application_url"
                value={formData.application_url}
                onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
                placeholder="https://company.com/careers/apply"
              />
            </div>

            <div>
              <Label htmlFor="application_email">Application Email</Label>
              <Input
                id="application_email"
                type="email"
                value={formData.application_email}
                onChange={(e) => setFormData({ ...formData, application_email: e.target.value })}
                placeholder="jobs@company.com"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag and press Enter (e.g., Python, Remote, Startup)"
                  className="flex-1"
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-500"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title || !formData.company}
              className="bg-dna-copper hover:bg-dna-gold text-white"
            >
              {loading ? 'Posting...' : 'Post Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobCreationDialog;