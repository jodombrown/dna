
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Calendar, 
  Globe,
  TrendingUp,
  BarChart3,
  ArrowRight
} from 'lucide-react';

interface ReportsAccessPanelProps {
  onDownloadReport: (reportType: string) => void;
}

const ReportsAccessPanel: React.FC<ReportsAccessPanelProps> = ({ onDownloadReport }) => {
  const quarterlyReports = [
    {
      id: 'q4-2024',
      title: 'Q4 2024 Regional Impact Report',
      description: 'Comprehensive overview of contributions and outcomes across all African regions',
      date: 'December 2024',
      size: '2.3 MB',
      highlights: ['$4.2M total contributions', '156 active projects', '847K lives impacted']
    },
    {
      id: 'q3-2024',
      title: 'Q3 2024 Regional Impact Report',
      description: 'Third quarter analysis of community contributions and project progress',
      date: 'September 2024',
      size: '2.1 MB',
      highlights: ['$3.8M total contributions', '134 active projects', '723K lives impacted']
    }
  ];

  const annualReports = [
    {
      id: 'annual-2024',
      title: '2024 State of African Progress Report',
      description: 'Annual comprehensive analysis of diaspora contributions and regional development',
      date: 'January 2025',
      size: '5.2 MB',
      status: 'upcoming',
      highlights: ['Year-end impact analysis', 'Regional development trends', 'Future opportunity mapping']
    },
    {
      id: 'annual-2023',
      title: '2023 State of African Progress Report',
      description: 'Complete overview of 2023 contributions, achievements, and impact metrics',
      date: 'January 2024',
      size: '4.8 MB',
      status: 'available',
      highlights: ['$12.4M annual contributions', '89 completed projects', '2.1M lives impacted']
    }
  ];

  return (
    <div className="mb-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Impact Reports & Analytics</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Access detailed quarterly and annual reports showcasing the collective impact of 
          diaspora contributions across African regions.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-dna-emerald" />
              Quarterly Regional Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quarterlyReports.map((report) => (
              <div key={report.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {report.size}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {report.date}
                  </span>
                </div>

                <div className="space-y-1 mb-4">
                  {report.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-dna-emerald rounded-full" />
                      <span className="text-gray-600">{highlight}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => onDownloadReport(report.id)}
                  className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-dna-copper" />
              Annual State Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {annualReports.map((report) => (
              <div key={report.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  </div>
                  <div className="ml-2 flex flex-col gap-1">
                    <Badge 
                      variant="outline" 
                      className={report.status === 'upcoming' ? 'bg-yellow-50 text-yellow-700' : ''}
                    >
                      {report.size}
                    </Badge>
                    {report.status === 'upcoming' && (
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {report.date}
                  </span>
                </div>

                <div className="space-y-1 mb-4">
                  {report.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-dna-copper rounded-full" />
                      <span className="text-gray-600">{highlight}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => onDownloadReport(report.id)}
                  className="w-full"
                  variant={report.status === 'upcoming' ? 'outline' : 'default'}
                  disabled={report.status === 'upcoming'}
                  size="sm"
                >
                  {report.status === 'upcoming' ? (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Notify When Available
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download Report
                    </>
                  )}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 bg-gradient-to-r from-dna-emerald/5 to-dna-mint/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-dna-emerald/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-dna-emerald" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Subscribe to Impact Updates
                </h3>
                <p className="text-gray-600 mb-4">
                  Get notified when new reports are published and receive monthly impact summaries directly in your inbox.
                </p>
              </div>
            </div>
            <Button className="bg-dna-emerald hover:bg-dna-forest text-white">
              Subscribe
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsAccessPanel;
