import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Bug, Lightbulb, HelpCircle, Search, Filter, ChevronDown, ChevronRight,
  Check, Clock, CircleDot, MessageSquare, Send, Paperclip, User, Calendar,
  Monitor, Globe, AlertCircle, X, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  feedbackService,
  FeedbackThread,
  FeedbackThreadListItem,
  FeedbackMessageWithSender,
  FeedbackType,
  FeedbackStatus,
  FeedbackPriority,
} from '@/services/feedbackService';

const TYPE_CONFIG: Record<FeedbackType, { label: string; icon: React.ReactNode; color: string }> = {
  bug: { label: 'Bug', icon: <Bug className="h-4 w-4" />, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  idea: { label: 'Idea', icon: <Lightbulb className="h-4 w-4" />, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  question: { label: 'Question', icon: <HelpCircle className="h-4 w-4" />, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
};

const STATUS_CONFIG: Record<FeedbackStatus, { label: string; icon: React.ReactNode; color: string }> = {
  received: { label: 'Received', icon: <CircleDot className="h-4 w-4" />, color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  in_progress: { label: 'In Progress', icon: <Clock className="h-4 w-4" />, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  resolved: { label: 'Resolved', icon: <Check className="h-4 w-4" />, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  closed: { label: 'Closed', icon: <X className="h-4 w-4" />, color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
};

const PRIORITY_CONFIG: Record<FeedbackPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default function FeedbackInbox() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<FeedbackType | 'all'>('all');
  const [replyText, setReplyText] = useState('');

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['feedback-stats'],
    queryFn: () => feedbackService.getStats(),
    refetchInterval: 30000,
  });

  // Fetch threads
  const { data: threads = [], isLoading: threadsLoading } = useQuery({
    queryKey: ['feedback-threads', statusFilter, typeFilter],
    queryFn: () => feedbackService.getAllThreads({
      status: statusFilter === 'all' ? undefined : [statusFilter],
      type: typeFilter === 'all' ? undefined : [typeFilter],
    }),
    refetchInterval: 10000,
  });

  // Selected thread details
  const selectedThread = threads.find(t => t.id === selectedThreadId);

  // Fetch messages for selected thread
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['feedback-messages', selectedThreadId],
    queryFn: () => feedbackService.getMessages(selectedThreadId!),
    enabled: !!selectedThreadId,
    refetchInterval: 5000,
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: (content: string) => feedbackService.sendTeamReply(selectedThreadId!, content),
    onSuccess: () => {
      setReplyText('');
      queryClient.invalidateQueries({ queryKey: ['feedback-messages', selectedThreadId] });
      queryClient.invalidateQueries({ queryKey: ['feedback-threads'] });
      toast({
        title: 'Reply sent',
        description: 'Your response has been sent to the user.',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to send',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: FeedbackStatus) => feedbackService.updateThreadStatus(selectedThreadId!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-threads'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-stats'] });
      toast({ title: 'Status updated' });
    },
  });

  // Priority update mutation
  const updatePriorityMutation = useMutation({
    mutationFn: (priority: FeedbackPriority) => feedbackService.updateThreadPriority(selectedThreadId!, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-threads'] });
      toast({ title: 'Priority updated' });
    },
  });

  // Filter threads by search
  const filteredThreads = threads.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.user_full_name?.toLowerCase().includes(q) ||
      t.last_message_content?.toLowerCase().includes(q) ||
      t.user_email?.toLowerCase().includes(q)
    );
  });

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedThreadId) return;
    replyMutation.mutate(replyText.trim());
  };

  const formatTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, h:mm a');
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Feedback Inbox</h1>
        <p className="text-muted-foreground">Manage user feedback, bugs, and feature requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 dark:border-yellow-900/30">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">{stats?.received || 0}</div>
            <p className="text-xs text-muted-foreground">New</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 dark:border-blue-900/30">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats?.in_progress || 0}</div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 dark:border-green-900/30">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats?.resolved || 0}</div>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-900/30">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{stats?.bugs || 0}</div>
            <p className="text-xs text-muted-foreground">Bugs</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 dark:border-amber-900/30">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-600">{stats?.ideas || 0}</div>
            <p className="text-xs text-muted-foreground">Ideas</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 dark:border-blue-900/30">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats?.questions || 0}</div>
            <p className="text-xs text-muted-foreground">Questions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
        {/* Thread List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Threads</CardTitle>
              <Badge variant="secondary">{filteredThreads.length}</Badge>
            </div>
            {/* Search & Filters */}
            <div className="space-y-2 pt-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="idea">Idea</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[480px]">
              {threadsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No feedback threads found
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredThreads.map((thread) => {
                    const typeConfig = TYPE_CONFIG[thread.type];
                    const statusConfig = STATUS_CONFIG[thread.status];

                    return (
                      <button
                        key={thread.id}
                        onClick={() => setSelectedThreadId(thread.id)}
                        className={cn(
                          "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors",
                          selectedThreadId === thread.id && "bg-muted"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={thread.user_avatar_url} />
                            <AvatarFallback className="text-xs">
                              {thread.user_full_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-sm truncate">
                                {thread.user_full_name}
                              </span>
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(thread.updated_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {thread.last_message_content || 'No messages yet'}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", typeConfig.color)}>
                                {typeConfig.icon}
                                <span className="ml-1">{typeConfig.label}</span>
                              </Badge>
                              <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", statusConfig.color)}>
                                {statusConfig.label}
                              </Badge>
                              {thread.unread_count > 0 && (
                                <Badge className="text-[10px] px-1.5 py-0 bg-primary">
                                  {thread.unread_count}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Thread Detail */}
        <Card className="lg:col-span-2">
          {!selectedThreadId ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Select a thread to view details</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Thread Header */}
              <CardHeader className="border-b border-border pb-4">
                {selectedThread && (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedThread.user_avatar_url} />
                          <AvatarFallback>
                            {selectedThread.user_full_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{selectedThread.user_full_name}</h3>
                          <p className="text-xs text-muted-foreground">{selectedThread.user_email}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedThreadId(null)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Status & Priority Controls */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <Select
                        value={selectedThread.status}
                        onValueChange={(v) => updateStatusMutation.mutate(v as FeedbackStatus)}
                      >
                        <SelectTrigger className="h-8 w-[140px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                {config.icon}
                                {config.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedThread.priority}
                        onValueChange={(v) => updatePriorityMutation.mutate(v as FeedbackPriority)}
                      >
                        <SelectTrigger className="h-8 w-[120px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Badge variant="secondary" className={cn("text-xs", TYPE_CONFIG[selectedThread.type].color)}>
                        {TYPE_CONFIG[selectedThread.type].icon}
                        <span className="ml-1">{TYPE_CONFIG[selectedThread.type].label}</span>
                      </Badge>
                    </div>

                    {/* Context Info */}
                    {selectedThread.context && (
                      <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1.5">
                        <div className="font-medium text-muted-foreground mb-2">Captured Context</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-1.5">
                            <Globe className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate" title={selectedThread.context.page_url}>
                              {selectedThread.context.page_url}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Monitor className="h-3 w-3 text-muted-foreground" />
                            <span>{selectedThread.context.browser} / {selectedThread.context.os}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>{formatTime(selectedThread.context.timestamp)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground">Screen:</span>
                            <span>{selectedThread.context.screen_size}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No messages yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-3",
                          msg.is_from_team && "flex-row-reverse"
                        )}
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={msg.sender_avatar_url} />
                          <AvatarFallback className={cn(
                            "text-xs",
                            msg.is_from_team && "bg-emerald-100 dark:bg-emerald-900/30"
                          )}>
                            {msg.is_from_team ? 'E' : msg.sender_full_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn("max-w-[70%]", msg.is_from_team && "text-right")}>
                          <p className="text-[10px] text-muted-foreground mb-1 px-1">
                            {msg.is_from_team ? `${msg.sender_full_name} (Team)` : msg.sender_full_name}
                          </p>
                          <div
                            className={cn(
                              "rounded-xl px-3 py-2",
                              msg.is_from_team
                                ? "bg-emerald-600 text-white rounded-tr-sm"
                                : "bg-muted rounded-tl-sm"
                            )}
                          >
                            {msg.attachment_url && msg.attachment_type === 'image' && (
                              <img
                                src={msg.attachment_url}
                                alt="attachment"
                                className="rounded-lg max-w-full mb-2"
                              />
                            )}
                            {msg.attachment_url && msg.attachment_type !== 'image' && (
                              <a
                                href={msg.attachment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs underline mb-2"
                              >
                                <Paperclip className="h-3 w-3" />
                                {msg.attachment_filename || 'Attachment'}
                              </a>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                            <p className={cn(
                              "text-[10px] mt-1",
                              msg.is_from_team ? "text-white/60" : "text-muted-foreground"
                            )}>
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Reply Input */}
              <div className="border-t border-border p-4">
                <div className="flex items-end gap-2">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="min-h-[60px] max-h-[120px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || replyMutation.isPending}
                    className="h-10"
                  >
                    {replyMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Press Cmd+Enter to send
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
