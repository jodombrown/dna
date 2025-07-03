import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { seedDemoData } from '@/utils/demoDataSeeder';
import { Database, Loader2, CheckCircle } from 'lucide-react';

const DemoDataSeeder: React.FC = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedDemoData();
      setIsSeeded(true);
      toast({
        title: "Demo Data Created! 🎉",
        description: "Successfully created posts, profiles, events, communities, and contribution opportunities. Refresh the page to see the content.",
      });
    } catch (error) {
      console.error('Seeding error:', error);
      toast({
        title: "Seeding Failed",
        description: "There was an error creating the demo data. Check the console for details.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          DNA Platform Demo Data
        </CardTitle>
        <CardDescription>
          Create comprehensive demo data to test all platform features including posts, profiles, events, communities, and contribution opportunities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold text-dna-forest">Content Created:</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• 12+ Social Feed Posts</li>
              <li>• 8 Professional Profiles</li>
              <li>• 5 Community Events</li>
              <li>• 5 Community Groups</li>
              <li>• 5 Contribution Cards</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-dna-forest">Features to Test:</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Like, Share, Follow</li>
              <li>• Event Registration</li>
              <li>• Community Joining</li>
              <li>• Contribution Support</li>
              <li>• Professional Networking</li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={handleSeedData}
            disabled={isSeeding || isSeeded}
            className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
            size="lg"
          >
            {isSeeding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSeeded && <CheckCircle className="w-4 h-4 mr-2" />}
            {isSeeding 
              ? 'Creating Demo Data...' 
              : isSeeded 
                ? 'Demo Data Created Successfully!' 
                : 'Create Demo Data'
            }
          </Button>
          
          {isSeeded && (
            <p className="text-sm text-center mt-2 text-gray-600">
              Refresh the page or navigate to different sections to see the new content!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DemoDataSeeder;