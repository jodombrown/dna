import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopNav } from '@/components/admin/AdminTopNav';
import { NotificationsList } from '@/components/admin/notifications/NotificationsList';
import { NotificationFilters } from '@/components/admin/notifications/NotificationFilters';
import AdminAuthWrapper from '@/components/admin/AdminAuthWrapper';
import { Bell } from 'lucide-react';

const AdminNotificationsPanel = () => {
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
                  <Bell className="h-8 w-8 text-dna-emerald" />
                  Admin Notifications
                </h1>
                <p className="text-gray-600">
                  Stay informed about critical platform events and administrative alerts.
                </p>
              </div>

              {/* Filters */}
              <div className="mb-6">
                <NotificationFilters />
              </div>

              {/* Notifications List */}
              <NotificationsList />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminAuthWrapper>
  );
};

export default AdminNotificationsPanel;