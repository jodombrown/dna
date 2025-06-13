
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, Clock } from 'lucide-react';

const ContributionMethods: React.FC = () => {
  return (
    <Card className="bg-gradient-to-r from-dna-copper/10 to-dna-emerald/10">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Multiple Ways to Make Impact</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-dna-emerald rounded-xl mx-auto mb-4 flex items-center justify-center">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">Financial Investment</h4>
            <p className="text-xs sm:text-sm text-gray-600">Direct funding for high-impact projects with transparent tracking</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-dna-copper rounded-xl mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">Skills & Expertise</h4>
            <p className="text-xs sm:text-sm text-gray-600">Volunteer your professional skills to support project development</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-dna-forest rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">Time & Mentorship</h4>
            <p className="text-xs sm:text-sm text-gray-600">Share knowledge and mentor emerging leaders and entrepreneurs</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContributionMethods;
