import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CSVExportButton() {
  const [isExporting, setIsExporting] = React.useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Mock export functionality - in production, this would call your analytics API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Create mock CSV data
      const csvData = [
        ['Metric', 'Value', 'Date'],
        ['Total Users', '2847', new Date().toISOString().split('T')[0]],
        ['New Signups Today', '23', new Date().toISOString().split('T')[0]],
        ['Active This Week', '456', new Date().toISOString().split('T')[0]],
        ['Posts Today', '67', new Date().toISOString().split('T')[0]],
        ['Communities', '89', new Date().toISOString().split('T')[0]],
        ['Events', '12', new Date().toISOString().split('T')[0]],
        ['Flagged Content', '3', new Date().toISOString().split('T')[0]]
      ].map(row => row.join(',')).join('\n');
      
      // Create and download CSV file
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `dna-analytics-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: "Analytics data has been exported to CSV file.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the analytics data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExport}
      disabled={isExporting}
      className="bg-dna-emerald hover:bg-dna-emerald/90 text-white"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </>
      )}
    </Button>
  );
}