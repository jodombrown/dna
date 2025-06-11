
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import AdvancedSearchDialog from '@/components/search/AdvancedSearchDialog';

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
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);

  return (
    <>
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
            <div className="flex gap-2">
              <Button 
                className="bg-dna-emerald hover:bg-dna-forest text-white"
                onClick={onSearch}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAdvancedSearchOpen(true)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Advanced
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Use the Advanced Search for more detailed filtering options
          </p>
        </CardContent>
      </Card>

      <AdvancedSearchDialog 
        isOpen={isAdvancedSearchOpen}
        onClose={() => setIsAdvancedSearchOpen(false)}
      />
    </>
  );
};

export default SearchSection;
