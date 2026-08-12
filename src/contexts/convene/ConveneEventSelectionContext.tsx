import { createContext, useContext } from 'react';

/**
 * Set only by ConveneDiscovery, and only at desktop width (1024+), where
 * Browse hosts the selected event's detail in AppShell's `related` slot
 * instead of navigating away from the list. Absent everywhere else —
 * including Browse itself below 1024 — so every card's default click
 * handler falls through to its normal standalone-route navigate with no
 * special-casing at the call site.
 */
export const ConveneEventSelectionContext = createContext<((slugOrId: string) => void) | null>(null);

export function useConveneEventSelection() {
  return useContext(ConveneEventSelectionContext);
}
