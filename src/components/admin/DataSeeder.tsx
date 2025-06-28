
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Calendar, Building2, Database, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const DataSeeder = () => {
  const [isSeeding, setIsSeeding] = useState({
    profiles: false,
    communities: false,
    events: false
  });
  const [counts, setCounts] = useState({
    profiles: 0,
    communities: 0,
    events: 0
  });
  const { toast } = useToast();

  const fetchCounts = async () => {
    try {
      const [profilesCount, communitiesCount, eventsCount] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('communities').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true })
      ]);

      setCounts({
        profiles: profilesCount.count || 0,
        communities: communitiesCount.count || 0,
        events: eventsCount.count || 0
      });
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  React.useEffect(() => {
    fetchCounts();
  }, []);

  const handleSeed = async (type: 'profiles' | 'communities' | 'events') => {
    setIsSeeding(prev => ({ ...prev, [type]: true }));
    
    try {
      toast({
        title: "Info",
        description: `Seeding for ${type} is not implemented yet`,
      });
      
      await fetchCounts();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to seed ${type}: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSeeding(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleClearData = async (type: 'profiles' | 'communities' | 'events') => {
    if (!confirm(`Are you sure you want to delete all ${type}? This cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase.from(type).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (error) throw error;

      toast({
        title: "Success!",
        description: `All ${type} have been deleted`,
      });
      
      await fetchCounts();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to clear ${type}: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Data Management</h1>
          <p className="text-gray-600 mt-2">Manage your database content for testing</p>
        </div>
        <Button onClick={fetchCounts} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Counts
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profiles</CardTitle>
            <Users className="w-4 h-4 ml-auto text-dna-emerald" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-bold">{counts.profiles}</div>
              <Badge variant="outline">{counts.profiles > 0 ? 'Populated' : 'Empty'}</Badge>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => handleSeed('profiles')} 
                disabled={isSeeding.profiles}
                className="w-full bg-dna-emerald hover:bg-dna-forest"
                size="sm"
              >
                {isSeeding.profiles ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Seed Profiles
                  </>
                )}
              </Button>
              {counts.profiles > 0 && (
                <Button 
                  onClick={() => handleClearData('profiles')} 
                  variant="destructive"
                  size="sm"
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Data
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communities</CardTitle>
            <Building2 className="w-4 h-4 ml-auto text-dna-copper" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-bold">{counts.communities}</div>
              <Badge variant="outline">{counts.communities > 0 ? 'Populated' : 'Empty'}</Badge>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => handleSeed('communities')} 
                disabled={isSeeding.communities}
                className="w-full bg-dna-copper hover:bg-dna-gold"
                size="sm"
              >
                {isSeeding.communities ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Seed Communities
                  </>
                )}
              </Button>
              {counts.communities > 0 && (
                <Button 
                  onClick={() => handleClearData('communities')} 
                  variant="destructive"
                  size="sm"
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Data
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <Calendar className="w-4 h-4 ml-auto text-dna-forest" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-bold">{counts.events}</div>
              <Badge variant="outline">{counts.events > 0 ? 'Populated' : 'Empty'}</Badge>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => handleSeed('events')} 
                disabled={isSeeding.events}
                className="w-full bg-dna-forest hover:bg-dna-emerald"
                size="sm"
              >
                {isSeeding.events ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Seed Events
                  </>
                )}
              </Button>
              {counts.events > 0 && (
                <Button 
                  onClick={() => handleClearData('events')} 
                  variant="destructive"
                  size="sm"
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Data
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataSeeder;
