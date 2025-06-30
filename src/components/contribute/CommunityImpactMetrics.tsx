
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Globe, 
  Calendar,
  FileText,
  Award,
  ArrowRight
} from 'lucide-react';

interface CommunityImpactMetricsProps {
  onViewReports: () => void;
}

const CommunityImpactMetrics: React.FC<CommunityImpactMetricsProps> = ({ onViewReports }) => {
  const regionalMetrics = [
    { region: 'West Africa', projects: 23, funding: '$1.2M', contributors: 456 },
    { region: 'East Africa', projects: 18, funding: '$980K', contributors: 342 },
    { region: 'Southern Africa', projects: 15, funding: '$750K', contributors: 298 },
    { region: 'North Africa', projects: 12, funding: '$620K', contributors: 201 },
    { region: 'Central Africa', projects: 8, funding: '$450K', contributors: 156 }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Community Impact Overview</h2>
        <Button 
          onClick={onViewReports}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          View Reports
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-dna-emerald/10 to-dna-mint/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-dna-emerald" />
              <Badge className="bg-green-100 text-green-800">+23%</Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">$4.2M</h3>
            <p className="text-gray-600">Total Contributions (Q4 2024)</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-dna-copper/10 to-dna-gold/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-dna-copper" />
              <Badge className="bg-blue-100 text-blue-800">+156</Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">2,847</h3>
            <p className="text-gray-600">Active Contributors</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-dna-mint/10 to-dna-emerald/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Globe className="w-8 h-8 text-dna-mint" />
              <Badge className="bg-purple-100 text-purple-800">54 Countries</Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">847K</h3>
            <p className="text-gray-600">Lives Impacted</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-dna-gold/10 to-dna-copper/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-dna-gold" />
              <Badge className="bg-orange-100 text-orange-800">Active</Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">156</h3>
            <p className="text-gray-600">Open Opportunities</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-dna-emerald" />
            Regional Impact Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionalMetrics.map((region) => (
              <div key={region.region} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{region.region}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projects:</span>
                    <span className="font-medium">{region.projects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Funding:</span>
                    <span className="font-medium text-dna-emerald">{region.funding}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contributors:</span>
                    <span className="font-medium">{region.contributors}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-dna-emerald/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Quarterly & Annual Reports</h4>
                <p className="text-sm text-gray-600">Get detailed insights into regional progress and impact metrics</p>
              </div>
              <Button 
                onClick={onViewReports}
                className="bg-dna-emerald hover:bg-dna-forest text-white"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Access Reports
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityImpactMetrics;
