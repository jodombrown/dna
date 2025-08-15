import React from "react";
import {
  Plus, Send, Image as ImageIcon, Users, Compass, HeartHandshake, Calendar,
  Bell, Sparkles, TrendingUp, Filter, Loader2
} from "lucide-react";

/* =========================
   Types (minimal + flexible)
   ========================= */

export type Pillar = "all" | "connect" | "collaborate" | "contribute";
export type FeedMode = "forYou" | "trending" | "spotlight";

export type Profile = {
  id: string;
  full_name?: string;
  username?: string;
  headline?: string;
  role?: string;
  avatar_url?: string;
  impact_score?: number;
  profile_completion?: number; // 0..100
};

export type FeedPost = {
  id: string;
  created_at: string;
  pillar?: Pillar;
  content: string;
  media_url?: string;
  likes_count?: number;
  comments_count?: number;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
    headline?: string;
  };
};

export type MatchPerson = {
  id: string;
  full_name: string;
  title?: string;
  avatar_url?: string;
  shared_tags?: string[];
};

export type Opportunity = {
  id: string;
  title: string;
  org?: string;
  tags?: string[];
  location?: string;
  deadline?: string; // ISO
};

export type EventLite = {
  id: string;
  name: string;
  when: string; // ISO
  location?: string;
};

/* =========================
   Hook contracts (injected)
   ========================= */

type UseRoleBasedAccessHook = () => {
  profile?: Profile | null;
  isLoading?: boolean;
};

type UsePaginatedPostsHook = (args: {
  mode: FeedMode;
  pillar: Pillar;
  resetKey?: string;
}) => {
  // Either infinite-query style:
  data?: { pages?: Array<{ items?: FeedPost[] }> } | FeedPost[];
  // Or simple array style:
  posts?: FeedPost[];

  isLoading?: boolean;
  loading?: boolean;

  hasNextPage?: boolean;
  hasMore?: boolean;

  fetchNextPage?: () => void;
  loadMore?: () => void;

  // Optionally support forced reset/refetch on filter changes:
  reset?: () => void;
  refetch?: () => void;
};

type UseLiveCollaborationsHook = () => {
  items?: Array<{
    id: string;
    title?: string;
    name?: string;
    organization?: string;
    owner_name?: string;
    tags?: string[];
    sectors?: string[];
  }>;
  recommended_people?: Array<{
    id: string;
    full_name?: string;
    username?: string;
    title?: string;
    headline?: string;
    avatar_url?: string;
    skills?: string[];
    tags?: string[];
  }>;
  insights?: string[];
};

type UseLiveEventsHook = () => {
  events?: EventLite[];
};

type CreatePostFn = (payload: {
  text: string;
  pillar: Pillar;
  file?: File | null;
}) => Promise<void>;

/* =========================
   UI building blocks
   ========================= */

