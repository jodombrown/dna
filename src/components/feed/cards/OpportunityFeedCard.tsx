/**
 * Contribute — Opportunity Card (Universal Feed)
 *
 * Finalized card model (BD083 palette, bevel at --bevel-width via FeedCardBase).
 *
 * CARD STANDARD (BD085): numbers appear only in the proof block. The engagement
 * row is always four verbs (React / Comment / Reshare / Save), no counts.
 *
 * Contribute's proof is CONSEQUENCE: the give → to → impact flow (BD084). It is
 * the signature no other card has — recognizable even in grayscale. You see the
 * effect before you act.
 *
 * Contribute is INITIATIVE-centric, not person-centric. Connect points at a
 * person; Contribute points at work + outcome. Distinct on purpose.
 *
 * State:
 *   direction = 'offer' → a giver.        Primary action: "Request this"
 *   direction = 'need'  → an initiative.  Primary action: "I can fill this"
 *
 * Capital is NOT a Contribute currency at v0.0 (D048). The compensation columns
 * exist because the composer writes them; no money is surfaced here.
 */

import React, { useState } from 'react';
import { UniversalFeedItem } from '@/types/feed';
import { FeedCardBase } from './FeedCardBase';
import { CardActionRow } from './CardActionRow';
import { CardMedia } from './CardMedia';
import { ExpandableProse } from './ExpandableProse';
import { LinkPreviewCard } from '@/components/feed/LinkPreviewCard';
import { ReshareDialog } from '@/components/feed/dialogs/ReshareDialog';
import { useReshare } from '@/hooks/useReshare';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Share2,
  MessageCircle,
  Bookmark,
  Repeat2,
  Smile,
  Images,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { usePostLikes } from '@/hooks/usePostLikes';
import { usePostBookmarks } from '@/hooks/usePostBookmarks';
import { ThreadedComments } from '@/components/posts/ThreadedComments';
import { PostMenuOwn } from '@/components/posts/PostMenuOwn';
import { PostMenuOthers } from '@/components/posts/PostMenuOthers';

interface OpportunityFeedCardProps {
  item: UniversalFeedItem;
  currentUserId: string;
  onUpdate: () => void;
  showComments?: boolean;
  onCommentClick?: () => void;
  /** "I can fill this" / "Request this" */
  onRespond?: (opportunityId: string) => void;
  /** Broker from your network — the compounding move. */
  onRefer?: (opportunityId: string) => void;
}

/** The currency being offered or asked for. Capital is deliberately absent (D048). */
const CATEGORY_LABEL: Record<string, string> = {
  skills_expertise: 'Expertise',
  mentorship_guidance: 'Mentorship',
  partnership_collaboration: 'Partnership',
  knowledge_training: 'Knowledge',
  network_introductions: 'Network',
  physical_resources: 'Resources',
  volunteer_time: 'Time',
};

