import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Search, Shield, Edit, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/ui/loader';

interface AdinProfile {
  id: string;
  display_name: string;
  email: string;
  influence_score: number;
  verified: boolean;
  region_focus: string[];
  sector_focus: string[];
  admin_notes: string;
  last_updated: string;
}

const AdinProfileControls = () => {
  const [profiles, setProfiles] = useState<AdinProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<AdinProfile | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchAdinProfiles();
  }, []);

  const fetchAdinProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('adin_profiles')
        .select(`
          id,
          influence_score,
          verified,
          region_focus,
          sector_focus,
          admin_notes,
          last_updated,
          profiles!inner(display_name, email)
        `)
        .order('influence_score', { ascending: false });

      if (error) throw error;

      const transformedData = data?.map(item => ({
        id: item.id,
        display_name: item.profiles.display_name,
        email: item.profiles.email,
        influence_score: item.influence_score || 0,
        verified: item.verified || false,
        region_focus: item.region_focus || [],
        sector_focus: item.sector_focus || [],
        admin_notes: item.admin_notes || '',
        last_updated: item.last_updated
      })) || [];

      setProfiles(transformedData);
    } catch (error) {
      console.error('Error fetching ADIN profiles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch ADIN profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationToggle = async (profileId: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from('adin_profiles')
        .update({ verified, last_updated: new Date().toISOString() })
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Profile ${verified ? 'verified' : 'unverified'} successfully`,
      });

      fetchAdinProfiles();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    }
  };

  const handleUpdateNotes = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('adin_profiles')
        .update({ 
          admin_notes: adminNotes,
          last_updated: new Date().toISOString() 
        })
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin notes updated successfully",
      });

      fetchAdinProfiles();
      setSelectedProfile(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating notes:', error);
      toast({
        title: "Error",
        description: "Failed to update admin notes",
        variant: "destructive",
      });
    }
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loader label="Loading ADIN profiles..." />;
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search profiles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Profiles Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Influence Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Focus Areas</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProfiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{profile.display_name || 'Unknown'}</div>
                    <div className="text-sm text-muted-foreground">{profile.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    {profile.influence_score.toLocaleString()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={profile.verified}
                      onCheckedChange={(checked) => 
                        handleVerificationToggle(profile.id, checked)
                      }
                    />
                    <span className="text-sm">
                      {profile.verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex flex-wrap gap-1">
                      {profile.region_focus.slice(0, 2).map((region, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {region}
                        </Badge>
                      ))}
                      {profile.region_focus.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.region_focus.length - 2}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {profile.sector_focus.slice(0, 2).map((sector, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {sector}
                        </Badge>
                      ))}
                      {profile.sector_focus.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.sector_focus.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedProfile(profile);
                            setAdminNotes(profile.admin_notes || '');
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit ADIN Profile</DialogTitle>
                        </DialogHeader>
                        {selectedProfile && (
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">User</label>
                              <p className="text-sm">{selectedProfile.display_name}</p>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Current Influence Score</label>
                              <p className="text-sm font-mono">{selectedProfile.influence_score}</p>
                            </div>

                            <div>
                              <label className="text-sm font-medium">Admin Notes</label>
                              <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add admin notes..."
                                rows={4}
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setSelectedProfile(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleUpdateNotes(selectedProfile.id)}
                              >
                                Update Notes
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" size="sm">
                      <Activity className="h-4 w-4 mr-1" />
                      Activity
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredProfiles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No ADIN profiles found</p>
        </div>
      )}
    </div>
  );
};

export default AdinProfileControls;