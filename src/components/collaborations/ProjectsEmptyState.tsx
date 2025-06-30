
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Zap } from 'lucide-react';

const ProjectsEmptyState: React.FC = () => {
  return (
    <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-white">
      <CardContent>
        <Target className="w-16 h-16 text-gray-300 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-gray-900 mb-3">No initiatives match your criteria</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Try adjusting your filters to discover more collaboration opportunities, or consider starting your own initiative.
        </p>
        <Button className="bg-dna-copper hover:bg-dna-gold text-white">
          <Zap className="w-4 h-4 mr-2" />
          Start New Initiative
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProjectsEmptyState;
