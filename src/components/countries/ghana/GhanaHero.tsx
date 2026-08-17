import * as React from "react";
import { Link } from "react-router-dom";
import { Section } from "@/components/ds/Section";
import { Container } from "@/components/ds/Container";
import { Stack } from "@/components/ds/Stack";
import { GHANA_FLAG } from "@/content/ghana-content";

/**
 * Home hero. Header/title only for PR1 — the DC handoff's hero subhead copy
 * is not in ghana-content.ts, so nothing is invented here pending the design
 * bundle. Type scale: the handoff specifies 34/1.08 mobile, 46/1.05 desktop,
 * which sits between this repo's `display` (32px) and `hero` (48px) tokens;
 * per the build brief, the repo's own DNA token scale wins over the DC
 * file's cached pixel values, so this uses display -> hero across the
 * breakpoint rather than a one-off arbitrary size.
 */
export function GhanaHero() {
  return (
    <Section tone="default">
      <Container>
        <Stack gap="m" align="start">
          <nav aria-label="Breadcrumb" className="text-meta uppercase tracking-wide text-muted-foreground">
            <Link to="/" className="hover:text-foreground">West Africa</Link>
          </nav>
          {/* Ghana flag accent bar. Per-country literal, not a system token. */}
          <div className="flex h-1 w-16 overflow-hidden rounded-dna-sm" aria-hidden>
            <span className="flex-1" style={{ backgroundColor: GHANA_FLAG.red }} />
            <span className="flex-1" style={{ backgroundColor: GHANA_FLAG.gold }} />
            <span className="flex-1" style={{ backgroundColor: GHANA_FLAG.green }} />
          </div>
          <h1 className="font-heritage text-display md:text-hero text-foreground">
            Ghana
          </h1>
        </Stack>
      </Container>
    </Section>
  );
}
