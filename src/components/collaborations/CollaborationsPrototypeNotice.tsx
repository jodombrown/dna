
import React from 'react';
import { Info } from 'lucide-react';

const CollaborationsPrototypeNotice: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-dna-copper/10 to-dna-emerald/10 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-dna-copper mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Platform Preview - Prototype Stage</h3>
            <p className="text-sm text-gray-700">
              This is a preview of our Collaborate experience! The projects and collaboration tools shown below represent our vision for how diaspora professionals will work together on impactful initiatives across Africa. This prototype showcases the collaborative workspace we're building to facilitate meaningful partnerships and project development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationsPrototypeNotice;
