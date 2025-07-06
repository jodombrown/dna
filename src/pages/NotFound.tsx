import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  useScrollToTop();
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-white via-dna-emerald/5 to-dna-forest/10 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center shadow-lg border-dna-emerald/20">
        <CardContent className="pt-8 pb-6">
          <div className="text-6xl font-bold text-dna-forest mb-4">404</div>
          <h1 className="text-2xl font-semibold text-dna-forest mb-2">
            Page Not Found
          </h1>
          <p className="text-dna-forest/70 mb-6">
            This page doesn't exist yet. Go back to the platform.
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={() => window.history.back()} 
              variant="outline"
              className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Link to="/">
              <Button className="bg-dna-emerald hover:bg-dna-emerald/90 text-white">
                <Home className="h-4 w-4 mr-2" />
                Return to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
