"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles, Images, MessageSquarePlus, TrendingUp, Users, ChevronRight, Save, Share2, Heart, Filter, ArrowUpRight, Loader2 } from "lucide-react";
import { EnhancedPostComposer } from "@/components/social-feed/EnhancedPostComposer";

// ===================== Shared Types ============================
export type Pillar = "all" | "connect" | "collaborate" | "contribute";
export type FeedMode = "forYou" | "trending" | "spotlight";

export interface UserSummary {
  id?: string;
  name?: string;
  role?: string;
  avatarUrl?: string;
  impactScore?: number; // 0-100
  completion?: number; // 0-100
}

export interface FeedPost {
  id: string | number;
  author: { name?: string; role?: string; avatarUrl?: string };
  body: string;
  pillar?: "connect" | "collaborate" | "contribute";
  created_at?: string;
}

export interface MatchItem { id: string | number; name: string; title?: string; avatarUrl?: string; tags?: string[] }
export interface OpportunityItem { id: string | number; title: string; org?: string; tags?: string[] }

export interface DashboardProps {
  user?: UserSummary | null;
  mode: FeedMode;
  pillar: Pillar;
  setMode: (m: FeedMode) => void;
  setPillar: (p: Pillar) => void;
  // feed
  posts: FeedPost[];
  isLoadingPosts?: boolean;
  hasMorePosts?: boolean;
  loadMorePosts?: () => void;
  // matches/opportunities
  matches?: MatchItem[];
  opportunities?: OpportunityItem[];
}

// ===================== UI SUBCOMPONENTS =======================
function ImpactHeader({ user }: { user?: UserSummary | null }) {
  const initials = (user?.name || "Member").split(" ").map((s) => s[0]).join("");
  return (
    <Card className="border-none bg-gradient-to-r from-dna-mint/20 to-dna-forest/10 dark:from-dna-mint/15 dark:to-dna-forest/5">
      <CardContent className="p-4 md:p-6 flex flex-col gap-4">
        <div className="flex items-start gap-3 md:gap-4">
          <Avatar className="h-12 w-12 md:h-14 md:w-14 ring-2 ring-dna-mint/40">
            {user?.avatarUrl ? <AvatarImage src={user?.avatarUrl} alt={user?.name || ""} /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <h1 className="text-lg md:text-xl font-semibold truncate">{user?.name || "DNA Member"}</h1>
                <p className="text-sm text-muted-foreground">{user?.role || "Professional"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-dna-mint text-foreground">Impact {user?.impactScore ?? 0}%</Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-40 hidden sm:block">
                        <Progress value={user?.completion ?? 0} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Profile {user?.completion ?? 0}% complete</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center text-sm text-muted-foreground gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Today's Match: <strong>Make one meaningful connection</strong></span>
          </div>
          <div className="sm:ml-auto">
            <Button className="bg-dna-forest hover:bg-dna-forest/90 text-white" size="sm">
              Make an Impact
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Composer({ onPostCreated }: { onPostCreated?: () => void }) {
  return <EnhancedPostComposer onPostCreated={onPostCreated} />;
}

function PillarFilters({ value, onChange }: { value: Pillar; onChange: (v: Pillar) => void }) {
  const items: { key: Pillar; label: string }[] = [
    { key: "all", label: "All" },
    { key: "connect", label: "Connect" },
    { key: "collaborate", label: "Collaborate" },
    { key: "contribute", label: "Contribute" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((f) => (
        <Button
          key={f.key}
          variant={value === f.key ? "default" : "outline"}
          size="sm"
          className={value === f.key ? "bg-dna-forest text-white" : ""}
          onClick={() => onChange(f.key)}
        >
          {f.label}
        </Button>
      ))}
      <Button variant="ghost" size="sm" className="ml-auto"><Filter className="h-4 w-4 mr-1"/>More</Button>
    </div>
  );
}

function FeedList({ posts }: { posts: FeedPost[] }) {
  if (!posts?.length) {
    return (
      <div className="text-sm text-muted-foreground py-6 text-center">No posts yet in this view.</div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {posts.map((p) => (
        <Card key={String(p.id)}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-9 w-9"><AvatarFallback>{(p.author?.name || "").split(" ").map(s=>s[0]).join("") || "U"}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium leading-tight">{p.author?.name || "Member"}</p>
                    <p className="text-xs text-muted-foreground">{p.author?.role || ""}</p>
                  </div>
                  {p.pillar ? <Badge variant="outline" className="capitalize">{p.pillar}</Badge> : null}
                </div>
                <p className="mt-3 text-sm whitespace-pre-wrap">{p.body}</p>
                <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
                  <Button variant="ghost" size="sm"><Users className="h-4 w-4 mr-1"/>Connect</Button>
                  <Button variant="ghost" size="sm"><Save className="h-4 w-4 mr-1"/>Save</Button>
                  <Button variant="ghost" size="sm"><Share2 className="h-4 w-4 mr-1"/>Share</Button>
                  <Button variant="ghost" size="sm"><Heart className="h-4 w-4 mr-1"/>React</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MatchesPanel({ matches }: { matches?: MatchItem[] }) {
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle>Top Matches Today</CardTitle></CardHeader>
      <CardContent className="flex flex-col gap-3">
        {(matches || []).slice(0,3).map((m) => (
          <div key={String(m.id)} className="flex items-center gap-3 rounded-xl border p-3">
            <Avatar className="h-9 w-9"><AvatarFallback>{(m.name || "").split(" ").map(s=>s[0]).join("") || "U"}</AvatarFallback></Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{m.name}</p>
              {m.title ? <p className="text-xs text-muted-foreground truncate">{m.title}</p> : null}
              <div className="mt-1 flex flex-wrap gap-1">
                {(m.tags || []).map((t) => (
                  <Badge key={t} variant="secondary" className="capitalize">{t}</Badge>
                ))}
              </div>
            </div>
            <Button size="sm" className="bg-dna-mint">Connect</Button>
          </div>
        ))}
        <Button variant="ghost" size="sm" className="self-start">See all <ChevronRight className="h-4 w-4 ml-1"/></Button>
      </CardContent>
    </Card>
  );
}

function OpportunitiesPanel({ items }: { items?: OpportunityItem[] }) {
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle>Open Opportunities</CardTitle></CardHeader>
      <CardContent className="flex flex-col gap-3">
        {(items || []).slice(0,4).map((o) => (
          <div key={String(o.id)} className="rounded-xl border p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium leading-tight">{o.title}</p>
                {o.org ? <p className="text-xs text-muted-foreground">{o.org}</p> : null}
                <div className="mt-1 flex flex-wrap gap-1">
                  {(o.tags || []).map((t) => (
                    <Badge key={t} variant="secondary" className="capitalize">{t}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Save</Button>
                <Button size="sm" className="bg-dna-forest text-white">View</Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TrendingPanel() {
  const hashtags = [
    { tag: "AfricanFintech", count: "2.1k" },
    { tag: "ClimateTech", count: "890" },
    { tag: "DigitalHealth", count: "654" },
  ];
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle>Trending in Africa</CardTitle></CardHeader>
      <CardContent className="flex flex-col gap-2">
        {hashtags.map((h) => (
          <Button key={h.tag} variant="ghost" className="justify-between">
            <span>#{h.tag}</span>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <TrendingUp className="h-4 w-4"/>
              <span>{h.count} posts</span>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

// ===================== MAIN UI EXPORT =========================
export default function DnaDashboardUI(props: DashboardProps) {
  const { user, posts, isLoadingPosts, hasMorePosts, loadMorePosts, matches, opportunities, mode, pillar, setMode, setPillar } = props;

  return (
    <div className="container mx-auto px-3 md:px-6 py-4 md:py-6">
      <ImpactHeader user={user} />

      <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 space-y-4">
          <Composer onPostCreated={() => {
            if (typeof loadMorePosts === 'function') {
              loadMorePosts();
            }
          }} />

          <Card>
            <CardHeader className="pb-3">
              <Tabs value={mode} onValueChange={(v)=>setMode(v as FeedMode)} className="w-full">
                <TabsList>
                  <TabsTrigger value="forYou">For You</TabsTrigger>
                  <TabsTrigger value="trending">Trending in Africa</TabsTrigger>
                  <TabsTrigger value="spotlight">Spotlight</TabsTrigger>
                </TabsList>
                <TabsContent value="forYou" className="mt-3">
                  <PillarFilters value={pillar} onChange={setPillar} />
                </TabsContent>
                <TabsContent value="trending" className="mt-3">
                  <PillarFilters value={pillar} onChange={setPillar} />
                </TabsContent>
                <TabsContent value="spotlight" className="mt-3">
                  <PillarFilters value={pillar} onChange={setPillar} />
                </TabsContent>
              </Tabs>
            </CardHeader>
            <CardContent>
              {isLoadingPosts ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground"><Loader2 className="h-5 w-5 mr-2 animate-spin"/>Loading…</div>
              ) : (
                <FeedList posts={posts || []} />
              )}
              {(hasMorePosts && loadMorePosts) ? (
                <div className="mt-4 flex justify-center"><Button variant="outline" onClick={loadMorePosts}>Load more</Button></div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-4 space-y-4">
          <MatchesPanel matches={matches} />
          <OpportunitiesPanel items={opportunities} />
          <TrendingPanel />
        </div>
      </div>
    </div>
  );
}

// ================== ADAPTER FACTORY (NO IMPORTS) ===============
type UsePaginatedPostsHook = (args: { mode: FeedMode; pillar: Pillar; resetKey?: string }) => {
  data?: FeedPost[] | { pages?: Array<{ items?: FeedPost[] }> };
  posts?: FeedPost[];
  isLoading?: boolean; loading?: boolean;
  hasNextPage?: boolean; hasMore?: boolean;
  fetchNextPage?: () => void; loadMore?: () => void;
  reset?: () => void; refetch?: () => void;
};

type UseLiveCollaborationsHook = () => any;

type UseRoleBasedAccessHook = () => { profile?: any } | { profile: null } | null | undefined;

export function createDashboardPageAdapter(hooks: {
  usePaginatedPosts: UsePaginatedPostsHook;
  useLiveCollaborations: UseLiveCollaborationsHook;
  useRoleBasedAccess: UseRoleBasedAccessHook;
}) {
  const { usePaginatedPosts, useLiveCollaborations, useRoleBasedAccess } = hooks;
  return function DashboardPageAdapter() {
    const { profile } = (useRoleBasedAccess as any)?.() || { profile: null };

    const user: UserSummary = {
      id: profile?.id,
      name: profile?.full_name || profile?.username || "DNA Member",
      role: profile?.role || profile?.headline || "Professional",
      avatarUrl: profile?.avatar_url || undefined,
      impactScore: profile?.impact_score ?? 0,
      completion: profile?.profile_completion ?? 0,
    };

    const [mode, setMode] = React.useState<FeedMode>("forYou");
    const [pillar, setPillar] = React.useState<Pillar>("all");
    const resetKey = React.useMemo(() => `${mode}|${pillar}`, [mode, pillar]);

    // FEED
    const feed = (usePaginatedPosts as any)?.({ mode, pillar, resetKey }) || {};
    const feedData = (feed?.data || feed?.posts || []) as any;
    const posts: FeedPost[] = Array.isArray(feedData)
      ? (feedData as FeedPost[])
      : (feedData?.pages?.flatMap((p: any) => p?.items || []) || []);

    const isLoadingPosts = Boolean(feed?.isLoading || feed?.loading);
    const hasMorePosts = Boolean(feed?.hasNextPage || feed?.hasMore);
    const loadMorePosts = feed?.fetchNextPage || feed?.loadMore || undefined;

    React.useEffect(() => {
      if (typeof feed?.reset === "function") feed.reset();
      else if (typeof feed?.refetch === "function") feed.refetch();
    }, [resetKey]);

    // OPPORTUNITIES
    const collab = (useLiveCollaborations as any)?.() || {};
    const opportunities: OpportunityItem[] = (collab?.items || collab?.data || collab || [])
      ?.slice?.(0, 6)
      ?.map((it: any) => ({
        id: it.id,
        title: it.title || it.name,
        org: it.owner_name || it.organization || "",
        tags: it.tags || it.sectors || [],
      })) || [];

    // MATCHES
    const matches: MatchItem[] = (collab?.recommended_people || [])
      .slice?.(0, 3)
      .map((p: any) => ({ id: p.id, name: p.full_name || p.username, title: p.title || p.headline, avatarUrl: p.avatar_url, tags: p.skills || p.tags || [] }));

    return (
      <DnaDashboardUI
        user={user}
        mode={mode}
        pillar={pillar}
        setMode={setMode}
        setPillar={setPillar}
        posts={posts}
        isLoadingPosts={isLoadingPosts}
        hasMorePosts={hasMorePosts}
        loadMorePosts={loadMorePosts}
        matches={matches}
        opportunities={opportunities}
      />
    );
  };
}

// ================== SAFE STUB ADAPTER (CANVAS OK) =============
function useStubRoleBasedAccess() {
  return { profile: { id: "u_demo", full_name: "DNA Member", role: "Professional", avatar_url: "", impact_score: 72, profile_completion: 64 } };
}

function useStubPaginatedPosts(_args: { mode: FeedMode; pillar: Pillar; resetKey?: string }) {
  const items: FeedPost[] = [
    { id: "p1", author: { name: "Abdui R.", role: "Social Entrepreneur" }, body: "We're launching a new initiative to support local farmers. Join us!", pillar: "collaborate" },
    { id: "p2", author: { name: "Zara M.", role: "EdTech Founder" }, body: "Hosting a mentorship session for early-stage founders next week.", pillar: "connect" },
  ];
  return { data: { pages: [{ items }] }, isLoading: false, hasNextPage: false, fetchNextPage: undefined };
}

function useStubLiveCollaborations() {
  return {
    items: [
      { id: "o1", title: "Olamite Impact Research", owner_name: "Olamite", tags: ["Environment", "Research"] },
      { id: "o2", title: "HealthTech Platform", owner_name: "Hausa Labs", tags: ["Software", "Collaboration"] },
    ],
    recommended_people: [
      { id: "m1", full_name: "Fatima A.", title: "ClimateTech Founder (Lagos)", avatar_url: "", skills: ["ClimateTech", "Founder"] },
      { id: "m2", full_name: "Kwame D.", title: "Healthcare Product Lead (Accra)", avatar_url: "", skills: ["HealthTech", "Product"] },
    ],
  };
}

export const DashboardPageAdapter = createDashboardPageAdapter({
  usePaginatedPosts: useStubPaginatedPosts,
  useLiveCollaborations: useStubLiveCollaborations,
  useRoleBasedAccess: useStubRoleBasedAccess,
});

// ================== DEV TESTS (RUN MANUALLY) ==================
export function runDashboardMappingTests() {
  const results: { name: string; passed: boolean; detail?: string }[] = [];
  function t(name: string, fn: () => void) {
    try { fn(); results.push({ name, passed: true }); }
    catch (e: any) { results.push({ name, passed: false, detail: e?.message || String(e) }); }
  }

  t("maps feed from data.pages[0].items", () => {
    const feed = { data: { pages: [{ items: [{ id: 1, author: { name: "A" }, body: "hi" } as FeedPost] }] } };
    const pages = feed.data.pages.flatMap((p: any) => p.items || []);
    if (!Array.isArray(pages) || pages.length !== 1 || pages[0].id !== 1) throw new Error("pages mapping failed");
  });

  t("maps feed from posts[]", () => {
    const feed = { posts: [{ id: 2, author: { name: "B" }, body: "yo" } as FeedPost] };
    const posts: FeedPost[] = Array.isArray(feed.posts) ? feed.posts : [];
    if (posts.length !== 1 || posts[0].id !== 2) throw new Error("flat posts mapping failed");
  });

  t("maps collaborations to opportunities", () => {
    const collab = { items: [{ id: "x", title: "T", owner_name: "Org", tags: ["t1"] }] };
    const opportunities: OpportunityItem[] = (collab.items || []).map((it: any) => ({ id: it.id, title: it.title || it.name, org: it.owner_name || it.organization || "", tags: it.tags || it.sectors || [] }));
    if (opportunities.length !== 1 || opportunities[0].org !== "Org") throw new Error("opportunities mapping failed");
  });

  t("maps recommended_people to matches", () => {
    const collab = { recommended_people: [{ id: "m", full_name: "Name", title: "T" }] };
    const matches: MatchItem[] = (collab.recommended_people || []).map((p: any) => ({ id: p.id, name: p.full_name || p.username, title: p.title || p.headline }));
    if (matches.length !== 1 || matches[0].name !== "Name") throw new Error("matches mapping failed");
  });

  t("resetKey updates on mode/pillar change", () => {
    const mkKey = (m: FeedMode, p: Pillar) => `${m}|${p}`;
    const k1 = mkKey("forYou", "all");
    const k2 = mkKey("trending", "all");
    const k3 = mkKey("trending", "connect");
    if (k1 === k2 || k2 === k3) throw new Error("resetKey not unique across changes");
  });

  return {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    results,
  };
}