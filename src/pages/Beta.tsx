/**
 * /beta - Beta in-app testing.
 *
 * Placeholder shell for the in-app testing page the beta banner links to.
 * Content is deliberately minimal: it states only what is decided (the beta
 * window and what follows it) and invents nothing else. Design comes later.
 */
import React, { lazy, Suspense } from 'react';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { PageSEO } from '@/components/seo/PageSEO';
import { Section, Container, Stack } from '@/components/ds';

const Footer = lazy(() => import('@/components/Footer'));

const Beta = () => {
  useScrollToTop();

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Beta in-app testing"
        description="DNA is in beta from August 15 to October 15, 2026. Learn what in-app testing covers and what happens after the beta window closes."
        keywords={['DNA beta', 'in-app testing', 'diaspora network of africa beta']}
        canonicalPath="/beta"
      />

      <main id="main-content">
        <Section>
          <Container width="narrow">
            <Stack gap="l">
              <h1 className="text-h1 text-foreground">Beta in-app testing</h1>
              <p className="text-body text-muted-foreground">
                DNA is in beta from August 15 to October 15, 2026. During this window Members use
                the live product across the five C's, and what breaks, confuses, or slows you down
                is what we fix.
              </p>
              <p className="text-body text-muted-foreground">
                When the beta window closes, public launch follows with a full campaign heading into
                Detty December in Accra, Ghana.
              </p>
            </Stack>
          </Container>
        </Section>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Beta;
