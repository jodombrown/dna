import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopNav } from '@/components/admin/AdminTopNav';
import AdminAuthWrapper from '@/components/admin/AdminAuthWrapper';

const AdminEventsPage = () => {
  return (
    <AdminAuthWrapper>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AdminSidebar />
          
          <div className="flex-1 flex flex-col">
            <AdminTopNav />
            
            <main className="flex-1 p-6 overflow-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Events Management</h1>
                <p className="text-gray-600">
                  Manage platform events and community gatherings.
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="text-center text-gray-500">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Events Management</h3>
                  <p>Event management features coming soon.</p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminAuthWrapper>
  );
};

export default AdminEventsPage;