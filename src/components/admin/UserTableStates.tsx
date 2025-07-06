import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, XCircle } from 'lucide-react';

interface LoadingStateProps {
  rowCount?: number;
}

export function LoadingState({ rowCount = 5 }: LoadingStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(rowCount)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-16 h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ErrorStateProps {
  error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center text-red-600">
          <XCircle className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function EmptyState() {
  return (
    <div className="text-center py-12">
      <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <p className="text-gray-600 mb-2">No users found</p>
      <p className="text-sm text-gray-500">
        Try adjusting your search criteria
      </p>
    </div>
  );
}