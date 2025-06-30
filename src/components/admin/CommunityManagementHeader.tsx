
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Filter, RefreshCw } from 'lucide-react';

interface CommunityManagementHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  filterCategory: string;
  onCategoryChange: (value: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  stats: {
    total: number;
    pending: number;
    flagged: number;
    approved: number;
  };
}

const CommunityManagementHeader: React.FC<CommunityManagementHeaderProps> = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterCategory,
  onCategoryChange,
  onRefresh,
  isLoading,
  stats
}) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-dna-emerald mr-3" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Community Management</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Total: {stats.total}</span>
                <Badge variant="outline" className="text-yellow-600">
                  Pending: {stats.pending}
                </Badge>
                <Badge variant="outline" className="text-red-600">
                  Flagged: {stats.flagged}
                </Badge>
                <Badge variant="outline" className="text-green-600">
                  Approved: {stats.approved}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search communities..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Environment">Environment</SelectItem>
                <SelectItem value="Culture">Culture</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityManagementHeader;
