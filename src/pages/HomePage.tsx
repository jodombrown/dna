import React from "react";
import { Sparkles, Loader2, Users, HeartHandshake, Calendar, TrendingUp, Filter } from "lucide-react";

import useRoleBasedAccess from "@/hooks/useRoleBasedAccess";
import { usePaginatedPosts } from "@/components/social-feed/usePaginatedPosts";
import useLiveCollaborations from "@/hooks/useLiveCollaborations";
import { usePostSubmission } from "@/hooks/usePostSubmission";
import { useLiveEvents } from "@/hooks/useLiveEvents";

type Pillar = "all" | "connect" | "collaborate" | "contribute";
type FeedMode = "forYou" | "trending" | "spotlight";

// Simple insights hook until you create the real one
const useInsights = (profile: any) => {
  return React.useMemo(() => {
    if (!profile) return [];
    return [
      "Fintech founders in ECOWAS saw a 14% increase in cross-border pilots last quarter.",
      "SME digitization grants closing in 2 weeks.",
      "Your AgriTech connections are 3x more active this month."
    ];
  }, [profile]);
};

export default function HomePage() {
  const { profile } = useRoleBasedAccess() || {};

  // Feed state
  const [mode, setMode] = React.useState<FeedMode>("forYou");
  const [pillar, setPillar] = React.useState<Pillar>("all");

  // Reset: bump refreshKey on any filter change
  const [refreshKey, bumpRefreshKey] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => { bumpRefreshKey(); }, [mode, pillar]);

  // Feed - use existing hook interface
  const feed = usePaginatedPosts({
    sortMode: mode === "forYou" ? "relevant" : mode,
    pillar: pillar === "all" ? undefined : pillar,
    refreshKey: refreshKey,
    relevantOnly: mode === "forYou",
  });

  // Composer
  const { submitPost, isSubmitting } = usePostSubmission();
  const onCreatePost = async (data: { content: string; pillar: Pillar; file?: File | null }) => {
    const success = await submitPost({
      content: data.content,
      pillar: data.pillar,
      type: "post",
      file: data.file || null,
    });
    if (success) {
      await feed.refresh(); // refresh feed after successful post
    }
  };

  // Side panels
  const collabData = useLiveCollaborations();
  const liveEvents = useLiveEvents();               // may be empty until you wire the table
  const insights = useInsights(profile);           // safe derived insights

  // Today prompt (tiny nudge)
  const topMatch = collabData?.recommended_people?.[0];
  const todayPrompt = topMatch
    ? `Today's Match: Connect with ${topMatch.full_name}${topMatch.title ? `, ${topMatch.title}` : ""}.`
    : `Share an update or explore opportunities to make an impact today.`;

  return (
    <div className="container mx-auto px-3 md:px-6 py-4 md:py-6 space-y-4">
      <ImpactHeader
        profile={profile}
        todayPrompt={todayPrompt}
        onPrimaryAction={() => {
          const el = document?.querySelector?.("textarea");
          (el as HTMLTextAreaElement | null)?.focus?.();
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main (2 cols) */}
        <div className="md:col-span-2 space-y-3">
          <ComposerCard
            avatar={profile?.avatar_url}
            onSubmit={onCreatePost}
            disabled={!!isSubmitting}
          />

          <div className="flex items-center justify-between">
            <FeedTabs mode={mode} setMode={setMode} />
            <PillarFilters pillar={pillar} setPillar={setPillar} />
          </div>

          <FeedList
            posts={feed.posts}
            isLoading={feed.loading}
            hasMore={feed.hasMore}
            onLoadMore={feed.loadMore}
          />
        </div>

        {/* Right rail */}
        <div className="space-y-3">
          <MatchesPanel people={collabData?.recommended_people || []} />
          <OpportunitiesPanel items={collabData?.items || []} />
          {liveEvents.events?.length ? <EventsPanel events={liveEvents.events.filter(e => e.date_time).map(e => ({ 
            id: e.id, 
            title: e.title, 
            date_time: e.date_time!, 
            location: e.location 
          }))} /> : null}
          {insights.length ? <InsightsPanel items={insights} /> : null}
        </div>
      </div>
    </div>
  );
}

/* ---------- UI bits (kept local to avoid import churn) ---------- */

function Avatar({ src, alt, size = 40 }: { src?: string; alt?: string; size?: number }) {
  return (
    <img
      src={src || "https://placehold.co/80x80?text=DNA"}
      alt={alt || "avatar"}
      className="rounded-full object-cover bg-neutral-200"
      style={{ width: size, height: size }}
    />
  );
}

