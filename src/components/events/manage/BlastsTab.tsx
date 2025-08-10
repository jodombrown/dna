import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { MailIcon, SendIcon, ClockIcon, UsersIcon, EyeIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Blast {
  id: string;
  subject: string;
  body_markdown: string;
  scheduled_for: string | null;
  sent_at: string | null;
  segment: any;
}

interface BlastsTabProps {
  eventId: string;
}

const BlastsTab: React.FC<BlastsTabProps> = ({ eventId }) => {
  const [blasts, setBlasts] = useState<Blast[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // New blast form
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [segment, setSegment] = useState('all');
  const [scheduleType, setScheduleType] = useState('now');
  const [scheduledFor, setScheduledFor] = useState('');

  const fetchBlasts = async () => {
    try {
      const { data, error } = await supabase
        .from('event_blasts')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlasts(data || []);
    } catch (error) {
      console.error('Error fetching blasts:', error);
      toast.error('Failed to load email blasts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlasts();
  }, [eventId]);

  const handleSendBlast = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Subject and body are required');
      return;
    }

    setSending(true);
    try {
      const blastData = {
        event_id: eventId,
        subject: subject.trim(),
        body_markdown: body.trim(),
        segment: segment === 'all' ? null : { type: segment },
        scheduled_for: scheduleType === 'later' && scheduledFor ? new Date(scheduledFor).toISOString() : null,
      };

      const { error } = await supabase
        .from('event_blasts')
        .insert([blastData]);

      if (error) throw error;

      toast.success(scheduleType === 'now' ? 'Email blast sent!' : 'Email blast scheduled!');
      
      // Reset form
      setSubject('');
      setBody('');
      setSegment('all');
      setScheduleType('now');
      setScheduledFor('');
      
      fetchBlasts();
    } catch (error) {
      console.error('Error sending blast:', error);
      toast.error('Failed to send email blast');
    } finally {
      setSending(false);
    }
  };

  const segmentOptions = [
    { value: 'all', label: 'All Attendees', count: '120' },
    { value: 'confirmed', label: 'Confirmed Only', count: '95' },
    { value: 'pending', label: 'Pending Approval', count: '15' },
    { value: 'waitlist', label: 'Waitlisted', count: '10' },
  ];

  const getBlastStatus = (blast: Blast) => {
    if (blast.sent_at) {
      return <Badge variant="default">Sent</Badge>;
    } else if (blast.scheduled_for) {
      return <Badge variant="secondary">Scheduled</Badge>;
    } else {
      return <Badge variant="outline">Draft</Badge>;
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <MailIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Loading email blasts...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="compose" className="space-y-6">
        <TabsList>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MailIcon className="w-5 h-5" />
                <span>Compose Email Blast</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Subject */}
              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="mt-1"
                />
              </div>

              {/* Audience Segment */}
              <div>
                <Label>Audience</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
                  {segmentOptions.map((option) => (
                    <Card
                      key={option.value}
                      className={`p-3 cursor-pointer transition-all ${
                        segment === option.value ? 'ring-2 ring-primary' : 'hover:shadow-md'
                      }`}
                      onClick={() => setSegment(option.value)}
                    >
                      <div className="text-center space-y-1">
                        <div className="flex items-center justify-center space-x-2">
                          <UsersIcon className="w-4 h-4" />
                          <span className="font-medium text-lg">{option.count}</span>
                        </div>
                        <p className="text-sm font-medium">{option.label}</p>
                        <div className={`w-3 h-3 rounded-full mx-auto ${
                          segment === option.value ? 'bg-primary' : 'border border-muted-foreground'
                        }`} />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Email Body */}
              <div>
                <Label htmlFor="body">Email Content (Markdown)</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={`# Event Update

Hi {{name}},

We're excited to share an important update about **{{event_title}}**!

## What's New
- New speaker announcement
- Updated schedule
- Venue information

We can't wait to see you there!

Best regards,
The Event Team

---
*You're receiving this because you registered for {{event_title}}*`}
                  rows={12}
                  className="mt-1 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use markdown for formatting. Available variables: {`{{name}}, {{event_title}}, {{event_date}}`}
                </p>
              </div>

              <Separator />

              {/* Scheduling */}
              <div className="space-y-4">
                <Label>Send Schedule</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card
                    className={`p-4 cursor-pointer transition-all ${
                      scheduleType === 'now' ? 'ring-2 ring-primary' : 'hover:shadow-md'
                    }`}
                    onClick={() => setScheduleType('now')}
                  >
                    <div className="flex items-center space-x-3">
                      <SendIcon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Send Now</p>
                        <p className="text-sm text-muted-foreground">Deliver immediately</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card
                    className={`p-4 cursor-pointer transition-all ${
                      scheduleType === 'later' ? 'ring-2 ring-primary' : 'hover:shadow-md'
                    }`}
                    onClick={() => setScheduleType('later')}
                  >
                    <div className="flex items-center space-x-3">
                      <ClockIcon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Schedule</p>
                        <p className="text-sm text-muted-foreground">Send at specific time</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {scheduleType === 'later' && (
                  <div>
                    <Label htmlFor="scheduled_for">Schedule Date & Time</Label>
                    <Input
                      id="scheduled_for"
                      type="datetime-local"
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
                
                <Button
                  onClick={handleSendBlast}
                  disabled={sending || !subject.trim() || !body.trim()}
                >
                  {sending ? 'Sending...' : scheduleType === 'now' ? 'Send Now' : 'Schedule'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Email Blast History</CardTitle>
            </CardHeader>
            <CardContent>
              {blasts.length === 0 ? (
                <div className="text-center py-8">
                  <MailIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground">No email blasts sent yet</p>
                  <p className="text-sm text-muted-foreground">Create your first blast in the Compose tab</p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Scheduled</TableHead>
                        <TableHead>Sent</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blasts.map((blast) => (
                        <TableRow key={blast.id}>
                          <TableCell>
                            <p className="font-medium">{blast.subject}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {blast.body_markdown.split('\n')[0].replace(/^#+ /, '')}
                            </p>
                          </TableCell>
                          <TableCell>{getBlastStatus(blast)}</TableCell>
                          <TableCell>{formatDateTime(blast.scheduled_for)}</TableCell>
                          <TableCell>{formatDateTime(blast.sent_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <EyeIcon className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlastsTab;