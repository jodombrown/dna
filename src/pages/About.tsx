import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Linkedin, ArrowUpRight } from 'lucide-react';
import JoinDNADialog from '@/components/auth/JoinDNADialog';
import SurveyDialog from '@/components/survey/SurveyDialog';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { PageSEO, getOrganizationSchema } from '@/components/seo/PageSEO';
import { useStatCitations } from '@/hooks/useStatCitations';
import dnaLogo from '@/assets/dna-logo-trimmed.png';

const LINKEDIN_URL = 'https://www.linkedin.com/in/jaunelamarr/';
const DNA_PROFILE_URL = 'https://diasporanetwork.africa/dna/jaunelamarro';

const CORE_VALUES = [
  {
    numeral: '01',
    name: 'Unity',
    copy: 'Many origins, one mobilization. We build where diaspora effort compounds instead of scattering.',
  },
  {
    numeral: '02',
    name: 'Innovation',
    copy: 'We solve the coordination problem with real infrastructure, not goodwill and group chats.',
  },
  {
    numeral: '03',
    name: 'Impact',
    copy: 'Success is measured on the continent: work completed, capital moved, people reached.',
  },
];

const About = () => {
  useScrollToTop();
  const navigate = useNavigate();

  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);

  const { data: stats } = useStatCitations();
  const featuredStats = (stats ?? []).slice(0, 3);

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

      {/* Hero */}
      <section className="py-12 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-micro uppercase text-dna-copper mb-6">Our story</p>
          <img
            src={dnaLogo}
            alt="Diaspora Network of Africa"
            width={661}
            height={307}
            className="h-16 sm:h-20 w-auto mb-6"
          />
          <h1 className="text-display sm:text-hero font-serif text-foreground max-w-3xl mb-6">
            DNA is the mobilization infrastructure for the Global African Diaspora's return.
          </h1>
          <p className="text-h3 text-muted-foreground max-w-2xl leading-relaxed">
            Members connect, convene, collaborate, contribute and convey in one place, so
            diaspora talent, capital and expertise reach the continent as coordinated effort
            rather than scattered goodwill.
          </p>
        </div>
      </section>

      {/* Why DNA exists */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            <h2 className="text-h1 font-serif text-foreground">Why DNA exists</h2>
            <div className="lg:col-span-2 space-y-4 text-body text-muted-foreground leading-relaxed max-w-prose">
              <p>
                The diaspora is not short on will, skill or money. It is short on a place where
                those three meet a specific need at a specific time. A surgeon in Houston, a
                logistics operator in Lisbon and a fund manager in Nairobi can all want the same
                clinic built and never once be in the same room.
              </p>
              <p>
                Every attempt to fix that with a group chat, a spreadsheet or an annual conference
                runs out of energy before the work finishes. DNA exists so the effort survives the
                enthusiasm: needs are stated, work becomes a completable unit, and contribution is
                tracked to a result on the continent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission and Vision */}
      <section className="py-12 bg-muted/40 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-h2 font-serif text-foreground mb-3">Our mission</h3>
              <p className="text-body text-muted-foreground leading-relaxed">
                To create a unified platform that connects African diaspora professionals,
                entrepreneurs and innovators worldwide, so they can collaborate on work that
                drives sustainable development across Africa.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-h2 font-serif text-foreground mb-3">Our vision</h3>
              <p className="text-body text-muted-foreground leading-relaxed">
                A thriving ecosystem where the diaspora's collective knowledge, resources and
                passion become tangible solutions to Africa's most pressing challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the founder */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-micro uppercase text-dna-copper mb-4">Meet the founder</p>
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
            <div className="rounded-xl border border-border overflow-hidden bg-card">
              <img
                src="/lovable-uploads/02154efb-0abe-4ed4-b41f-265e4a856e8d.png"
                alt="Jaûne L. Odombrown, Founder and CEO of Diaspora Network of Africa"
                className="w-full aspect-square object-cover"
                loading="lazy"
              />
            </div>

            <div className="lg:col-span-2">
              <h2 className="text-display font-serif text-foreground mb-1">Jaûne L. Odombrown</h2>
              <p className="text-h3 text-dna-copper mb-6">Founder and Chief Executive Officer</p>

              <div className="space-y-4 text-body text-muted-foreground leading-relaxed max-w-prose">
                <p>
                  Jaûne is an ecosystem builder who has spent his career putting people who would
                  never have met in the same room, then keeping them there long enough to finish
                  something. He started DNA after watching that work stall for the same reason
                  every time: no shared place to hold it.
                </p>
                <p>
                  He leads DNA from the same conviction it was founded on. Diaspora members are
                  ready to build, and communities on the continent are ready to receive that
                  effort. What has been missing is the infrastructure between them.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button asChild variant="outline" className="touch-target justify-start">
                  <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="w-4 h-4 mr-2" />
                    Connect with Jaûne on LinkedIn
                  </a>
                </Button>
                <Button asChild variant="ghost" className="touch-target justify-start">
                  <a href={DNA_PROFILE_URL} target="_blank" rel="noopener noreferrer">
                    View his DNA profile
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>

              <figure className="mt-8 border-l border-dna-copper pl-5">
                <blockquote className="text-h3 font-serif italic text-foreground leading-relaxed max-w-prose">
                  "The African diaspora represents one of the world's most powerful yet
                  underutilized resources for positive change. By connecting our collective
                  knowledge, passion and resources, we can transform challenges into opportunities
                  and unlock Africa's limitless potential."
                </blockquote>
                <figcaption className="text-meta text-muted-foreground mt-3">
                  Jaûne L. Odombrown
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* Core values */}
      <section className="py-12 bg-muted/40 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-h1 font-serif text-foreground mb-8">Our core values</h2>
          <ol className="grid md:grid-cols-3 gap-6">
            {CORE_VALUES.map(({ numeral, name, copy }) => (
              <li
                key={name}
                className="rounded-xl border border-border bg-card p-6 transition-colors duration-150 hover:border-dna-copper"
              >
                <span className="text-micro text-dna-copper">{numeral}</span>
                <h3 className="text-h2 font-serif text-foreground mt-2 mb-2">{name}</h3>
                <p className="text-body text-muted-foreground leading-relaxed">{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-12 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-h1 font-serif text-foreground mb-4">Join the mobilization</h2>
          <p className="text-body text-muted-foreground leading-relaxed mb-6 max-w-prose">
            Membership is where the work happens. Request access and we will let you know the
            moment your place is open.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Button onClick={() => setIsJoinDialogOpen(true)} className="touch-target">
              Request access
            </Button>
          </div>
        </div>
      </section>


      <JoinDNADialog
        isOpen={isJoinDialogOpen}
        onClose={() => setIsJoinDialogOpen(false)}
        onTakeSurvey={() => setIsSurveyOpen(true)}
      />

      <SurveyDialog isOpen={isSurveyOpen} onClose={() => setIsSurveyOpen(false)} />

      <Footer />
    </div>
  );
};

export default About;
