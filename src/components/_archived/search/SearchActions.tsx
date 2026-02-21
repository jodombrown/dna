
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, RotateCcw } from 'lucide-react';

interface SearchActionsProps {
  onSearch: () => void;
  onClear: () => void;
  loading: boolean;
}

const SearchActions: React.FC<SearchActionsProps> = ({ onSearch, onClear, loading }) => {
  return (
    <div className="flex justify-end space-x-2">
      <Button
        variant="outline"
        onClick={onClear}
        disabled={loading}
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Clear
      </Button>
      <Button
        onClick={onSearch}
        disabled={loading}
      >
        <Search className="w-4 h-4 mr-2" />
        Search
      </Button>
    </div>
  );
};

export default SearchActions;
