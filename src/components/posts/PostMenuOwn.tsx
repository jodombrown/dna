import { useState } from 'react';
import { MoreHorizontal, Edit2, Trash2, Pin, MessageSquareOff, Link, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePostActions } from '@/hooks/usePostActions';
import { EditPostDialog } from './EditPostDialog';

interface PostMenuOwnProps {
  postId: string;
  authorId: string;
  currentUserId: string;
  content: string;
  isPinned?: boolean;
  commentsDisabled?: boolean;
  onUpdate?: () => void;
}

export function PostMenuOwn({
  postId,
  authorId,
  currentUserId,
  content,
  isPinned = false,
  commentsDisabled = false,
  onUpdate,
}: PostMenuOwnProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const {
    deletePost,
    togglePin,
    toggleComments,
    copyLink,
  } = usePostActions(postId, authorId, currentUserId);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this post? This cannot be undone.')) {
      deletePost.mutate();
      onUpdate?.();
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit post
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => togglePin.mutate(!isPinned)}>
            <Pin className="h-4 w-4 mr-2" />
            {isPinned ? 'Unpin from profile' : 'Pin to profile'}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => toggleComments.mutate(!commentsDisabled)}>
            {commentsDisabled ? (
              <>
                <MessageSquare className="h-4 w-4 mr-2" />
                Turn on comments
              </>
            ) : (
              <>
                <MessageSquareOff className="h-4 w-4 mr-2" />
                Turn off comments
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={copyLink}>
            <Link className="h-4 w-4 mr-2" />
            Copy link
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete post
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditPostDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        postId={postId}
        initialContent={content}
        onSuccess={onUpdate}
      />
    </>
  );
}
