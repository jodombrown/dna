/**
 * DNA Universal Composer — Phase C rebuild (BD085/BD087)
 *
 * The member writes first. Everything else follows the writing:
 *
 *   ┌──────────────────────────────┬──────────────────┐
 *   │  Verb rail (arrows)          │                  │
 *   │  Textarea — always first     │   LIVE CARD      │
 *   │  DIA line (quiet, one line)  │   PREVIEW        │
 *   │  Fields for this verb        │                  │
 *   │  Tools · Draft · POST        │                  │
 *   └──────────────────────────────┴──────────────────┘
 *
 * Desktop: two columns. Mobile: the preview collapses to a "See your card"
 * toggle below the fields — never a second scroll region competing with the
 * writing surface.
 *
 * DIA ACTS. IT DOES NOT ASK. It reads the draft (dia-compose-read), flips the
 * verb, and fills the fields — reporting on one quiet line. The member can
 * always override via the rail, and any field they touch is theirs forever.
 *
 * SPACE COMPOSES INLINE (reversal of BD087): picking Start a Collaboration
 * renders fields right here; submit calls the Spaces substrate. No navigation.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useDIACompose } from '@/hooks/useDIACompose';
import { useAutoEmbedDetection } from '@/hooks/useAutoEmbedDetection';
import { useToast } from '@/hooks/use-toast';
import { LinkPreviewCard } from '@/components/feed/LinkPreviewCard';
import { ComposerMode, ComposerContext, ComposerFormData } from '@/hooks/useUniversalComposer';
import type { ComposerSuccessData } from '@/hooks/useUniversalComposer';
import { DEFAULT_MODE, modeConfig } from '@/config/composerModes';
import { MODE_HANDLERS } from './modeHandlers';
import { seedToFormData } from './composerFormData';
import { ComposerVerbRail } from './ComposerVerbRail';
import { ComposerFields } from './ComposerFields';
import { ComposerCardPreview } from './ComposerCardPreview';
import { MediaUploadButton } from './fields/MediaUploadButton';
import { resolveDate, type ResolvedDate } from '@/services/composeResolvers';
import { saveDraft, scheduleDraft, updateDraft, updateSchedule } from '@/services/postDraftsService';
import { EventForm } from '@/components/events/EventForm';
import type { EventFormValues } from '@/lib/events/eventFormSchema';
import { utcToWallTime, wallTimeToUtc, browserTimezone } from '@/lib/events/timezone';
import { cn } from '@/lib/utils';

interface UniversalComposerProps {
  isOpen: boolean;
  mode: ComposerMode;
  context: ComposerContext;
  isSubmitting: boolean;
  successData: ComposerSuccessData | null;
  onClose: () => void;
  onModeChange: (mode: ComposerMode) => void;
  onSubmit: (formData: ComposerFormData) => void;
  onDismissSuccess: () => void;
}

/** Post button fill per verb — literal classes, legible on every fill. */
const POST_FILL: Record<ComposerMode, string> = {
  connect: 'bg-bevel-connect hover:bg-bevel-connect/90 text-white',
  event: 'bg-bevel-event hover:bg-bevel-event/90 text-white',
  space: 'bg-bevel-space hover:bg-bevel-space/90 text-white',
  need: 'bg-bevel-opportunity hover:bg-bevel-opportunity/90 text-[#3d2f05]',
  story: 'bg-bevel-story hover:bg-bevel-story/90 text-white',
};

const FORMAT_TO_DB: Record<string, 'in_person' | 'virtual' | 'hybrid'> = {
  'In person': 'in_person',
  Virtual: 'virtual',
  Hybrid: 'hybrid',
};

interface DraftV2 {
  mode: ComposerMode;
  body: string;
  fields: Record<string, string>;
  mediaUrl?: string;
  roles?: string[];
  galleryUrls?: string[];
  resolvedWhen?: ResolvedDate | null;
  savedAt: number;
}

const draftKey = (userId: string) => `dna.composer.v2.${userId}`;

export const UniversalComposer = ({
  isOpen,
  mode,
  context,
  isSubmitting,
  successData,
  onClose,
  onModeChange,
  onSubmit,
  onDismissSuccess,
}: UniversalComposerProps) => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const userId = user?.id ?? '';
  const { toast } = useToast();

  const [body, setBody] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(undefined);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  // Resolved date (BD089) — DIA hands an answer; it seeds the event form.
  const [resolvedWhen, setResolvedWhen] = useState<ResolvedDate | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [userPickedVerb, setUserPickedVerb] = useState(false);
  const [ownedByAuthor, setOwnedByAuthor] = useState<Set<string>>(new Set());
  const [previewOpenMobile, setPreviewOpenMobile] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  // Post-action split button (BD534: connect/story only) — save-as-draft and
  // schedule-for-later against post_drafts. Separate from the seed-step
  // localStorage autosave above; these are two different drafting concepts.
  const [postMenuOpen, setPostMenuOpen] = useState(false);
  const [schedulePanelOpen, setSchedulePanelOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [isDraftActionBusy, setIsDraftActionBusy] = useState(false);
  /**
   * Host an Event used to skip the free-text step entirely, which left DIA with
   * nothing to read once the member was inside event mode. Now event mode opens
   * on the same Textarea every other verb uses; `hasSeeded` flips once DIA has
   * read it (or the member opts out) and the structured form takes over.
   */
  const [hasSeeded, setHasSeeded] = useState(false);

  const hydratedRef = useRef(false);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const eventSeedTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const { proposal, isReading, diaFilled, releaseField, reset } = useDIACompose({
    text: body,
    userPickedVerb,
    ownedByAuthor,
    enabled: isOpen && !successData,
  });

  // Link/video preview — reconnects the existing auto-embed infrastructure
  // (useAutoEmbedDetection, link-preview edge function) to the live composer.
  const {
    loading: embedLoading,
    embedData,
    handleContentChange: handleEmbedContentChange,
    clearEmbedData,
  } = useAutoEmbedDetection();
  const strippedEmbedUrlRef = useRef<string | null>(null);

  const handleBodyChange = useCallback((value: string) => {
    setBody(value);
    // Once a URL has been confirmed and stripped this session, further
    // typing must not re-trigger detection — that's what was wiping the
    // preview on every keystroke after the strip fired. BD530. Detection
    // resumes once removeEmbed() resets the ref (a genuinely new paste).
    if (strippedEmbedUrlRef.current === null) {
      handleEmbedContentChange(value);
    }
  }, [handleEmbedContentChange]);

  // Once a URL resolves to a preview, the raw link is clutter — the card
  // beneath now represents it. Only after a successful fetch, never for a
  // still-typing URL that hasn't resolved yet.
  useEffect(() => {
    if (embedLoading || !embedData) return;
    if (strippedEmbedUrlRef.current === embedData.url) return;
    if (!body.includes(embedData.url)) return;
    strippedEmbedUrlRef.current = embedData.url;
    setBody((prev) =>
      prev
        .replace(embedData.url, '')
        .replace(/[ \t]{2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    );
  }, [embedLoading, embedData, body]);

  const removeEmbed = useCallback(() => {
    const url = embedData?.url;
    clearEmbedData();
    strippedEmbedUrlRef.current = null;
    if (url) {
      setBody((prev) =>
        prev
          .replace(url, '')
          .replace(/[ \t]{2,}/g, ' ')
          .replace(/\n{3,}/g, '\n\n')
          .trim()
      );
    }
  }, [embedData, clearEmbedData]);

  // DIA acts. It does not ask. (The member can always override via the rail.)
  useEffect(() => {
    if (!proposal) return;
    if (!userPickedVerb && proposal.verb !== mode) onModeChange(proposal.verb);
    setFields((prev) => {
      const next = { ...prev };
      Object.entries(proposal.fields).forEach(([k, v]) => {
        if (!ownedByAuthor.has(k)) next[k] = v;
      });
      return next;
    });
    // Event mode: don't hand off to the structured form while the member
    // is still typing — a proposal landing mid-sentence would yank the
    // text box away. Wait for a real pause after the read lands. BD525.
    if (mode === 'event' || proposal.verb === 'event') {
      clearTimeout(eventSeedTimerRef.current);
      eventSeedTimerRef.current = setTimeout(() => setHasSeeded(true), 1500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposal]);

  // Any further typing cancels a pending event-mode handoff — the member
  // gets the full pause after their LAST keystroke, not whatever was left
  // of the timer from an earlier one. BD525.
  useEffect(() => {
    clearTimeout(eventSeedTimerRef.current);
  }, [body]);

  // The author touches a field → it is theirs forever.
  const editField = useCallback(
    (k: string, v: string) => {
      setFields((f) => ({ ...f, [k]: v }));
      setOwnedByAuthor((s) => new Set(s).add(k));
      releaseField(k);
    },
    [releaseField]
  );

  // DIA proposes natural language ("Saturday at 6pm"); we resolve it to a real
  // instant the member can see and correct. Only while DIA still owns "when".
  useEffect(() => {
    if (!proposal?.fields.when || ownedByAuthor.has('when')) return;
    setResolvedWhen(resolveDate(proposal.fields.when));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposal]);

  // DIA proposes roles as a comma-string; seed the chips from it until touched.
  useEffect(() => {
    if (!proposal?.fields.roles || ownedByAuthor.has('roles')) return;
    const parsed = proposal.fields.roles.split(',').map((r) => r.trim()).filter(Boolean);
    if (parsed.length) setRoles(parsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposal]);

  const handleRolesChange = useCallback(
    (next: string[]) => {
      setRoles(next);
      setOwnedByAuthor((s) => new Set(s).add('roles'));
      releaseField('roles');
    },
    [releaseField]
  );

  const pickVerb = useCallback(
    (m: ComposerMode) => {
      setUserPickedVerb(true);
      onModeChange(m);
    },
    [onModeChange]
  );

  // "not this?" — revert to Convey and let the member drive.
  const rejectProposal = useCallback(() => {
    setUserPickedVerb(true);
    onModeChange(DEFAULT_MODE);
  }, [onModeChange]);

  const clearAll = useCallback(() => {
    setBody('');
    setFields({});
    setMediaUrl(undefined);
    setGalleryUrls([]);
    setResolvedWhen(null);
    setRoles([]);
    setUserPickedVerb(false);
    setOwnedByAuthor(new Set());
    setPreviewOpenMobile(false);
    setDraftSavedAt(null);
    setHasSeeded(false);
    clearEmbedData();
    strippedEmbedUrlRef.current = null;
    clearTimeout(eventSeedTimerRef.current);
    reset();
  }, [reset, clearEmbedData]);

  // A closed composer forgets the seed step, so reopening Host an Event lands
  // on the free-text entry again rather than a stale structured form.
  useEffect(() => {
    if (!isOpen) {
      setHasSeeded(false);
      clearTimeout(eventSeedTimerRef.current);
    }
  }, [isOpen]);



  // A closed composer forgets the seed step, so reopening Host an Event lands
  // on the free-text entry again rather than a stale structured form.
  useEffect(() => {
    if (!isOpen) {
      setHasSeeded(false);
      clearTimeout(eventSeedTimerRef.current);
    }
  }, [isOpen]);



  // ---- Edit mode: resuming a post_drafts row (BD534 step 5) ----------------
  // Hydrates body/fields/mediaUrl/galleryUrls from editDraft.payload — the
  // SAME four state setters the localStorage draft-restore effect below
  // uses, just fed from a different source. userPickedVerb is set so DIA
  // never tries to reclassify content the member already committed to a
  // mode, and every hydrated field is marked owned so a stray DIA read can't
  // overwrite it either.
  const editDraftHydratedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isOpen) {
      editDraftHydratedRef.current = null;
      return;
    }
    const editDraft = context.editDraft;
    if (!editDraft || editDraftHydratedRef.current === editDraft.id) return;
    editDraftHydratedRef.current = editDraft.id;

    const payload = editDraft.payload as Partial<ComposerFormData>;
    setBody(payload.content ?? '');
    setMediaUrl(payload.mediaUrl);
    setGalleryUrls(payload.galleryUrls ?? []);

    const draftFields: Record<string, string> =
      editDraft.mode === 'story'
        ? { title: payload.title ?? '' }
        : { intent: payload.intent ?? '', where: payload.where ?? '' };
    setFields(draftFields);
    setOwnedByAuthor(new Set(Object.keys(draftFields)));
    setUserPickedVerb(true);
    hydratedRef.current = true; // never let the localStorage seed-draft clobber this

    if (editDraft.status === 'scheduled' && editDraft.scheduledAt) {
      const zone = browserTimezone();
      const wallTime = utcToWallTime(editDraft.scheduledAt, zone);
      setScheduleDate(wallTime.date);
      setScheduleTime(wallTime.time);
      setSchedulePanelOpen(true);
      setPostMenuOpen(true);
    }
  }, [isOpen, context.editDraft]);

  // ---- Draft: refresh-safe, quiet, one per member -------------------------
  useEffect(() => {
    if (!isOpen || !userId || successData) return;
    if (context.editDraft) return; // edit-mode hydration owns these fields instead
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const raw = localStorage.getItem(draftKey(userId));
      if (!raw) return;
      const draft = JSON.parse(raw) as DraftV2;
      if (!draft?.body?.trim()) return;
      setBody(draft.body);
      setFields(draft.fields ?? {});
      setMediaUrl(draft.mediaUrl);
      setGalleryUrls(draft.galleryUrls ?? []);
      setRoles(draft.roles ?? []);
      // A saved event keeps its resolved date. Prefer the persisted resolved
      // instant; fall back to re-parsing the phrase DIA had populated.
      if (draft.resolvedWhen) setResolvedWhen(draft.resolvedWhen);
      else if (draft.fields?.when) setResolvedWhen(resolveDate(draft.fields.when));
      setDraftSavedAt(draft.savedAt ?? null);
      // Restored fields are the author's — DIA does not overwrite a draft.
      const owned = new Set(Object.keys(draft.fields ?? {}));
      if (draft.roles?.length) owned.add('roles');
      setOwnedByAuthor(owned);
      if (draft.mode && draft.mode !== mode) onModeChange(draft.mode);
    } catch {
      // Unreadable draft — start clean.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId, successData]);

  useEffect(() => {
    if (!isOpen) hydratedRef.current = false;
  }, [isOpen]);

  // ---- Space prefill: CuratedEventPreview hands name/tagline/description in
  // via context.spacePrefill (the old /spaces/new form read the same fields
  // from router state). Runs after draft restore so an explicit prefill wins.
  const spacePrefillAppliedRef = useRef(false);
  useEffect(() => {
    if (!isOpen) {
      spacePrefillAppliedRef.current = false;
      return;
    }
    if (spacePrefillAppliedRef.current) return;
    const prefill = context.spacePrefill;
    if (!prefill) return;
    spacePrefillAppliedRef.current = true;

    const owned = new Set<string>();
    if (prefill.name) {
      setFields((f) => ({ ...f, title: prefill.name! }));
      owned.add('title');
    }
    if (prefill.spaceType) {
      setFields((f) => ({ ...f, type: prefill.spaceType! }));
      owned.add('type');
    }
    const bodyText = [prefill.tagline, prefill.description].filter(Boolean).join('\n\n');
    if (bodyText) setBody(bodyText);
    if (owned.size) setOwnedByAuthor((s) => new Set([...s, ...owned]));
  }, [isOpen, context]);

  useEffect(() => {
    if (!isOpen || !userId || successData || (mode === 'event' && hasSeeded)) return;
    clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      try {
        if (body.trim()) {
          const draft: DraftV2 = { mode, body, fields, mediaUrl, roles, galleryUrls, resolvedWhen, savedAt: Date.now() };
          localStorage.setItem(draftKey(userId), JSON.stringify(draft));
          setDraftSavedAt(draft.savedAt);
        } else {
          localStorage.removeItem(draftKey(userId));
          setDraftSavedAt(null);
        }
      } catch {
        // Storage full/blocked — drafting is best-effort.
      }
    }, 600);
    return () => clearTimeout(draftTimerRef.current);
  }, [body, fields, mediaUrl, roles, galleryUrls, resolvedWhen, mode, isOpen, userId, successData, hasSeeded]);

  // Once the structured event form takes over, the seed-step draft it
  // was built from is stale and has no further use — clear it so
  // re-editing the form's own fields never gets shadowed by it on
  // reopen. BD525.
  useEffect(() => {
    if (hasSeeded && userId) {
      try {
        localStorage.removeItem(draftKey(userId));
      } catch {
        // best-effort
      }
    }
  }, [hasSeeded, userId]);

  // ---- Success: DIA doesn't ceremonize. Close, toast, clear. ---------------
  useEffect(() => {
    if (!successData) return;
    if (userId) {
      try {
        localStorage.removeItem(draftKey(userId));
      } catch {
        // best-effort
      }
    }
    clearAll();
    onDismissSuccess(); // closes the composer and shows the verb's toast
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successData]);

  // ---- Convene: the unified event form (compact level, expands in place) ---
  // Hosting an event IS authoring an event — same schema, same submit path as
  // the full form. What the member wrote before the verb flipped seeds the
  // form: body → description, DIA's title/when/where → their fields.
  const isEventMode = mode === 'event';
  const eventSeed = useMemo<Partial<EventFormValues> | null>(() => {
    if (!hasSeeded) return null;
    const seed: Partial<EventFormValues> = {};
    if (body.trim()) seed.description = body.trim();
    if (fields.title?.trim()) seed.title = fields.title.trim();
    if (mediaUrl) seed.cover_image_url = mediaUrl;
    if (fields.format && FORMAT_TO_DB[fields.format]) seed.format = FORMAT_TO_DB[fields.format];
    if (resolvedWhen) {
      const zone = browserTimezone();
      const start = utcToWallTime(resolvedWhen.iso, zone);
      const end = utcToWallTime(
        new Date(new Date(resolvedWhen.iso).getTime() + 2 * 3600_000).toISOString(),
        zone
      );
      seed.startDate = start.date;
      seed.startTime = start.time;
      seed.endDate = end.date;
      seed.endTime = end.time;
    }
    if (fields.where?.trim()) {
      // DIA's "where" is unresolved free text ("Los Angeles, California").
      // location_city is published verbatim to strangers via get_public_event,
      // so only the place picker may write it — seed the venue name instead,
      // where a free-text guess is survivable.
      seed.location_name = fields.where.trim();
    }
    // Skipping the seed step with nothing written is a pure opt-out: an empty
    // form, exactly as before.
    return Object.keys(seed).length ? seed : null;
    // Snapshot at the moment the seed step ends (DIA read the text, or the
    // member skipped it) — the form owns its state from there.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSeeded]);

  const handleEventPublished = useCallback(() => {
    if (userId) {
      try {
        localStorage.removeItem(draftKey(userId));
      } catch {
        // best-effort
      }
    }
    clearAll();
    onClose();
  }, [userId, clearAll, onClose]);

  // ---- Submit: route by verb to the substrate ------------------------------
  // The verb→ComposerFormData mapping lives in seedToFormData (shared with the
  // edit round-trip tests) so there is exactly ONE forward implementation.
  const buildFormData = useCallback(
    (): ComposerFormData | null =>
      seedToFormData(mode, { body, fields, mediaUrl, galleryUrls, roles, embedData }),
    [mode, body, fields, mediaUrl, galleryUrls, roles, embedData]
  );

  const handleSubmit = useCallback(() => {
    const formData = buildFormData();
    if (!formData) return;
    onSubmit(formData);
  }, [buildFormData, onSubmit]);

  // ---- Save as draft / Schedule for later (BD534, connect/story only) ------
  // Both leave the composer open on failure — same as today's failed-submit
  // behavior — and both clear the seed-step localStorage draft on success,
  // exactly like a normal publish, since the post_drafts row now owns it.
  const isSchedulableMode = mode === 'connect' || mode === 'story';
  const schedulableMode = isSchedulableMode ? (mode as 'connect' | 'story') : null;

  const finishDraftAction = useCallback(
    (message: string) => {
      if (userId) {
        try {
          localStorage.removeItem(draftKey(userId));
        } catch {
          // best-effort
        }
      }
      clearAll();
      onClose();
      toast({ description: message });
    },
    [userId, clearAll, onClose, toast]
  );

  const handleSaveDraft = useCallback(async () => {
    if (!userId || !schedulableMode) return;
    const formData = buildFormData();
    if (!formData) return;
    setIsDraftActionBusy(true);
    try {
      if (context.editDraft) {
        await updateDraft({ id: context.editDraft.id, mode: schedulableMode, payload: formData });
      } else {
        await saveDraft({ authorId: userId, mode: schedulableMode, payload: formData });
      }
      setPostMenuOpen(false);
      finishDraftAction('Saved as draft.');
    } catch (error) {
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Failed to save draft.',
      });
    } finally {
      setIsDraftActionBusy(false);
    }
  }, [userId, schedulableMode, buildFormData, finishDraftAction, toast, context.editDraft]);

  const openSchedulePanel = useCallback(() => {
    setScheduleError(null);
    setSchedulePanelOpen(true);
  }, []);

  const cancelSchedulePanel = useCallback(() => {
    setSchedulePanelOpen(false);
    setScheduleError(null);
  }, []);

  const handleConfirmSchedule = useCallback(async () => {
    if (!userId || !schedulableMode) return;
    if (!scheduleDate || !scheduleTime) {
      setScheduleError('Pick a date and time.');
      return;
    }
    const formData = buildFormData();
    if (!formData) return;

    const zone = browserTimezone();
    const scheduledAt = wallTimeToUtc(scheduleDate, scheduleTime, zone);
    if (scheduledAt.getTime() <= Date.now()) {
      setScheduleError('Pick a time in the future.');
      return;
    }

    setIsDraftActionBusy(true);
    try {
      if (context.editDraft) {
        await updateSchedule({ id: context.editDraft.id, mode: schedulableMode, payload: formData, scheduledAt });
      } else {
        await scheduleDraft({ authorId: userId, mode: schedulableMode, payload: formData, scheduledAt });
      }
      const when = scheduledAt.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      setSchedulePanelOpen(false);
      setPostMenuOpen(false);
      finishDraftAction(`Scheduled for ${when}.`);
    } catch (error) {
      setScheduleError(error instanceof Error ? error.message : 'Failed to schedule post.');
    } finally {
      setIsDraftActionBusy(false);
    }
  }, [userId, schedulableMode, scheduleDate, scheduleTime, buildFormData, finishDraftAction, context.editDraft]);

  // A closed composer forgets the schedule panel, same as every other
  // per-open transient in this component.
  useEffect(() => {
    if (!isOpen) {
      setPostMenuOpen(false);
      setSchedulePanelOpen(false);
      setScheduleDate('');
      setScheduleTime('');
      setScheduleError(null);
    }
  }, [isOpen]);

  // ---- DIA line ------------------------------------------------------------
  const diaLine = useMemo(() => {
    if (isReading) {
      return <span className="text-muted-foreground">DIA is reading…</span>;
    }
    if (userPickedVerb) {
      const cfg = modeConfig(mode);
      return (
        <span className="text-muted-foreground">
          Posting as <span className="font-semibold text-foreground">{cfg.label}</span>
          {' · '}
          {cfg.cName}
        </span>
      );
    }
    if (proposal) {
      const cfg = modeConfig(proposal.verb);
      return (
        <span className="text-muted-foreground">
          DIA read this as <span className="font-semibold text-foreground">{cfg.label}</span>
          {' · '}
          {cfg.cName}
          <button
            type="button"
            onClick={rejectProposal}
            className="ml-2 underline decoration-dotted underline-offset-2 hover:text-foreground"
          >
            not this?
          </button>
        </span>
      );
    }
    return null;
  }, [isReading, userPickedVerb, proposal, mode, rejectProposal]);

  const handler = MODE_HANDLERS[mode];
  const canPost = body.trim().length > 0 && !isSubmitting;

  const disabledModes: ComposerMode[] = [
    ...(context.eventId ? (['event'] as ComposerMode[]) : []),
    ...(context.spaceId ? (['space'] as ComposerMode[]) : []),
  ];

  const author = {
    name: profile?.display_name || profile?.username || 'You',
    avatarUrl: profile?.avatar_url,
  };

  // The card reads flat strings; fold the resolved date/roles back in so
  // the live preview shows what the member will actually post.
  const previewFields = useMemo(
    () => ({
      ...fields,
      ...(roles.length ? { roles: roles.join(', ') } : {}),
      ...(resolvedWhen ? { when: resolvedWhen.label } : {}),
    }),
    [fields, roles, resolvedWhen]
  );

  const preview = (
    <ComposerCardPreview
      mode={mode}
      body={body}
      fields={previewFields}
      author={author}
      mediaPreviewUrl={mediaUrl || galleryUrls[0]}
    />
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) onClose();
    },
    [onClose]
  );

  /**
   * DR1 step 5 (BD135 rule 5): CONTENT ONLY.
   *
   * This component used to render its own <Sheet>, <SheetContent side="right">
   * and <SheetHeader>. The shell owns all of that now — sliding container,
   * scrim, header, title, close, focus trap, safe areas, route binding. A
   * surface that renders its own chrome does not merge.
   */
  return (
    <>
        {/* CONTENT ONLY. The shell owns the scroller (AppDrawer line 202).
            This div previously declared overflow-y-auto + overscroll-contain,
            which made it a scroll container that could never scroll: its parent
            is the shell's block-level scroll div, so flex-1 was inert and its
            height was auto, leaving scrollHeight equal to clientHeight.
            overscroll-contain still applied, so a gesture here was trapped in a
            box with nowhere to go and never chained to the real scroller.
            Do NOT re-add overflow-x-hidden on its own: when one axis is
            non-visible the other is treated as auto, which rebuilds the same
            dead scroller from one class. Clip runaway width on the child with
            break-words instead. */}
        <div className="w-full px-4 py-4 sm:px-6">
          <div className="flex w-full items-start gap-5">
            {/* ---- Writing column ---- */}
            <div className="min-w-0 flex-1 space-y-3">
              <ComposerVerbRail mode={mode} onPick={pickVerb} disabledModes={disabledModes} />

              {isEventMode && !hasSeeded ? (
                /* Seed step: event mode gets the same free-text entry as every
                   other verb, so DIA has something to read here too. */
                <>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Paste your event details, or describe it in your own words. DIA picks up the name, date, time, and location — everything else you'll fill in below."
                    autoFocus
                    className="min-h-[120px] resize-y text-[15px] leading-relaxed"
                  />

                  <div className="flex min-h-[18px] items-center gap-1.5 text-xs" aria-live="polite">
                    {diaLine && <Sparkles className="h-3 w-3 flex-shrink-0 text-bevel-opportunity" />}
                    {diaLine}
                  </div>

                  <button
                    type="button"
                    onClick={() => setHasSeeded(true)}
                    className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    Skip, I'll fill it in myself
                  </button>
                </>
              ) : isEventMode ? (
                /* Hosting an event renders the unified event form at its
                   compact level; "More options" expands it right here. */
                <EventForm
                  key={hasSeeded ? 'composer-event-form-seeded' : 'composer-event-form-empty'}
                  level="compact"
                  mode="create"
                  initialValues={eventSeed ?? undefined}
                  onSuccess={handleEventPublished}
                />
              ) : (
                <>
                  {/* Textarea — always first. Writing is the whole point. */}
                  <Textarea
                    value={body}
                    onChange={(e) => handleBodyChange(e.target.value)}
                    placeholder={modeConfig(mode).placeholder}
                    autoFocus
                    className="min-h-[120px] resize-y text-[15px] leading-relaxed"
                  />

                  {/* The DIA line — it reports; it does not interrupt. */}
                  <div className="flex min-h-[18px] items-center gap-1.5 text-xs" aria-live="polite">
                    {diaLine && <Sparkles className="h-3 w-3 flex-shrink-0 text-bevel-opportunity" />}
                    {diaLine}
                  </div>

                  {/* Link/video preview — LinkedIn/oEmbed pattern (BD074),
                      same position StoryCard renders it in the feed. */}
                  {!embedLoading && embedData && (
                    <LinkPreviewCard
                      data={{
                        url: embedData.url,
                        title: embedData.title,
                        description: embedData.description,
                        provider_name: embedData.provider_name || embedData.site_name,
                        thumbnail_url: embedData.thumbnail_url || embedData.image,
                        type: embedData.type,
                        is_video: embedData.is_video,
                      }}
                      onRemove={removeEmbed}
                      showRemoveButton
                      size="full"
                    />
                  )}

                  <ComposerFields
                    mode={mode}
                    values={fields}
                    diaFilled={diaFilled}
                    onChange={editField}
                    roles={roles}
                    onRolesChange={handleRolesChange}
                    mediaUrl={mediaUrl}
                    onMediaChange={setMediaUrl}
                    galleryUrls={galleryUrls}
                    onGalleryChange={setGalleryUrls}
                  />
                </>
              )}

              {/* Mobile: the card is a toggle, never a second scroll region. */}
              {!isEventMode && <div className="lg:hidden">
                <button
                  type="button"
                  onClick={() => setPreviewOpenMobile((v) => !v)}
                  className="flex w-full items-center justify-between rounded-lg border bg-muted/40 px-3 py-2 text-sm font-medium text-muted-foreground"
                >
                  See your card
                  <ChevronDown
                    className={cn('h-4 w-4 transition-transform', previewOpenMobile && 'rotate-180')}
                  />
                </button>
                {previewOpenMobile && <div className="mt-2">{preview}</div>}
              </div>}
            </div>

            {/* ---- Live card preview (desktop) ---- */}
            {!isEventMode && (
              <div className="sticky top-0 hidden w-[300px] flex-shrink-0 lg:block">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Your card, as the diaspora sees it
                </p>
                {preview}
              </div>
            )}
          </div>
        </div>

        {/* ---- Tools · Draft · POST ---- */}
        {/* Event mode: EventForm carries its own publish controls above. */}
        <div
          className="sticky bottom-0 z-10 border-t bg-background px-4 pt-3 sm:px-6"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 12px), 12px)' }}
        >
          <div className="flex items-center gap-2">
            {!isEventMode && (
              <MediaUploadButton
                label=""
                onUpload={setMediaUrl}
                currentMediaUrl={mediaUrl}
                onRemove={() => setMediaUrl(undefined)}
              />
            )}
            <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              {!isEventMode && draftSavedAt ? 'Draft saved' : ''}
            </span>
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            {/* Every verb has one. Labeled for what it does. Connect/story get a
                split button — schedule/draft only succeed for these two modes,
                so the affordance doesn't exist anywhere else (BD534). */}
            {!isEventMode && isSchedulableMode && (
              <div className="flex">
                <Button
                  onClick={handleSubmit}
                  disabled={!canPost}
                  className={cn('min-h-[44px] min-w-[110px] rounded-r-none font-semibold', POST_FILL[mode])}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? handler.submittingLabel : handler.submitLabel}
                </Button>
                <DropdownMenu
                  open={postMenuOpen}
                  onOpenChange={(open) => {
                    setPostMenuOpen(open);
                    if (!open) cancelSchedulePanel();
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      disabled={!canPost || isSubmitting || isDraftActionBusy}
                      className={cn(
                        'min-h-[44px] rounded-l-none border-l border-white/20 px-2 font-semibold',
                        POST_FILL[mode]
                      )}
                      aria-label="More post options"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    {schedulePanelOpen ? (
                      <div className="space-y-2 p-2">
                        <p className="text-xs font-medium text-foreground">Schedule for later</p>
                        <div className="flex gap-2">
                          <Input
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            type="time"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="w-28"
                          />
                        </div>
                        {scheduleError && (
                          <p className="text-xs text-destructive">{scheduleError}</p>
                        )}
                        <div className="flex justify-end gap-2 pt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={cancelSchedulePanel}
                            disabled={isDraftActionBusy}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleConfirmSchedule}
                            disabled={isDraftActionBusy}
                          >
                            {isDraftActionBusy && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                            Confirm
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <DropdownMenuItem
                          disabled={isDraftActionBusy}
                          onSelect={(e) => {
                            e.preventDefault();
                            openSchedulePanel();
                          }}
                        >
                          Schedule for later
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={isDraftActionBusy} onClick={handleSaveDraft}>
                          Save as draft
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            {!isEventMode && !isSchedulableMode && (
              <Button
                onClick={handleSubmit}
                disabled={!canPost}
                className={cn('min-h-[44px] min-w-[130px] font-semibold', POST_FILL[mode])}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? handler.submittingLabel : handler.submitLabel}
              </Button>
            )}
          </div>
        </div>
    </>
  );
};
