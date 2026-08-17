import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ds/Section";
import { Container } from "@/components/ds/Container";
import { Stack } from "@/components/ds/Stack";
import { SECTIONS_BY_PATHWAY } from "@/content/ghana-content";

const COMMUNITY_LEDE = SECTIONS_BY_PATHWAY.community.find((s) => s.type === "lede")?.body ?? "";

/** Fixed brand green, not token-derived, per the design handoff. */
export function GhanaFooterCta() {
  return (
    <Section as="div" className="bg-footer text-primary-foreground" tone="default">
      <Container>
        <Stack gap="m" align="start">
          <h2 className="font-heritage text-h2">Join Ghana's community</h2>
          <p className="text-body max-w-3xl">{COMMUNITY_LEDE}</p>
          <Button variant="secondary" className="border-primary-foreground text-primary-foreground" asChild>
            <Link to="/auth?mode=signup">Join DNA</Link>
          </Button>
        </Stack>
      </Container>
    </Section>
  );
}