export const OpportunityFeedCard: React.FC<OpportunityFeedCardProps> = ({
  item,
  currentUserId,
  onUpdate,
  showComments = false,
  onCommentClick,
  onRespond,
  onRefer,
}) => {
  const navigate = useNavigate();
  const [localShowComments, setLocalShowComments] = useState(showComments);

  const { likeCount, userHasLiked, toggleLike } = usePostLikes(item.post_id, currentUserId);
  const { userHasBookmarked, toggleBookmark } = usePostBookmarks(item.post_id, currentUserId);

  // Reshare — same hook + dialog PostCard and ConnectCard use, so a resharable
  // post is created the same way regardless of which card the click came from.
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

  // Opportunity fields ride the linked entity (BD081 post-backed envelope).
  const opp = (item as unknown as {
    direction?: 'need' | 'offer';
    category?: string;
    give_what?: string;
    give_to?: string;
    intended_impact?: string;
  }) ?? {};

  const isNeed = opp.direction !== 'offer';
  const opportunityId = item.linked_entity_id ?? item.post_id;

  const categoryLabel = opp.category
    ? `${CATEGORY_LABEL[opp.category] ?? opp.category}${isNeed ? ' needed' : ''}`
    : isNeed
      ? 'Needed'
      : 'Offering';

  // The triple (BD084). Falls back gracefully while DIA extraction rolls out.
  const triple = [
    { label: isNeed ? 'Need' : 'Give', value: opp.give_what },
    { label: isNeed ? 'For' : 'To', value: opp.give_to },
    { label: 'Impact', value: opp.intended_impact },
  ];
  const hasTriple = triple.some((t) => !!t.value);

  const commentsVisible = showComments || localShowComments;
  const handleCommentClick = () => {
    if (onCommentClick) onCommentClick();
    else setLocalShowComments((v) => !v);
  };

  return (
    <FeedCardBase bevelType="opportunity">
      {/* Header — the initiative, or the giver */}
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
            {item.title || authorName}
          </span>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-bevel-opportunity">Contribute</span>
            {' · '}
            {isNeed ? 'Need' : 'Offering'}
            {' · '}
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
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

      {/* Currency pill */}
      <span className="mb-2 inline-block rounded-full bg-bevel-opportunity/15 px-2.5 py-0.5 text-[11px] font-semibold text-bevel-opportunity">
        {categoryLabel}
      </span>

      {/* The ask, or the offer */}
      <ExpandableProse
        content={item.content}
        accentClassName="text-bevel-opportunity"
        className="mb-3 text-body leading-relaxed text-muted-foreground"
      />

      {/* Media — hero. Bleeds to the frame (BD178); mid-card, so square corners.
          NEVER CROP, AND NO FIXED BAND (BD634 follow-up). object-contain inside a fixed
          height band never crops, but it guarantees a sliver of image ringed by
          bars the moment the photo is not the band's ratio — which is every
          portrait flyer. So the container takes the image's height instead: a
          16:9 photo renders short and wide, a portrait renders tall, both full
          card width, no bars. max-h-media (32rem) is the only ceiling; an image
          tall enough to hit it narrows and stays centred (mx-auto), and that is
          the one case bg-muted still fills. Uploads are bounded to 9:16–16:9 by
          the aspect-ratio guardrail, so natural height cannot run away.

          my-3, not mt-3: the ask above owns mb-3 and the proof block below owns
          no top margin, so the media has to pay for its own bottom gap. Adjacent
          margins collapse, so this stays 12px whichever combination renders. */}
      {item.media_url && (
        <CardMedia className="my-3 bg-muted">
          <img
            src={item.media_url}
            alt=""
            className="mx-auto h-auto max-h-media w-full object-contain"
            loading="lazy"
          />
        </CardMedia>
      )}

      {/* Media — gallery (carousel with peek, BD074). Same never-crop rule.
          Tile dimensions come from the width/minWidth/maxWidth gallery-* tokens
          rather than the arbitrary literals StoryCard and ConnectCard still
          carry — new code does not get to add a new arbitrary value. */}
      {item.gallery_urls && item.gallery_urls.length > 0 && (
        <div className="my-3 space-y-2">
          <div className="flex items-center gap-2 text-meta font-medium text-muted-foreground">
            <Images className="h-3.5 w-3.5" />
            <span>{item.gallery_urls.length} photos</span>
          </div>
          <div className="story-scroll -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1">
            {item.gallery_urls.map((url, idx) => (
              <div
                key={idx}
                className="h-36 w-gallery-peek min-w-gallery-tile max-w-gallery-tile flex-shrink-0 snap-start overflow-hidden rounded-xl bg-muted/30 sm:h-40 sm:w-gallery-tile"
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

      {/* Media — link preview (compact, BD074). The third media state, specced
          with the hero and the gallery and never built until now: a Contribute
          post with no image but a link_url — a video the giver is pointing at —
          rendered nothing at all. Same compact LinkPreviewCard StoryCard uses,
          so a linked video reads identically wherever it appears in the feed. */}
      {item.link_url && (
        <div className="my-3">
          <LinkPreviewCard
            data={{
              url: item.link_url,
              title: item.link_title || undefined,
              description: item.link_description || undefined,
              provider_name: item.link_metadata?.provider_name,
              thumbnail_url: item.link_metadata?.thumbnail_url,
              type: item.link_metadata?.embed_type,
              is_video: item.link_metadata?.is_video,
            }}
            showRemoveButton={false}
            size="compact"
          />
        </div>
      )}

      {/* PROOF — the give → to → impact flow. Contribute's signature (BD084). */}
      {hasTriple && (
        <div className="flex items-stretch gap-1.5 rounded-lg bg-muted/50 p-2.5">
          {triple.map((step, idx) => (
            <React.Fragment key={step.label}>
              {idx > 0 && (
                <div className="flex items-center text-bevel-opportunity">
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
              <div className="min-w-0 flex-1 text-center">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {step.label}
                </p>
                <p className="mt-0.5 truncate text-xs font-semibold leading-tight">
                  {step.value || '—'}
                </p>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Act, or broker from your network */}
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          className="flex-1 bg-bevel-opportunity text-[#3d2f05] hover:bg-bevel-opportunity/90"
          disabled={!onRespond}
          onClick={() => onRespond?.(opportunityId)}
        >
          {isNeed ? 'I can fill this' : 'Request this'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 border-bevel-opportunity text-bevel-opportunity hover:bg-bevel-opportunity/5"
          disabled={!onRefer}
          onClick={() => onRefer?.(opportunityId)}
        >
          <Share2 className="h-3.5 w-3.5" />
          Refer
        </Button>
      </div>

      {/* Engagement row — four verbs, no counts (BD085). Shared CardActionRow (BD185). */}
      <CardActionRow
        accent="text-bevel-opportunity"
        actions={[
          {
            icon: Smile,
            label: 'React',
            onClick: () => toggleLike(),
            active: userHasLiked,
            activeClassName: 'fill-bevel-opportunity/20 text-bevel-opportunity',
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
          activeClassName: 'fill-current text-bevel-opportunity',
        }}
      />

      {commentsVisible && (
        <ThreadedComments
          postId={item.post_id}
          currentUserId={currentUserId}
          commentsDisabled={!!item.comments_disabled}
        />
      )}

      <ReshareDialog
        open={isReshareDialogOpen}
        onOpenChange={closeReshareDialog}
        post={item}
        currentUserId={currentUserId}
        onReshare={handleReshare}
        isLoading={isResharing}
      />
    </FeedCardBase>
  );
};
