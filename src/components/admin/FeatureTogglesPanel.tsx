import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, Edit, Trash, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/ui/loader';

interface FeatureFlag {
  feature_key: string;
  is_enabled: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

const FeatureTogglesPanel = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newFlag, setNewFlag] = useState({
    feature_key: '',
    is_enabled: false,
    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchFeatureFlags();
  }, []);

  const fetchFeatureFlags = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFlags(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch feature flags",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlag = async () => {
    if (!newFlag.feature_key.trim()) {
      toast({
        title: "Error",
        description: "Feature key is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('feature_flags')
        .insert([{
          feature_key: newFlag.feature_key.toLowerCase().replace(/\s+/g, '_'),
          is_enabled: newFlag.is_enabled,
          notes: newFlag.notes
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Feature flag created successfully",
      });

      setNewFlag({ feature_key: '', is_enabled: false, notes: '' });
      setIsCreateDialogOpen(false);
      fetchFeatureFlags();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create feature flag",
        variant: "destructive",
      });
    }
  };

  const handleToggleFlag = async (featureKey: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ 
          is_enabled: !currentValue,
          updated_at: new Date().toISOString()
        })
        .eq('feature_key', featureKey);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Feature ${!currentValue ? 'enabled' : 'disabled'} successfully`,
      });

      fetchFeatureFlags();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle feature flag",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFlag = async (featureKey: string) => {
    if (!confirm('Are you sure you want to delete this feature flag?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('feature_flags')
        .delete()
        .eq('feature_key', featureKey);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Feature flag deleted successfully",
      });

      fetchFeatureFlags();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete feature flag",
        variant: "destructive",
      });
    }
  };

  const commonFlags = [
    { key: 'beta_testing', description: 'Enable beta testing features' },
    { key: 'new_messaging', description: 'New messaging interface' },
    { key: 'advanced_search', description: 'Advanced search functionality' },
    { key: 'community_features', description: 'Community management features' },
    { key: 'analytics_dashboard', description: 'Enhanced analytics dashboard' },
    { key: 'mobile_app_integration', description: 'Mobile app integration features' },
  ];

  if (loading) {
    return <Loader label="Loading feature flags..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Feature Flags</h3>
          <p className="text-sm text-muted-foreground">
            Control feature rollouts and toggle functionality
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-dna-forest hover:bg-dna-forest/90">
              <Plus className="h-4 w-4 mr-2" />
              New Flag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Feature Flag</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Feature Key</label>
                <Input
                  value={newFlag.feature_key}
                  onChange={(e) => setNewFlag(prev => ({ ...prev, feature_key: e.target.value }))}
                  placeholder="e.g., new_dashboard_feature"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use lowercase letters, numbers, and underscores only
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={newFlag.is_enabled}
                  onCheckedChange={(checked) => setNewFlag(prev => ({ ...prev, is_enabled: checked }))}
                />
                <label className="text-sm font-medium">
                  {newFlag.is_enabled ? 'Enabled' : 'Disabled'}
                </label>
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={newFlag.notes}
                  onChange={(e) => setNewFlag(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Describe what this flag controls..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateFlag}>
                  Create Flag
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Setup */}
      {flags.length === 0 && (
        <div className="border rounded-lg p-6">
          <h4 className="font-medium mb-3">Quick Setup</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Get started with these commonly used feature flags:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commonFlags.map((flag) => (
              <div key={flag.key} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="text-sm font-medium">{flag.key}</p>
                  <p className="text-xs text-muted-foreground">{flag.description}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setNewFlag({
                      feature_key: flag.key,
                      is_enabled: false,
                      notes: flag.description
                    });
                    setIsCreateDialogOpen(true);
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Flags Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Feature Key</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flags.map((flag) => (
              <TableRow key={flag.feature_key}>
                <TableCell>
                  <div className="font-mono text-sm">{flag.feature_key}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={flag.is_enabled}
                      onCheckedChange={() => handleToggleFlag(flag.feature_key, flag.is_enabled)}
                    />
                    <Badge 
                      variant={flag.is_enabled ? "default" : "secondary"}
                      className={flag.is_enabled ? "bg-green-500 text-white" : ""}
                    >
                      {flag.is_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate text-sm text-muted-foreground">
                    {flag.notes || 'No description'}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(flag.updated_at).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteFlag(flag.feature_key)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {flags.length === 0 && (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Feature Flags</h3>
          <p className="text-muted-foreground mb-4">
            Create your first feature flag to control feature rollouts
          </p>
        </div>
      )}

      {/* Usage Guide */}
      <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">How to use Feature Flags</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Use feature flags to control the rollout of new features</p>
          <p>• Toggle features on/off without deploying code changes</p>
          <p>• Test features with a subset of users before full release</p>
          <p>• Quickly disable features if issues are discovered</p>
        </div>
      </div>
    </div>
  );
};

export default FeatureTogglesPanel;