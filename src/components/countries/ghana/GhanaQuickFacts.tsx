import * as React from "react";
import { Section } from "@/components/ds/Section";
import { Container } from "@/components/ds/Container";
import { Stack } from "@/components/ds/Stack";
import { Grid } from "@/components/ds/Grid";

interface QuickFact {
  label: string;
  value: string;
}

const QUICK_FACTS: QuickFact[] = [
  { label: "Capital", value: "Accra" },
  { label: "Population", value: "~34 million" },
  { label: "Languages", value: "English (official), Twi, Ga, Ewe, Dagbani, and more" },
  { label: "Currency", value: "Ghanaian cedi (GHS)" },
  { label: "Time Zone", value: "GMT: 5 hours ahead of US Eastern, 8 ahead of US Pacific, same as the UK" },
];

export interface DiasporaEstimate {
  /** No verified figure exists yet. Toggle this off only when the row should
   * be suppressed entirely; the default keeps the placeholder chip visible. */
  diasporaEstimateVisible?: boolean;
  /** Populated once a verified figure lands. */
  value?: string;
  source?: string;
  lastVerified?: string;
}

/** Six quick facts. Stacked on mobile, 3 columns on desktop. */
export function GhanaQuickFacts({
  diasporaEstimateVisible = true,
  value,
  source,
  lastVerified,
}: DiasporaEstimate = {}) {
  return (
    <Section tone="muted">
      <Container>
        <Stack gap="l">
          <h2 className="font-heritage text-h2 text-foreground">Quick facts</h2>
          <Grid cols={3} gap="m">
            {QUICK_FACTS.map((fact) => (
              <Stack key={fact.label} gap="s">
                <span className="text-meta uppercase tracking-wide text-muted-foreground">{fact.label}</span>
                <span className="text-body text-foreground">{fact.value}</span>
              </Stack>
            ))}
            {diasporaEstimateVisible && (
              <Stack gap="s">
                <span className="text-meta uppercase tracking-wide text-muted-foreground">
                  Diaspora population estimate
                </span>
                {value ? (
                  <Stack gap="s">
                    <span className="text-body text-foreground">{value}</span>
                    {(source || lastVerified) && (
                      <span className="text-meta text-muted-foreground">
                        {source}
                        {source && lastVerified ? ", " : ""}
                        {lastVerified && `verified ${lastVerified}`}
                      </span>
                    )}
                  </Stack>
                ) : (
                  <span className="inline-flex w-fit items-center rounded-dna-lg bg-dna-sand px-3 py-1 text-meta text-muted-foreground">
                    Not yet verified
                  </span>
                )}
              </Stack>
            )}
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
