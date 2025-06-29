
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useContentFlags } from '@/hooks/useContentFlags';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, AlertTriangle, Eye, EyeOff, Trash2, CheckCircle, XCircle, ArrowLeft, Flag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ContentFlagDialog from '@/components/admin/ContentFlagDialog';
import ModerationActionDialog from '@/components/admin/ModerationActionDialog';

const AdminContentModeration = () => {
  const { hasAnyRole } = useAdminAuth();
  const { flags, loading, error, resolveFlag, moderatePost, refetch } = useContentFlags();
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!hasAnyRole(['super_admin', 'content_moderator'])) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>You don't have permissions to access content moderation.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/admin-dashboard')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingFlags = flags.filter(flag => flag.status === 'pending');
  const resolvedFlags = flags.filter(flag => flag.status !== 'pending');

  const getFlagTypeBadge = (flagType: string) => {
    const colors = {
      inappropriate_content: 'bg-red-100 text-red-800',
      spam: 'bg-orange-100 text-orange-800',
      harassment: 'bg-purple-100 text-purple-800',
      misinformation: 'bg-yellow-100 text-yellow-800',
      copyright_violation: 'bg-blue-100 text-blue-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[flagType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      hidden: 'bg-gray-100 text-gray-800',
      deleted: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleResolveFlag = async (flagId: string, status: any, notes?: string) => {
    const result = await resolveFlag(flagId, status, notes);
    if (result.success) {
      toast({
        title: "Success",
        description: "Flag resolved successfully.",
      });
      refetch();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to resolve flag.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading content moderation...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>Failed to load content flags: {error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/admin-dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Shield className="w-8 h-8 text-dna-emerald mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Content Moderation</h1>
                <p className="text-sm text-gray-500">Review and manage flagged content</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Flags</CardTitle>
              <Flag className="w-4 h-4 text-dna-emerald" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{flags.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{pendingFlags.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Resolved</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{resolvedFlags.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Urgent</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {flags.filter(f => f.flag_type === 'harassment' && f.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Moderation Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending Review ({pendingFlags.length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({resolvedFlags.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Content Flags</CardTitle>
                <CardDescription>Content that requires moderation review</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content</TableHead>
                      <TableHead>Flag Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Flagged By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingFlags.map((flag) => (
                      <TableRow key={flag.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{flag.content_type}</Badge>
                            <span className="font-mono text-sm">{flag.content_id.substring(0, 8)}...</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getFlagTypeBadge(flag.flag_type)}>
                            {flag.flag_type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {flag.reason || 'No reason provided'}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {flag.flagged_by?.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(flag.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResolveFlag(flag.id, 'approved')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResolveFlag(flag.id, 'rejected')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedFlag(flag);
                                setShowActionDialog(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {pendingFlags.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No pending flags to review.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resolved">
            <Card>
              <CardHeader>
                <CardTitle>Resolved Content Flags</CardTitle>
                <CardDescription>Previously moderated content flags</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content</TableHead>
                      <TableHead>Flag Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Resolved By</TableHead>
                      <TableHead>Date Resolved</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resolvedFlags.map((flag) => (
                      <TableRow key={flag.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{flag.content_type}</Badge>
                            <span className="font-mono text-sm">{flag.content_id.substring(0, 8)}...</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getFlagTypeBadge(flag.flag_type)}>
                            {flag.flag_type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(flag.status)}>
                            {flag.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {flag.resolved_by?.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {flag.resolved_at ? new Date(flag.resolved_at).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {flag.moderator_notes || 'No notes'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {resolvedFlags.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No resolved flags found.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      {selectedFlag && (
        <ModerationActionDialog
          open={showActionDialog}
          onOpenChange={setShowActionDialog}
          flag={selectedFlag}
          onResolve={handleResolveFlag}
          onModeratePost={moderatePost}
        />
      )}
    </div>
  );
};

export default AdminContentModeration;
