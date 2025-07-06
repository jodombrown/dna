import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopNav } from '@/components/admin/AdminTopNav';
import { StatWidget } from '@/components/admin/StatWidget';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import { SystemMessageBanner } from '@/components/admin/SystemMessageBanner';
import { useAdminDashboardStats } from '@/hooks/useAdminDashboardStats';
import AdminAuthWrapper from '@/components/admin/AdminAuthWrapper';
import { 
  Users, 
  UserPlus, 
  Activity, 
  MessageSquare, 
  Flag,
  Building,
  Calendar
} from 'lucide-react';

const AdminDashboardHome = () => {
  const stats = useAdminDashboardStats();

  return (
    <AdminAuthWrapper>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AdminSidebar />
          
          <div className="flex-1 flex flex-col">
            <AdminTopNav />
            
            <main className="flex-1 p-6 overflow-auto">
              {/* System Messages */}
              <SystemMessageBanner />
              
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">
                  Welcome to the DNA Admin Portal. Monitor and manage the platform from here.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatWidget
                  title="Total Users"
                  value={stats.totalUsers}
                  icon={Users}
                  change={{ value: '+12%', type: 'increase' }}
                  description="All registered users"
                  loading={stats.loading}
                />
                <StatWidget
                  title="New Signups Today"
                  value={stats.newSignupsToday}
                  icon={UserPlus}
                  change={{ value: '+5', type: 'increase' }}
                  description="Registrations today"
                  loading={stats.loading}
                />
                <StatWidget
                  title="Active This Week"
                  value={stats.activeUsersThisWeek}
                  icon={Activity}
                  change={{ value: '+8%', type: 'increase' }}
                  description="Users with activity"
                  loading={stats.loading}
                />
                <StatWidget
                  title="Posts Today"
                  value={stats.postsToday}
                  icon={MessageSquare}
                  change={{ value: '+3', type: 'increase' }}
                  description="New posts created"
                  loading={stats.loading}
                />
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatWidget
                  title="Flagged Content"
                  value={stats.flaggedContent}
                  icon={Flag}
                  change={{ value: '-2', type: 'decrease' }}
                  description="Pending moderation"
                  loading={stats.loading}
                />
                <StatWidget
                  title="Communities"
                  value={stats.totalCommunities}
                  icon={Building}
                  change={{ value: '+1', type: 'increase' }}
                  description="Active communities"
                  loading={stats.loading}
                />
                <StatWidget
                  title="Events"
                  value={stats.totalEvents}
                  icon={Calendar}
                  change={{ value: '+4', type: 'increase' }}
                  description="Scheduled events"
                  loading={stats.loading}
                />
              </div>

              {/* Activity Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <ActivityFeed />
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminAuthWrapper>
  );
};

export default AdminDashboardHome;