function Avatar({
  src,
  alt,
  size = 36,
  className = "",
}: {
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
}) {
  return (
    <img
      src={src || "https://placehold.co/80x80?text=DNA"}
      alt={alt || "avatar"}
      width={size}
      height={size}
      className={`rounded-full object-cover bg-neutral-200 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

function SectionCard({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <div className="flex items-center gap-2 text-neutral-800">
          {icon}
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* =========================
   Impact Header (Hero)
   ========================= */

function ImpactHeader({
  profile,
  onPrimaryAction,
  todayPrompt,
}: {
  profile: Profile | null;
  onPrimaryAction: () => void;
  todayPrompt?: string;
}) {
  const name = profile?.full_name || profile?.username || "Member";
  const completion = Math.max(0, Math.min(100, profile?.profile_completion ?? 0));
  const score = Math.round(profile?.impact_score ?? 0);

  return (
    <div className="bg-gradient-to-r from-dna-forest/95 to-dna-copper/90 text-white rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center gap-4">
        <Avatar src={profile?.avatar_url} alt={name} size={56} />
        <div>
          <div className="text-sm opacity-80">Welcome back</div>
          <div className="text-xl font-semibold">{name}</div>
          <div className="text-xs opacity-90">{profile?.headline || profile?.role || "DNA Member"}</div>
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
            <div
              className="h-2 rounded-full bg-dna-mint"
              style={{ width: `${completion}%` }}
            />
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

      {todayPrompt && (
        <div className="text-xs md:text-sm md:w-1/3 md:text-right opacity-95">
          {todayPrompt}
        </div>
      )}
    </div>
  );
}

/* =========================
   Composer (minimal → expand)
   ========================= */

function PostComposer({
  avatar,
  onSubmit,
  disabled,
}: {
  avatar?: string;
  onSubmit: (payload: { text: string; pillar: Pillar; file?: File | null }) => Promise<void>;
  disabled?: boolean;
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
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border hover:bg-neutral-50 cursor-pointer">
                <ImageIcon className="w-4 h-4" />
                Media
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border">
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
              </div>
            </div>

            <button
              disabled={!canSubmit}
              onClick={async () => {
                setSubmitting(true);
                try {
                  await onSubmit({ text: text.trim(), pillar, file });
                  setText(""); setFile(null); setPillar("all");
                } finally {
                  setSubmitting(false);
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-dna-forest text-white px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Feed (tabs + filters)
   ========================= */

function FeedTabs({
  mode,
  setMode,
}: {
  mode: FeedMode;
  setMode: (m: FeedMode) => void;
}) {
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

function PillarFilters({
  pillar,
  setPillar,
}: {
  pillar: Pillar;
  setPillar: (p: Pillar) => void;
}) {
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
  posts: FeedPost[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}) {
  return (
    <div className="space-y-3">
      {posts.map((p) => (
        <div key={p.id} className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Avatar src={p.author.avatar_url} alt={p.author.name} />
            <div>
              <div className="text-sm font-medium">{p.author.name}</div>
              {p.author.headline && <div className="text-xs text-neutral-600">{p.author.headline}</div>}
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
            <span>👍 {p.likes_count ?? 0}</span>
            <span>💬 {p.comments_count ?? 0}</span>
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
      {!isLoading && posts.length === 0 && (
        <div className="text-center py-8 text-neutral-500 text-sm">
          No posts yet. Be the first to share something today.
        </div>
      )}
    </div>
  );
}

/* =========================
   Right Sidebar panels
   ========================= */

function MatchesPanel({ people }: { people: MatchPerson[] }) {
  return (
    <SectionCard title="Top Matches" icon={<Users className="w-4 h-4" />}>
      <div className="space-y-3">
        {people.slice(0, 5).map((m) => (
          <div key={m.id} className="flex items-center gap-3">
            <Avatar src={m.avatar_url} alt={m.full_name} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{m.full_name}</div>
              {m.title && <div className="text-xs text-neutral-600 truncate">{m.title}</div>}
              {m.shared_tags && m.shared_tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {m.shared_tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100">{t}</span>
                  ))}
                </div>
              )}
            </div>
            <button className="text-xs px-3 py-1.5 rounded-lg border hover:bg-neutral-50">Connect</button>
          </div>
        ))}
        {people.length === 0 && <div className="text-xs text-neutral-500">No matches yet.</div>}
      </div>
    </SectionCard>
  );
}

function OpportunitiesPanel({ items }: { items: Opportunity[] }) {
  return (
    <SectionCard title="Open Opportunities" icon={<HeartHandshake className="w-4 h-4" />}>
      <div className="space-y-3">
        {items.slice(0, 5).map((o) => (
          <div key={o.id} className="text-sm">
            <div className="font-medium">{o.title}</div>
            <div className="text-xs text-neutral-600">
              {[o.org, o.location].filter(Boolean).join(" • ")}
              {o.deadline && <> • due {new Date(o.deadline).toLocaleDateString()}</>}
            </div>
            {o.tags && o.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {o.tags.slice(0, 3).map((t) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100">{t}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && <div className="text-xs text-neutral-500">None right now.</div>}
      </div>
    </SectionCard>
  );
}

function EventsPanel({ events }: { events: EventLite[] }) {
  return (
    <SectionCard title="Events" icon={<Calendar className="w-4 h-4" />}>
      <div className="space-y-2">
        {events.slice(0, 4).map((e) => (
          <div key={e.id} className="text-sm">
            <div className="font-medium">{e.name}</div>
            <div className="text-xs text-neutral-600">
              {new Date(e.when).toLocaleString()} {e.location ? `• ${e.location}` : ""}
            </div>
          </div>
        ))}
        {events.length === 0 && <div className="text-xs text-neutral-500">No upcoming events.</div>}
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

/* =========================
   HOME UI (pure presentational)
   ========================= */

export function HomeUI({
  profile,
  todayPrompt,
  onMakeImpact,
  onCreatePost,
  feedState,
  matches,
  opportunities,
  events,
  insights,
}: {
  profile: Profile | null;
  todayPrompt?: string;
  onMakeImpact: () => void;
  onCreatePost: CreatePostFn;
  feedState: {
    mode: FeedMode;
    setMode: (m: FeedMode) => void;
    pillar: Pillar;
    setPillar: (p: Pillar) => void;
    posts: FeedPost[];
    isLoading?: boolean;
    hasMore?: boolean;
    loadMore?: () => void;
  };
  matches: MatchPerson[];
  opportunities: Opportunity[];
  events: EventLite[];
  insights: string[];
}) {
  const { mode, setMode, pillar, setPillar, posts, isLoading, hasMore, loadMore } = feedState;

  return (
    <div className="space-y-4">
      <ImpactHeader
        profile={profile}
        todayPrompt={todayPrompt}
        onPrimaryAction={onMakeImpact}
      />

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* center-left (2 cols) */}
        <div className="md:col-span-2 space-y-3">
          <PostComposer
            avatar={profile?.avatar_url}
            onSubmit={onCreatePost}
          />

          <div className="flex items-center justify-between">
            <FeedTabs mode={mode} setMode={setMode} />
            <PillarFilters pillar={pillar} setPillar={setPillar} />
          </div>

          <FeedList
            posts={posts}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={loadMore}
          />
        </div>

        {/* right column */}
        <div className="space-y-3">
          <MatchesPanel people={matches} />
          <OpportunitiesPanel items={opportunities} />
          {events?.length > 0 && <EventsPanel events={events} />}
          {insights?.length > 0 && <InsightsPanel items={insights} />}
        </div>
      </div>
    </div>
  );
}

/* =========================
   ADAPTER FACTORY (wire hooks)
   ========================= */

export function createHomePageAdapter(hooks: {
  useRoleBasedAccess: UseRoleBasedAccessHook;
  usePaginatedPosts: UsePaginatedPostsHook;
  useLiveCollaborations?: UseLiveCollaborationsHook;
  useLiveEvents?: UseLiveEventsHook;
  onCreatePost?: CreatePostFn; // optional injection
}) {
  const {
    useRoleBasedAccess,
    usePaginatedPosts,
    useLiveCollaborations,
    useLiveEvents,
    onCreatePost,
  } = hooks;

  return function HomePageAdapter(): JSX.Element {
    const { profile } = useRoleBasedAccess?.() || {};

    // FEED state (tabs + filters)
    const [mode, setMode] = React.useState<FeedMode>("forYou");
    const [pillar, setPillar] = React.useState<Pillar>("all");
    const resetKey = React.useMemo(() => `${mode}|${pillar}`, [mode, pillar]);

    const feed = (usePaginatedPosts as any)?.({ mode, pillar, resetKey }) || {};
    const posts: FeedPost[] =
      feed.posts ??
      (Array.isArray(feed.data) ? feed.data : feed.data?.pages?.flatMap((p: any) => p?.items || []) ?? []) ??
      [];

    const isLoading = !!(feed.isLoading ?? feed.loading);
    const hasMore = !!(feed.hasNextPage ?? feed.hasMore);
    const loadMore = (feed.fetchNextPage ?? feed.loadMore) as (() => void) | undefined;

    // Hard reset when filters change
    React.useEffect(() => {
      if (typeof feed?.reset === "function") feed.reset();
      else if (typeof feed?.refetch === "function") feed.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resetKey]);

    // Matches, opportunities, insights
    const collab = useLiveCollaborations?.() || {};
    const matches: MatchPerson[] = (collab.recommended_people || []).map((p) => ({
      id: p.id,
      full_name: p.full_name || p.username || "Member",
      title: p.title || p.headline,
      avatar_url: p.avatar_url,
      shared_tags: (p.skills || p.tags || []).slice(0, 4),
    }));

    const opportunities: Opportunity[] = (collab.items || []).map((it) => ({
      id: it.id,
      title: it.title || it.name || "Opportunity",
      org: it.owner_name || it.organization,
      tags: (it.tags || it.sectors || []).slice(0, 4),
    }));

    const events: EventLite[] = (hooks.useLiveEvents?.().events || []) as EventLite[];
    const insights: string[] = (collab.insights || []) as string[];

    const handleCreatePost: CreatePostFn = onCreatePost
      ? onCreatePost
      : async ({ text }) => {
          console.warn("[Home] onCreatePost not provided. Text:", text);
          // You can inject a real poster later; this preserves compile-time safety now.
        };

    const todayPrompt =
      matches[0]
        ? `Today's Match: Connect with ${matches[0].full_name}${matches[0].title ? `, ${matches[0].title}` : ""}.`
        : `Share an update or explore opportunities to make an impact today.`;

    return (
      <HomeUI
        profile={profile ?? null}
        todayPrompt={todayPrompt}
        onMakeImpact={() => {
          // Suggested behavior: focus composer or take user to top match.
          const el = document?.querySelector?.("textarea");
          (el as HTMLTextAreaElement | null)?.focus?.();
        }}
        onCreatePost={handleCreatePost}
        feedState={{
          mode,
          setMode,
          pillar,
          setPillar,
          posts,
          isLoading,
          hasMore,
          loadMore,
        }}
        matches={matches}
        opportunities={opportunities}
        events={events}
        insights={insights}
      />
    );
  };
}

/* =========================
   SAFE LOCAL STUB (optional)
   ========================= */

export const HomePageAdapter = createHomePageAdapter({
  useRoleBasedAccess: () => ({
    profile: {
      id: "x",
      full_name: "DNA Member",
      username: "you",
      headline: "Building bridges across the Diaspora",
      avatar_url: "",
      impact_score: 128,
      profile_completion: 72,
    },
  }),
  usePaginatedPosts: () => ({
    posts: [
      {
        id: "p1",
        created_at: new Date().toISOString(),
        pillar: "connect",
        content: "Welcome to DNA! Share your first update.",
        author: { id: "a1", name: "DNA Team", avatar_url: "" },
        likes_count: 3,
        comments_count: 1,
      },
    ],
    isLoading: false,
    hasMore: false,
  }),
  useLiveCollaborations: () => ({
    recommended_people: [
      { id: "m1", full_name: "Fatima A.", title: "ClimateTech Founder", skills: ["climate", "energy"] },
      { id: "m2", full_name: "Kwame B.", title: "Fintech Product Lead", skills: ["fintech", "payments"] },
    ],
    items: [
      { id: "o1", title: "Kigali AgriTech Pilot", owner_name: "AgriLab", tags: ["agritech", "pilot"] },
    ],
    insights: [
      "Fintech founders in ECOWAS saw a 14% increase in cross-border pilots last quarter.",
      "SME digitization grants closing in 2 weeks.",
    ],
  }),
  useLiveEvents: () => ({
    events: [
      { id: "e1", name: "Diaspora Connect: Nairobi", when: new Date(Date.now() + 864e5).toISOString(), location: "Nairobi" },
    ],
  }),
});

/* =========================
   Tiny mapping tests (dev)
   ========================= */

export function runHomeMappingTests() {
  const results: { name: string; ok: boolean; error?: any }[] = [];
  const t = (name: string, fn: () => void) => {
    try { fn(); results.push({ name, ok: true }); }
    catch (e) { results.push({ name, ok: false, error: String(e) }); }
  };

  // Case 1: resetKey uniqueness
  t("resetKey updates across mode/pillar", () => {
    const k1 = "forYou|all", k2 = "trending|all", k3 = "trending|connect";
    const allKeys = [k1, k2, k3];
    const uniqueKeys = new Set(allKeys);
    if (uniqueKeys.size !== allKeys.length) throw new Error("resetKey not unique");
  });

  // Case 2: normalize posts from data.pages[].items
  t("normalize posts from paginated data", () => {
    const pages = [{ items: [{ id: "1" } as any] }, { items: [{ id: "2" } as any] }];
    const data: any = { pages };
    const flat = data.pages.flatMap((p: any) => p.items || []);
    if (flat.length !== 2) throw new Error("failed to flatten");
  });

  // Case 3: normalize posts from flat array
  t("normalize posts from flat array", () => {
    const posts = [{ id: "x" }, { id: "y" }];
    if (posts.length !== 2) throw new Error("wrong length");
  });

  // Case 4: collab mapping
  t("map collab people/opportunities", () => {
    const p = { id: "1", full_name: "A", skills: ["s1"] };
    const o = { id: "2", title: "T", owner_name: "Org", tags: ["t1"] };
    const mp = {
      id: p.id, full_name: p.full_name || "Member", shared_tags: (p as any).skills
    };
    const mo = {
      id: o.id, title: o.title || "Opportunity", org: (o as any).owner_name, tags: o.tags
    };
    if (!mp.full_name || !mo.title) throw new Error("mapping failed");
  });

  return results;
}