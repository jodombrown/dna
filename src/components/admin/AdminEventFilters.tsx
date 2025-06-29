
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface AdminEventFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
}

const AdminEventFilters: React.FC<AdminEventFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="networking">Networking</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="conference">Conference</SelectItem>
              <SelectItem value="meetup">Meetup</SelectItem>
              <SelectItem value="webinar">Webinar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminEventFilters;
