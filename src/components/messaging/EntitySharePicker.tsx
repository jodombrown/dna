import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { messageService } from '@/services/messageService';
import type { EntityReferenceData } from '@/services/messageTypes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Calendar,
  Users,
  Lightbulb,
  FileText,
  BookOpen,
  Loader2,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/useMobile';
import { format } from 'date-fns';

interface EntitySharePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  onEntitySent?: () => void;
}

type EntityType = 'event' | 'space' | 'opportunity' | 'post' | 'story';

interface EntityItem {
  id: string;
  title: string;
  preview?: string;
  image?: string;
  type: EntityType;
}

const TABS: { value: EntityType; label: string; icon: React.ElementType }[] = [
  { value: 'event', label: 'Events', icon: Calendar },
  { value: 'space', label: 'Spaces', icon: Users },
  { value: 'opportunity', label: 'Opportunities', icon: Lightbulb },
  { value: 'post', label: 'Posts', icon: FileText },
  { value: 'story', label: 'Stories', icon: BookOpen },
];

export const EntitySharePicker: React.FC<EntitySharePickerProps> = ({
  open,
  onOpenChange,
  conversationId,
  onEntitySent,
}) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<EntityType>('event');
  const [search, setSearch] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // Fetch events
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['share-picker-events'],
    queryFn: async () => {
      const { data } = await supabase
        .from('events')
        .select('id, title, start_time, cover_image_url')
        .gte('start_time', new Date().toISOString())
        .order('start_time')
        .limit(20);
      return (data || []).map((e): EntityItem => ({
        id: e.id,
        title: e.title,
        preview: e.start_time ? format(new Date(e.start_time), 'MMM d, yyyy') : undefined,
        image: e.cover_image_url || undefined,
        type: 'event',
      }));
    },
    enabled: open && activeTab === 'event',
  });

  // Fetch spaces
  const { data: spaces = [], isLoading: spacesLoading } = useQuery({
    queryKey: ['share-picker-spaces'],
    queryFn: async () => {
      const { data } = await supabase
        .from('spaces')
        .select('id, name, description, cover_image_url')
        .order('created_at', { ascending: false })
        .limit(20);
      return (data || []).map((s: any): EntityItem => ({
        id: s.id,
        title: s.name,
        preview: s.description ? s.description.slice(0, 80) : undefined,
        image: s.cover_image_url || undefined,
        type: 'space',
      }));
    },
    enabled: open && activeTab === 'space',
  });

  // Fetch opportunities (contribution_needs)
  const { data: opportunities = [], isLoading: oppsLoading } = useQuery({
    queryKey: ['share-picker-opportunities'],
    queryFn: async () => {
      const { data } = await supabase
        .from('contribution_needs')
        .select('id, title, type, description')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(20);
      return (data || []).map((o): EntityItem => ({
        id: o.id,
        title: o.title,
        preview: o.type || undefined,
        type: 'opportunity',
      }));
    },
    enabled: open && activeTab === 'opportunity',
  });

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['share-picker-posts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('posts')
        .select('id, content, author_id')
        .order('created_at', { ascending: false })
        .limit(20);
      return (data || []).map((p): EntityItem => ({
        id: p.id,
        title: (p.content || '').slice(0, 60) || 'Post',
        preview: p.content ? p.content.slice(0, 100) : undefined,
        type: 'post',
      }));
    },
    enabled: open && activeTab === 'post',
  });

  // Fetch stories
  const { data: stories = [], isLoading: storiesLoading } = useQuery({
    queryKey: ['share-picker-stories'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('stories')
        .select('id, title, summary, cover_image_url')
        .order('created_at', { ascending: false })
        .limit(20);
      return (data || []).map((s: any): EntityItem => ({
        id: s.id,
        title: s.title,
        preview: s.summary ? s.summary.slice(0, 80) : undefined,
        image: s.cover_image_url || undefined,
        type: 'story',
      }));
    },
    enabled: open && activeTab === 'story',
  });

  const currentItems: EntityItem[] = useMemo(() => {
    const map: Record<EntityType, EntityItem[]> = {
      event: events,
      space: spaces,
      opportunity: opportunities,
      post: posts,
      story: stories,
    };
    const items = map[activeTab] || [];
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.preview?.toLowerCase().includes(q)
    );
  }, [activeTab, events, spaces, opportunities, posts, stories, search]);

  const isLoading =
    (activeTab === 'event' && eventsLoading) ||
    (activeTab === 'space' && spacesLoading) ||
    (activeTab === 'opportunity' && oppsLoading) ||
    (activeTab === 'post' && postsLoading) ||
    (activeTab === 'story' && storiesLoading);

  const handleSelectEntity = async (item: EntityItem) => {
    setIsSending(true);
    try {
      const ref: EntityReferenceData = {
        entityType: item.type,
        entityId: item.id,
        entityTitle: item.title,
        entityPreview: item.preview,
        entityImage: item.image,
      };
      await messageService.sendEntityReference(conversationId, ref);
      toast({ title: 'Shared', description: `${item.type} shared in conversation` });
      onOpenChange(false);
      onEntitySent?.();
    } catch {
      toast({
        title: 'Failed to share',
        description: 'Could not share this item',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const pickerContent = (
    <div className="flex flex-col gap-3">
      {/* Tabs for entity types */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EntityType)}>
        <TabsList className="w-full grid grid-cols-5 h-9">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-xs px-1 gap-1"
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={`Search ${activeTab}s...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-9 text-sm"
        />
      </div>

      {/* Items list */}
      <ScrollArea className="max-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : currentItems.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            {search ? 'No results found' : `No ${activeTab}s available`}
          </p>
        ) : (
          <div className="space-y-1">
            {currentItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectEntity(item)}
                disabled={isSending}
                type="button"
                className={cn(
                  'flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left transition-colors',
                  'hover:bg-muted/60 border border-transparent'
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  {item.preview && (
                    <p className="text-xs text-muted-foreground truncate">
                      {item.preview}
                    </p>
                  )}
                </div>
                <Send className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh] flex flex-col gap-3 pb-6 px-4">
          <DrawerHeader className="px-0 pb-0">
            <DrawerTitle className="text-base">Share in Chat</DrawerTitle>
          </DrawerHeader>
          {pickerContent}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col gap-3">
        <DialogHeader>
          <DialogTitle className="text-base">Share in Chat</DialogTitle>
        </DialogHeader>
        {pickerContent}
      </DialogContent>
    </Dialog>
  );
};
