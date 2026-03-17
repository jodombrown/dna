

# Standardize Convene Sub-Header to Match Feed & Connect

## The Problem

Feed and Connect both use the same **segmented tab bar** pattern for Row 2:
- Container: `bg-muted/50 rounded-lg` with `p-1`
- Active tab: icon + label text, `bg-background shadow-sm`, expands with `flex-1`
- Inactive tabs: icon only, `text-muted-foreground`
- Haptic feedback on tap

Convene's Row 2 is completely different — it uses a horizontally scrolling **pill filter bar** with copper-bordered buttons and no icons. This is the inconsistency you're seeing.

## The Fix

Replace Convene's pill filter bar with the same segmented icon+label tab component used by Feed and Connect. Each Convene filter gets a contextual icon so users know what it means at a glance.

### Tab mapping with icons

| Filter | Icon | Label |
|--------|------|-------|
| All | `CalendarDays` | All |
| Near Me | `MapPin` | Near Me |
| This Week | `Clock` | This Week |
| Online | `Globe` | Online |
| Free | `Ticket` | Free |
| My Network | `Users` | Network |

### File: `src/components/convene/ConveneMobileHeader.tsx`

**Row 2 rewrite** — replace the pill scroll bar (lines 89-111) with the exact same segmented control markup from `MobileFeedTabs` / `ConnectMobileHeader`:

```tsx
// Same container as Feed & Connect
<div className="px-3 py-1.5 bg-background border-b border-border">
  <div className="flex items-center justify-between gap-1 p-1 bg-muted/50 rounded-lg">
    {TABS.map(({ id, icon: Icon, label }) => {
      const isActive = activePill === id;
      return (
        <button key={id} onClick={...}
          className={cn(
            "flex items-center justify-center gap-1.5 py-2 rounded-md transition-all duration-200",
            isActive
              ? "bg-background shadow-sm flex-1 px-3"
              : "px-3 text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}>
          <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
          {isActive && <span className="text-xs font-medium truncate">{label}</span>}
        </button>
      );
    })}
  </div>
</div>
```

- Add `haptic('light')` on tap (matching Feed)
- Import icons from `lucide-react`: `CalendarDays`, `MapPin`, `Clock`, `Globe`, `Ticket`, `Users`

### Scope

Only one file changes: `ConveneMobileHeader.tsx`. The props interface stays the same (`activePill` / `onPillChange`), so `ConveneDiscovery.tsx` needs zero changes.

