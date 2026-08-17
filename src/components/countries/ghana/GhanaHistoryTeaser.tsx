import * as React from "react";
import { Link } from "react-router-dom";
import { Section } from "@/components/ds/Section";
import { Container } from "@/components/ds/Container";
import { Stack } from "@/components/ds/Stack";
import { Grid } from "@/components/ds/Grid";
import { GHANA_HISTORY_RUPTURE } from "@/content/ghana-content";

/** Headline, one paragraph, one photo slot, and a link into the full history pathway. */
export function GhanaHistoryTeaser() {
  return (
    <Section>
      <Container>
        <Grid variant="feature" gap="l">
          <Stack gap="m" align="start">
            <span className="text-meta uppercase tracking-wide text-muted-foreground">
              {GHANA_HISTORY_RUPTURE.kicker}
            </span>
            <h2 className="font-heritage text-h2 text-foreground">{GHANA_HISTORY_RUPTURE.title}</h2>
            <p className="text-body text-muted-foreground">{GHANA_HISTORY_RUPTURE.body}</p>
            <Link to="/west-africa/ghana/history" className="text-body text-primary hover:underline">
              Read Ghana's history
            </Link>
          </Stack>
          <div
            className="flex aspect-square items-center justify-center rounded-dna-lg bg-dna-sand text-center text-meta text-muted-foreground p-4"
            role="img"
            aria-label={GHANA_HISTORY_RUPTURE.placeholder}
          >
            {GHANA_HISTORY_RUPTURE.placeholder}
          </div>
        </Grid>
      </Container>
    </Section>
  );
}
