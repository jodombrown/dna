import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, Filter } from 'lucide-react';
import AppHeader from '@/components/app/AppHeader';
import { LeaderboardCard } from '@/components/leaderboard/LeaderboardCard';
import { supabase } from '@/integrations/supabase/client';
import { useScrollToTop } from '@/hooks/useScrollToTop';

interface LeaderboardUser {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  score: number;
  rank: number;
  location?: string;
  pillar_scores?: {
    connect: number;
    collaborate: number;
    contribute: number;
  };
  is_verified?: boolean;
  impact_type?: string;
}

const LeaderboardPage = () => {
  useScrollToTop();
  const [activeTab, setActiveTab] = useState('total');
  const [countryFilter, setCountryFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [leaderboardData, setLeaderboardData] = useState<{
    total: LeaderboardUser[];
    connect: LeaderboardUser[];
    collaborate: LeaderboardUser[];
    contribute: LeaderboardUser[];
  }>({
    total: [],
    connect: [],
    collaborate: [],
    contribute: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboardData();
  }, [countryFilter, sectorFilter]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      // Fetch leaderboard data from Supabase function
      const { data: totalData, error: totalError } = await supabase
        .rpc('get_leaderboard', {
          board_type: 'total',
          country_filter: countryFilter === 'all' ? null : countryFilter,
          sector_filter: sectorFilter === 'all' ? null : sectorFilter,
          limit_count: 100
        });

      const { data: connectData, error: connectError } = await supabase
        .rpc('get_leaderboard', {
          board_type: 'connect',
          country_filter: countryFilter === 'all' ? null : countryFilter,
          sector_filter: sectorFilter === 'all' ? null : sectorFilter,
          limit_count: 100
        });

      const { data: collaborateData, error: collaborateError } = await supabase
        .rpc('get_leaderboard', {
          board_type: 'collaborate',
          country_filter: countryFilter === 'all' ? null : countryFilter,
          sector_filter: sectorFilter === 'all' ? null : sectorFilter,
          limit_count: 100
        });

      const { data: contributeData, error: contributeError } = await supabase
        .rpc('get_leaderboard', {
          board_type: 'contribute',
          country_filter: countryFilter === 'all' ? null : countryFilter,
          sector_filter: sectorFilter === 'all' ? null : sectorFilter,
          limit_count: 100
        });

      if (totalError || connectError || collaborateError || contributeError) {
        throw new Error('Failed to fetch leaderboard data');
      }

      setLeaderboardData({
        total: totalData || [],
        connect: connectData || [],
        collaborate: collaborateData || [],
        contribute: contributeData || []
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Set mock data for demonstration
      setLeaderboardData({
        total: generateMockLeaderboard('total'),
        connect: generateMockLeaderboard('connect'),
        collaborate: generateMockLeaderboard('collaborate'),
        contribute: generateMockLeaderboard('contribute')
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockLeaderboard = (type: string): LeaderboardUser[] => {
    const mockUsers = [
      { name: 'Sarah Okoye', location: 'Lagos, Nigeria', verified: true, impact_type: 'startup' },
      { name: 'David Mensah', location: 'Accra, Ghana', verified: true, impact_type: 'policy' },
      { name: 'Amina Hassan', location: 'Cairo, Egypt', verified: false },
      { name: 'Kwame Asante', location: 'London, UK', verified: true, impact_type: 'research' },
      { name: 'Fatima Diop', location: 'Dakar, Senegal', verified: false },
      { name: 'Ahmed Kone', location: 'Abidjan, Côte d\'Ivoire', verified: true, impact_type: 'education' },
      { name: 'Grace Mwangi', location: 'Nairobi, Kenya', verified: false },
      { name: 'Yusuf Babangida', location: 'Abuja, Nigeria', verified: true, impact_type: 'infrastructure' },
    ];

    return mockUsers.map((user, index) => ({
      user_id: `user-${index + 1}`,
      full_name: user.name,
      location: user.location,
      score: Math.floor(Math.random() * 1000) + 100,
      rank: index + 1,
      is_verified: user.verified,
      impact_type: user.impact_type,
      pillar_scores: {
        connect: Math.floor(Math.random() * 300) + 50,
        collaborate: Math.floor(Math.random() * 300) + 50,
        contribute: Math.floor(Math.random() * 300) + 50
      }
    }));
  };

  const countries = [
    'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Egypt', 'Morocco',
    'Ethiopia', 'Uganda', 'Tanzania', 'Rwanda', 'Senegal', 'Côte d\'Ivoire'
  ];

  const sectors = [
    'Technology', 'Healthcare', 'Education', 'Finance', 'Agriculture',
    'Energy', 'Manufacturing', 'Real Estate', 'Transportation', 'Media'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-dna-gold" />
            <h1 className="text-3xl font-bold text-dna-forest">DNA Leaderboard</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Celebrating the most impactful members of the African diaspora community
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Country</label>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Sector</label>
                <Select value={sectorFilter} onValueChange={setSectorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sectors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sectors</SelectItem>
                    {sectors.map(sector => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button onClick={fetchLeaderboardData} disabled={loading}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="total">Overall</TabsTrigger>
            <TabsTrigger value="connect">Connect</TabsTrigger>
            <TabsTrigger value="collaborate">Collaborate</TabsTrigger>
            <TabsTrigger value="contribute">Contribute</TabsTrigger>
          </TabsList>

          <TabsContent value="total">
            <LeaderboardCard
              users={leaderboardData.total}
              type="total"
              title="Overall Impact Leaders"
              className="mx-auto max-w-4xl"
            />
          </TabsContent>

          <TabsContent value="connect">
            <LeaderboardCard
              users={leaderboardData.connect}
              type="connect"
              title="Top Connectors"
              className="mx-auto max-w-4xl"
            />
          </TabsContent>

          <TabsContent value="collaborate">
            <LeaderboardCard
              users={leaderboardData.collaborate}
              type="collaborate"
              title="Collaboration Champions"
              className="mx-auto max-w-4xl"
            />
          </TabsContent>

          <TabsContent value="contribute">
            <LeaderboardCard
              users={leaderboardData.contribute}
              type="contribute"
              title="Top Contributors"
              className="mx-auto max-w-4xl"
            />
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold text-dna-forest mb-2">
                Want to climb the leaderboard?
              </h3>
              <p className="text-gray-600 mb-4">
                Engage with the community, share insights, and contribute to projects to earn DNA points!
              </p>
              <div className="flex gap-2 justify-center">
                <Badge className="bg-dna-emerald/10 text-dna-emerald">+10 pts per post</Badge>
                <Badge className="bg-dna-copper/10 text-dna-copper">+5 pts per connection</Badge>
                <Badge className="bg-dna-forest/10 text-dna-forest">+20 pts per project</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;