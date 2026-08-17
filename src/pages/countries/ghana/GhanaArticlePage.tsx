import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { GhanaPublicShell } from "@/components/countries/ghana/GhanaPublicShell";
import { Section } from "@/components/ds/Section";
import { Container } from "@/components/ds/Container";
import { Stack } from "@/components/ds/Stack";
import { getPathwayLabel } from "@/pages/countries/ghana/pathwayMeta";

/** Route stub for PR1 (route registration only). Full article layout is PR7 scope. */
export default function GhanaArticlePage() {
  const { pathwayId = "", articleId = "" } = useParams<{ pathwayId: string; articleId: string }>();
  const label = getPathwayLabel(pathwayId);

  return (
    <>
      <Helmet>
        <title>Article | {label} | Ghana | Diaspora Network of Africa</title>
      </Helmet>
      <GhanaPublicShell>
        <Section>
          <Container>
            <Stack gap="m" align="start">
              <nav aria-label="Breadcrumb" className="text-meta uppercase tracking-wide text-muted-foreground">
                <Link to="/west-africa/ghana" className="hover:text-foreground">Ghana</Link>
                {" / "}
                <Link to={`/west-africa/ghana/${pathwayId}`} className="hover:text-foreground">{label}</Link>
              </nav>
              <h1 className="font-heritage text-display text-foreground">Article {articleId}</h1>
              <p className="text-body text-muted-foreground">
                Full article layout lands in a later PR.
              </p>
            </Stack>
          </Container>
        </Section>
      </GhanaPublicShell>
    </>
  );
}
