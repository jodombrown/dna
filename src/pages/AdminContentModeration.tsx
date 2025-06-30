
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useContentFlags } from '@/hooks/useContentFlags';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ContentModerationHeader from '@/components/admin/ContentModerationHeader';
import ContentFlagCard from '@/components/admin/ContentFlagCard';
import BulkModerationPanel from '@/components/admin/BulkModerationPanel';
import ModerationActionDialog from '@/components/admin/ModerationActionDialog';

const AdminContentModeration = () => {
  const { hasAnyRole } = useAdminAuth();
  const { flags, loading, error, resolveFlag, moderatePost, refetch } = useContentFlags();
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Filter flags based on search and filters
  const filteredFlags = useMemo(() => {
    return flags.filter(flag => {
      const matchesSearch = !searchTerm || 
        flag.content_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flag.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flag.flag_type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || flag.flag_type === filterType;
      const matchesStatus = filterStatus === 'all' || flag.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [flags, searchTerm, filterType, filterStatus]);

  const pendingFlags = filteredFlags.filter(flag => flag.status === 'pending');
  const resolvedFlags = filteredFlags.filter(flag => flag.status !== 'pending');

  const stats = {
    total: flags.length,
    pending: flags.filter(f => f.status === 'pending').length,
    urgent: flags.filter(f => f.flag_type === 'harassment' && f.status === 'pending').length
  };

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

  const handleFlagSelection = (flagId: string, checked: boolean) => {
    if (checked) {
      setSelectedFlags(prev => [...prev, flagId]);
    } else {
      setSelectedFlags(prev => prev.filter(id => id !== flagId));
    }
  };

  const handleSelectAll = (flags: any[], checked: boolean) => {
    if (checked) {
      setSelectedFlags(prev => [...new Set([...prev, ...flags.map(f => f.id)])]);
    } else {
      const flagIds = flags.map(f => f.id);
      setSelectedFlags(prev => prev.filter(id => !flagIds.includes(id)));
    }
  };

  const handleBulkAction = async (action: string, notes?: string) => {
    const promises = selectedFlags.map(flagId => resolveFlag(flagId, action as any, notes));
    await Promise.all(promises);
    toast({
      title: "Success",
      description: `${selectedFlags.length} flags ${action}`,
    });
    refetch();
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
      <ContentModerationHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterType={filterType}
        onFilterChange={setFilterType}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        onRefresh={refetch}
        isLoading={loading}
        stats={stats}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin-dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <BulkModerationPanel
          selectedFlags={selectedFlags}
          onClearSelection={() => setSelectedFlags([])}
          onBulkAction={handleBulkAction}
          isLoading={loading}
        />

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Review ({pendingFlags.length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({resolvedFlags.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="space-y-4">
              {pendingFlags.length > 0 && (
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
                  <Checkbox
                    checked={pendingFlags.every(flag => selectedFlags.includes(flag.id))}
                    onCheckedChange={(checked) => handleSelectAll(pendingFlags, checked as boolean)}
                  />
                  <span className="text-sm font-medium">Select all pending flags</span>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingFlags.map((flag) => (
                  <div key={flag.id} className="relative">
                    <div className="absolute top-4 left-4 z-10">
                      <Checkbox
                        checked={selectedFlags.includes(flag.id)}
                        onCheckedChange={(checked) => handleFlagSelection(flag.id, checked as boolean)}
                        className="bg-white shadow-sm"
                      />
                    </div>
                    <ContentFlagCard
                      flag={flag}
                      onResolve={handleResolveFlag}
                      onViewDetails={(flag) => {
                        setSelectedFlag(flag);
                        setShowActionDialog(true);
                      }}
                      isLoading={loading}
                    />
                  </div>
                ))}
              </div>
              
              {pendingFlags.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-gray-500 text-lg">No pending flags to review.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="resolved">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resolvedFlags.map((flag) => (
                <ContentFlagCard
                  key={flag.id}
                  flag={flag}
                  onResolve={handleResolveFlag}
                  onViewDetails={(flag) => {
                    setSelectedFlag(flag);
                    setShowActionDialog(true);
                  }}
                  isLoading={loading}
                />
              ))}
            </div>
            
            {resolvedFlags.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500 text-lg">No resolved flags found.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

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
