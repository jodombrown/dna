import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Database, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { seedDemoData, clearDemoData } from '@/utils/seedData';

interface SeedResults {
  users: number;
  organizations: number;
  posts: number;
  events: number;
  jobs: number;
  initiatives: number;
  newsletters: number;
  contributions: number;
  follows: number;
  savedItems: number;
}

const DataSeeder: React.FC = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [results, setResults] = useState<SeedResults | null>(null);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const seedResults = await seedDemoData();
      setResults(seedResults);
      toast({
        title: "Success!",
        description: "Demo data has been seeded successfully",
      });
    } catch (error: any) {
      console.error('Seeding error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to seed demo data",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await clearDemoData();
      setResults(null);
      toast({
        title: "Success!",
        description: "Demo data has been cleared successfully",
      });
    } catch (error: any) {
      console.error('Clearing error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to clear demo data",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Demo Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-dna-copper/10 border border-dna-copper/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-dna-copper" />
              <h4 className="font-medium text-dna-forest">About Demo Data</h4>
            </div>
            <p className="text-sm text-gray-600">
              This will populate the platform with realistic African diaspora demo data including:
              15 users, 20 posts, 5 events, 5 jobs, 5 initiatives, 5 newsletters, 3 verified organizations, 
              and various interactions like follows, saved items, and contributions.
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleSeedData}
              disabled={isSeeding || isClearing}
              className="bg-dna-emerald hover:bg-dna-forest text-white"
            >
              {isSeeding ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              {isSeeding ? 'Seeding Data...' : 'Seed Demo Data'}
            </Button>

            <Button
              onClick={handleClearData}
              disabled={isSeeding || isClearing}
              variant="destructive"
            >
              {isClearing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              {isClearing ? 'Clearing Data...' : 'Clear Demo Data'}
            </Button>
          </div>

          {results && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="w-5 h-5" />
                  Seeding Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">{results.users}</div>
                    <div className="text-sm text-green-600">Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">{results.organizations}</div>
                    <div className="text-sm text-green-600">Organizations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">{results.posts}</div>
                    <div className="text-sm text-green-600">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">{results.events}</div>
                    <div className="text-sm text-green-600">Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">{results.jobs}</div>
                    <div className="text-sm text-green-600">Jobs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">{results.initiatives}</div>
                    <div className="text-sm text-green-600">Initiatives</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSeeder;