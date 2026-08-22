/**
 * Connect — Connection Card (Universal Feed)
 *
 * The fifth and final card. Completes the create-and-circulate engine.
 *
 * Connect points at a PERSON. (Contribute points at work + an outcome; that is
 * the line between them, and DIA is prompted on exactly that distinction.)
 *
 * CARD STANDARD (BD085): numbers appear only in the proof block. The engagement
 * row is always four verbs — React / Comment / Reshare / Save — no counts.
 *
 * Connect's proof is RECOGNITION: mutual connections. "4 people you both know"
 * is what turns a cold ask into a warm one, and it is the reason someone
 * replies. Backed by the live `get_mutual_connections` RPC (verified against
 * pg_proc: returns id, username, full_name, avatar_url, headline).
 *
 * The proof block is a door (BD086) — it opens the ProofSheet listing exactly
 * who you both know.
 *
 * Two states, one card:
 *   direction 'seeking'  → they need someone.        Primary: "I can help"
 *   direction 'offering' → they are available.       Primary: "Reach out"
 * Either way, the secondary is "Introduce" — brokering from your own network is
 * the compounding move, and the whole point of a body that knows itself.
 */

import React, { useState } from 'react';
import { UniversalFeedItem } from '@/types/feed';
import { FeedCardBase } from './FeedCardBase';
import { CardActionRow } from './CardActionRow';
import { CardMedia } from './CardMedia';
import { ProofSheet, ProofPerson } from '@/components/feed/ProofSheet';
import { ReshareDialog } from '@/components/feed/dialogs/ReshareDialog';
import { IntroductionModal } from '@/components/connect/IntroductionModal';
import { useReshare } from '@/hooks/useReshare';
import { linkifyContent } from '@/utils/linkifyContent';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  MapPin,
  ArrowLeftRight,
  ChevronRight,
  MessageCircle,
  Bookmark,
  Repeat2,
  Smile,
  Images,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { usePostLikes } from '@/hooks/usePostLikes';
import { usePostBookmarks } from '@/hooks/usePostBookmarks';
import { ThreadedComments } from '@/components/posts/ThreadedComments';
import { PostMenuOwn } from '@/components/posts/PostMenuOwn';
import { PostMenuOthers } from '@/components/posts/PostMenuOthers';
import { EditedMarker } from '@/components/posts/EditedMarker';

interface ConnectCardProps {
  item: UniversalFeedItem;
  currentUserId: string;
  onUpdate: () => void;
  showComments?: boolean;
  onCommentClick?: () => void;
  /** "I can help" / "Reach out" — opens a message to the author. Defaults to starting a DM. */
  onRespond?: (authorId: string) => void;
  /** Broker from your own network. Defaults to picking a mutual connection to introduce. */
  onIntroduce?: (authorId: string) => void;
}

interface ConnectFacets {
  /** Who they need, e.g. "Co-founder". */
  intent?: string;
  /** 'seeking' (default) or 'offering'. */
  direction?: 'seeking' | 'offering';
  /** Sector / industry line. */
  sector?: string;
  where?: string;
}

interface MutualConnection {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
}

/**
 * Live RPC (verified signature):
 *   get_mutual_connections(user1_id uuid, user2_id uuid)
 *     → TABLE(id, username, full_name, avatar_url, headline)
 */
function useMutualConnections(otherUserId: string, meId: string) {
  return useQuery({
    queryKey: ['mutual-connections', meId, otherUserId],
    enabled: !!otherUserId && !!meId && otherUserId !== meId,
    queryFn: async (): Promise<MutualConnection[]> => {
      const { data, error } = await supabase.rpc('get_mutual_connections', {
        user1_id: meId,
        user2_id: otherUserId,
      });
      if (error) return [];
      return (data ?? []) as MutualConnection[];
    },
  });
}

export const ConnectCard: React.FC<ConnectCardProps> = ({
  item,
  currentUserId,
  onUpdate,
  showComments = false,
  onCommentClick,
  onRespond,
  onIntroduce,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [localShowComments, setLocalShowComments] = useState(showComments);
  const [proofOpen, setProofOpen] = useState(false);
  const [introduceOpen, setIntroduceOpen] = useState(false);
  const [introducee, setIntroducee] = useState<ProofPerson | null>(null);
  const [isRespondLoading, setIsRespondLoading] = useState(false);

  const { likeCount, userHasLiked, toggleLike } = usePostLikes(item.post_id, currentUserId);
  const { userHasBookmarked, toggleBookmark } = usePostBookmarks(item.post_id, currentUserId);

  // Reshare — same hook + dialog PostCard uses, so a resharable post is
  // created the same way regardless of which card the click came from.
  const {
    hasReshared,
    isLoading: isResharing,
    isReshareDialogOpen,
    openReshareDialog,
    closeReshareDialog,
    handleReshare,
  } = useReshare({
    postId: item.post_id,
    userId: currentUserId,
    originalAuthorId: item.author_id,
    originalAuthorName: item.author_display_name,
    onSuccess: onUpdate,
  });

  const isOwner = item.author_id === currentUserId;
  const authorName = item.author_display_name || item.author_username || 'Member';
  const firstName = authorName.split(' ')[0];

  const facets = (item as unknown as ConnectFacets) ?? {};
  const isSeeking = facets.direction !== 'offering';

  const { data: mutuals = [] } = useMutualConnections(item.author_id, currentUserId);

  const contextLine = [facets.sector, facets.where].filter(Boolean).join(' · ');

  const commentsVisible = showComments || localShowComments;
  const handleCommentClick = () => {
    if (onCommentClick) onCommentClick();
    else setLocalShowComments((v) => !v);
  };

  // Respond — same find-or-create-conversation pattern used across the
  // network hub (ConnectMemberCard, MemberCard): reuse an existing 1:1
  // conversation with the author if one exists, otherwise start one.
  const handleRespond = async (authorId: string) => {
    if (onRespond) {
      onRespond(authorId);
      return;
    }
    setIsRespondLoading(true);
    try {
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .or(
          `and(user_a.eq.${currentUserId},user_b.eq.${authorId}),and(user_a.eq.${authorId},user_b.eq.${currentUserId})`
        )
        .maybeSingle();

      if (existing) {
        navigate(`/dna/messages/${existing.id}`);
        return;
      }

      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({ user_a: currentUserId, user_b: authorId })
        .select('id')
        .single();
      if (error) throw error;
      navigate(`/dna/messages/${newConv.id}`);
    } catch {
      toast({ title: 'Error', description: 'Could not start conversation', variant: 'destructive' });
    } finally {
      setIsRespondLoading(false);
    }
  };

  // Introduce — brokering from your own network. Reuses the mutual
  // connections already fetched for the proof block: pick one, then compose
  // the introduction in the same IntroductionModal DIA uses.
  const handleIntroduce = (authorId: string) => {
    if (onIntroduce) {
      onIntroduce(authorId);
      return;
    }
    setIntroduceOpen(true);
  };

  return (
    <FeedCardBase bevelType="connect">
      {/* Header — Connect points at a person, so the person leads */}
      <div className="mb-3 flex items-start gap-3">
        <Avatar
          className="h-10 w-10 flex-shrink-0 cursor-pointer"
          onClick={() => navigate(`/dna/${item.author_username}`)}
        >
          <AvatarImage src={item.author_avatar_url || ''} />
          <AvatarFallback>{authorName[0]?.toUpperCase() || 'M'}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <span
            className="cursor-pointer text-sm font-semibold hover:underline"
            onClick={() => navigate(`/dna/${item.author_username}`)}
          >
            {authorName}
          </span>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-bevel-connect">Connect</span>
            {' · '}
            {isSeeking ? 'Seeking' : 'Offering'}
            {' · '}
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            {item.edited_at && (
              <>
                {' · '}
                <EditedMarker editedAt={item.edited_at} postId={item.post_id} isOwn={isOwner} />
              </>
            )}
          </p>
        </div>

        {isOwner ? (
          <PostMenuOwn
            postId={item.post_id}
            authorId={item.author_id}
            currentUserId={currentUserId}
            content={item.content || ''}
            onUpdate={onUpdate}
            item={item}
          />
        ) : (
          <PostMenuOthers
            postId={item.post_id}
            authorId={item.author_id}
            authorName={authorName}
            currentUserId={currentUserId}
            onUpdate={onUpdate}
          />
        )}
      </div>

      {/* Who they need */}
      {facets.intent && (
        <span className="mb-2 inline-block rounded-full bg-bevel-connect/10 px-2.5 py-0.5 text-[11px] font-semibold text-bevel-connect">
          {facets.intent}
        </span>
      )}

      {/* The ask */}
      <p className="mb-2 text-[15px] font-semibold leading-snug">
        {linkifyContent(item.content || '')}
      </p>

      {/* Context — sector and place */}
      {contextLine && (
        <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
          {facets.sector ? (
            <Briefcase className="h-3.5 w-3.5 flex-shrink-0 text-bevel-connect" />
          ) : (
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-bevel-connect" />
          )}
          {contextLine}
        </p>
      )}

      {/* Media — hero. Bleeds to the frame (BD178); mid-card, so square corners.
          NEVER CROP, AND NO FIXED BAND (BD634 follow-up). object-contain inside a fixed
          height band never crops, but it guarantees a sliver of image ringed by
          bars the moment the photo is not the band's ratio — which is every
          portrait flyer. So the container takes the image's height instead: a
          16:9 photo renders short and wide, a portrait renders tall, both full
          card width, no bars. max-h-media (32rem) is the only ceiling; an image
          tall enough to hit it narrows and stays centred (mx-auto), and that is
          the one case bg-muted still fills. Uploads are bounded to 9:16–16:9 by
          the aspect-ratio guardrail, so natural height cannot run away. */}
      {item.media_url && (
        <CardMedia className="mt-3 bg-muted">
          <img
            src={item.media_url}
            alt=""
            className="mx-auto h-auto max-h-media w-full object-contain"
            loading="lazy"
          />
        </CardMedia>
      )}

      {/* Media — gallery (carousel with peek, BD074) */}
      {item.gallery_urls && item.gallery_urls.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Images className="h-3.5 w-3.5" />
            <span>{item.gallery_urls.length} photos</span>
          </div>
          <div className="story-scroll -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1">
            {item.gallery_urls.map((url, idx) => (
              <div
                key={idx}
                className="h-36 w-[78%] min-w-[220px] max-w-[280px] flex-shrink-0 snap-start overflow-hidden rounded-xl bg-muted/30 sm:h-40 sm:w-[240px]"
              >
                <img
                  src={url}
                  alt={`Gallery ${idx + 1}`}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROOF — recognition. The only place numbers live on this card,
          and it is a door (BD086). */}
      {mutuals.length > 0 && (
        <button
          type="button"
          onClick={() => setProofOpen(true)}
          className="mt-3 flex w-full items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2 text-left transition-colors hover:bg-muted"
        >
          <div className="flex flex-shrink-0">
            {mutuals.slice(0, 3).map((m, idx) => (
              <Avatar
                key={m.id}
                className={cn('h-6 w-6 border-2 border-card', idx > 0 && '-ml-2')}
              >
                <AvatarImage src={m.avatar_url || ''} />
                <AvatarFallback className="text-[9px]">
                  {(m.full_name || m.username || 'M')[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {mutuals.length} {mutuals.length === 1 ? 'person' : 'people'}
            </span>
            {' you both know'}
          </p>
          <ChevronRight className="ml-auto h-4 w-4 flex-shrink-0 text-muted-foreground" />
        </button>
      )}

      {/* Act, or broker */}
      {!isOwner && (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-bevel-connect text-white hover:bg-bevel-connect/90"
            disabled={isRespondLoading}
            onClick={() => handleRespond(item.author_id)}
          >
            {isSeeking ? 'I can help' : `Reach out to ${firstName}`}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-bevel-connect text-bevel-connect hover:bg-bevel-connect/5"
            disabled={!onIntroduce && mutuals.length === 0}
            onClick={() => handleIntroduce(item.author_id)}
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Connect
          </Button>
        </div>
      )}

      {/* Engagement — four verbs, no counts (BD085). Shared CardActionRow (BD185). */}
      <CardActionRow
        accent="text-bevel-connect"
        actions={[
          {
            icon: Smile,
            label: 'React',
            onClick: () => toggleLike(),
            active: userHasLiked,
            activeClassName: 'fill-bevel-connect/20 text-bevel-connect',
          },
          {
            icon: MessageCircle,
            label: 'Comment',
            onClick: handleCommentClick,
            active: commentsVisible,
          },
          {
            icon: Repeat2,
            label: 'Reshare',
            onClick: openReshareDialog,
            active: hasReshared,
          },
        ]}
        trailing={{
          icon: Bookmark,
          label: 'Save',
          onClick: () => toggleBookmark(),
          active: userHasBookmarked,
          activeClassName: 'fill-current text-bevel-connect',
        }}
      />

      {commentsVisible && (
        <ThreadedComments
          postId={item.post_id}
          currentUserId={currentUserId}
          commentsDisabled={!!item.comments_disabled}
        />
      )}

      {/* Who you both know (BD086) */}
      <ProofSheet
        open={proofOpen}
        onOpenChange={setProofOpen}
        kind="mutual_connections"
        entityId={item.author_id}
        title={`People you and ${firstName} both know`}
      />

      <ReshareDialog
        open={isReshareDialogOpen}
        onOpenChange={closeReshareDialog}
        post={item}
        currentUserId={currentUserId}
        onReshare={handleReshare}
        isLoading={isResharing}
      />

      {/* Introduce — pick a mutual connection to broker to the author. */}
      <ProofSheet
        open={introduceOpen}
        onOpenChange={setIntroduceOpen}
        kind="mutual_connections"
        entityId={item.author_id}
        title={`Introduce ${firstName} to who you know`}
        onPersonClick={(p) => setIntroducee(p)}
      />

      {introducee && (
        <IntroductionModal
          open={!!introducee}
          onOpenChange={(open) => { if (!open) setIntroducee(null); }}
          personAId={item.author_id}
          personBId={introducee.user_id}
          introducerId={currentUserId}
        />
      )}
    </FeedCardBase>
  );
};
