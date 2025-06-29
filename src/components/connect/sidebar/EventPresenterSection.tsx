
import React from 'react';

const EventPresenterSection: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Presented by</h3>
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.open('https://diasporanetworkafrica.com', '_blank')}
          className="hover:opacity-80 transition-opacity"
        >
          <img 
            src="/lovable-uploads/c6f51307-c7df-4a26-a66e-b99e88b55c53.png" 
            alt="DNA Logo" 
            className="w-12 h-12 rounded-lg object-contain"
          />
        </button>
        <div>
          <div className="font-medium text-gray-900">Diaspora Network of Africa</div>
          <div className="text-sm text-gray-600">#1 Professional Networking and Impact Investment Platform for the African Diaspora</div>
        </div>
      </div>
    </div>
  );
};

export default EventPresenterSection;
