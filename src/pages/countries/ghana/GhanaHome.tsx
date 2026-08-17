import * as React from "react";
import { Helmet } from "react-helmet-async";
import { GhanaPublicShell } from "@/components/countries/ghana/GhanaPublicShell";
import { GhanaHero } from "@/components/countries/ghana/GhanaHero";
import { GhanaFooterCta } from "@/components/countries/ghana/GhanaFooterCta";

/**
 * PR1: route, shell, content module. Renders header, nav strip, hero, and
 * the footer CTA band only — the live-data banner, carousel, history teaser,
 * pathway grid, quick facts, and community cards land in PR2.
 */
export default function GhanaHome() {
  return (
    <>
      <Helmet>
        <title>Ghana | Diaspora Network of Africa</title>
        <meta
          name="description"
          content="Ghana's history, culture, news, government, investment, real estate, tourism, relocation, education, and community, for the global African diaspora."
        />
      </Helmet>
      <GhanaPublicShell>
        <GhanaHero />
        <GhanaFooterCta />
      </GhanaPublicShell>
    </>
  );
}
