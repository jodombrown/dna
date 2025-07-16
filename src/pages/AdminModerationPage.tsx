
import React from 'react';
import { AdminAuthWrapper } from '@/components/admin/AdminAuthWrapper';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flag, AlertTriangle, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { useRealtimeQuery } from '@/hooks/useRealtimeQuery';

const AdminModerationPage = () => {
  const { data: flags, loading } = useRealtimeQuery('admin-content-flags', {
    table: 'content_flags',
    select: '*',
    orderBy: { column: 'created_at', ascending: false }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <MessageSquare className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Flag className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <AdminAuthWrapper>
        <AdminLayout>
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
            </div>
          </div>
        </AdminLayout>
      </AdminAuthWrapper>
    );
  }

  return (
    <AdminAuthWrapper>
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {flags?.filter(f => !f.resolved_at).length || 0} Pending
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">Pending Reports</TabsTrigger>
              <TabsTrigger value="resolved">Resolved Reports</TabsTrigger>
              <TabsTrigger value="all">All Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="h-5 w-5" />
                    Pending Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {flags?.filter(flag => !flag.resolved_at).map((flag) => (
                      <div key={flag.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getContentTypeIcon(flag.content_type)}
                            <div>
                              <div className="font-medium text-gray-900">
                                {flag.content_type.charAt(0).toUpperCase() + flag.content_type.slice(1)} Report
                              </div>
                              <div className="text-sm text-gray-500">
                                Reported on {new Date(flag.created_at).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Reason: {flag.reason || 'No reason provided'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                              <XCircle className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {flags?.filter(flag => !flag.resolved_at).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No pending reports
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Resolved Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {flags?.filter(flag => flag.resolved_at).map((flag) => (
                      <div key={flag.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getContentTypeIcon(flag.content_type)}
                            <div>
                              <div className="font-medium text-gray-900">
                                {flag.content_type.charAt(0).toUpperCase() + flag.content_type.slice(1)} Report
                              </div>
                              <div className="text-sm text-gray-500">
                                Resolved on {new Date(flag.resolved_at).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Reason: {flag.reason || 'No reason provided'}
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary">Resolved</Badge>
                        </div>
                      </div>
                    ))}
                    {flags?.filter(flag => flag.resolved_at).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No resolved reports
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="h-5 w-5" />
                    All Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {flags?.map((flag) => (
                      <div key={flag.id} className={`border rounded-lg p-4 ${flag.resolved_at ? 'bg-gray-50' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getContentTypeIcon(flag.content_type)}
                            <div>
                              <div className="font-medium text-gray-900">
                                {flag.content_type.charAt(0).toUpperCase() + flag.content_type.slice(1)} Report
                              </div>
                              <div className="text-sm text-gray-500">
                                Reported on {new Date(flag.created_at).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Reason: {flag.reason || 'No reason provided'}
                              </div>
                            </div>
                          </div>
                          <Badge variant={flag.resolved_at ? "secondary" : "destructive"}>
                            {flag.resolved_at ? 'Resolved' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </AdminAuthWrapper>
  );
};

export default AdminModerationPage;
