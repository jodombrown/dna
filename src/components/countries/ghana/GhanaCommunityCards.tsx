import * as React from "react";
import { Section } from "@/components/ds/Section";
import { Container } from "@/components/ds/Container";
import { Stack } from "@/components/ds/Stack";
import { Grid } from "@/components/ds/Grid";
import { SECTIONS_BY_PATHWAY } from "@/content/ghana-content";

const COMMUNITY_LEDE = SECTIONS_BY_PATHWAY.community.find((s) => s.type === "lede")?.body ?? "";
const COMMUNITY_ITEMS =
  SECTIONS_BY_PATHWAY.community.find((s) => s.type === "topic" && s.items)?.items ?? [];

/** Three cards using the founding-moment framing already written for the community pathway. */
export function GhanaCommunityCards() {
  return (
    <Section>
      <Container>
        <Stack gap="l">
          <Stack gap="s" align="start">
            <h2 className="font-heritage text-h2 text-foreground">Join the community</h2>
            <p className="text-body text-muted-foreground max-w-2xl">{COMMUNITY_LEDE}</p>
          </Stack>
          <Grid cols={3} gap="m">
            {COMMUNITY_ITEMS.map((item) => (
              <div key={item.t} className="rounded-dna-lg border border-dna-stone bg-card p-4 shadow-dna-1">
                <Stack gap="s" align="start">
                  <h3 className="font-heritage text-h3 text-foreground">{item.t}</h3>
                  <p className="text-body text-muted-foreground">{item.d}</p>
                </Stack>
              </div>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
