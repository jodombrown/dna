import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Award, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { Loader } from '@/components/ui/loader';

interface InfluenceDistribution {
  range: string;
  count: number;
  percentage: number;
}

interface ADINMetrics {
  total_profiles: number;
  verified_count: number;
  avg_score: number;
  top_score: number;
}

const ADINInfluenceChart = () => {
  const [distributionData, setDistributionData] = useState<InfluenceDistribution[]>([]);
  const [metrics, setMetrics] = useState<ADINMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchADINData();
  }, []);

  const fetchADINData = async () => {
    try {
      setLoading(true);
      
      // Fetch ADIN profiles with scores
      const { data: adinProfiles, error: adinError } = await supabase
        .from('adin_profiles')
        .select('influence_score, verified');

      if (adinError) throw adinError;

      // Fetch user ADIN profile data for verified contributors
      const { data: userAdinData, error: userError } = await supabase
        .from('user_adin_profile')
        .select('contributor_score, is_verified_contributor');

      if (userError) throw userError;

      // Combine and process data
      const allScores: number[] = [];
      let verifiedCount = 0;

      // Add ADIN profile scores
      adinProfiles?.forEach(profile => {
        if (profile.influence_score !== null) {
          allScores.push(profile.influence_score);
        }
        if (profile.verified) {
          verifiedCount++;
        }
      });

      // Add user ADIN scores
      userAdinData?.forEach(profile => {
        if (profile.contributor_score !== null && profile.contributor_score > 0) {
          allScores.push(profile.contributor_score);
        }
        if (profile.is_verified_contributor) {
          verifiedCount++;
        }
      });

      // Create distribution bins
      const bins = [
        { range: '0-50', min: 0, max: 50 },
        { range: '51-200', min: 51, max: 200 },
        { range: '201-500', min: 201, max: 500 },
        { range: '501-1000', min: 501, max: 1000 },
        { range: '1000+', min: 1001, max: Infinity },
      ];

      const distribution = bins.map(bin => {
        const count = allScores.filter(score => score >= bin.min && score <= bin.max).length;
        return {
          range: bin.range,
          count,
          percentage: allScores.length > 0 ? (count / allScores.length) * 100 : 0,
        };
      });

      setDistributionData(distribution);

      // Calculate metrics
      const totalProfiles = allScores.length;
      const avgScore = totalProfiles > 0 ? allScores.reduce((sum, score) => sum + score, 0) / totalProfiles : 0;
      const topScore = totalProfiles > 0 ? Math.max(...allScores) : 0;

      setMetrics({
        total_profiles: totalProfiles,
        verified_count: verifiedCount,
        avg_score: avgScore,
        top_score: topScore,
      });

    } catch (error) {
      console.error('Error fetching ADIN data:', error);
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
  ];

  if (loading) {
    return <Loader label="Loading ADIN influence analytics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-dna-forest" />
              <div>
                <p className="text-2xl font-bold text-foreground">{metrics.total_profiles}</p>
                <p className="text-sm text-muted-foreground">ADIN Profiles</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-dna-emerald" />
              <div>
                <p className="text-2xl font-bold text-foreground">{metrics.verified_count}</p>
                <p className="text-sm text-muted-foreground">Verified Contributors</p>
                <Badge variant="secondary">
                  {metrics.total_profiles > 0 ? ((metrics.verified_count / metrics.total_profiles) * 100).toFixed(1) : 0}% verified
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-dna-copper" />
              <div>
                <p className="text-2xl font-bold text-foreground">{metrics.avg_score.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">Average Score</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-dna-gold" />
              <div>
                <p className="text-2xl font-bold text-foreground">{metrics.top_score}</p>
                <p className="text-sm text-muted-foreground">Highest Score</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Influence Score Distribution Bar Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Influence Score Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'count' ? `${value} profiles` : `${Number(value).toFixed(1)}%`,
                    name === 'count' ? 'Count' : 'Percentage'
                  ]}
                />
                <Bar dataKey="count" fill="hsl(var(--dna-forest))" name="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Distribution Pie Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Score Range Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, percentage }) => `${range}: ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value} profiles`, 'Count']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Distribution Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Detailed Distribution</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-4">Score Range</th>
                <th className="text-left py-2 px-4">Count</th>
                <th className="text-left py-2 px-4">Percentage</th>
                <th className="text-left py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {distributionData.map((item, index) => (
                <tr key={item.range} className="border-b border-border">
                  <td className="py-2 px-4 font-medium">{item.range}</td>
                  <td className="py-2 px-4">{item.count}</td>
                  <td className="py-2 px-4">{item.percentage.toFixed(1)}%</td>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <Badge 
                        variant={item.count > 0 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {item.count > 0 ? 'Active' : 'Empty'}
                      </Badge>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ADINInfluenceChart;