import React from 'react';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { PageSEO, getOrganizationSchema } from '@/components/seo/PageSEO';
import AboutContent from '@/components/about/AboutContent';

const LINKEDIN_URL = 'https://www.linkedin.com/in/jaunelamarr/';

const About = () => {
  useScrollToTop();

  const founderSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Jaûne L. Odombrown',
    jobTitle: 'Founder & CEO',
    worksFor: {
      '@type': 'Organization',
      name: 'Diaspora Network of Africa',
    },
    url: LINKEDIN_URL,
  };

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="About DNA: Our Mission to Unite the African Diaspora"
        description="DNA is the mobilization infrastructure for the Global African Diaspora's return. Meet the founder and learn why DNA exists."
        keywords={[
          'about diaspora network africa',
          'african diaspora mission',
          'DNA platform',
          'Jaune Odombrown',
          'diaspora unity',
          'africa development mission',
        ]}
        canonicalPath="/about"
        structuredData={[getOrganizationSchema(), founderSchema]}
      />

      <AboutContent />
    </div>
  );
};

export default About;