function ImpactHeader({
  profile,
  todayPrompt,
  onPrimaryAction,
}: {
  profile?: any;
  todayPrompt?: string;
  onPrimaryAction: () => void;
}) {
  const name = profile?.full_name || profile?.username || "DNA Member";
  const completion = Math.max(0, Math.min(100, profile?.profile_completion ?? 0));
  const score = Math.round(profile?.impact_score ?? 0);

  return (
    <div className="bg-gradient-to-r from-dna-forest/95 to-dna-copper/90 text-white rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center gap-4">
        <Avatar src={profile?.avatar_url} alt={name} size={56} />
        <div>
          <div className="text-sm opacity-80">Welcome back</div>
          <div className="text-xl font-semibold">{name}</div>
          <div className="text-xs opacity-90">{profile?.headline || profile?.role || "Professional"}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:flex md:items-center gap-4 md:gap-8">
        <div className="text-center">
          <div className="text-xs opacity-90 mb-1">Impact Score</div>
          <div className="text-2xl font-bold">{score}</div>
        </div>
        <div className="min-w-[180px]">
          <div className="flex items-center justify-between text-xs opacity-90 mb-1">
            <span>Profile</span><span>{completion}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/30">
            <div className="h-2 rounded-full bg-dna-mint" style={{ width: `${completion}%` }} />
          </div>
        </div>
        <button
          onClick={onPrimaryAction}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-dna-forest px-4 py-2 font-medium hover:bg-neutral-100 transition"
        >
          <Sparkles className="w-4 h-4" />
          Make an Impact
        </button>
      </div>

      {todayPrompt && <div className="text-xs md:text-sm md:w-1/3 md:text-right opacity-95">{todayPrompt}</div>}
    </div>
  );
}

