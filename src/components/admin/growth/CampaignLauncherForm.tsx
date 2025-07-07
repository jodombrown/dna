import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, Calendar as CalendarIcon, Users, Play, Pause, BarChart } from 'lucide-react';
import { format } from 'date-fns';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  target_segment: any;
  content: any;
  scheduled_at?: string;
  created_at: string;
  metrics: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  } | any;
}

export function CampaignLauncherForm() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'email',
    target_segment: 'all',
    subject: '',
    content: '',
    scheduled_at: null as Date | null,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('growth_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to fetch campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    if (!formData.name || !formData.content) {
      toast({
        title: "Error",
        description: "Please fill in campaign name and content",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('growth_campaigns')
        .insert({
          name: formData.name,
          description: formData.description,
          type: formData.type,
          target_segment: { segment: formData.target_segment },
          content: {
            subject: formData.subject,
            body: formData.content,
          },
          scheduled_at: formData.scheduled_at?.toISOString(),
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setCampaigns([data, ...campaigns]);
      setFormData({
        name: '',
        description: '',
        type: 'email',
        target_segment: 'all',
        subject: '',
        content: '',
        scheduled_at: null,
      });

      toast({
        title: "Success",
        description: "Campaign created successfully",
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const updateCampaignStatus = async (campaignId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('growth_campaigns')
        .update({ status: newStatus })
        .eq('id', campaignId);

      if (error) throw error;

      setCampaigns(campaigns.map(campaign => 
        campaign.id === campaignId ? { ...campaign, status: newStatus } : campaign
      ));

      toast({
        title: "Success",
        description: `Campaign ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating campaign status:', error);
      toast({
        title: "Error",
        description: "Failed to update campaign status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      paused: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">Loading campaigns...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Campaign Creation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Create New Campaign
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                placeholder="e.g., Welcome Series Q1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="type">Campaign Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email Campaign</SelectItem>
                  <SelectItem value="notification">Push Notification</SelectItem>
                  <SelectItem value="sms">SMS Campaign</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this campaign..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target">Target Audience</Label>
              <Select value={formData.target_segment} onValueChange={(value) => setFormData({ ...formData, target_segment: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="waitlist">Waitlist Users</SelectItem>
                  <SelectItem value="active">Active Users</SelectItem>
                  <SelectItem value="inactive">Inactive Users</SelectItem>
                  <SelectItem value="new">New Signups (Last 7 days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Schedule Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.scheduled_at ? format(formData.scheduled_at, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.scheduled_at || undefined}
                    onSelect={(date) => setFormData({ ...formData, scheduled_at: date || null })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {formData.type === 'email' && (
            <div>
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                placeholder="Your compelling subject line..."
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
          )}

          <div>
            <Label htmlFor="content">Campaign Content</Label>
            <Textarea
              id="content"
              placeholder="Write your campaign message here..."
              className="min-h-[120px]"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <Button 
            onClick={createCampaign} 
            disabled={isCreating}
            className="w-full"
          >
            <Mail className="mr-2 h-4 w-4" />
            {isCreating ? 'Creating Campaign...' : 'Create Campaign'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Campaign Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{campaign.name}</div>
                      {campaign.description && (
                        <div className="text-sm text-gray-500">{campaign.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{campaign.type}</TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell className="capitalize">
                    {typeof campaign.target_segment === 'object' 
                      ? campaign.target_segment.segment || 'All'
                      : campaign.target_segment}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Sent: {campaign.metrics.sent}</div>
                      <div>Opens: {campaign.metrics.opened}</div>
                      <div>Clicks: {campaign.metrics.clicked}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {campaign.scheduled_at 
                      ? format(new Date(campaign.scheduled_at), "MMM d, yyyy")
                      : 'Not scheduled'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {campaign.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => updateCampaignStatus(campaign.id, 'active')}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                      {campaign.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCampaignStatus(campaign.id, 'paused')}
                        >
                          <Pause className="h-3 w-3" />
                        </Button>
                      )}
                      {campaign.status === 'paused' && (
                        <Button
                          size="sm"
                          onClick={() => updateCampaignStatus(campaign.id, 'active')}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {campaigns.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No campaigns created yet. Create your first campaign above!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
