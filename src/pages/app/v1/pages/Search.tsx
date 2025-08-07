import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search as SearchIcon, Users, Calendar, Building, Archive, AlertCircle } from 'lucide-react';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Legacy Search Header */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Archive className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-amber-800">Legacy Search System</CardTitle>
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
              v1 Archive
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-700 text-sm mb-2">
                This is the archived v1 search functionality. Search results show historical data only.
              </p>
              <p className="text-amber-600 text-xs">
                New search features are available in the v2 platform.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SearchIcon className="w-5 h-5" />
            <span>Search DNA Network</span>
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">Legacy</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search people, events, communities... (v1 data)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-gray-300"
              />
            </div>
            <Button className="bg-gray-600 hover:bg-gray-700" disabled>
              <SearchIcon className="w-4 h-4 mr-2" />
              Search v1 Data
            </Button>
          </div>

          {/* Search Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-700">People</h3>
                    <p className="text-sm text-gray-500">1,247 v1 profiles</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-8 h-8 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-700">Events</h3>
                    <p className="text-sm text-gray-500">156 v1 events</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Building className="w-8 h-8 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-700">Organizations</h3>
                    <p className="text-sm text-gray-500">89 v1 orgs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Search Results Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Legacy Search Archive</h3>
            <p className="text-gray-500 mb-4">
              Search functionality is preserved but in read-only mode for the v1 archive.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>• All v1 profiles, events, and organizations are archived</p>
              <p>• Search indexes are preserved for historical reference</p>
              <p>• Live search is available in the new v2 platform</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Searches (Historical) */}
      <Card>
        <CardHeader>
          <CardTitle>Popular v1 Searches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              'Lagos entrepreneurs',
              'Nairobi startups', 
              'Cape Town tech',
              'Diaspora investors',
              'AfriTech Summit',
              'Women in tech',
              'Fintech Africa',
              'Agricultural innovation'
            ].map((tag) => (
              <Badge key={tag} variant="outline" className="cursor-default bg-gray-50 text-gray-600 border-gray-300">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Search;