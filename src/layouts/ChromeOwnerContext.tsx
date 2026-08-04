import * as React from 'react';

/**
 * ChromeOwnerContext — the transitional handshake between BaseLayout's global
 * chrome and a route that supplies its own through AppShell.
 *
 * WHY THIS EXISTS, AND WHEN IT DIES: it exists ONLY while some routes render
 * through AppShell (which owns its own <UnifiedHeader/> + <PulseBar/> +
 * <PulseDock/>) and some still rely on BaseLayout to render that chrome for
 * them. Ownership is decided by CLAIM, never by route — AppShell claim()s on
 * mount and release()s on unmount, and BaseLayout renders its chrome only while
 * nothing has claimed. There is NO path list here or anywhere: a route owns the
 * chrome because it mounted an AppShell, not because its URL matched a string.
 *
 * When the fifth C converts to AppShell, BaseLayout stops owning chrome
 * entirely: its chrome block and this whole context are deleted together, in
 * the same commit. This is scaffolding with a demolition date, not a seam meant
 * to live in the codebase.
 */
interface ChromeOwner {
  /** True while at least one AppShell has claimed chrome ownership. */
  claimed: boolean;
  /** Take ownership (AppShell, on mount). Reference-stable. */
  claim: () => void;
  /** Give it back (AppShell, on unmount). Reference-stable. */
  release: () => void;
}

/**
 * A stable no-op owner so an AppShell rendered OUTSIDE the provider — unit
 * tests, a drawer panel — neither throws nor accidentally toggles anyone's
 * chrome. `claim`/`release` are the same references forever, so the effect that
 * depends on them runs exactly once.
 */
const NOOP_OWNER: ChromeOwner = {
  claimed: false,
  claim: () => {},
  release: () => {},
};

const ChromeOwnerContext = React.createContext<ChromeOwner | null>(null);

export function ChromeOwnerProvider({ children }: { children: React.ReactNode }) {
  // A COUNT, not a boolean: two AppShells can overlap for a frame while React
  // mounts the next route before unmounting the previous one (and StrictMode
  // double-invokes effects in dev). Balanced claim/release pairs keep `claimed`
  // true across that overlap, so BaseLayout's chrome never flashes back in
  // between two AppShell routes.
  const [claims, setClaims] = React.useState(0);
  const claim = React.useCallback(() => setClaims((n) => n + 1), []);
  const release = React.useCallback(() => setClaims((n) => Math.max(0, n - 1)), []);

  const value = React.useMemo<ChromeOwner>(
    () => ({ claimed: claims > 0, claim, release }),
    [claims, claim, release],
  );

  return (
    <ChromeOwnerContext.Provider value={value}>{children}</ChromeOwnerContext.Provider>
  );
}

/** Non-throwing: falls back to the stable no-op owner outside a provider. */
export function useChromeOwner(): ChromeOwner {
  return React.useContext(ChromeOwnerContext) ?? NOOP_OWNER;
}

export default ChromeOwnerContext;
