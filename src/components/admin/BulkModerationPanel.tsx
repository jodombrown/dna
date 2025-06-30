
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Eye, 
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const { toast } = useToast();

  const handleBulkAction = async (action: string) => {
    if (selectedFlags.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select flags to moderate",
        variant: "destructive"
      });
      return;
    }

    try {
      await onBulkAction(action, moderatorNotes);
      setModeratorNotes('');
      setShowNotesInput(false);
      onClearSelection();
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  if (selectedFlags.length === 0) {
    return null;
  }

  return (
    <Card className="border-dna-emerald/20 bg-dna-mint/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedFlags.length} selected</Badge>
            <span className="text-lg">Bulk Actions</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-gray-500"
          >
            Clear Selection
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {showNotesInput && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Moderator Notes (Optional)
            </label>
            <Textarea
              value={moderatorNotes}
              onChange={(e) => setModeratorNotes(e.target.value)}
              placeholder="Add notes about this moderation action..."
              rows={3}
            />
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleBulkAction('approved')}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve All
          </Button>
          
          <Button
            onClick={() => handleBulkAction('rejected')}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject All
          </Button>
          
          <Button
            onClick={() => handleBulkAction('hidden')}
            disabled={isLoading}
            variant="outline"
            className="text-gray-600 hover:text-gray-700"
          >
            <EyeOff className="w-4 h-4 mr-2" />
            Hide Content
          </Button>
          
          <Button
            onClick={() => handleBulkAction('deleted')}
            disabled={isLoading}
            variant="outline"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Content
          </Button>
          
          <Button
            onClick={() => setShowNotesInput(!showNotesInput)}
            variant="outline"
            className="text-gray-600"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            {showNotesInput ? 'Hide' : 'Add'} Notes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkModerationPanel;
