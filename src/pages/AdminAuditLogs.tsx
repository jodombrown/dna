import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopNav } from '@/components/admin/AdminTopNav';
import { AdminAuditLogsTable } from '@/components/admin/logs/AdminAuditLogsTable';
import { AuditLogFilters } from '@/components/admin/logs/AuditLogFilters';
import { AuditLogExport } from '@/components/admin/logs/AuditLogExport';
import AdminAuthWrapper from '@/components/admin/AdminAuthWrapper';
import { FileText } from 'lucide-react';

const AdminAuditLogs = () => {
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                      <FileText className="h-8 w-8 text-dna-emerald" />
                      Audit Logs
                    </h1>
                    <p className="text-gray-600">
                      Track all administrative actions and system events for transparency and accountability.
                    </p>
                  </div>
                  <AuditLogExport />
                </div>
              </div>

              {/* Filters */}
              <div className="mb-6">
                <AuditLogFilters />
              </div>

              {/* Logs Table */}
              <AdminAuditLogsTable />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminAuthWrapper>
  );
};

export default AdminAuditLogs;