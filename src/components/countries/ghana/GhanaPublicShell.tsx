import * as React from "react";
import Footer from "@/components/Footer";
import { useChromeOwner } from "@/layouts/ChromeOwnerContext";
import { GhanaHeader } from "./GhanaHeader";
import { GhanaNavStrip } from "./GhanaNavStrip";
import { GhanaDrawer } from "./GhanaDrawer";
import { GhanaSearchOverlay } from "./GhanaSearchOverlay";

export interface GhanaPublicShellProps {
  children: React.ReactNode;
}

/**
 * Public shell for the Ghana country page. Claims chrome ownership (BD110)
 * on mount so BaseLayout's UnifiedHeader/PulseBar/PulseDock stand down,
 * this is signed-out app chrome, not the authenticated app shell.
 */
export function GhanaPublicShell({ children }: GhanaPublicShellProps) {
  const { claim, release } = useChromeOwner();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useLayoutEffect(() => {
    claim();
    return release;
  }, [claim, release]);

  return (
    <div className="min-h-dvh bg-background">
      <GhanaHeader
        onOpenDrawer={() => setDrawerOpen(true)}
        onOpenSearch={() => setSearchOpen((isOpen) => !isOpen)}
      />
      <GhanaNavStrip />
      <GhanaSearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <GhanaDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
      {children}
      <Footer />
    </div>
  );
}
