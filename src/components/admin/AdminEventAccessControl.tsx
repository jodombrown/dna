
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AdminEventAccessControlProps {
  canManageEvents: boolean;
  onNavigateBack: () => void;
}

const AdminEventAccessControl: React.FC<AdminEventAccessControlProps> = ({
  canManageEvents,
  onNavigateBack
}) => {
  if (canManageEvents) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-red-600">Access Denied</CardTitle>
          <CardDescription>You don't have permission to manage events.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onNavigateBack}>Return to Dashboard</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEventAccessControl;
