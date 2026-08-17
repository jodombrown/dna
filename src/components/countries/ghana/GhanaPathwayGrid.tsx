import * as React from "react";
import { Link } from "react-router-dom";
import { Section } from "@/components/ds/Section";
import { Container } from "@/components/ds/Container";
import { Stack } from "@/components/ds/Stack";
import { Grid } from "@/components/ds/Grid";
import { GHANA_PATHWAYS } from "@/pages/countries/ghana/pathwayMeta";
import { GHANA_FLAG } from "@/content/ghana-content";

const FLAG_CYCLE = [GHANA_FLAG.red, GHANA_FLAG.gold, GHANA_FLAG.green];

/**
 * Ten pathway cards in fixed canonical order (never usage-ranked or
 * alphabetized). Accent colors cycle through the Ghana flag palette by
 * index, per-country literals like the hero's flag bar, not tokens.
 */
export function GhanaPathwayGrid() {
  return (
    <Section tone="muted">
      <Container>
        <Stack gap="l">
          <h2 className="font-heritage text-h2 text-foreground">Explore Ghana</h2>
          <Grid cols={5} gap="m">
            {GHANA_PATHWAYS.map((pathway, index) => {
              const Icon = pathway.icon;
              const accent = FLAG_CYCLE[index % FLAG_CYCLE.length];
              return (
                <Link
                  key={pathway.id}
                  to={`/west-africa/ghana/${pathway.id}`}
                  style={{ borderLeftColor: accent }}
                  className="flex flex-col gap-2 rounded-dna-lg border border-dna-stone border-l-4 bg-card p-4 shadow-dna-1 transition-all duration-150 md:hover:-translate-y-0.5 md:hover:shadow-dna-2"
                >
                  <Icon className="size-5" style={{ color: accent }} aria-hidden />
                  <span className="font-heritage text-h3 text-foreground">{pathway.label}</span>
                  <span className="text-meta text-muted-foreground">{pathway.description}</span>
                </Link>
              );
            })}
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
