
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface AdminUserSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const AdminUserSearch: React.FC<AdminUserSearchProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Search Admin Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by user ID or role..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminUserSearch;
