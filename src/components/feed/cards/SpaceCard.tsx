/**
 * Collaborate — Space Card (Universal Feed)
 *
 * Finalized card model (BD083 palette, bevel at --bevel-width via FeedCardBase).
 *
 * This IS the Space surfacing in the feed. There is no separate "Spaces card" —
 * one component, one welding (D084).
 *
 * CARD STANDARD (BD085): numbers appear only in the proof block. The engagement
 * row is always four verbs (React / Comment / Reshare / Save), no counts.
 *
 * Collaborate's proof is the SPACE'S LIVE STATE — team / countries / progress.
 * The richest proof of any C, because a Space has a real, ongoing state to show.
 *
 * State:
 *   recruiting → open roles + "Request to join"
 *   update     → progress + "Follow"
 *
 * Capital held (D048): no "$ pooled" figure at v0.0. Non-capital metrics only.
 *
 * BUGFIX: the previous card rendered `item.view_count` labelled "members" — a
 * wrong number wearing a right label. Now reads the real member count.
 *
 * BUGFIX: the header avatar read `item.media_url || item.author_avatar_url`.
 * A Space post's attached photo is not a profile photo, so any Space that
 * posted an image wore that image as its avatar — the poster's own picture was
 * only ever a fallback for the case where no media existed. The attached media
 * now belongs to the media block below, where it was always meant to render.
 *
 * BUGFIX (BD650): the header put the Space in the name slot while the avatar
 * rendered the person — a human face labelled with a Space name, and the
 * already-computed `authorName` went unused. Reputation is person-scoped (D046),
 * so crediting only the Space erased the member in the surface where reputation
 * accrues. Name and avatar now lead with the author; the Space is subtitle
 * context.
 */

import React, { useState } from 'react';
import { UniversalFeedItem } from '@/types/feed';
import { FeedCardBase } from './FeedCardBase';
import { CardActionRow } from './CardActionRow';
import { CardMedia } from './CardMedia';
import { ExpandableProse } from './ExpandableProse';
import { LinkPreviewCard } from '@/components/feed/LinkPreviewCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  MessageCircle,
  Bookmark,
  Repeat2,
  Smile,
  Zap,
  ChevronRight,
  Images,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { usePostLikes } from '@/hooks/usePostLikes';
import { usePostBookmarks } from '@/hooks/usePostBookmarks';
import { ThreadedComments } from '@/components/posts/ThreadedComments';
import { ProofSheet } from '@/components/feed/ProofSheet';
import { ReshareDialog } from '@/components/feed/dialogs/ReshareDialog';
import { useReshare } from '@/hooks/useReshare';
import { PostMenuOwn } from '@/components/posts/PostMenuOwn';
import { PostMenuOthers } from '@/components/posts/PostMenuOthers';

interface SpaceCardProps {
  item: UniversalFeedItem;
  currentUserId: string;
  onUpdate: () => void;
  showComments?: boolean;
  onCommentClick?: () => void;
  onJoinRequest?: (spaceId: string) => void;
  onFollow?: (spaceId: string) => void;
  isFollowing?: boolean;
}

interface SpaceFacets {
  space_state?: 'recruiting' | 'update';
  space_type?: string;
  member_count?: number;
  country_count?: number;
  roles_needed?: Array<{ id?: string; title?: string } | string>;
  progress_pct?: number;
  /** One headline metric the Space itself defines, e.g. { label: 'Schools', value: 10 } */
  headline_metric?: { label: string; value: number };
}

const roleLabel = (r: { title?: string } | string): string =>
  typeof r === 'string' ? r : r.title ?? 'Open role';

