import React from 'react';

/**
 * AuthPageShell — the frame for a standalone, signed-out auth surface.
 *
 * The page-level layout gate exists because a page that sets its own width
 * and rhythm competes with every other page that does the same, and nothing
 * owns the result. The frame lives here so the route file holds content only.
 */
export default function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">{children}</div>
    </div>
  );
}
