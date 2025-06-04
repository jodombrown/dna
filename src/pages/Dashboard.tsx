
import React from 'react';
import Header from '@/components/Header';
import PlatformLayers from '@/components/dashboard/PlatformLayers';
import UserJourney from '@/components/dashboard/UserJourney';
import RevenueStreams from '@/components/dashboard/RevenueStreams';
import TargetMetrics from '@/components/dashboard/TargetMetrics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dna-forest mb-2">Platform Dashboard</h1>
          <p className="text-gray-600">Comprehensive overview of the DNA platform architecture and performance metrics</p>
        </div>

        {/* Platform Architecture Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-dna-forest">Platform Architecture Layers</CardTitle>
              <CardDescription>Technical components across platform layers</CardDescription>
            </CardHeader>
            <CardContent>
              <PlatformLayers />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-dna-forest">User Journey Flow</CardTitle>
              <CardDescription>User engagement stages and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <UserJourney />
            </CardContent>
          </Card>
        </div>

        {/* Business Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-dna-forest">Revenue Streams</CardTitle>
              <CardDescription>Monthly revenue distribution by source</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueStreams />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-dna-forest">Target Metrics</CardTitle>
              <CardDescription>Year 1 performance targets and goals</CardDescription>
            </CardHeader>
            <CardContent>
              <TargetMetrics />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
