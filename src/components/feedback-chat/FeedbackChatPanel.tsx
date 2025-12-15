import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, ChevronDown, Loader2, Send, Paperclip, Bug, Lightbulb, HelpCircle, Info, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useImageUpload } from '@/hooks/useImageUpload';
import {
  feedbackService,
  FeedbackThread,
  FeedbackMessageWithSender,
  FeedbackType,
} from '@/services/feedbackService';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface FeedbackChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const FEEDBACK_TYPES: { type: FeedbackType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: 'bug', label: 'Bug', icon: <Bug className="h-3.5 w-3.5" />, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  { type: 'idea', label: 'Idea', icon: <Lightbulb className="h-3.5 w-3.5" />, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { type: 'question', label: 'Question', icon: <HelpCircle className="h-3.5 w-3.5" />, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  received: { label: 'Received', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
};

export const FeedbackChatPanel: React.FC<FeedbackChatPanelProps> = ({ isOpen, onClose }) => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { uploadImage, uploading } = useImageUpload();

  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<{ url: string; type: string; filename: string } | null>(null);
  const [selectedType, setSelectedType] = useState<FeedbackType>('bug');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get or create thread
  const { data: thread, isLoading: threadLoading } = useQuery({
    queryKey: ['feedback-thread'],
    queryFn: () => feedbackService.getOrCreateThread(selectedType),
    enabled: isOpen && !!user,
    staleTime: 30000,
  });

  // Get messages for thread
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['feedback-messages', thread?.id],
    queryFn: () => feedbackService.getMessages(thread!.id),
    enabled: !!thread?.id,
    refetchInterval: 5000,
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: ({ content, attach }: { content: string; attach?: typeof attachment }) =>
      feedbackService.sendMessage(thread!.id, content, attach || undefined),
    onSuccess: () => {
      setMessage('');
      setAttachment(null);
      queryClient.invalidateQueries({ queryKey: ['feedback-messages', thread?.id] });
      if (textareaRef.current) {
        textareaRef.current.style.height = '44px';
      }
    },
    onError: () => {
      toast({
        title: 'Failed to send',
        description: 'Your message could not be sent. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Update thread type mutation
  const updateTypeMutation = useMutation({
    mutationFn: (type: FeedbackType) => feedbackService.updateThreadType(thread!.id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-thread'] });
    },
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!thread?.id) return;

    const channel = supabase
      .channel(`feedback-chat:${thread.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feedback_messages',
          filter: `thread_id=eq.${thread.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['feedback-messages', thread.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'feedback_threads',
          filter: `id=eq.${thread.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['feedback-thread'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [thread?.id, queryClient]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 44), 120)}px`;
    }
  }, [message]);

  // Update selected type when thread loads
  useEffect(() => {
    if (thread?.type) {
      setSelectedType(thread.type);
    }
  }, [thread?.type]);

  const handleSend = () => {
    if ((!message.trim() && !attachment) || !thread) return;
    sendMutation.mutate({ content: message.trim(), attach: attachment });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      const url = await uploadImage(file, 'feedback-attachments');
      if (url) {
        setAttachment({
          url,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          filename: file.name,
        });
      }
    } catch {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload file. Please try again.',
        variant: 'destructive',
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTypeChange = (type: FeedbackType) => {
    setSelectedType(type);
    if (thread && thread.type !== type) {
      updateTypeMutation.mutate(type);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'h:mm a');
    } catch {
      return '';
    }
  };

  const currentStatus = thread?.status ? STATUS_LABELS[thread.status] : null;

  // Group messages with welcome message
  const allMessages = useMemo(() => {
    const welcomeMessage: FeedbackMessageWithSender = {
      id: 'welcome',
      thread_id: thread?.id || '',
      sender_id: 'system',
      content: "Hi there! Tell us about any bugs, ideas, or questions. We read every message and will respond as soon as we can.",
      is_from_team: true,
      attachment_url: null,
      attachment_type: null,
      attachment_filename: null,
      created_at: thread?.created_at || new Date().toISOString(),
      sender_full_name: 'DNA Engineering',
      sender_avatar_url: '',
    };

    return [welcomeMessage, ...messages];
  }, [messages, thread]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-50",
        "w-[380px] max-w-[calc(100vw-40px)]",
        "h-[520px] max-h-[calc(100vh-100px)]",
        "bg-background border border-border rounded-2xl shadow-2xl",
        "flex flex-col overflow-hidden",
        "animate-in slide-in-from-bottom-5 fade-in duration-200"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <span className="text-lg">🛠️</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm">DNA Engineering</h3>
            <p className="text-xs text-muted-foreground">We typically respond within 24h</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Type selector & Status */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20">
        <div className="flex items-center gap-1.5">
          {FEEDBACK_TYPES.map(({ type, label, icon, color }) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                selectedType === type
                  ? color
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
        {currentStatus && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className={cn("text-[10px] px-2", currentStatus.color)}>
                {currentStatus.label}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="text-xs">Current status of your feedback</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {threadLoading || messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {allMessages.map((msg) => {
              const isOwn = msg.sender_id === user?.id;
              const isSystem = msg.sender_id === 'system';

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-2",
                    isOwn ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {!isOwn && (
                    <Avatar className="h-7 w-7 flex-shrink-0">
                      {isSystem ? (
                        <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-xs">
                          🛠️
                        </AvatarFallback>
                      ) : (
                        <>
                          <AvatarImage src={msg.sender_avatar_url} />
                          <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-xs">
                            {msg.sender_full_name?.charAt(0) || 'E'}
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                  )}

                  <div className={cn("max-w-[75%]", isOwn && "text-right")}>
                    {!isOwn && !isSystem && (
                      <p className="text-[10px] text-muted-foreground mb-0.5 px-1">
                        {msg.sender_full_name}
                      </p>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-3 py-2",
                        isOwn
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
                      {msg.attachment_url && msg.attachment_type === 'file' && (
                        <a
                          href={msg.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "flex items-center gap-2 text-xs underline mb-2",
                            isOwn ? "text-white/90" : "text-foreground"
                          )}
                        >
                          <Paperclip className="h-3 w-3" />
                          {msg.attachment_filename || 'Attachment'}
                        </a>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      <p
                        className={cn(
                          "text-[10px] mt-1",
                          isOwn ? "text-white/60" : "text-muted-foreground"
                        )}
                      >
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Context captured indicator */}
      <div className="px-4 py-1.5 border-t border-border bg-muted/20">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-help">
              <Info className="h-3 w-3" />
              <span>Page context auto-captured</span>
              <Check className="h-3 w-3 text-green-500" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[280px]">
            <p className="text-xs">
              We automatically capture the current page URL, browser, and device info to help diagnose issues faster.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card p-3">
        {/* Attachment preview */}
        {attachment && (
          <div className="mb-2">
            <div className="relative inline-block">
              {attachment.type === 'image' ? (
                <div className="relative">
                  <img
                    src={attachment.url}
                    alt={attachment.filename}
                    className="h-16 w-auto rounded-lg object-cover"
                  />
                  <button
                    onClick={() => setAttachment(null)}
                    className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 pr-8 relative">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate max-w-[180px]">{attachment.filename}</span>
                  <button
                    onClick={() => setAttachment(null)}
                    className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt"
            className="hidden"
          />

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || sendMutation.isPending}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </Button>

          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what happened..."
            disabled={sendMutation.isPending || !thread}
            rows={1}
            className={cn(
              "min-h-[36px] max-h-[100px] resize-none flex-1",
              "text-sm bg-muted/50 border-0 focus-visible:ring-1 rounded-xl py-2 px-3"
            )}
          />

          {(message.trim() || attachment) && (
            <Button
              onClick={handleSend}
              disabled={(!message.trim() && !attachment) || sendMutation.isPending || !thread}
              size="icon"
              className="h-9 w-9 rounded-full flex-shrink-0 bg-emerald-600 hover:bg-emerald-700"
            >
              {sendMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
