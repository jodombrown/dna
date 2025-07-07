import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopNav } from '@/components/admin/AdminTopNav';
import { WaitlistManagementTable } from '@/components/admin/growth/WaitlistManagementTable';
import { ReferralAnalyticsModule } from '@/components/admin/growth/ReferralAnalyticsModule';
import { CampaignLauncherForm } from '@/components/admin/growth/CampaignLauncherForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminAuthWrapper from '@/components/admin/AdminAuthWrapper';
import { TrendingUp, Users, Mail, Target } from 'lucide-react';

const AdminGrowthDashboard = () => {
  return (
    <AdminAuthWrapper requiredRole="admin">
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AdminSidebar />
          
          <div className="flex-1 flex flex-col">
            <AdminTopNav />
            
            <main className="flex-1 p-6 overflow-auto">
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-dna-emerald" />
                  Growth Dashboard
                </h1>
                <p className="text-gray-600">
                  Manage user acquisition, campaigns, and growth analytics for the DNA platform.
                </p>
              </div>

              {/* Growth Metrics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Waitlist</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2,845</div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Referrals</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">892</div>
                    <p className="text-xs text-muted-foreground">+8% from last month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Campaigns Active</CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">7</div>
                    <p className="text-xs text-muted-foreground">3 scheduled</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">23.4%</div>
                    <p className="text-xs text-muted-foreground">+2.1% from last month</p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Tabs */}
              <Tabs defaultValue="waitlist" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="waitlist">Waitlist Management</TabsTrigger>
                  <TabsTrigger value="referrals">Referral Analytics</TabsTrigger>
                  <TabsTrigger value="campaigns">Campaign Launcher</TabsTrigger>
                </TabsList>
                
                <TabsContent value="waitlist" className="space-y-6">
                  <WaitlistManagementTable />
                </TabsContent>
                
                <TabsContent value="referrals" className="space-y-6">
                  <ReferralAnalyticsModule />
                </TabsContent>
                
                <TabsContent value="campaigns" className="space-y-6">
                  <CampaignLauncherForm />
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminAuthWrapper>
  );
};

export default AdminGrowthDashboard;