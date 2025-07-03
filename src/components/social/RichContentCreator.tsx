
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Lightbulb, Briefcase, Plus, X } from 'lucide-react';
import { useAuth } from '@/contexts/CleanAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const RichContentCreator: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('event');
  const [loading, setLoading] = useState(false);
  
  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    date_time: '',
    location: '',
    description: '',
    tags: [] as string[],
    newTag: ''
  });
  
  // Initiative form state
  const [initiativeForm, setInitiativeForm] = useState({
    title: '',
    description: '',
    impact_area: '',
  });
  
  // Opportunity form state
  const [opportunityForm, setOpportunityForm] = useState({
    title: '',
    role_type: '',
    organization: '',
    location: '',
    deadline: '',
    description: '',
    tags: [] as string[],
    newTag: ''
  });

  const addTag = (formType: 'event' | 'opportunity', tag: string) => {
    if (!tag.trim()) return;
    
    if (formType === 'event') {
      setEventForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()],
        newTag: ''
      }));
    } else {
      setOpportunityForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()],
        newTag: ''
      }));
    }
  };

  const removeTag = (formType: 'event' | 'opportunity', index: number) => {
    if (formType === 'event') {
      setEventForm(prev => ({
        ...prev,
        tags: prev.tags.filter((_, i) => i !== index)
      }));
    } else {
      setOpportunityForm(prev => ({
        ...prev,
        tags: prev.tags.filter((_, i) => i !== index)
      }));
    }
  };

  const handleEventSubmit = async () => {
    if (!user || !eventForm.title.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('events')
        .insert({
          title: eventForm.title.trim(),
          date_time: eventForm.date_time || null,
          location: eventForm.location || null,
          description: eventForm.description || null,
          tags: eventForm.tags.length > 0 ? eventForm.tags : null,
          created_by: user.id
        });

      if (error) throw error;

      setEventForm({
        title: '',
        date_time: '',
        location: '',
        description: '',
        tags: [],
        newTag: ''
      });
      
      toast({
        title: "Event Created!",
        description: "Your event has been shared with the community.",
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInitiativeSubmit = async () => {
    if (!user || !initiativeForm.title.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('initiatives')
        .insert({
          title: initiativeForm.title.trim(),
          description: initiativeForm.description || null,
          impact_area: initiativeForm.impact_area || null,
          creator_id: user.id
        });

      if (error) throw error;

      setInitiativeForm({
        title: '',
        description: '',
        impact_area: '',
      });
      
      toast({
        title: "Initiative Created!",
        description: "Your initiative has been shared with the community.",
      });
    } catch (error) {
      console.error('Error creating initiative:', error);
      toast({
        title: "Error",
        description: "Failed to create initiative. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpportunitySubmit = async () => {
    if (!user || !opportunityForm.title.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('opportunities')
        .insert({
          title: opportunityForm.title.trim(),
          role_type: opportunityForm.role_type || null,
          organization: opportunityForm.organization || null,
          location: opportunityForm.location || null,
          deadline: opportunityForm.deadline || null,
          description: opportunityForm.description || null,
          tags: opportunityForm.tags.length > 0 ? opportunityForm.tags : null,
          created_by: user.id
        });

      if (error) throw error;

      setOpportunityForm({
        title: '',
        role_type: '',
        organization: '',
        location: '',
        deadline: '',
        description: '',
        tags: [],
        newTag: ''
      });
      
      toast({
        title: "Opportunity Created!",
        description: "Your opportunity has been shared with the community.",
      });
    } catch (error) {
      console.error('Error creating opportunity:', error);
      toast({
        title: "Error",
        description: "Failed to create opportunity. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Sign in to create rich content</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="event" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Event
            </TabsTrigger>
            <TabsTrigger value="initiative" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Initiative
            </TabsTrigger>
            <TabsTrigger value="opportunity" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Opportunity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="event" className="space-y-4">
            <div>
              <Label htmlFor="event-title">Event Title *</Label>
              <Input
                id="event-title"
                value={eventForm.title}
                onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter event title"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-date">Date & Time</Label>
                <Input
                  id="event-date"
                  type="datetime-local"
                  value={eventForm.date_time}
                  onChange={(e) => setEventForm(prev => ({ ...prev, date_time: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="event-location">Location</Label>
                <Input
                  id="event-location"
                  value={eventForm.location}
                  onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Event location"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                value={eventForm.description}
                onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Event description"
                rows={3}
              />
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={eventForm.newTag}
                  onChange={(e) => setEventForm(prev => ({ ...prev, newTag: e.target.value }))}
                  placeholder="Add a tag"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag('event', eventForm.newTag);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTag('event', eventForm.newTag)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {eventForm.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeTag('event', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleEventSubmit}
              disabled={!eventForm.title.trim() || loading}
              className="w-full bg-dna-copper hover:bg-dna-gold text-white"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </TabsContent>

          <TabsContent value="initiative" className="space-y-4">
            <div>
              <Label htmlFor="initiative-title">Initiative Title *</Label>
              <Input
                id="initiative-title"
                value={initiativeForm.title}
                onChange={(e) => setInitiativeForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter initiative title"
              />
            </div>
            
            <div>
              <Label htmlFor="initiative-impact">Impact Area</Label>
              <Input
                id="initiative-impact"
                value={initiativeForm.impact_area}
                onChange={(e) => setInitiativeForm(prev => ({ ...prev, impact_area: e.target.value }))}
                placeholder="e.g., Education, Healthcare, Economic Development"
              />
            </div>

            <div>
              <Label htmlFor="initiative-description">Summary</Label>
              <Textarea
                id="initiative-description"
                value={initiativeForm.description}
                onChange={(e) => setInitiativeForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your initiative and call to action"
                rows={4}
              />
            </div>

            <Button 
              onClick={handleInitiativeSubmit}
              disabled={!initiativeForm.title.trim() || loading}
              className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
            >
              {loading ? 'Creating...' : 'Create Initiative'}
            </Button>
          </TabsContent>

          <TabsContent value="opportunity" className="space-y-4">
            <div>
              <Label htmlFor="opportunity-title">Opportunity Title *</Label>
              <Input
                id="opportunity-title"
                value={opportunityForm.title}
                onChange={(e) => setOpportunityForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter opportunity title"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="opportunity-role">Role Type</Label>
                <Input
                  id="opportunity-role"
                  value={opportunityForm.role_type}
                  onChange={(e) => setOpportunityForm(prev => ({ ...prev, role_type: e.target.value }))}
                  placeholder="e.g., Full-time, Contract, Volunteer"
                />
              </div>
              <div>
                <Label htmlFor="opportunity-org">Organization</Label>
                <Input
                  id="opportunity-org"
                  value={opportunityForm.organization}
                  onChange={(e) => setOpportunityForm(prev => ({ ...prev, organization: e.target.value }))}
                  placeholder="Organization name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="opportunity-location">Location</Label>
                <Input
                  id="opportunity-location"
                  value={opportunityForm.location}
                  onChange={(e) => setOpportunityForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Location or Remote"
                />
              </div>
              <div>
                <Label htmlFor="opportunity-deadline">Deadline</Label>
                <Input
                  id="opportunity-deadline"
                  type="date"
                  value={opportunityForm.deadline}
                  onChange={(e) => setOpportunityForm(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="opportunity-description">Description</Label>
              <Textarea
                id="opportunity-description"
                value={opportunityForm.description}
                onChange={(e) => setOpportunityForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Opportunity description and requirements"
                rows={3}
              />
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={opportunityForm.newTag}
                  onChange={(e) => setOpportunityForm(prev => ({ ...prev, newTag: e.target.value }))}
                  placeholder="Add a tag"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag('opportunity', opportunityForm.newTag);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTag('opportunity', opportunityForm.newTag)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {opportunityForm.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeTag('opportunity', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleOpportunitySubmit}
              disabled={!opportunityForm.title.trim() || loading}
              className="w-full bg-dna-gold hover:bg-yellow-600 text-white"
            >
              {loading ? 'Creating...' : 'Create Opportunity'}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RichContentCreator;
