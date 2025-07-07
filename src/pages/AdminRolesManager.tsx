import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopNav } from '@/components/admin/AdminTopNav';
import { AdminRolesTable } from '@/components/admin/roles/AdminRolesTable';
import { InviteAdminDialog } from '@/components/admin/roles/InviteAdminDialog';
import AdminAuthWrapper from '@/components/admin/AdminAuthWrapper';
import { Shield } from 'lucide-react';

const AdminRolesManager = () => {
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                      <Shield className="h-8 w-8 text-dna-emerald" />
                      Admin Roles Management
                    </h1>
                    <p className="text-gray-600">
                      Manage admin roles and permissions for platform access.
                    </p>
                  </div>
                  <InviteAdminDialog />
                </div>
              </div>

              <AdminRolesTable />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminAuthWrapper>
  );
};

export default AdminRolesManager;