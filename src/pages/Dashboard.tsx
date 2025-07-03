
import React from 'react';
import Header from '@/components/Header';
import UserDashboard from '@/components/analytics/UserDashboard';
import { useAuth } from '@/contexts/CleanAuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-dna-forest mb-4">Sign In Required</h2>
              <p className="text-gray-600 mb-6">Please sign in to view your analytics dashboard</p>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-dna-copper hover:bg-dna-gold text-white"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserDashboard />
      </div>
    </div>
  );
};

export default Dashboard;
