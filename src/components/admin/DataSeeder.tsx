
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Calendar, Building2, Database, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { seedProfessionals, seedCommunities, seedEvents } from '@/utils/seedData';
import { useToast } from '@/components/ui/use-toast';

const DataSeeder = () => {
  const [isSeeding, setIsSeeding] = useState({
    professionals: false,
    communities: false,
    events: false
  });
  const [counts, setCounts] = useState({
    professionals: 0,
    communities: 0,
    events: 0
  });
  const { toast } = useToast();

  const fetchCounts = async () => {
    try {
      const [professionalsCount, communitiesCount, eventsCount] = await Promise.all([
        supabase.from('professionals' as any).select('id', { count: 'exact', head: true }),
        supabase.from('communities' as any).select('id', { count: 'exact', head: true }),
        supabase.from('events' as any).select('id', { count: 'exact', head: true })
      ]);

      setCounts({
        professionals: professionalsCount.count || 0,
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

  const handleSeed = async (type: 'professionals' | 'communities' | 'events') => {
    setIsSeeding(prev => ({ ...prev, [type]: true }));
    
    try {
      let result;
      switch (type) {
        case 'professionals':
          result = await seedProfessionals();
          break;
        case 'communities':
          result = await seedCommunities();
          break;
        case 'events':
          result = await seedEvents();
          break;
      }

      toast({
        title: "Success!",
        description: `Successfully seeded ${result?.length || 0} ${type}`,
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

  const handleClearData = async (type: 'professionals' | 'communities' | 'events') => {
    if (!confirm(`Are you sure you want to delete all ${type}? This cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from(type as any)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
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
          <p className="text-gray-600 mt-2">Seed your database with realistic African diaspora profiles for testing</p>
        </div>
        <Button onClick={fetchCounts} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Counts
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professionals</CardTitle>
            <Users className="w-4 h-4 ml-auto text-dna-emerald" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-bold">{counts.professionals}</div>
              <Badge variant="outline">{counts.professionals > 0 ? 'Populated' : 'Empty'}</Badge>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => handleSeed('professionals')} 
                disabled={isSeeding.professionals}
                className="w-full bg-dna-emerald hover:bg-dna-forest"
                size="sm"
              >
                {isSeeding.professionals ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Seed Professionals
                  </>
                )}
              </Button>
              {counts.professionals > 0 && (
                <Button 
                  onClick={() => handleClearData('professionals')} 
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

      <Card>
        <CardHeader>
          <CardTitle>What This Creates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-dna-emerald mb-2">50 Diverse Professionals</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Tech leaders, investors, entrepreneurs</li>
                <li>• Various African countries of origin</li>
                <li>• Global diaspora locations</li>
                <li>• Realistic bios and experience</li>
                <li>• Multiple languages and skills</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-dna-copper mb-2">10 Active Communities</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Tech, Business, Healthcare</li>
                <li>• Creative Industries, Energy</li>
                <li>• Youth Development, Research</li>
                <li>• Various member counts</li>
                <li>• Featured and regular communities</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-dna-forest mb-2">10 Upcoming Events</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Conferences, Workshops, Meetups</li>
                <li>• Virtual and in-person events</li>
                <li>• Various locations and dates</li>
                <li>• Different attendee counts</li>
                <li>• Registration links included</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSeeder;
