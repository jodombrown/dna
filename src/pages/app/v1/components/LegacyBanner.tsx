import React from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LegacyBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 text-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-medium">Legacy Dashboard (v1)</span>
          <span className="hidden sm:inline">- You are viewing the archived DNA platform v1</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/app')}
          className="text-white hover:bg-amber-600 h-6 px-2"
        >
          <ArrowLeft className="w-3 h-3 mr-1" />
          <span className="text-xs">Back to v2</span>
        </Button>
      </div>
    </div>
  );
};

export default LegacyBanner;