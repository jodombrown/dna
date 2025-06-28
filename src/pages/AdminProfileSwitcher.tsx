
import React from 'react';
import Header from '@/components/Header';
import AdminProfileSwitcher from '@/components/admin/AdminProfileSwitcher';
import ProtectedAdminRoute from '@/components/ProtectedAdminRoute';

const AdminProfileSwitcherPage = () => {
  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-8">
          <AdminProfileSwitcher />
        </div>
      </div>
    </ProtectedAdminRoute>
  );
};

export default AdminProfileSwitcherPage;
