import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, TrendingUp, Zap, Shield, ArrowRight, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MonthlyUpdateHubProps {
  region: string;
}

const MonthlyUpdateHub: React.FC<MonthlyUpdateHubProps> = ({ region }) => {
  const [monthlyReports, setMonthlyReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthlyReports();
  }, [region]);

  const fetchMonthlyReports = async () => {
    try {
      const { data, error } = await supabase
        .from('monthly_reports')
        .select(`
          *,
          regions (name),
          countries (name, iso_code)
        `)
        .eq('is_published', true)
        .order('report_year', { ascending: false })
        .order('report_month', { ascending: false })
        .limit(6);

      if (!error && data) {
        setMonthlyReports(data);
      }
    } catch (error) {
      console.error('Error fetching monthly reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for the current month
  const currentMonthData = {
    month: 'January 2025',
    economic_summary: 'Regional GDP growth accelerated to 4.2% YoY, driven by strong performance in Egypt and Morocco. FDI inflows reached $3.1B, up 18% from previous quarter.',
    innovation_highlight: 'Cairo-based fintech startup MoneyFellows secured $31M Series B funding. Tunisia launched its first government-backed startup incubator with €10M funding.',
    political_summary: 'Morocco advanced renewable energy initiatives with new solar projects. Egypt continued economic reforms with IMF program implementation showing positive results.',
    featured_projects: [
      {
        name: 'North Africa Green Energy Corridor',
        description: 'Regional renewable energy infrastructure project',
        investment: '$2.4B',
        countries: ['Morocco', 'Algeria', 'Tunisia']
      },
      {
        name: 'Digital Payment Integration',
        description: 'Cross-border payment system for regional trade',
        investment: '$180M',
        countries: ['Egypt', 'Morocco']
      }
    ]
  };

  const economicIndicators = [
    { indicator: 'Regional GDP Growth', value: '4.2%', change: '+0.8%', positive: true },
    { indicator: 'FDI Inflows', value: '$3.1B', change: '+18%', positive: true },
    { indicator: 'Inflation Rate', value: '2.8%', change: '-0.3%', positive: true },
    { indicator: 'Youth Unemployment', value: '28.5%', change: '-1.2%', positive: true },
  ];

  const politicalUpdates = [
    {
      country: 'Egypt',
      update: 'IMF program implementation showing positive results with currency stabilization',
      risk_level: 'medium',
      date: '2025-01-15'
    },
    {
      country: 'Morocco',
      update: 'Advanced renewable energy initiatives with new solar projects worth $800M',
      risk_level: 'low',
      date: '2025-01-12'
    },
    {
      country: 'Tunisia',
      update: 'Government launched €50M startup support program to boost innovation',
      risk_level: 'medium',
      date: '2025-01-10'
    }
  ];

  const innovationSpotlight = [
    {
      company: 'MoneyFellows',
      sector: 'Fintech',
      funding: '$31M Series B',
      description: 'Digital savings and lending platform expanding across MENA',
      country: 'Egypt'
    },
    {
      company: 'Chari',
      sector: 'B2B Commerce',
      funding: '$5.5M Series A',
      description: 'B2B marketplace connecting retailers with suppliers',
      country: 'Morocco'
    },
    {
      company: 'Expensya',
      sector: 'Enterprise SaaS',
      funding: '$3.8M Growth',
      description: 'Expense management platform for businesses',
      country: 'Tunisia'
    }
  ];

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Monthly Update Hub</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay informed with the latest economic, political, and innovation updates from {region}.
          </p>
        </div>

        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="current">Current Month</TabsTrigger>
            <TabsTrigger value="economic">Economic</TabsTrigger>
            <TabsTrigger value="innovation">Innovation</TabsTrigger>
            <TabsTrigger value="political">Political</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">{currentMonthData.month} Report</CardTitle>
                  </div>
                  <Button variant="outline" size="sm" className="group">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Economic Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {currentMonthData.economic_summary}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="h-5 w-5 text-secondary" />
                        Innovation Highlight
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {currentMonthData.innovation_highlight}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-accent" />
                        Political Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {currentMonthData.political_summary}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Featured Projects</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {currentMonthData.featured_projects.map((project, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{project.name}</h4>
                            <Badge variant="outline">{project.investment}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {project.countries.map((country, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {country}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="economic" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {economicIndicators.map((indicator, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <Badge variant={indicator.positive ? "default" : "destructive"} className="text-xs">
                        {indicator.change}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-sm">{indicator.indicator}</h4>
                    <p className="text-xl font-bold">{indicator.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="innovation" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {innovationSpotlight.map((company, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Zap className="h-4 w-4 text-secondary" />
                      <Badge variant="outline" className="text-xs">{company.country}</Badge>
                    </div>
                    <h4 className="font-semibold">{company.company}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{company.sector}</p>
                    <p className="text-xs text-muted-foreground mb-2">{company.description}</p>
                    <Badge variant="secondary" className="text-xs">{company.funding}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="political" className="space-y-6">
            <div className="space-y-4">
              {politicalUpdates.map((update, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-accent" />
                        <h4 className="font-semibold">{update.country}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={update.risk_level === 'low' ? 'default' : update.risk_level === 'medium' ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {update.risk_level} risk
                        </Badge>
                        <span className="text-xs text-muted-foreground">{update.date}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{update.update}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Archive Access */}
        <div className="mt-12 text-center">
          <Card className="inline-block">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Report Archive</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Access previous monthly reports and track regional progress over time.
              </p>
              <Button variant="outline" className="group">
                Browse Archive
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default MonthlyUpdateHub;