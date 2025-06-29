
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ModerationActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flag: any;
  onResolve: (flagId: string, status: string, notes?: string) => Promise<void>;
  onModeratePost: (postId: string, action: string, notes?: string) => Promise<any>;
}

const ModerationActionDialog: React.FC<ModerationActionDialogProps> = ({
  open,
  onOpenChange,
  flag,
  onResolve,
  onModeratePost
}) => {
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAction = async (flagStatus: string, postAction?: string) => {
    setLoading(true);
    try {
      // Resolve the flag
      await onResolve(flag.id, flagStatus, moderatorNotes);
      
      // If there's a post action, moderate the post
      if (postAction && flag.content_type === 'post') {
        const result = await onModeratePost(flag.content_id, postAction, moderatorNotes);
        if (!result.success) {
          throw new Error(result.error);
        }
      }

      toast({
        title: "Success",
        description: "Moderation action completed successfully.",
      });

      onOpenChange(false);
      setModeratorNotes('');
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to complete moderation action.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFlagTypeBadge = (flagType: string) => {
    const colors = {
      inappropriate_content: 'bg-red-100 text-red-800',
      spam: 'bg-orange-100 text-orange-800',
      harassment: 'bg-purple-100 text-purple-800',
      misinformation: 'bg-yellow-100 text-yellow-800',
      copyright_violation: 'bg-blue-100 text-blue-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[flagType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!flag) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Review Content Flag</DialogTitle>
          <DialogDescription>
            Review the flagged content and take appropriate moderation action.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Flag Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Flag Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Content Type</Label>
                  <div className="mt-1">
                    <Badge variant="outline">{flag.content_type}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Flag Type</Label>
                  <div className="mt-1">
                    <Badge className={getFlagTypeBadge(flag.flag_type)}>
                      {flag.flag_type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Content ID</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border text-sm font-mono">
                  {flag.content_id}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Reason</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                  {flag.reason || 'No reason provided'}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Flagged Date</Label>
                <div className="mt-1 text-sm text-gray-500">
                  {new Date(flag.created_at).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Moderator Notes */}
          <div>
            <Label htmlFor="moderator-notes">Moderator Notes</Label>
            <Textarea
              id="moderator-notes"
              placeholder="Add notes about your decision..."
              value={moderatorNotes}
              onChange={(e) => setModeratorNotes(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => handleAction('approved')}
              disabled={loading}
              className="text-green-600 hover:text-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Content
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleAction('rejected')}
              disabled={loading}
              className="text-red-600 hover:text-red-700"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Flag
            </Button>

            {flag.content_type === 'post' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleAction('approved', 'hidden')}
                  disabled={loading}
                  className="text-gray-600 hover:text-gray-700"
                >
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide Post
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleAction('approved', 'deleted')}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Post
                </Button>
              </>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModerationActionDialog;
