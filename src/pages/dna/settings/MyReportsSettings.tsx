import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import {
  Loader2,
  Flag,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  FileText,
  User,
  Calendar,
  Image,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ContentFlag {
  id: string;
  content_type: string;
  content_id: string;
  flag_type: string;
  reason: string | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
  moderator_notes: string | null;
}

const contentTypeIcons: Record<string, React.ElementType> = {
  message: MessageSquare,
  post: FileText,
  comment: MessageSquare,
  profile: User,
  event: Calendar,
  image: Image,
};

const flagTypeLabels: Record<string, string> = {
  inappropriate_content: 'Inappropriate Content',
  spam: 'Spam',
  harassment: 'Harassment',
  misinformation: 'Misinformation',
  copyright_violation: 'Copyright Violation',
  other: 'Other',
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
  pending: { label: 'Under Review', variant: 'secondary', icon: Clock },
  approved: { label: 'Action Taken', variant: 'default', icon: CheckCircle2 },
  rejected: { label: 'No Action Needed', variant: 'outline', icon: XCircle },
  hidden: { label: 'Content Hidden', variant: 'default', icon: CheckCircle2 },
  deleted: { label: 'Content Removed', variant: 'destructive', icon: CheckCircle2 },
};

export default function MyReportsSettings() {
  const { user } = useAuth();

  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['my-reports', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('content_flags')
        .select('*')
        .eq('flagged_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ContentFlag[];
    },
    enabled: !!user,
  });

  const getContentTypeIcon = (contentType: string) => {
    const Icon = contentTypeIcons[contentType] || Flag;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <SettingsLayout title="My Reports" description="View reports you've submitted">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </SettingsLayout>
    );
  }

  if (error) {
    return (
      <SettingsLayout title="My Reports" description="View reports you've submitted">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-4 text-destructive" />
              <p>Failed to load your reports</p>
            </div>
          </CardContent>
        </Card>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout
      title="My Reports"
      description="View reports you've submitted"
    >
      <div className="space-y-6">
        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              About Reports
            </CardTitle>
            <CardDescription>
              How content moderation works
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Reports are reviewed by our moderation team</li>
              <li>• We take action on content that violates community guidelines</li>
              <li>• You'll see the status update here once reviewed</li>
              <li>• Your identity is never shared with the person you reported</li>
            </ul>
          </CardContent>
        </Card>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Reports ({reports?.length || 0})</CardTitle>
            <CardDescription>
              Content and users you've reported
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!reports || reports.length === 0 ? (
              <div className="py-12 text-center">
                <Flag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">You haven't submitted any reports</p>
                <p className="text-sm text-muted-foreground mt-1">
                  When you report content or users, they'll appear here
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 p-2 rounded-lg bg-muted">
                          {getContentTypeIcon(report.content_type)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">
                              {report.content_type} Report
                            </span>
                            {getStatusBadge(report.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Reason:</span>{' '}
                            {flagTypeLabels[report.flag_type] || report.flag_type}
                          </p>
                          {report.reason && (
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Details:</span> {report.reason}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Submitted {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                          </p>
                          {report.resolved_at && (
                            <p className="text-xs text-muted-foreground">
                              Resolved {formatDistanceToNow(new Date(report.resolved_at), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}
