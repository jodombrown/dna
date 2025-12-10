import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Loader2, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { messageService, MessageSearchResult } from '@/services/messageService';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface MessageSearchProps {
  /** If provided, search is limited to this conversation */
  conversationId?: string;
  /** Callback when a search result is clicked */
  onResultClick?: (result: MessageSearchResult) => void;
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Additional class names */
  className?: string;
}

/**
 * MessageSearch - Search messages within conversations
 *
 * Implements PRD requirement:
 * - Message search returns relevant results within 500ms
 * - Searchable by keyword or date
 */
const MessageSearch: React.FC<MessageSearchProps> = ({
  conversationId,
  onResultClick,
  placeholder = 'Search messages...',
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Debounce search to avoid too many requests
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Search query
  const { data: results, isLoading, isFetching } = useQuery({
    queryKey: ['message-search', debouncedSearch, conversationId],
    queryFn: () => messageService.searchMessages(debouncedSearch, conversationId),
    enabled: debouncedSearch.length >= 2,
    staleTime: 30000, // Cache for 30 seconds
  });

  const handleResultClick = useCallback(
    (result: MessageSearchResult) => {
      onResultClick?.(result);
      setSearchTerm('');
      setIsOpen(false);
    },
    [onResultClick]
  );

  const handleClear = useCallback(() => {
    setSearchTerm('');
    setIsOpen(false);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query || query.length < 2) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-9 pr-9"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && searchTerm.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-50 overflow-hidden">
          <ScrollArea className="max-h-[400px]">
            {isLoading || isFetching ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : results && results.length > 0 ? (
              <div className="divide-y">
                {results.map((result) => (
                  <button
                    key={result.message_id}
                    onClick={() => handleResultClick(result)}
                    className="w-full p-3 hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage
                          src={result.sender_avatar_url}
                          alt={result.sender_full_name}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getInitials(result.sender_full_name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate">
                            {result.sender_full_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(result.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>

                        <p className="text-sm text-foreground line-clamp-2">
                          {highlightMatch(result.content, debouncedSearch)}
                        </p>

                        {/* Show conversation context if searching globally */}
                        {!conversationId && result.other_user_id !== result.sender_id && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MessageSquare className="h-3 w-3" />
                            <span>Conversation with {result.other_user_full_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                <Search className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No messages found for "{debouncedSearch}"</p>
              </div>
            )}
          </ScrollArea>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && searchTerm.length >= 2 && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default MessageSearch;
