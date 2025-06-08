
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  loading: boolean;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  searchTerm,
  onSearchChange,
  onSearch,
  loading
}) => {
  return (
    <Card className="mb-6 sm:mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Search className="w-5 h-5" />
          Find Your Network
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Input 
            placeholder="Search by name, expertise, company..." 
            className="flex-1"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          />
          <Button 
            className="bg-dna-emerald hover:bg-dna-forest text-white"
            onClick={onSearch}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchSection;