function ComposerCard({
  avatar,
  onSubmit,
  disabled,
}: {
  avatar?: string;
  disabled?: boolean;
  onSubmit: (p: { content: string; pillar: Pillar; file?: File | null }) => Promise<void>;
}) {
  const [text, setText] = React.useState("");
  const [pillar, setPillar] = React.useState<Pillar>("all");
  const [file, setFile] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const canSubmit = !disabled && !submitting && text.trim().length > 0;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-4">
      <div className="flex gap-3">
        <Avatar src={avatar} alt="me" />
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share an update, ask a question, or highlight an opportunity…"
            className="w-full min-h-[72px] resize-y outline-none text-sm bg-transparent"
          />
          {/* simple media preview */}
          {file && (
            <div className="relative mt-2">
              {file.type.startsWith("image/") ? (
                <img src={URL.createObjectURL(file)} className="max-h-96 rounded-lg" />
              ) : (
                <video className="max-h-96 rounded-lg" controls src={URL.createObjectURL(file)} />
              )}
              <button
                className="absolute top-2 right-2 text-xs bg-white/90 border rounded px-2 py-1"
                onClick={() => setFile(null)}
              >
                ×
              </button>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border hover:bg-neutral-50 cursor-pointer">
                <Filter className="w-4 h-4" />
                <select
                  value={pillar}
                  onChange={(e) => setPillar(e.target.value as Pillar)}
                  className="bg-transparent outline-none"
                >
                  <option value="all">All</option>
                  <option value="connect">Connect</option>
                  <option value="collaborate">Collaborate</option>
                  <option value="contribute">Contribute</option>
                </select>
              </label>
              <label className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border hover:bg-neutral-50 cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                Media
              </label>
            </div>

            <button
              disabled={!canSubmit}
              onClick={async () => {
                setSubmitting(true);
                try {
                  await onSubmit({ content: text.trim(), pillar, file });
                  setText(""); setPillar("all"); setFile(null);
                  // track?.("post_created", { pillar }); // optional analytics
                } finally { setSubmitting(false); }
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-dna-forest text-white px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedTabs({ mode, setMode }: { mode: FeedMode; setMode: (m: FeedMode) => void; }) {
  const Tab = ({ id, label }: { id: FeedMode; label: string }) => (
    <button
      onClick={() => setMode(id)}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
        mode === id ? "bg-dna-forest text-white" : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
      }`}
    >
      {label}
    </button>
  );
  return (
    <div className="flex items-center gap-2">
      <Tab id="forYou" label="For You" />
      <Tab id="trending" label="Trending" />
      <Tab id="spotlight" label="Spotlight" />
    </div>
  );
}

function PillarFilters({ pillar, setPillar }: { pillar: Pillar; setPillar: (p: Pillar) => void; }) {
  const Chip = ({ id, label }: { id: Pillar; label: string }) => (
    <button
      onClick={() => setPillar(id)}
      className={`px-2.5 py-1 rounded-full text-xs border ${
        pillar === id ? "bg-dna-mint/20 border-dna-mint text-dna-forest" : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
      }`}
    >
      {label}
    </button>
  );
  return (
    <div className="flex items-center gap-2">
      <Chip id="all" label="All" />
      <Chip id="connect" label="Connect" />
      <Chip id="collaborate" label="Collaborate" />
      <Chip id="contribute" label="Contribute" />
    </div>
  );
}

function FeedList({
  posts,
  isLoading,
  onLoadMore,
  hasMore,
}: {
  posts: any[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}) {
  return (
    <div className="space-y-3">
      {posts?.map((p) => (
        <div key={p.id} className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Avatar src={p.profiles?.avatar_url || p.author?.avatar_url} alt={p.profiles?.full_name || p.author?.name} />
            <div>
              <div className="text-sm font-medium">{p.profiles?.full_name || p.author?.name || "Member"}</div>
              {(p.profiles?.profession || p.author?.headline) && (
                <div className="text-xs text-neutral-600">{p.profiles?.profession || p.author?.headline}</div>
              )}
            </div>
            <div className="ml-auto text-xs text-neutral-500">
              {new Date(p.created_at).toLocaleString()}
            </div>
          </div>
          <div className="text-sm whitespace-pre-wrap">{p.content}</div>
          {p.media_url && (
            <div className="mt-2">
              <img src={p.media_url} alt="" className="rounded-lg max-h-96 object-cover w-full" />
            </div>
          )}
          <div className="mt-3 flex items-center gap-4 text-xs text-neutral-600">
            <span>👍 {p.like_count ?? p.likes_count ?? 0}</span>
            <span>💬 {p.comment_count ?? p.comments_count ?? 0}</span>
            {p.pillar && <span className="ml-auto px-2 py-0.5 rounded-full bg-neutral-100">{p.pillar}</span>}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex items-center justify-center py-6 text-neutral-500">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Loading…
        </div>
      )}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 text-sm rounded-lg border bg-white hover:bg-neutral-50"
          >
            Load more
          </button>
        </div>
      )}
      {!isLoading && (!posts || posts.length === 0) && (
        <div className="text-center py-8 text-neutral-500 text-sm">
          No posts yet. Be the first to share something today.
        </div>
      )}
    </div>
  );
}

function SectionCard({
  title, icon, children,
}: { title: string; icon?: React.ReactNode; children: React.ReactNode; }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100">
        {icon}
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function MatchesPanel({ people }: { people: any[] }) {
  return (
    <SectionCard title="Top Matches" icon={<Users className="w-4 h-4" />}>
      <div className="space-y-3">
        {(people || []).slice(0, 5).map((m) => (
          <div key={m.id} className="flex items-center gap-3">
            <Avatar src={m.avatar_url} alt={m.full_name} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{m.full_name}</div>
              {m.title && <div className="text-xs text-neutral-600 truncate">{m.title}</div>}
              {(m.skills || m.tags)?.length ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {(m.skills || m.tags).slice(0, 3).map((t: string) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100">{t}</span>
                  ))}
                </div>
              ) : null}
            </div>
            <button className="text-xs px-3 py-1.5 rounded-lg border hover:bg-neutral-50">Connect</button>
          </div>
        ))}
        {!people?.length && <div className="text-xs text-neutral-500">No matches yet.</div>}
      </div>
    </SectionCard>
  );
}

function OpportunitiesPanel({ items }: { items: any[] }) {
  return (
    <SectionCard title="Open Opportunities" icon={<HeartHandshake className="w-4 h-4" />}>
      <div className="space-y-3">
        {(items || []).slice(0, 5).map((o) => (
          <div key={o.id} className="text-sm">
            <div className="font-medium">{o.title || o.name}</div>
            <div className="text-xs text-neutral-600">
              {[o.owner_name || o.organization].filter(Boolean).join(" • ")}
            </div>
            {(o.tags || o.sectors)?.length ? (
              <div className="mt-1 flex flex-wrap gap-1">
                {(o.tags || o.sectors).slice(0, 3).map((t: string) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100">{t}</span>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        {!items?.length && <div className="text-xs text-neutral-500">None right now.</div>}
      </div>
    </SectionCard>
  );
}

function EventsPanel({ events }: { events: { id: string; title: string; date_time: string; location?: string }[] }) {
  return (
    <SectionCard title="Events" icon={<Calendar className="w-4 h-4" />}>
      <div className="space-y-2">
        {events.slice(0, 4).map((e) => (
          <div key={e.id} className="text-sm">
            <div className="font-medium">{e.title}</div>
            <div className="text-xs text-neutral-600">
              {new Date(e.date_time).toLocaleString()} {e.location ? `• ${e.location}` : ""}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function InsightsPanel({ items }: { items: string[] }) {
  return (
    <SectionCard title="Insights" icon={<TrendingUp className="w-4 h-4" />}>
      <ul className="list-disc pl-5 space-y-2 text-sm">
        {items.slice(0, 6).map((i, idx) => <li key={idx}>{i}</li>)}
      </ul>
    </SectionCard>
  );
}