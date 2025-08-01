import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Activity, Users, MapPin, Signal } from 'lucide-react';
import UserGrowthChart from './analytics/UserGrowthChart';
import ADINInfluenceChart from './analytics/ADINInfluenceChart';
import EngagementHeatmap from './analytics/EngagementHeatmap';
import ReferralFunnel from './analytics/ReferralFunnel';
import SignalFunnelAnalytics from './analytics/SignalFunnelAnalytics';
import TopSectorsRegions from './analytics/TopSectorsRegions';

const AdminAnalyticsDashboard = () => {
  const analyticsSection = [
    { id: 'growth', label: 'Growth', icon: TrendingUp, component: UserGrowthChart },
    { id: 'adin', label: 'ADIN', icon: BarChart3, component: ADINInfluenceChart },
    { id: 'engagement', label: 'Engagement', icon: Activity, component: EngagementHeatmap },
    { id: 'referrals', label: 'Referrals', icon: Users, component: ReferralFunnel },
    { id: 'signals', label: 'Signals', icon: Signal, component: SignalFunnelAnalytics },
    { id: 'regions', label: 'Regions', icon: MapPin, component: TopSectorsRegions },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {analyticsSection.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.id} className="p-4">
              <div className="flex items-center gap-3">
                <Icon className="h-6 w-6 text-dna-forest" />
                <div>
                  <h3 className="font-semibold text-foreground">{section.label}</h3>
                  <p className="text-sm text-muted-foreground">Analytics</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="growth" className="w-full">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full mb-6">
          {analyticsSection.map((section) => {
            const Icon = section.icon;
            return (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="flex items-center gap-2 text-xs"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{section.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {analyticsSection.map((section) => {
          const Component = section.component;
          return (
            <TabsContent key={section.id} value={section.id}>
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <section.icon className="h-6 w-6 text-dna-forest" />
                  <h2 className="text-xl font-semibold text-foreground">
                    {section.label} Analytics
                  </h2>
                </div>
                <Component />
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default AdminAnalyticsDashboard;