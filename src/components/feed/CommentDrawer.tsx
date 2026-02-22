/**
 * DNA | Sprint 11 - Comment Drawer
 *
 * Mobile: bottom sheet drawer (using vaul Drawer pattern)
 * Desktop: inline expansion
 * Threaded comments: 1 level deep only
 * Comment composer with @mention support
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Send, CornerDownRight, MoreHorizontal, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMobile } from '@/hooks/useMobile';

// ============================================================
// TYPES
// ============================================================

interface CommentDrawerProps {
  contentType: string;
  contentId: string;
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface FeedComment {
  id: string;
  userId: string;
  body: string;
  parentCommentId: string | null;
  createdAt: string;
  author: {
    displayName: string;
    avatarUrl: string | null;
    username: string | null;
  };
  replies: FeedComment[];
}

// ============================================================
// COMPONENT
// ============================================================

export const CommentDrawer: React.FC<CommentDrawerProps> = ({
  contentType,
  contentId,
  currentUserId,
  isOpen,
  onClose,
}) => {
  const { isMobile } = useMobile();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  // Focus textarea when opening or replying
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen, replyingTo]);

  // ============================================================
  // FETCH COMMENTS
  // ============================================================

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['feed-comments', contentType, contentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feed_comments')
        .select('id, user_id, body, parent_comment_id, created_at')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const rows = (data || []) as Array<{
        id: string;
        user_id: string;
        body: string;
        parent_comment_id: string | null;
        created_at: string;
      }>;

      // Fetch author profiles
      const userIds = [...new Set(rows.map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, username')
        .in('id', userIds);

      const profileMap = new Map<string, { displayName: string; avatarUrl: string | null; username: string | null }>();
      for (const p of (profiles || []) as Array<Record<string, string | null>>) {
        profileMap.set(p.id as string, {
          displayName: (p.full_name as string) || 'User',
          avatarUrl: p.avatar_url,
          username: p.username,
        });
      }

      // Build threaded structure (1 level deep)
      const topLevel: FeedComment[] = [];
      const replyMap = new Map<string, FeedComment[]>();

      for (const row of rows) {
        const comment: FeedComment = {
          id: row.id,
          userId: row.user_id,
          body: row.body,
          parentCommentId: row.parent_comment_id,
          createdAt: row.created_at,
          author: profileMap.get(row.user_id) || {
            displayName: 'User',
            avatarUrl: null,
            username: null,
          },
          replies: [],
        };

        if (row.parent_comment_id) {
          const existing = replyMap.get(row.parent_comment_id) || [];
          existing.push(comment);
          replyMap.set(row.parent_comment_id, existing);
        } else {
          topLevel.push(comment);
        }
      }

      // Attach replies to parents
      for (const comment of topLevel) {
        comment.replies = replyMap.get(comment.id) || [];
      }

      return topLevel;
    },
    enabled: isOpen,
  });

  // ============================================================
  // POST COMMENT
  // ============================================================

  const postCommentMutation = useMutation({
    mutationFn: async (body: string) => {
      if (!currentUserId) throw new Error('Not authenticated');

      const { error } = await supabase.from('feed_comments').insert({
        user_id: currentUserId,
        content_type: contentType,
        content_id: contentId,
        parent_comment_id: replyingTo,
        body,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment('');
      setReplyingTo(null);
      queryClient.invalidateQueries({
        queryKey: ['feed-comments', contentType, contentId],
      });
    },
    onError: () => {
      toast.error('Failed to post comment');
    },
  });

  // ============================================================
  // DELETE COMMENT
  // ============================================================

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('feed_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', currentUserId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['feed-comments', contentType, contentId],
      });
      toast.success('Comment deleted');
    },
    onError: () => {
      toast.error('Failed to delete comment');
    },
  });

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleSubmit = () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    postCommentMutation.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  const totalComments = comments.reduce((acc, c) => acc + 1 + c.replies.length, 0);

  // ============================================================
  // RENDER
  // ============================================================

  const content = (
    <div className={cn(
      'flex flex-col',
      isMobile ? 'h-[70vh]' : 'max-h-[500px]'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm">
          Comments {totalComments > 0 && `(${totalComments})`}
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
          Close
        </Button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded w-1/4" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && comments.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No comments yet. Be the first to share your thoughts.
          </p>
        )}

        {comments.map((comment) => (
          <CommentThread
            key={comment.id}
            comment={comment}
            currentUserId={currentUserId}
            onReply={(id) => {
              setReplyingTo(id);
              textareaRef.current?.focus();
            }}
            onDelete={(id) => deleteCommentMutation.mutate(id)}
          />
        ))}
      </div>

      {/* Composer */}
      <div className="border-t border-border px-4 py-3">
        {replyingTo && (
          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
            <CornerDownRight className="h-3 w-3" />
            <span>Replying to comment</span>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-primary hover:underline"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a comment..."
            className="min-h-[40px] max-h-[120px] resize-none text-sm"
            rows={1}
          />
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!newComment.trim() || postCommentMutation.isPending}
            className="h-10 px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  // Mobile: render as bottom sheet style
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl shadow-xl animate-in slide-in-from-bottom duration-300">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
          </div>
          {content}
        </div>
      </div>
    );
  }

  // Desktop: inline
  return (
    <div className="border-t border-border mt-3">
      {content}
    </div>
  );
};

// ============================================================
// COMMENT THREAD SUB-COMPONENT
// ============================================================

interface CommentThreadProps {
  comment: FeedComment;
  currentUserId: string;
  onReply: (commentId: string) => void;
  onDelete: (commentId: string) => void;
}

const CommentThread: React.FC<CommentThreadProps> = ({
  comment,
  currentUserId,
  onReply,
  onDelete,
}) => {
  const isOwn = comment.userId === currentUserId;

  return (
    <div>
      {/* Parent comment */}
      <div className="flex gap-2.5">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.author.avatarUrl || ''} />
          <AvatarFallback className="text-[10px]">
            {comment.author.displayName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="bg-muted/50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{comment.author.displayName}</span>
              <span className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm mt-0.5 whitespace-pre-wrap break-words">
              {comment.body}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-1 ml-1">
            <button
              onClick={() => onReply(comment.id)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Reply
            </button>
            {isOwn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-xs text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => onDelete(comment.id)}>
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Replies (1 level deep) */}
      {comment.replies.length > 0 && (
        <div className="ml-10 mt-2 space-y-2 border-l-2 border-border/50 pl-3">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="flex gap-2">
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarImage src={reply.author.avatarUrl || ''} />
                <AvatarFallback className="text-[8px]">
                  {reply.author.displayName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="bg-muted/30 rounded-lg px-2.5 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{reply.author.displayName}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5 whitespace-pre-wrap break-words">
                    {reply.body}
                  </p>
                </div>
                {reply.userId === currentUserId && (
                  <div className="flex items-center gap-3 mt-0.5 ml-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-xs text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="h-3 w-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => onDelete(reply.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
