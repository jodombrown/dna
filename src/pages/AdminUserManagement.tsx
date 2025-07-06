import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopNav } from '@/components/admin/AdminTopNav';
import { UserListTable } from '@/components/admin/UserListTable';
import { UserTablePagination } from '@/components/admin/UserTablePagination';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, RefreshCw } from 'lucide-react';
import AdminAuthWrapper from '@/components/admin/AdminAuthWrapper';

const AdminUserManagement = () => {
  const {
    users,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    refreshUsers
  } = useAdminUsers(10);

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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
                    <p className="text-gray-600">
                      Monitor and manage all platform users, roles, and account status.
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshUsers}
                      disabled={loading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" disabled>
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                      <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                        Coming Soon
                      </span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="space-y-4">
                <UserListTable 
                  users={users}
                  loading={loading}
                  error={error}
                />
                
                {!loading && !error && (
                  <UserTablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    pageSize={10}
                    onPageChange={setCurrentPage}
                    loading={loading}
                  />
                )}
              </div>

              {/* Phase Progress Indicator */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      ✅ Phase 3 Complete: Hybrid Data System
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Real Supabase data when available, falls back to mock data for testing
                    </p>
                  </div>
                  <div className="text-xs text-blue-600">
                    Next: Phase 4 - User Actions & Moderation
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminAuthWrapper>
  );
};

export default AdminUserManagement;