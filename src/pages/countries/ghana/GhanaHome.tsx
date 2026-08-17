import * as React from "react";
import { Helmet } from "react-helmet-async";
import { GhanaPublicShell } from "@/components/countries/ghana/GhanaPublicShell";
import { GhanaHero } from "@/components/countries/ghana/GhanaHero";
import { GhanaLiveDataBanner } from "@/components/countries/ghana/GhanaLiveDataBanner";
import { GhanaTopStories } from "@/components/countries/ghana/GhanaTopStories";
import { GhanaHistoryTeaser } from "@/components/countries/ghana/GhanaHistoryTeaser";
import { GhanaPathwayGrid } from "@/components/countries/ghana/GhanaPathwayGrid";
import { GhanaQuickFacts } from "@/components/countries/ghana/GhanaQuickFacts";
import { GhanaCommunityCards } from "@/components/countries/ghana/GhanaCommunityCards";
import { GhanaFooterCta } from "@/components/countries/ghana/GhanaFooterCta";

/**
 * PR2: the home sections between the hero and the footer CTA. The map
 * section ("Ghana, mapped") lands in PR6 and is intentionally left out,
 * not stubbed. Drawer, search, and country-redirect search stay wired to
 * no-ops until PR3.
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
        <GhanaLiveDataBanner />
        <GhanaTopStories />
        <GhanaHistoryTeaser />
        <GhanaPathwayGrid />
        <GhanaQuickFacts />
        <GhanaCommunityCards />
        <GhanaFooterCta />
      </GhanaPublicShell>
    </>
  );
}
