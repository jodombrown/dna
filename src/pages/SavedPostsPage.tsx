import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserBookmarks } from '@/hooks/useUserBookmarks';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bookmark, Search, X, Pin, PinOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { usePostBookmark } from '@/hooks/usePostBookmark';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function SavedPostsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: bookmarks = [], isLoading } = useUserBookmarks(user?.id);

  // Filter bookmarks by search
  const filteredBookmarks = bookmarks.filter((bookmark) => {
    if (!searchQuery) return true;
    const content = bookmark.post?.content?.toLowerCase() || '';
    const authorName = bookmark.post?.author?.full_name?.toLowerCase() || '';
    return content.includes(searchQuery.toLowerCase()) || 
           authorName.includes(searchQuery.toLowerCase());
  });

  // Sort: pinned items first, then by created_at
  const sortedBookmarks = [...filteredBookmarks].sort((a, b) => {
    const aPinned = a.pinned_at ? 1 : 0;
    const bPinned = b.pinned_at ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const pinnedCount = filteredBookmarks.filter(b => b.pinned_at).length;

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading saved posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Saved Posts</h1>
        <p className="text-muted-foreground">
          {bookmarks.length} {bookmarks.length === 1 ? 'post' : 'posts'} saved
          {pinnedCount > 0 && ` · ${pinnedCount} pinned`}
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search saved posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {sortedBookmarks.length === 0 && (
        <Card className="p-12 text-center">
          <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery ? 'No posts found' : 'No saved posts yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? 'Try a different search term' 
              : 'Bookmark posts to read them later'}
          </p>
          {!searchQuery && (
            <Button onClick={() => navigate('/')}>
              Browse Posts
            </Button>
          )}
        </Card>
      )}

      {/* Bookmarked Posts List */}
      <div className="space-y-4">
        {sortedBookmarks.map((bookmark) => {
          if (!bookmark.post) return null;

          return (
            <SavedPostCard
              key={bookmark.id}
              bookmark={bookmark}
              onNavigate={() => navigate('/')}
              userId={user?.id}
            />
          );
        })}
      </div>
    </div>
  );
}

// Separate component for each saved post
function SavedPostCard({ bookmark, onNavigate, userId }: any) {
  const navigate = useNavigate();
  const { isBookmarked, isPinned, toggleBookmark, togglePin, isPinLoading } = usePostBookmark(bookmark.post_id, userId);

  const getInitials = (name: string) => {
    return name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  // Use local bookmark data for pin status if hook hasn't loaded yet
  const pinned = isPinned || !!bookmark.pinned_at;

  return (
    <Card className={`p-6 hover:shadow-md transition-shadow ${pinned ? 'border-primary/50 bg-primary/5' : ''}`}>
      {/* Pinned indicator */}
      {pinned && (
        <div className="flex items-center gap-1 text-xs text-primary mb-3">
          <Pin className="h-3 w-3" />
          <span>Pinned</span>
        </div>
      )}

      <div className="flex items-start gap-3 mb-4">
        <Avatar
          className="h-10 w-10 cursor-pointer"
          onClick={() => bookmark.post.author?.username && navigate(`/dna/${bookmark.post.author.username}`)}
        >
          <AvatarImage src={bookmark.post.author?.avatar_url} alt={bookmark.post.author?.full_name} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(bookmark.post.author?.full_name || 'Unknown')}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p
            className="font-semibold cursor-pointer hover:text-primary transition-colors"
            onClick={() => bookmark.post.author?.username && navigate(`/dna/${bookmark.post.author.username}`)}
          >
            {bookmark.post.author?.full_name || 'Unknown User'}
          </p>
          {bookmark.post.author?.headline && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {bookmark.post.author.headline}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Saved {formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true })}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePin()}
                  disabled={isPinLoading}
                  className={pinned ? 'text-primary' : 'text-muted-foreground hover:text-primary'}
                >
                  {pinned ? (
                    <PinOff className="h-4 w-4" />
                  ) : (
                    <Pin className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {pinned ? 'Unpin from top' : 'Pin to top'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleBookmark()}
                  className="text-primary"
                >
                  <Bookmark className="h-4 w-4 fill-current" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove from saved</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <p className="whitespace-pre-wrap break-words mb-4">{bookmark.post.content}</p>

      {bookmark.post.image_url && (
        <div className="rounded-lg overflow-hidden border">
          <img
            src={bookmark.post.image_url}
            alt="Post media"
            className="w-full h-auto object-cover max-h-96"
          />
        </div>
      )}
    </Card>
  );
}
