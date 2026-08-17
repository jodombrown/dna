import * as React from "react";
import { Link } from "react-router-dom";
import { Section } from "@/components/ds/Section";
import { Container } from "@/components/ds/Container";
import { Stack } from "@/components/ds/Stack";
import { getPathwayLabel } from "@/pages/countries/ghana/pathwayMeta";
import { PLACEHOLDER_ARTICLES } from "@/content/ghana-articles";
import diasporaPhoto from "@/assets/diaspora-connection.jpg";
import heroPhoto from "@/assets/hero-professional.jpeg";

const THUMBNAILS = [diasporaPhoto, heroPhoto];

/**
 * Horizontal infinite-loop carousel. The loop is a scroll-position illusion:
 * the 7 placeholder articles render three times in a row, and a scroll
 * listener resets scrollLeft by one set-width whenever it nears either
 * boundary, so the wrap is invisible to the user.
 */
export function GhanaTopStories() {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const setWidthRef = React.useRef(0);

  const measure = React.useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setWidthRef.current = el.scrollWidth / 3;
  }, []);

  React.useEffect(() => {
    measure();
    const el = trackRef.current;
    if (el && setWidthRef.current > 0) {
      el.scrollLeft = setWidthRef.current;
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const handleScroll = React.useCallback(() => {
    const el = trackRef.current;
    const setWidth = setWidthRef.current;
    if (!el || setWidth <= 0) return;
    if (el.scrollLeft <= 0) {
      el.scrollLeft += setWidth;
    } else if (el.scrollLeft + el.clientWidth >= setWidth * 3) {
      el.scrollLeft -= setWidth;
    }
  }, []);

  const scrollByCard = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-card]");
    const cardWidth = card?.offsetWidth ?? el.clientWidth * 0.82;
    el.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
  };

  const tripled = [...PLACEHOLDER_ARTICLES, ...PLACEHOLDER_ARTICLES, ...PLACEHOLDER_ARTICLES];

  return (
    <Section>
      <Container>
        <Stack gap="m">
          <Stack direction="row" gap="m" align="center" className="justify-between">
            <h2 className="font-heritage text-h2 text-foreground">Top stories</h2>
            <Stack direction="row" gap="s" className="hidden md:flex">
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                aria-label="Previous story"
                className="flex size-9 items-center justify-center rounded-dna-md border border-dna-stone text-foreground hover:bg-dna-sand transition-colors"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                aria-label="Next story"
                className="flex size-9 items-center justify-center rounded-dna-md border border-dna-stone text-foreground hover:bg-dna-sand transition-colors"
              >
                ›
              </button>
            </Stack>
          </Stack>
          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto"
          >
            {tripled.map((article, index) => (
              <Link
                key={`${article.id}-${index}`}
                data-carousel-card
                to={`/west-africa/ghana/${article.pathwayId}/${article.id}`}
                className="ghana-carousel-card flex flex-col gap-2 rounded-dna-lg border border-dna-stone bg-card p-3 shadow-dna-1 transition-colors hover:border-primary"
              >
                <img
                  src={THUMBNAILS[index % THUMBNAILS.length]}
                  alt=""
                  className="aspect-video w-full rounded-dna-md object-cover"
                />
                <span className="text-meta uppercase tracking-wide text-muted-foreground">
                  {getPathwayLabel(article.pathwayId)}
                </span>
                <span className="font-heritage text-h3 text-foreground">{article.headline}</span>
              </Link>
            ))}
          </div>
        </Stack>
      </Container>
    </Section>
  );
}
