import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopNav } from '@/components/admin/AdminTopNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Search, Filter, Plus } from 'lucide-react';
import AdminAuthWrapper from '@/components/admin/AdminAuthWrapper';

const AdminUserManagement = () => {
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
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
                    <p className="text-gray-600">
                      Monitor and manage all platform users, roles, and account status.
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" className="hidden sm:flex">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                    <Button variant="outline" className="hidden sm:flex">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </div>

              {/* Empty State Card */}
              <Card className="max-w-2xl mx-auto mt-12">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-dna-emerald/10 to-dna-copper/10 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-dna-emerald" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">
                    User Management System Ready
                  </CardTitle>
                  <CardDescription className="text-gray-600 max-w-md mx-auto">
                    The user management interface is being built in phases. 
                    Phase 1 (Navigation) is now complete.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="text-center pb-8">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                          <span className="font-medium text-green-800">Phase 1</span>
                        </div>
                        <p className="text-green-700">Navigation & Foundation</p>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                          <span className="font-medium text-gray-800">Phase 2</span>
                        </div>
                        <p className="text-gray-700">Data Layer & Table</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                          <span className="font-medium text-gray-800">Phase 3</span>
                        </div>
                        <p className="text-gray-700">Search & Filtering</p>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                          <span className="font-medium text-gray-800">Phase 4</span>
                        </div>
                        <p className="text-gray-700">User Actions & Modals</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      ✅ Admin navigation successfully established<br />
                      ✅ Route protection and authentication verified<br />
                      ✅ Mobile-responsive layout implemented
                    </p>
                  </div>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminAuthWrapper>
  );
};

export default AdminUserManagement;