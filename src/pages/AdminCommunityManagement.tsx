
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useCommunityManagement } from '@/hooks/useCommunityManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CommunityManagementHeader from '@/components/admin/CommunityManagementHeader';
import CommunityCard from '@/components/admin/CommunityCard';
import CommunityFlagCard from '@/components/admin/CommunityFlagCard';
import BulkCommunityActions from '@/components/admin/BulkCommunityActions';

const AdminCommunityManagement = () => {
  const { hasAnyRole } = useAdminAuth();
  const { 
    communities, 
    communityFlags, 
    loading, 
    error, 
    moderateCommunity,
    resolveCommunityFlag,
    deleteCommunity,
    refetch 
  } = useCommunityManagement();
  
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Filter communities and flags
  const filteredCommunities = useMemo(() => {
    return communities.filter(community => {
      const matchesSearch = !searchTerm || 
        community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || community.moderation_status === filterStatus;
      const matchesCategory = filterCategory === 'all' || community.category === filterCategory;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [communities, searchTerm, filterStatus, filterCategory]);

  const pendingCommunities = filteredCommunities.filter(c => c.moderation_status === 'pending');
  const approvedCommunities = filteredCommunities.filter(c => c.moderation_status === 'approved');
  const rejectedCommunities = filteredCommunities.filter(c => c.moderation_status === 'rejected');
  const pendingFlags = communityFlags.filter(flag => flag.status === 'pending');

  const stats = {
    total: communities.length,
    pending: communities.filter(c => c.moderation_status === 'pending').length,
    flagged: communityFlags.filter(f => f.status === 'pending').length,
    approved: communities.filter(c => c.moderation_status === 'approved').length
  };

  if (!hasAnyRole(['super_admin', 'content_moderator'])) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>You don't have permissions to access community management.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/admin-dashboard')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCommunitySelection = (communityId: string, checked: boolean) => {
    if (checked) {
      setSelectedCommunities(prev => [...prev, communityId]);
    } else {
      setSelectedCommunities(prev => prev.filter(id => id !== communityId));
    }
  };

  const handleSelectAll = (communities: any[], checked: boolean) => {
    if (checked) {
      setSelectedCommunities(prev => [...new Set([...prev, ...communities.map(c => c.id)])]);
    } else {
      const communityIds = communities.map(c => c.id);
      setSelectedCommunities(prev => prev.filter(id => !communityIds.includes(id)));
    }
  };

  const handleBulkAction = async (action: string, notes?: string, rejectionReason?: string) => {
    const promises = selectedCommunities.map(communityId => {
      if (action === 'delete') {
        return deleteCommunity(communityId);
      } else {
        return moderateCommunity(communityId, action as any, notes, rejectionReason);
      }
    });
    
    await Promise.all(promises);
    toast({
      title: "Success",
      description: `${selectedCommunities.length} communities ${action === 'delete' ? 'deleted' : action}`,
    });
    refetch();
  };

  const handleModerateCommunity = async (communityId: string, status: any, notes?: string, rejectionReason?: string) => {
    const result = await moderateCommunity(communityId, status, notes, rejectionReason);
    if (result.success) {
      refetch();
    }
  };

  const handleResolveCommunityFlag = async (flagId: string, status: any, notes?: string) => {
    const result = await resolveCommunityFlag(flagId, status, notes);
    if (result.success) {
      refetch();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading community management...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>Failed to load communities: {error}</CardDescription>
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
      <CommunityManagementHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        filterCategory={filterCategory}
        onCategoryChange={setFilterCategory}
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

        <BulkCommunityActions
          selectedCommunities={selectedCommunities}
          onClearSelection={() => setSelectedCommunities([])}
          onBulkAction={handleBulkAction}
          isLoading={loading}
        />

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Review ({pendingCommunities.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedCommunities.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedCommunities.length})
            </TabsTrigger>
            <TabsTrigger value="flags">
              Community Flags ({pendingFlags.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="space-y-4">
              {pendingCommunities.length > 0 && (
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
                  <Checkbox
                    checked={pendingCommunities.every(community => selectedCommunities.includes(community.id))}
                    onCheckedChange={(checked) => handleSelectAll(pendingCommunities, checked as boolean)}
                  />
                  <span className="text-sm font-medium">Select all pending communities</span>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingCommunities.map((community) => (
                  <div key={community.id} className="relative">
                    <div className="absolute top-4 left-4 z-10">
                      <Checkbox
                        checked={selectedCommunities.includes(community.id)}
                        onCheckedChange={(checked) => handleCommunitySelection(community.id, checked as boolean)}
                        className="bg-white shadow-sm"
                      />
                    </div>
                    <CommunityCard
                      community={community}
                      onModerate={handleModerateCommunity}
                      onDelete={deleteCommunity}
                      onViewDetails={(community) => console.log('View details:', community)}
                      isLoading={loading}
                    />
                  </div>
                ))}
              </div>
              
              {pendingCommunities.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-gray-500 text-lg">No pending communities to review.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="approved">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {approvedCommunities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  onModerate={handleModerateCommunity}
                  onDelete={deleteCommunity}
                  onViewDetails={(community) => console.log('View details:', community)}
                  isLoading={loading}
                />
              ))}
            </div>
            
            {approvedCommunities.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500 text-lg">No approved communities found.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rejected">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {rejectedCommunities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  onModerate={handleModerateCommunity}
                  onDelete={deleteCommunity}
                  onViewDetails={(community) => console.log('View details:', community)}
                  isLoading={loading}
                />
              ))}
            </div>
            
            {rejectedCommunities.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500 text-lg">No rejected communities found.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="flags">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingFlags.map((flag) => (
                <CommunityFlagCard
                  key={flag.id}
                  flag={flag}
                  onResolve={handleResolveCommunityFlag}
                  onViewDetails={(flag) => console.log('View flag details:', flag)}
                  isLoading={loading}
                />
              ))}
            </div>
            
            {pendingFlags.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500 text-lg">No community flags to review.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminCommunityManagement;
