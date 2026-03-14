import React, { useState } from 'react';
import {
  ResponsiveModal,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
} from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PostWithAuthor } from '@/types/posts';
import { Share2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostWithAuthor;
  onShare: (commentary?: string) => Promise<void>;
  userProfile?: {
    full_name: string;
    avatar_url?: string;
  };
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  onClose,
  post,
  onShare,
  userProfile,
}) => {
  const [commentary, setCommentary] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await onShare(commentary || undefined);
      setCommentary('');
      onClose();
    } finally {
      setIsSharing(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onClose} className="sm:max-w-[600px]">
      <ResponsiveModalHeader>
        <ResponsiveModalTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Post
        </ResponsiveModalTitle>
        <ResponsiveModalDescription>
          Add your thoughts before sharing with your network
        </ResponsiveModalDescription>
      </ResponsiveModalHeader>

      <div className="space-y-4 px-4">
        {userProfile && (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userProfile.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(userProfile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Add your thoughts... (optional)"
                  value={commentary}
                  onChange={(e) => setCommentary(e.target.value)}
                  className="min-h-[80px] resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {commentary.length}/500 characters
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author_avatar_url} />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                {getInitials(post.author_full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{post.author_full_name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          <p className="text-sm line-clamp-4 whitespace-pre-wrap">{post.content}</p>

          {post.image_url && (
            <img
              src={post.image_url}
              alt="Post"
              className="mt-3 rounded-md max-h-48 w-full object-cover"
            />
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 pb-4">
          <Button variant="outline" onClick={onClose} disabled={isSharing}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={isSharing}>
            {isSharing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </>
            )}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
};
