import React from 'react';
import AfricaSpinner from '@/components/ui/AfricaSpinner';

const SearchResultsLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <AfricaSpinner size="lg" showText text="Searching..." />
    </div>
  );
};

export default SearchResultsLoading;
