
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Trash2,
  AlertTriangle 
} from 'lucide-react';

interface BulkModerationPanelProps {
  selectedFlags: string[];
  onClearSelection: () => void;
  onBulkAction: (action: string, notes?: string) => Promise<void>;
  isLoading: boolean;
}

const BulkModerationPanel: React.FC<BulkModerationPanelProps> = ({
  selectedFlags,
  onClearSelection,
  onBulkAction,
  isLoading
}) => {
  const [bulkNotes, setBulkNotes] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleBulkAction = async (action: string) => {
    setActionLoading(action);
    try {
      await onBulkAction(action, bulkNotes);
      setBulkNotes('');
      onClearSelection();
    } finally {
      setActionLoading(null);
    }
  };

  if (selectedFlags.length === 0) return null;

  return (
    <Card className="mb-6 border-dna-emerald/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-dna-emerald" />
            Bulk Actions
          </CardTitle>
          <Badge variant="outline" className="text-dna-emerald">
            {selectedFlags.length} selected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="bulk-notes">Bulk Action Notes (Optional)</Label>
          <Textarea
            id="bulk-notes"
            placeholder="Add notes for this bulk action..."
            value={bulkNotes}
            onChange={(e) => setBulkNotes(e.target.value)}
            className="mt-1"
            rows={2}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => handleBulkAction('approved')}
            disabled={isLoading || !!actionLoading}
            className="text-green-600 hover:text-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve All ({selectedFlags.length})
            {actionLoading === 'approved' && '...'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleBulkAction('rejected')}
            disabled={isLoading || !!actionLoading}
            className="text-red-600 hover:text-red-700"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject All ({selectedFlags.length})
            {actionLoading === 'rejected' && '...'}
          </Button>
          
          <Button
            variant="outline"
            onClick={onClearSelection}
            disabled={isLoading || !!actionLoading}
          >
            Clear Selection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkModerationPanel;
