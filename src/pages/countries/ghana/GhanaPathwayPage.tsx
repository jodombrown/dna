import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { GhanaPublicShell } from "@/components/countries/ghana/GhanaPublicShell";
import { Section } from "@/components/ds/Section";
import { Container } from "@/components/ds/Container";
import { Stack } from "@/components/ds/Stack";
import { getPathwayLabel } from "@/pages/countries/ghana/pathwayMeta";

/**
 * Route stub for PR1 (route registration only). The single-open accordion,
 * hero photo band, and stories list are PR4 scope; the bespoke History
 * layout is PR5 scope.
 */
export default function GhanaPathwayPage() {
  const { pathwayId = "" } = useParams<{ pathwayId: string }>();
  const label = getPathwayLabel(pathwayId);

  return (
    <>
      <Helmet>
        <title>{label} | Ghana | Diaspora Network of Africa</title>
      </Helmet>
      <GhanaPublicShell>
        <Section>
          <Container>
            <Stack gap="m" align="start">
              <nav aria-label="Breadcrumb" className="text-meta uppercase tracking-wide text-muted-foreground">
                <Link to="/west-africa/ghana" className="hover:text-foreground">Ghana</Link>
              </nav>
              <h1 className="font-heritage text-display md:text-hero text-foreground">{label}</h1>
              <p className="text-body text-muted-foreground">
                This pathway's full layout lands in a later PR.
              </p>
            </Stack>
          </Container>
        </Section>
      </GhanaPublicShell>
    </>
  );
}
