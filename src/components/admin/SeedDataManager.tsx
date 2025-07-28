import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { seedDataService } from '@/services/seedDataService';
import { Download, Upload, Trash2, Database } from 'lucide-react';

export const SeedDataManager = () => {
  const [loading, setLoading] = useState(false);
  const [fileInput, setFileInput] = useState<File | null>(null);
  const { toast } = useToast();

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      setLoading(true);
      const data = await seedDataService.exportData(format);
      
      if (format === 'csv') {
        // For CSV, create separate files for each table
        Object.keys(data as any).forEach(table => {
          if ((data as any)[table]) {
            seedDataService.downloadData(
              (data as any)[table], 
              `dna-seed-${table}`, 
              'csv'
            );
          }
        });
      } else {
        seedDataService.downloadData(data, 'dna-seed-data', 'json');
      }

      toast({
        title: 'Export Successful',
        description: `Seed data exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export seed data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!fileInput) {
      toast({
        title: 'No File Selected',
        description: 'Please select a JSON file to import',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const text = await fileInput.text();
      const data = JSON.parse(text);

      await seedDataService.importSeedData(data);

      toast({
        title: 'Import Successful',
        description: 'Seed data imported successfully',
      });

      setFileInput(null);
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: 'Failed to import seed data. Check file format.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearSeedData = async () => {
    if (!confirm('Are you sure you want to clear all seed data? This cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await seedDataService.clearSeedData();

      toast({
        title: 'Clear Successful',
        description: 'All seed data has been cleared',
      });
    } catch (error) {
      toast({
        title: 'Clear Failed',
        description: 'Failed to clear seed data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultSeedData = async () => {
    // This would load the original Python-generated seed data
    const defaultSeedData = {
      profiles: [
        {
          full_name: 'Mary Green',
          email: 'mary35@gmail.com',
          diaspora_identity: 'Repat',
          country_of_origin: 'Vietnam',
          country_of_residence: 'Libyan Arab Jamahiriya',
          last_seen_at: '2025-07-06 02:03:18'
        },
        {
          full_name: 'Rebecca Welch',
          email: 'welchrebecca@hotmail.com',
          diaspora_identity: 'Ally',
          country_of_origin: 'Togo',
          country_of_residence: 'Cape Verde',
          last_seen_at: '2025-07-22 01:33:22'
        }
        // Add more default data as needed
      ],
      connections: [],
      posts: [],
      events: []
    };

    try {
      setLoading(true);
      await seedDataService.importSeedData(defaultSeedData);

      toast({
        title: 'Default Data Loaded',
        description: 'Default seed data has been loaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Load Failed',
        description: 'Failed to load default seed data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Seed Data Manager
        </CardTitle>
        <CardDescription>
          Manage test data for Community Pulse dashboards. Export existing data or import new seed datasets.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Export Section */}
        <div>
          <h3 className="text-lg font-medium mb-3">Export Data</h3>
          <div className="flex gap-3">
            <Button 
              onClick={() => handleExport('json')} 
              disabled={loading}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export as JSON
            </Button>
            <Button 
              onClick={() => handleExport('csv')} 
              disabled={loading}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
          </div>
        </div>

        <Separator />

        {/* Import Section */}
        <div>
          <h3 className="text-lg font-medium mb-3">Import Data</h3>
          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="seedFile">Select JSON file to import</Label>
              <Input
                id="seedFile"
                type="file"
                accept=".json"
                onChange={(e) => setFileInput(e.target.files?.[0] || null)}
              />
            </div>
            <Button 
              onClick={handleImport} 
              disabled={loading || !fileInput}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Seed Data
            </Button>
          </div>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-medium mb-3">Quick Actions</h3>
          <div className="flex gap-3">
            <Button 
              onClick={loadDefaultSeedData} 
              disabled={loading}
              variant="default"
            >
              <Database className="h-4 w-4 mr-2" />
              Load Default Data
            </Button>
            <Button 
              onClick={handleClearSeedData} 
              disabled={loading}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Seed Data
            </Button>
          </div>
        </div>

        {/* Status */}
        {loading && (
          <div className="text-center text-sm text-muted-foreground">
            Processing... Please wait.
          </div>
        )}
      </CardContent>
    </Card>
  );
};