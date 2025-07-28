import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FeatureFlag {
  feature_key: string;
  is_enabled: boolean;
  notes: string | null;
  updated_at: string;
}

const FeatureFlagsManager = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFlags = async () => {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('feature_key');

      if (error) throw error;
      setFlags(data || []);
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      toast({
        title: "Error",
        description: "Failed to load feature flags",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = async (featureKey: string, newValue: boolean) => {
    setUpdating(featureKey);
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ is_enabled: newValue })
        .eq('feature_key', featureKey);

      if (error) throw error;

      setFlags(prev => prev.map(flag => 
        flag.feature_key === featureKey 
          ? { ...flag, is_enabled: newValue }
          : flag
      ));

      toast({
        title: "Success",
        description: `${featureKey} ${newValue ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error updating feature flag:', error);
      toast({
        title: "Error",
        description: "Failed to update feature flag",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Flags</CardTitle>
        <CardDescription>
          Control platform feature visibility and rollout
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {flags.map((flag) => (
            <div
              key={flag.feature_key}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium">{flag.feature_key}</h3>
                  <Badge variant={flag.is_enabled ? "default" : "secondary"}>
                    {flag.is_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                {flag.notes && (
                  <p className="text-sm text-muted-foreground">{flag.notes}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {new Date(flag.updated_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {updating === flag.feature_key && <Loader className="w-4 h-4" />}
                <Switch
                  checked={flag.is_enabled}
                  onCheckedChange={(checked) => toggleFlag(flag.feature_key, checked)}
                  disabled={updating === flag.feature_key}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureFlagsManager;