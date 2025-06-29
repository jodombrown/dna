
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminUserManagementHeaderProps {
  onAddUser: () => void;
}

const AdminUserManagementHeader: React.FC<AdminUserManagementHeaderProps> = ({ onAddUser }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/admin-dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Users className="w-8 h-8 text-dna-emerald mr-3" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin User Management</h1>
              <p className="text-sm text-gray-500">Manage admin users and their roles</p>
            </div>
          </div>
          <Button 
            onClick={onAddUser}
            className="bg-dna-emerald hover:bg-dna-forest text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Admin User
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagementHeader;
