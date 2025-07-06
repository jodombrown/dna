import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopNav } from '@/components/admin/AdminTopNav';
import { UserListTable } from '@/components/admin/UserListTable';
import { UserTablePagination } from '@/components/admin/UserTablePagination';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useUserActions } from '@/hooks/useUserActions';
import { UserActionDialogs } from '@/components/admin/UserActionDialogs';
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

  const {
    deleteDialog,
    statusDialog,
    handleViewProfile,
    handleEditUser,
    handleToggleStatus,
    handleDeleteUser,
    confirmDelete,
    confirmStatusChange,
    cancelDelete,
    cancelStatusChange
  } = useUserActions();

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
                  onViewProfile={handleViewProfile}
                  onEditUser={handleEditUser}
                  onToggleStatus={handleToggleStatus}
                  onDeleteUser={handleDeleteUser}
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

              {/* Action Dialogs */}
              <UserActionDialogs
                deleteDialog={deleteDialog}
                statusDialog={statusDialog}
                onDeleteConfirm={confirmDelete}
                onStatusConfirm={confirmStatusChange}
                onDeleteCancel={cancelDelete}
                onStatusCancel={cancelStatusChange}
              />

              {/* Phase Progress Indicator */}
              <div className="mt-8 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-900">
                      ✅ Refactoring Complete: Clean Component Architecture
                    </p>
                    <p className="text-xs text-purple-700 mt-1">
                      Split 252-line file into 5 focused components for better maintainability
                    </p>
                  </div>
                  <div className="text-xs text-purple-600">
                    Ready for Phase 5 - Profile Preview & Enhanced Features
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