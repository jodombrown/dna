import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TrendingUp } from 'lucide-react';

const RightSidebar = () => {
  return (
    <div className="lg:col-span-3 space-y-4">
      {/* Trending Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-dna-emerald" />
            Trending Now
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="hover:bg-gray-50 p-2 rounded cursor-pointer">
            <p className="text-sm font-medium">#AfricaTech2024</p>
            <p className="text-xs text-gray-500">142 posts</p>
          </div>
          <div className="hover:bg-gray-50 p-2 rounded cursor-pointer">
            <p className="text-sm font-medium">#DiasporaInvestment</p>
            <p className="text-xs text-gray-500">89 posts</p>
          </div>
          <div className="hover:bg-gray-50 p-2 rounded cursor-pointer">
            <p className="text-sm font-medium">#YouthEmpowerment</p>
            <p className="text-xs text-gray-500">67 posts</p>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">People You May Know</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-dna-emerald text-white">EN</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Esther Nkomo</h4>
              <p className="text-xs text-gray-500">Healthcare Innovation</p>
              <Button size="sm" variant="outline" className="mt-1">
                Connect
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-dna-copper text-white">OA</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Omar Ahmed</h4>
              <p className="text-xs text-gray-500">Sustainable Agriculture</p>
              <Button size="sm" variant="outline" className="mt-1">
                Connect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Opportunities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="border-l-4 border-dna-emerald pl-3">
            <p className="text-sm font-medium">AfriTech Conference 2024</p>
            <p className="text-xs text-gray-500">Join 500+ tech leaders</p>
          </div>
          <div className="border-l-4 border-dna-copper pl-3">
            <p className="text-sm font-medium">Diaspora Investment Fund</p>
            <p className="text-xs text-gray-500">Seed funding available</p>
          </div>
          <div className="border-l-4 border-dna-forest pl-3">
            <p className="text-sm font-medium">Education Initiative</p>
            <p className="text-xs text-gray-500">Volunteers needed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RightSidebar;