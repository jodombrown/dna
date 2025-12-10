import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Reply, MoreHorizontal, Edit2, Trash2, Flag, Smile } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useCommentActions } from '@/hooks/useCommentActions';
import { useCommentReactions } from '@/hooks/useCommentReactions';
import { ReportDialog } from './ReportDialog';
import { QUICK_REACTIONS, getEmojiLabel } from '@/types/reactions';
import { cn } from '@/lib/utils';

interface CommentItemProps {
  comment: {
    comment_id: string;
    parent_comment_id: string | null;
    author_id: string;
    author_username: string;
    author_full_name: string;
    author_avatar_url: string | null;
    content: string;
    created_at: string;
    updated_at: string;
    reaction_counts: Record<string, number>;
    user_reaction: string | null;
    reply_count: number;
  };
  postId: string;
  currentUserId: string;
  onReply: () => void;
  isReplying: boolean;
}

export function CommentItem({ comment, postId, currentUserId, onReply, isReplying }: CommentItemProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const { isOwnComment, editComment, deleteComment, reportComment } = useCommentActions(
    comment.comment_id,
    comment.author_id,
    postId,
    currentUserId
  );

  const { reactions, userReaction, toggleReaction } = useCommentReactions(
    comment.comment_id,
    currentUserId
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    await editComment.mutateAsync(editContent.trim());
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this comment?')) {
      deleteComment.mutate();
    }
  };

  // Calculate total reactions
  const totalReactions = Object.values(comment.reaction_counts || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="flex gap-3 group">
      <Avatar
        className="h-8 w-8 cursor-pointer flex-shrink-0"
        onClick={() => navigate(`/dna/${comment.author_username}`)}
      >
        <AvatarImage src={comment.author_avatar_url || undefined} alt={comment.author_full_name} />
        <AvatarFallback className="bg-dna-forest text-white text-xs">
          {getInitials(comment.author_full_name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="bg-muted rounded-lg p-3 relative">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4
                className="font-semibold text-sm cursor-pointer hover:text-dna-forest transition-colors inline"
                onClick={() => navigate(`/dna/${comment.author_username}`)}
              >
                {comment.author_full_name}
              </h4>
              <span className="text-xs text-muted-foreground ml-2">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                {comment.updated_at !== comment.created_at && ' (edited)'}
              </span>
            </div>

            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {isOwnComment ? (
                  <>
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem 
                    onClick={() => setShowReportDialog(true)}
                    className="text-destructive"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {isEditing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={2}
                className="resize-none text-sm"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim()}
                  className="bg-dna-forest hover:bg-dna-forest/90"
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words mt-1">
              {comment.content}
            </p>
          )}

          {/* Reaction badges on comment */}
          {totalReactions > 0 && (
            <div className="absolute -bottom-2 right-2 flex items-center gap-0.5 bg-background border rounded-full px-1.5 py-0.5 shadow-sm">
              {Object.entries(comment.reaction_counts || {})
                .filter(([_, count]) => count > 0)
                .slice(0, 3)
                .map(([emoji]) => (
                  <span key={emoji} className="text-xs">{emoji}</span>
                ))}
              {totalReactions > 1 && (
                <span className="text-xs text-muted-foreground ml-0.5">{totalReactions}</span>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 ml-1 mt-1">
          {/* Emoji reaction picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "h-6 px-2 text-xs text-muted-foreground hover:text-foreground",
                  userReaction && "text-dna-forest"
                )}
              >
                {userReaction || <Smile className="h-3 w-3" />}
                <span className="ml-1">{userReaction ? getEmojiLabel(userReaction) : 'React'}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="start">
              <div className="flex gap-1">
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => toggleReaction(emoji)}
                    className={cn(
                      "p-1.5 rounded hover:bg-muted transition-colors text-lg",
                      userReaction === emoji && "bg-muted ring-2 ring-dna-forest"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Reply button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onReply}
            className={cn(
              "h-6 px-2 text-xs text-muted-foreground hover:text-foreground",
              isReplying && "text-dna-forest"
            )}
          >
            <Reply className="h-3 w-3 mr-1" />
            Reply
          </Button>
        </div>
      </div>

      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        onSubmit={(reason, description) => {
          reportComment.mutate({ reason, description });
        }}
        type="comment"
      />
    </div>
  );
}