export const SpaceCard: React.FC<SpaceCardProps> = ({
  item,
  currentUserId,
  onUpdate,
  showComments = false,
  onCommentClick,
  onJoinRequest,
  onFollow,
  isFollowing = false,
}) => {
  const navigate = useNavigate();
  const [localShowComments, setLocalShowComments] = useState(showComments);
  const [proofOpen, setProofOpen] = useState(false);

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
  const spaceName = item.space_title || item.title || 'Space';
  const spaceHref = item.space_id ? `/dna/collaborate/spaces/${item.space_id}` : '/dna/collaborate';

  const facets = (item as unknown as SpaceFacets) ?? {};
  const rolesNeeded = facets.roles_needed ?? [];
  const isRecruiting = facets.space_state === 'recruiting' || rolesNeeded.length > 0;
  const progress = facets.progress_pct;

  // The live dashboard. Only real counts — never view_count wearing a members label.
  const stats = [
    { label: 'Team', value: facets.member_count },
    { label: 'Countries', value: facets.country_count },
    facets.headline_metric
      ? { label: facets.headline_metric.label, value: facets.headline_metric.value }
      : null,
  ].filter((s): s is { label: string; value: number } => !!s && typeof s.value === 'number');

  const commentsVisible = showComments || localShowComments;
  const handleCommentClick = () => {
    if (onCommentClick) onCommentClick();
    else setLocalShowComments((v) => !v);
  };

  return (
    <FeedCardBase bevelType="space">
      {/* Header — the person is the actor, the Space is the context.
          Reputation is person-scoped (D046). A Space post that renders only the
          Space makes the member's contribution invisible in the exact surface
          where reputation accrues: a real face wearing a Space's name, crediting
          nobody. So the name slot and the avatar both point at the author, the
          way every other card type already does, and the Space moves down to the
          subtitle as secondary context — still a door, still carrying spaceHref. */}
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
            <span className="font-semibold text-bevel-space">Collaborate</span>
            {' · '}
            <span className="cursor-pointer hover:underline" onClick={() => navigate(spaceHref)}>
              {spaceName}
            </span>
            {' · '}
            {isRecruiting ? 'Recruiting' : 'Update'}
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

      {/* Type pill */}
      {facets.space_type && (
        <span className="mb-2 inline-block rounded-full bg-bevel-space/10 px-2.5 py-0.5 text-[11px] font-semibold text-bevel-space">
          {facets.space_type}
        </span>
      )}

      {/* What the Space is doing. ExpandableProse, not a clamped bold slab
          (BD635): a Space update is prose, and a semibold wall of it is
          unreadable at any length the composer actually allows. */}
      <ExpandableProse
        content={item.content}
        accentClassName="text-bevel-space"
        className="mb-3 text-body leading-relaxed text-muted-foreground"
      />

      {/* Recruiting — the roles that need filling */}
      {isRecruiting && rolesNeeded.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {rolesNeeded.slice(0, 4).map((role, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 rounded-full bg-bevel-space/10 px-2.5 py-1 text-xs text-bevel-space"
            >
              <Zap className="h-3 w-3" />
              {roleLabel(role)}
            </span>
          ))}
        </div>
      )}

      {/* Update — progress toward completion (D052: helping the body finish what it starts) */}
      {!isRecruiting && typeof progress === 'number' && (
        <div className="mb-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-bevel-space">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
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
          the aspect-ratio guardrail, so natural height cannot run away.

          my-3, not mt-3: the block above owns mb-3 and the proof block below
          owns no top margin, so the media has to pay for its own bottom gap.
          Adjacent margins collapse, so this stays 12px whichever combination
          of body, roles and progress renders above it. */}
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

      {/* Media — link preview (compact, BD074). The third media state: a Space
          update whose payload is a link — a demo video, a partner's site — with
          no image of its own rendered nothing at all. Same compact
          LinkPreviewCard the other cards use, so a linked video reads
          identically wherever it appears in the feed. */}
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

      {/* PROOF — the Space's live state. The only place numbers live on this card. */}
      {stats.length > 0 && (
        <button
          type="button"
          onClick={() => setProofOpen(true)}
          className="flex w-full items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-center transition-colors hover:bg-muted"
        >
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-sm font-semibold">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
          <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        </button>
      )}

      {/* Join the work, or follow it */}
      <div className="mt-3 flex gap-2">
        {isRecruiting ? (
          <Button
            size="sm"
            className="flex-1 bg-bevel-space text-white hover:bg-bevel-space/90"
            disabled={!onJoinRequest || !item.space_id}
            onClick={() => item.space_id && onJoinRequest?.(item.space_id)}
          >
            Request to join
          </Button>
        ) : (
          <Button
            size="sm"
            className={cn(
              'flex-1',
              isFollowing
                ? 'border border-bevel-space bg-transparent text-bevel-space hover:bg-bevel-space/5'
                : 'bg-bevel-space text-white hover:bg-bevel-space/90'
            )}
            disabled={!onFollow || !item.space_id}
            onClick={() => item.space_id && onFollow?.(item.space_id)}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="border-bevel-space text-bevel-space hover:bg-bevel-space/5"
          onClick={() => navigate(spaceHref)}
        >
          View Space
        </Button>
      </div>

      {/* Engagement row — four verbs, no counts (BD085). Shared CardActionRow (BD185). */}
      <CardActionRow
        accent="text-bevel-space"
        actions={[
          {
            icon: Smile,
            label: 'React',
            onClick: () => toggleLike(),
            active: userHasLiked,
            activeClassName: 'fill-bevel-space/20 text-bevel-space',
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
          activeClassName: 'fill-current text-bevel-space',
        }}
      />

      {commentsVisible && (
        <ThreadedComments
          postId={item.post_id}
          currentUserId={currentUserId}
          commentsDisabled={!!item.comments_disabled}
        />
      )}

      {/* The proof block is a door (BD086) — who is in this Space, and what they hold */}
      <ProofSheet
        open={proofOpen}
        onOpenChange={setProofOpen}
        kind="space_members"
        entityId={item.space_id}
        title={`Inside ${spaceName}`}
      />

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
