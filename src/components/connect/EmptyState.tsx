
import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  type: 'professionals' | 'communities' | 'events';
  onRefresh: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, onRefresh }) => (
  <div className="text-center py-12">
    <p className="text-gray-500 text-lg">No {type} found.</p>
    <Button 
      onClick={onRefresh}
      className="mt-4 bg-dna-emerald hover:bg-dna-forest text-white"
    >
      Refresh Data
    </Button>
  </div>
);

export default EmptyState;
