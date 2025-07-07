import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopNav } from '@/components/admin/AdminTopNav';
import { SettingsFormSection } from '@/components/admin/settings/SettingsFormSection';
import AdminAuthWrapper from '@/components/admin/AdminAuthWrapper';
import { Settings } from 'lucide-react';

const AdminSettingsPage = () => {
  return (
    <AdminAuthWrapper requiredRole="superadmin">
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AdminSidebar />
          
          <div className="flex-1 flex flex-col">
            <AdminTopNav />
            
            <main className="flex-1 p-6 overflow-auto">
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <Settings className="h-8 w-8 text-dna-emerald" />
                  Platform Settings
                </h1>
                <p className="text-gray-600">
                  Configure platform-wide behavior and default settings.
                </p>
              </div>

              <SettingsFormSection />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminAuthWrapper>
  );
};

export default AdminSettingsPage;