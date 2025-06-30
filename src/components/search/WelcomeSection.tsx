
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const WelcomeSection = () => {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <div className="text-gray-500">
          <p className="text-lg font-medium mb-2">Welcome to DiasporaLink Search</p>
          <p>Sign in to get personalized recommendations and connect with professionals</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeSection;
