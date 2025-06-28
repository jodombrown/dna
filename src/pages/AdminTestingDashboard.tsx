
import React from 'react';
import Header from '@/components/Header';
import TestingDashboard from '@/components/admin/TestingDashboard';
import ProtectedAdminRoute from '@/components/ProtectedAdminRoute';

const AdminTestingDashboard = () => {
  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-8">
          <TestingDashboard />
        </div>
      </div>
    </ProtectedAdminRoute>
  );
};

export default AdminTestingDashboard;
