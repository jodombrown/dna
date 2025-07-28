import React from 'react';
import FeatureGate from '@/components/FeatureGate';

const Communities = () => {
  return (
    <FeatureGate 
      feature="communities"
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-dna-forest mb-4">Communities</h1>
            <p className="text-gray-600">Community features are currently disabled.</p>
          </div>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-dna-forest mb-4">Communities</h1>
          <p className="text-gray-600">Community features coming soon...</p>
        </div>
      </div>
    </FeatureGate>
  );
};

export default Communities;