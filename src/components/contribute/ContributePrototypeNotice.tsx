
import React from 'react';
import { Info } from 'lucide-react';

const ContributePrototypeNotice: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-dna-gold/10 to-dna-emerald/10 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-dna-gold mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Platform Preview - Prototype Stage</h3>
            <p className="text-sm text-gray-700">
              This is a preview of our Contribute experience! The impact initiatives and contribution methods shown below represent our vision for how diaspora members will give back to Africa and track their impact. This prototype showcases the giving platform we're building to facilitate meaningful contributions to African development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributePrototypeNotice;
