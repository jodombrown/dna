
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface ContributeCallToActionProps {
  onFeedbackClick: () => void;
}

const ContributeCallToAction: React.FC<ContributeCallToActionProps> = ({ onFeedbackClick }) => {
  return (
    <Card className="mt-8 bg-gradient-to-r from-dna-gold/10 to-dna-emerald/10">
      <CardContent className="p-6 sm:p-8 text-center">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
          Have Ideas for New Ways to Contribute?
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-6">
          Help us create more meaningful ways for the diaspora to give back to Africa.
        </p>
        <Button 
          onClick={onFeedbackClick}
          className="bg-dna-gold hover:bg-dna-copper text-white"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Share Your Contribution Ideas
        </Button>
      </CardContent>
    </Card>
  );
};

export default ContributeCallToAction;
