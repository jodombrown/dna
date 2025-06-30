
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  XCircle, 
  Ban, 
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BulkCommunityActionsProps {
  selectedCommunities: string[];
  onClearSelection: () => void;
  onBulkAction: (action: string, notes?: string, rejectionReason?: string) => Promise<void>;
  isLoading: boolean;
}

const BulkCommunityActions: React.FC<BulkCommunityActionsProps> = ({
  selectedCommunities,
  onClearSelection,
  onBulkAction,
  isLoading
}) => {
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const { toast } = useToast();

  const handleBulkAction = async (action: string) => {
    if (selectedCommunities.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select communities to moderate",
        variant: "destructive"
      });
      return;
    }

    try {
      await onBulkAction(action, moderatorNotes, rejectionReason);
      setModeratorNotes('');
      setRejectionReason('');
      setShowNotesInput(false);
      onClearSelection();
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  if (selectedCommunities.length === 0) {
    return null;
  }

  return (
    <Card className="border-dna-emerald/20 bg-dna-mint/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedCommunities.length} selected</Badge>
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
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Moderator Notes (Optional)
              </label>
              <Textarea
                value={moderatorNotes}
                onChange={(e) => setModeratorNotes(e.target.value)}
                placeholder="Add notes about this moderation action..."
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Rejection Reason (For Rejections)
              </label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Specify reason for rejection..."
                rows={2}
              />
            </div>
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
            onClick={() => handleBulkAction('suspended')}
            disabled={isLoading}
            variant="outline"
            className="text-orange-600 hover:text-orange-700"
          >
            <Ban className="w-4 h-4 mr-2" />
            Suspend All
          </Button>
          
          <Button
            onClick={() => handleBulkAction('delete')}
            disabled={isLoading}
            variant="outline"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete All
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

export default BulkCommunityActions;
