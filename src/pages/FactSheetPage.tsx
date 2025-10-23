import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, Share2, Users, Target, Sparkles, TrendingUp, Globe, Heart } from 'lucide-react';
import UnifiedHeader from '@/components/UnifiedHeader';

const FactSheetPage = () => {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DNA Platform - Fact Sheet',
          text: 'Discover the Diaspora Network of Africa - mobilizing talent, capital, and expertise for systemic change.',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <UnifiedHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl pt-24">
        {/* Header Actions */}
        <div className="flex justify-end gap-3 mb-6 print:hidden">
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="text-6xl font-bold bg-gradient-to-r from-dna-forest via-dna-emerald to-dna-copper bg-clip-text text-transparent">
              DNA
            </div>
            <div className="text-sm font-semibold text-muted-foreground tracking-widest">
              DIASPORA NETWORK OF AFRICA
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Platform Fact Sheet
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Mobilizing the African Diaspora to drive systemic change through innovation and entrepreneurship
          </p>
        </div>

        <Separator className="mb-12" />

        {/* Executive Summary */}
        <Card className="p-8 mb-8 bg-card border-2">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-dna-copper" />
            Executive Summary
          </h2>
          <div className="space-y-4 text-lg text-foreground/90">
            <p>
              The Global African Diaspora holds extraordinary power - skills honed across continents, networks spanning the globe, knowledge bridging cultures, resources waiting to be channeled, and capital seeking meaningful impact. Yet this power remains <strong>scattered, underutilized, disconnected</strong> from the continent's urgent needs and boundless potential.
            </p>
            <p>
              The <strong>Diaspora Network of Africa (DNA)</strong> exists to change this. Founded by <a href="https://www.linkedin.com/in/jaunelamarr/" target="_blank" rel="noopener noreferrer" className="text-dna-copper hover:text-dna-gold underline font-semibold">Jaune Odombrown</a>, an ecosystem builder and entrepreneur, we are building the digital mobilization engine that transforms scattered strength into collective power.
            </p>
          </div>
        </Card>

        {/* Who We Are */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Users className="h-8 w-8 text-dna-emerald" />
            Who We Are
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-card/50">
              <h3 className="text-xl font-bold mb-3 text-dna-forest">Our Mission</h3>
              <p className="text-foreground/80">
                To mobilize the Global African Diaspora's collective power—skills, networks, knowledge, resources, and capital—into coordinated action that accelerates Africa's progress and prosperity.
              </p>
            </Card>
            <Card className="p-6 bg-card/50">
              <h3 className="text-xl font-bold mb-3 text-dna-forest">Our Vision</h3>
              <p className="text-foreground/80">
                A world where the African Diaspora operates as Africa's most powerful distributed asset—seamlessly connected, purposefully convened, actively collaborating, meaningfully contributing, and amplifying impact that transforms the continent and uplifts our global community.
              </p>
            </Card>
          </div>
          
          <Card className="p-6 mt-6 bg-gradient-to-br from-dna-forest/5 to-dna-emerald/5 border-2 border-dna-emerald/20">
            <h3 className="text-xl font-bold mb-3 text-dna-forest">Our Values</h3>
            <div className="grid md:grid-cols-3 gap-4 text-foreground/80">
              <div>
                <strong className="text-dna-copper">Ubuntu:</strong> We believe in collective humanity and interconnectedness
              </div>
              <div>
                <strong className="text-dna-copper">Sankofa:</strong> We honor our past while building our future
              </div>
              <div>
                <strong className="text-dna-copper">Excellence:</strong> We pursue entrepreneurial excellence grounded in cultural authenticity
              </div>
            </div>
          </Card>
        </section>

        <Separator className="mb-12" />

        {/* What We Do - The 5 Cs */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Target className="h-8 w-8 text-dna-copper" />
            Our Methodology: The 5 Cs Cycle
          </h2>
          <p className="text-lg text-foreground/90 mb-8">
            This is not a linear process. It's a <strong>living, breathing ecosystem</strong> where each action amplifies the next, creating an upward spiral of impact:
          </p>
          
          <div className="space-y-6">
            <Card className="p-6 border-l-4 border-l-dna-emerald bg-gradient-to-r from-dna-emerald/5 to-transparent">
              <h3 className="text-2xl font-bold mb-3 text-dna-forest">1. CONNECT - Building the Network of Possibility</h3>
              <p className="text-foreground/80 leading-relaxed">
                We start by linking diaspora members to each other and to opportunities across Africa. Every entrepreneur in Atlanta is connected to an innovator in Lagos. Every investor in London is linked to a project in Accra. Every technologist in Toronto finds their counterpart in Nairobi. <strong>Connection is our foundation</strong> - the threads that weave our scattered strength into collective power.
              </p>
            </Card>

            <Card className="p-6 border-l-4 border-l-dna-copper bg-gradient-to-r from-dna-copper/5 to-transparent">
              <h3 className="text-2xl font-bold mb-3 text-dna-forest">2. CONVENE - Gathering Around Shared Purpose</h3>
              <p className="text-foreground/80 leading-relaxed">
                From individual connections, we create intentional gatherings - digital and physical spaces where the diaspora comes together around Africa's priorities. We convene around sectors (tech, agriculture, healthcare), around challenges (infrastructure, education, climate), and around opportunities (market entry, investment, innovation). <strong>Purpose transforms strangers into collaborators.</strong>
              </p>
            </Card>

            <Card className="p-6 border-l-4 border-l-dna-gold bg-gradient-to-r from-dna-gold/5 to-transparent">
              <h3 className="text-2xl font-bold mb-3 text-dna-forest">3. COLLABORATE - Co-Creating Solutions</h3>
              <p className="text-foreground/80 leading-relaxed">
                When we gather with purpose, collaboration ignites. Diaspora expertise merges with continental insight. Resources meet needs. Ideas become strategies. This is where the architect in Canada designs with the builder in Rwanda. Where the investor in Dubai funds the entrepreneur in Kampala. <strong>Where collective intelligence surpasses what any individual could achieve alone.</strong>
              </p>
            </Card>

            <Card className="p-6 border-l-4 border-l-dna-emerald bg-gradient-to-r from-dna-emerald/5 to-transparent">
              <h3 className="text-2xl font-bold mb-3 text-dna-forest">4. CONTRIBUTE - Mobilizing Our Assets</h3>
              <p className="text-foreground/80 leading-relaxed">
                Collaboration unlocks contribution. Each person brings their unique value - a skill shared, knowledge transferred, a network opened, capital deployed, time invested. <strong>Contributions aren't charity; they're investments in our collective future.</strong> Every contribution strengthens the whole, proving that Africa's progress is the diaspora's progress.
              </p>
            </Card>

            <Card className="p-6 border-l-4 border-l-dna-copper bg-gradient-to-r from-dna-copper/5 to-transparent">
              <h3 className="text-2xl font-bold mb-3 text-dna-forest">5. CONVEY - Amplifying Impact and Inspiring Action</h3>
              <p className="text-foreground/80 leading-relaxed">
                We share our stories, broadcast our successes, communicate our learnings, and showcase our impact. When we convey what we've built together, we inspire others to join. Each story shared creates new connections. Every success broadcast brings new collaborators. <strong>The cycle begins again - stronger, wider, deeper.</strong>
              </p>
            </Card>
          </div>

          {/* The Spiral Effect */}
          <Card className="p-8 mt-8 bg-gradient-to-br from-dna-forest/10 via-dna-emerald/10 to-dna-copper/10 border-2 border-dna-copper/30">
            <h3 className="text-2xl font-bold mb-4 text-dna-forest flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-dna-copper" />
              The Spiral Effect
            </h3>
            <p className="text-lg text-foreground/90 mb-4">
              This isn't a one-time journey from Connect to Convey. It's a <strong>perpetual spiral</strong>:
            </p>
            <ul className="space-y-2 text-foreground/80 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-dna-copper mt-1">•</span>
                <span>Every story conveyed creates new connections</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-dna-copper mt-1">•</span>
                <span>Every contribution strengthens collaboration</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-dna-copper mt-1">•</span>
                <span>Every collaboration makes convenings more powerful</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-dna-copper mt-1">•</span>
                <span>Every convening deepens our connections</span>
              </li>
            </ul>
            <p className="text-lg text-foreground/90 mt-6 font-semibold">
              With each revolution, we grow stronger. More connected. More capable. More impactful.
            </p>
          </Card>
        </section>

        <Separator className="mb-12" />

        {/* Why It Matters */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Globe className="h-8 w-8 text-dna-gold" />
            Why It Matters: The Opportunity
          </h2>
          
          <Card className="p-8 bg-gradient-to-br from-dna-forest/10 to-dna-emerald/10 border-2 border-dna-forest/20 mb-6">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-dna-copper mb-2">200M+</div>
                <div className="text-sm font-semibold text-muted-foreground">African Diasporans Worldwide</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-dna-emerald mb-2">$200B+</div>
                <div className="text-sm font-semibold text-muted-foreground">Annual Diaspora Remittances</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-dna-gold mb-2">$3.4T</div>
                <div className="text-sm font-semibold text-muted-foreground">Africa's GDP by 2030</div>
              </div>
            </div>
          </Card>

          <div className="space-y-4 text-lg text-foreground/90">
            <p>
              The African diaspora represents one of the world's most underutilized resources for development. With over <strong>200 million people</strong> globally, diasporans possess incredible talent, capital, networks, and expertise.
            </p>
            <p>
              However, this potential remains <strong>fragmented and uncoordinated</strong>. DNA solves this by creating the first comprehensive platform that turns individual efforts into collective impact, transforming scattered contributions into systemic change.
            </p>
            <p>
              By 2030, Africa is projected to be the world's fastest-growing economic region. DNA positions diasporans to be at the forefront of this transformation, not as observers, but as <strong>architects of Africa's future</strong>.
            </p>
          </div>
        </section>

        <Separator className="mb-12" />

        {/* How We're Different */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-dna-emerald" />
            How We're Different: Our Positioning
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-card/50">
              <h3 className="text-xl font-bold mb-3 text-dna-copper">Diaspora-First Design</h3>
              <p className="text-foreground/80">
                Built specifically for African diaspora needs, not a generic networking platform. Every feature addresses real diaspora challenges and opportunities.
              </p>
            </Card>

            <Card className="p-6 bg-card/50">
              <h3 className="text-xl font-bold mb-3 text-dna-copper">Systems-Change Focus</h3>
              <p className="text-foreground/80">
                We don't just connect people—we mobilize coordinated action for transformative impact. From individual connections to collective movements.
              </p>
            </Card>

            <Card className="p-6 bg-card/50">
              <h3 className="text-xl font-bold mb-3 text-dna-copper">Cultural Intelligence</h3>
              <p className="text-foreground/80">
                Rooted in African values (Ubuntu, Sankofa) and designed with cultural authenticity. Technology that honors heritage while embracing innovation.
              </p>
            </Card>

            <Card className="p-6 bg-card/50">
              <h3 className="text-xl font-bold mb-3 text-dna-copper">Action-Oriented Platform</h3>
              <p className="text-foreground/80">
                Beyond networking: real opportunities, project collaboration, impact tracking, and tangible outcomes. Connection with purpose and results.
              </p>
            </Card>
          </div>

          <Card className="p-6 mt-6 bg-gradient-to-r from-dna-copper/10 to-dna-gold/10 border-2 border-dna-copper/20">
            <h3 className="text-xl font-bold mb-3 text-dna-forest">Our Promise</h3>
            <p className="text-foreground/90 mb-3">
              We are not building a database. <strong>We are building a movement with a digital mobilization engine.</strong> We are not creating a network. We are mobilizing a force for transformation.
            </p>
            <p className="text-foreground/90">
              DNA will make connection frictionless, convening purposeful, collaboration productive, contribution meaningful, and impact visible.
            </p>
          </Card>
        </section>

        <Separator className="mb-12" />

        {/* Call to Action for Different Stakeholders */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Heart className="h-8 w-8 text-dna-copper" />
            Join the Movement
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center bg-gradient-to-br from-dna-emerald/5 to-dna-forest/5 border-2 hover:border-dna-emerald/50 transition-all">
              <div className="mb-4">
                <Users className="h-12 w-12 mx-auto text-dna-emerald" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-dna-forest">For Users</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Join thousands of diasporans building Africa's future
              </p>
              <Button className="w-full" variant="default">
                Sign Up Today
              </Button>
            </Card>

            <Card className="p-6 text-center bg-gradient-to-br from-dna-copper/5 to-dna-gold/5 border-2 hover:border-dna-copper/50 transition-all">
              <div className="mb-4">
                <Target className="h-12 w-12 mx-auto text-dna-copper" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-dna-forest">For Partners</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Collaborate with us to amplify your impact
              </p>
              <Button className="w-full" variant="secondary">
                Explore Partnership
              </Button>
            </Card>

            <Card className="p-6 text-center bg-gradient-to-br from-dna-gold/5 to-dna-copper/5 border-2 hover:border-dna-gold/50 transition-all">
              <div className="mb-4">
                <Sparkles className="h-12 w-12 mx-auto text-dna-gold" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-dna-forest">For Investors</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Support the platform enabling diaspora-driven change
              </p>
              <Button className="w-full" variant="outline">
                Learn More
              </Button>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">
            Diaspora Network of Africa &copy; {new Date().getFullYear()} | Building the infrastructure for systemic change
          </p>
          <p className="text-xs mt-2">
            Contact: <a href="/contact" className="text-dna-copper hover:underline">Get in Touch</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FactSheetPage;