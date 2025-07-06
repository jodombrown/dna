import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopNav } from '@/components/admin/AdminTopNav';
import { MetricsCardsGrid } from '@/components/admin/insights/MetricsCardsGrid';
import { EngagementTrendsChart } from '@/components/admin/insights/EngagementTrendsChart';
import { TopCommunitiesTable } from '@/components/admin/insights/TopCommunitiesTable';
import { WaitlistTracker } from '@/components/admin/insights/WaitlistTracker';
import { CSVExportButton } from '@/components/admin/insights/CSVExportButton';
import { useAdminDashboardStats } from '@/hooks/useAdminDashboardStats';
import AdminAuthWrapper from '@/components/admin/AdminAuthWrapper';
import { Loader2, TrendingUp } from 'lucide-react';

const AdminInsightsDashboard = () => {
  const stats = useAdminDashboardStats();

  return (
    <AdminAuthWrapper>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AdminSidebar />
          
          <div className="flex-1 flex flex-col">
            <AdminTopNav />
            
            <main className="flex-1 p-6 overflow-auto">
              {/* Page Header */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                      <TrendingUp className="h-8 w-8 text-dna-emerald" />
                      Analytics Dashboard
                    </h1>
                    <p className="text-gray-600">
                      Real-time insights into platform performance, user engagement, and growth metrics.
                    </p>
                  </div>
                  <CSVExportButton />
                </div>
              </div>

              {stats.loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-dna-emerald" />
                  <span className="ml-3 text-gray-600">Loading analytics...</span>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Key Metrics */}
                  <MetricsCardsGrid stats={stats} />
                  
                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <EngagementTrendsChart />
                    <WaitlistTracker />
                  </div>
                  
                  {/* Communities Table */}
                  <TopCommunitiesTable />
                </div>
              )}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminAuthWrapper>
  );
};

export default AdminInsightsDashboard;