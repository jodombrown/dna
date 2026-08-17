import * as React from "react";
import { Section } from "@/components/ds/Section";
import { Container } from "@/components/ds/Container";
import { Stack } from "@/components/ds/Stack";
import { SECTIONS_BY_PATHWAY } from "@/content/ghana-content";

const COMMUNITY_ITEMS =
  SECTIONS_BY_PATHWAY.community.find((s) => s.type === "topic" && s.items)?.items ?? [];

export interface GhanaLiveDataBannerProps {
  liveDataState?: "cold-start" | "active";
  memberCount?: number;
  chapterCount?: number;
  whatsHappening?: string;
}

/**
 * Two mutually exclusive states, driven by a single prop. The active state
 * renders from props with no default values: if the numbers aren't passed,
 * this falls back to cold-start rather than showing a zero or a stub.
 * Always renders; never hides for a low count.
 */
export function GhanaLiveDataBanner({
  liveDataState = "cold-start",
  memberCount,
  chapterCount,
  whatsHappening,
}: GhanaLiveDataBannerProps) {
  const isActive =
    liveDataState === "active" && memberCount != null && chapterCount != null;

  return (
    <Section tone="muted">
      <Container>
        {isActive ? (
          <Stack direction="row" gap="l" wrap align="center">
            <Stack gap="s">
              <span className="font-heritage text-h1 text-foreground">{memberCount}</span>
              <span className="text-meta text-muted-foreground">Members from Ghana</span>
            </Stack>
            <Stack gap="s">
              <span className="font-heritage text-h1 text-foreground">{chapterCount}</span>
              <span className="text-meta text-muted-foreground">Chapters convened</span>
            </Stack>
            {whatsHappening && (
              <Stack gap="s">
                <span className="text-meta uppercase tracking-wide text-muted-foreground">
                  What's happening
                </span>
                <span className="text-body text-foreground">{whatsHappening}</span>
              </Stack>
            )}
          </Stack>
        ) : (
          <Stack gap="m" align="start">
            <h2 className="font-heritage text-h2 text-foreground">Be one of the first</h2>
            <Stack direction="row" gap="l" wrap>
              {COMMUNITY_ITEMS.map((item) => (
                <p key={item.t} className="text-body text-muted-foreground max-w-xs">
                  <span className="text-foreground">{item.t}</span> {item.d}
                </p>
              ))}
            </Stack>
          </Stack>
        )}
      </Container>
    </Section>
  );
}
