import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MapPin, Building, TrendingUp, Globe } from 'lucide-react';
import { Loader } from '@/components/ui/loader';

interface RegionData {
  region: string;
  count: number;
  percentage: number;
}

interface SectorData {
  sector: string;
  count: number;
  percentage: number;
}

interface CombinedData {
  region: string;
  sectors: { [sector: string]: number };
  total: number;
}

const TopSectorsRegions = () => {
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [sectorData, setSectorData] = useState<SectorData[]>([]);
  const [combinedData, setCombinedData] = useState<CombinedData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegionalData();
  }, []);

  const fetchRegionalData = async () => {
    try {
      setLoading(true);
      
      // Fetch ADIN profiles with regional and sectoral data
      const { data: adinProfiles, error: adinError } = await supabase
        .from('adin_profiles')
        .select('region_focus, sector_focus');

      // Fetch user profiles with location data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('location, industry');

      if (adinError || profilesError) {
        throw new Error('Error fetching regional data');
      }

      // Process region data
      const regionCounts: { [key: string]: number } = {};
      
      // Count from ADIN profiles
      adinProfiles?.forEach(profile => {
        if (profile.region_focus && Array.isArray(profile.region_focus)) {
          profile.region_focus.forEach((region: string) => {
            regionCounts[region] = (regionCounts[region] || 0) + 1;
          });
        }
      });

      // Count from user profiles (extract country/region from location)
      profiles?.forEach(profile => {
        if (profile.location) {
          // Simple extraction - in a real app, you'd use a proper location parser
          const location = profile.location.toLowerCase();
          let region = 'Other';
          
          if (location.includes('nigeria') || location.includes('lagos') || location.includes('abuja')) {
            region = 'Nigeria';
          } else if (location.includes('south africa') || location.includes('cape town') || location.includes('johannesburg')) {
            region = 'South Africa';
          } else if (location.includes('kenya') || location.includes('nairobi')) {
            region = 'Kenya';
          } else if (location.includes('ghana') || location.includes('accra')) {
            region = 'Ghana';
          } else if (location.includes('usa') || location.includes('united states') || location.includes('new york') || location.includes('california')) {
            region = 'USA';
          } else if (location.includes('uk') || location.includes('united kingdom') || location.includes('london')) {
            region = 'UK';
          } else if (location.includes('canada') || location.includes('toronto') || location.includes('vancouver')) {
            region = 'Canada';
          }
          
          regionCounts[region] = (regionCounts[region] || 0) + 1;
        }
      });

      // Process sector data
      const sectorCounts: { [key: string]: number } = {};
      
      // Count from ADIN profiles
      adinProfiles?.forEach(profile => {
        if (profile.sector_focus && Array.isArray(profile.sector_focus)) {
          profile.sector_focus.forEach((sector: string) => {
            sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
          });
        }
      });

      // Count from user profiles
      profiles?.forEach(profile => {
        if (profile.industry) {
          sectorCounts[profile.industry] = (sectorCounts[profile.industry] || 0) + 1;
        }
      });

      // Convert to chart format
      const totalRegions = Object.values(regionCounts).reduce((sum, count) => sum + count, 0);
      const regionChartData: RegionData[] = Object.entries(regionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([region, count]) => ({
          region,
          count,
          percentage: totalRegions > 0 ? (count / totalRegions) * 100 : 0,
        }));

      const totalSectors = Object.values(sectorCounts).reduce((sum, count) => sum + count, 0);
      const sectorChartData: SectorData[] = Object.entries(sectorCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([sector, count]) => ({
          sector,
          count,
          percentage: totalSectors > 0 ? (count / totalSectors) * 100 : 0,
        }));

      setRegionData(regionChartData);
      setSectorData(sectorChartData);

      // Create combined region-sector data
      const combined: CombinedData[] = regionChartData.slice(0, 5).map(regionItem => {
        const sectorsInRegion: { [sector: string]: number } = {};
        let totalInRegion = 0;

        // This is simplified - in a real app, you'd need to properly correlate region and sector data
        sectorChartData.slice(0, 3).forEach(sectorItem => {
          const count = Math.round(Math.random() * regionItem.count * 0.3);
          sectorsInRegion[sectorItem.sector] = count;
          totalInRegion += count;
        });

        return {
          region: regionItem.region,
          sectors: sectorsInRegion,
          total: totalInRegion,
        };
      });

      setCombinedData(combined);

    } catch (error) {
      console.error('Error fetching regional data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = [
    'hsl(var(--dna-forest))',
    'hsl(var(--dna-emerald))',
    'hsl(var(--dna-copper))',
    'hsl(var(--dna-gold))',
    'hsl(var(--dna-ivory))',
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7300',
    '#00ff00',
  ];

  if (loading) {
    return <Loader label="Loading regional analytics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Globe className="h-6 w-6 text-dna-forest" />
            <div>
              <p className="text-2xl font-bold text-foreground">{regionData.length}</p>
              <p className="text-sm text-muted-foreground">Active Regions</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Building className="h-6 w-6 text-dna-emerald" />
            <div>
              <p className="text-2xl font-bold text-foreground">{sectorData.length}</p>
              <p className="text-sm text-muted-foreground">Active Sectors</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-dna-copper" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {regionData[0]?.region || 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">Top Region</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-dna-gold" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {sectorData[0]?.sector || 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">Top Sector</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Regions Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Regions by Activity</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="region" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    value,
                    name === 'count' ? 'Activity Count' : 'Percentage'
                  ]}
                />
                <Bar dataKey="count" fill="hsl(var(--dna-forest))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Sectors Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Sectors by Activity</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="sector" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    value,
                    name === 'count' ? 'Activity Count' : 'Percentage'
                  ]}
                />
                <Bar dataKey="count" fill="hsl(var(--dna-emerald))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Distribution Pie Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Regional Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={regionData.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ region, percentage }) => `${region}: ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {regionData.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value} activities`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Sectoral Distribution Pie Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Sectoral Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorData.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ sector, percentage }) => `${sector}: ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {sectorData.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value} activities`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Regional Rankings Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Regional Rankings</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {regionData.map((region, index) => (
              <div key={region.region} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-dna-forest text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium">{region.region}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{region.count} activities</Badge>
                  <span className="text-sm text-muted-foreground">
                    {region.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Sector Rankings</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {sectorData.map((sector, index) => (
              <div key={sector.sector} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-dna-emerald text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium">{sector.sector}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{sector.count} activities</Badge>
                  <span className="text-sm text-muted-foreground">
                    {sector.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TopSectorsRegions;