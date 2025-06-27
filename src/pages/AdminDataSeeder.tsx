
import React from 'react';
import Header from '@/components/Header';
import DataSeeder from '@/components/admin/DataSeeder';
import ProtectedAdminRoute from '@/components/ProtectedAdminRoute';

const AdminDataSeeder = () => {
  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-8">
          <DataSeeder />
        </div>
      </div>
    </ProtectedAdminRoute>
  );
};

export default AdminDataSeeder;
