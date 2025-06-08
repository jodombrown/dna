
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConnectHeaderProps {
  totalCount: number;
}

const ConnectHeader: React.FC<ConnectHeaderProps> = ({ totalCount }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:bg-dna-mint"
              size="sm"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </Button>
            <div className="border-l border-gray-300 h-6 hidden sm:block"></div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Professional Network</h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Connect with diaspora professionals</p>
            </div>
          </div>
          <Badge className="bg-dna-emerald text-white text-xs sm:text-sm">
            {totalCount} Active
          </Badge>
        </div>
      </div>
    </header>
  );
};

export default ConnectHeader;
