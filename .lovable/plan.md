

# Five C's Hub Pages — DIA Integration Audit Results

## Audit Matrix

| Module | `DIAHubSection` (sidebar) | `HubDIAPanel` (sidebar recommendations) | Contextual Discovery Card (inline) | Feed-injected DIA cards |
|---|---|---|---|---|
| **CONNECT** | Yes — `surface="connect_hub"` in `Connect.tsx` | No (uses custom `DiaInsightCard` inline in `DiscoveryFeed.tsx` instead) | Yes — custom `DiaInsightCard` injected every 4-6 member cards | Yes |
| **CONVENE** | Yes — `surface="convene_hub"` in sidebar | No (not needed — has custom inline card) | Yes — `ConveneDIADiscoveryCard` between chips and events | Yes |
| **COLLABORATE** | Yes — `surface="collaborate_hub"` | Yes — `HubDIAPanel hub="collaborate"` | **No** — no inline contextual card | N/A |
| **CONTRIBUTE** | Yes — `surface="contribute_hub"` | Yes — `HubDIAPanel hub="contribute"` | **No** — no inline contextual card | N/A |
| **CONVEY** | Yes — `surface="convey_hub"` | Yes — `HubDIAPanel hub="convey"` | **No** — no inline contextual card | N/A |

## Assessment

**All five hubs have sidebar DIA integration** — either via `DIAHubSection` (the Sprint 4A card system) or `HubDIAPanel` (the shared recommendations panel), or both. Three hubs (Collaborate, Contribute, Convey) have *both*.

**Two hubs have inline contextual discovery cards** — CONNECT has `DiaInsightCard` woven into the member discovery feed, and CONVENE has `ConveneDIADiscoveryCard` between category chips and featured events.

## Gaps Found

The three hubs missing inline contextual cards (Collaborate, Contribute, Convey) already have **dual sidebar DIA** (`DIAHubSection` + `HubDIAPanel`), so they are not "missing DIA" — they just lack the more prominent inline placement that CONNECT and CONVENE have.

### Should we add inline cards to the remaining 3 hubs?

This is a question of priority. The inline cards on CONNECT and CONVENE are high-value because those pages have rich browsable content (member cards, event cards) where a contextual DIA nudge naturally fits between items. Collaborate, Contribute, and Convey have different content structures (spaces list, opportunities list, stories/posts) where an inline card could also add value.

**If you want to add them, here's what each would do:**

1. **CollaborateDIADiscoveryCard** — "3 spaces match your skills" / "Your space has been idle for 7 days" / "Welcome to Collaborate"
2. **ContributeDIADiscoveryCard** — "2 opportunities match your expertise" / "Post your first need or offer" / "Welcome to Contribute"
3. **ConveyDIADiscoveryCard** — "Your last story got 12 views" / "Trending topics in your network" / "Share your first story"

Each would follow the same pattern as `ConveneDIADiscoveryCard`: priority-based content selection, 7-day dismiss cooldown, positioned between the filter/chip section and the main content list.

**Estimated effort:** ~200 lines per card component + 5 lines wiring into each discovery page.

## Verdict

**No modules are missing DIA integration.** All five hubs have sidebar DIA. CONNECT and CONVENE additionally have inline contextual cards. Adding inline cards to the remaining three hubs would complete the pattern but is an enhancement, not a fix.

