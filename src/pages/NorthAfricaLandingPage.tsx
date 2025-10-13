import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, TrendingUp, Users, DollarSign, Building2 } from 'lucide-react';
import UnifiedHeader from '@/components/UnifiedHeader';
import Footer from '@/components/Footer';
import CountryDashboard from '@/components/regional/CountryDashboard';
import DiasporaSection from '@/components/regional/DiasporaSection';
import MonthlyUpdateHub from '@/components/regional/MonthlyUpdateHub';
import NewsletterSignup from '@/components/regional/NewsletterSignup';
import IndustrySidebar from '@/components/regional/IndustrySidebar';
import DiasporaPathways from '@/components/regional/DiasporaPathways';
import RegionalDataHub from '@/components/regional/RegionalDataHub';
import CulturalNarrative from '@/components/regional/CulturalNarrative';
import heroImage from '@/assets/north-africa-hero.jpg';

const NorthAfricaLandingPage = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedPathway, setSelectedPathway] = useState<string | null>(null);

  // Regional overview stats
  const regionalStats = [
    { 
      icon: Users, 
      label: 'Total Population', 
      value: '251M', 
      trend: '+2.1%',
      description: 'Across 6 countries'
    },
    { 
      icon: DollarSign, 
      label: 'Combined GDP', 
      value: '$945B', 
      trend: '+3.8%',
      description: '2024 projection'
    },
    { 
      icon: TrendingUp, 
      label: 'FDI Inflows', 
      value: '$12.4B', 
      trend: '+15.2%',
      description: 'Year over year'
    },
    { 
      icon: Building2, 
      label: 'Active Startups', 
      value: '2,847', 
      trend: '+28%',
      description: 'Tech ecosystem growth'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-north-africa-sand/10 to-background">
      <UnifiedHeader />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(24, 60, 46, 0.7), rgba(24, 60, 46, 0.4)), url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        />
        
        {/* DNA Brand Pattern Overlay */}
        <div className="absolute inset-0 z-1">
          <div className="h-full w-full opacity-20 bg-gradient-to-r from-dna-emerald/30 via-transparent to-dna-copper/30" />
        </div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-12">
            {/* DNA Brand Badge */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <Badge variant="secondary" className="bg-dna-forest/90 text-white border-dna-emerald">
                DNA Regional Hub
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-2xl">
              <span className="bg-gradient-to-r from-dna-emerald via-north-africa-oasis to-dna-copper bg-clip-text text-transparent">
                North Africa
              </span>
            </h1>
            
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8 drop-shadow-lg">
              Explore dynamic markets, cutting-edge innovation ecosystems, and powerful diaspora contributions 
              shaping the region's economic transformation and global opportunities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="group bg-dna-emerald hover:bg-dna-emerald/90 text-white border-0">
                Explore Regional Data
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                <Heart className="mr-2 h-4 w-4" />
                Subscribe to Updates
              </Button>
            </div>
          </div>

          {/* Regional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {regionalStats.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 bg-white/95 backdrop-blur-sm border-white/20">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-dna-emerald to-dna-copper" />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-dna-emerald/10 rounded-lg group-hover:bg-dna-emerald/20 transition-colors">
                      <stat.icon className="h-6 w-6 text-dna-emerald" />
                    </div>
                    <Badge variant="secondary" className="text-xs bg-dna-forest text-white">
                      {stat.trend}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold mb-1 text-dna-forest">{stat.value}</h3>
                  <p className="text-sm font-medium text-dna-forest/80 mb-1">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Diaspora Pathways */}
      <DiasporaPathways onPathwaySelect={setSelectedPathway} />

      {/* Cultural Narrative */}
      <CulturalNarrative />

      {/* Interactive Data Hub */}
      <RegionalDataHub 
        onCountrySelect={setSelectedCountry}
        onIndustrySelect={setSelectedIndustry}
        selectedCountry={selectedCountry}
        selectedPathway={selectedPathway}
      />

      {/* Country Dashboard */}
      {selectedCountry && (
        <CountryDashboard 
          countryName={selectedCountry}
          onClose={() => setSelectedCountry(null)}
        />
      )}

      {/* Diaspora Section */}
      <DiasporaSection region="North Africa" />

      {/* Monthly Update Hub */}
      <MonthlyUpdateHub region="North Africa" />

      {/* Newsletter Signup */}
      <NewsletterSignup region="North Africa" />

      {/* Industry Sidebar */}
      <IndustrySidebar 
        industry={selectedIndustry}
        onClose={() => setSelectedIndustry(null)}
      />

      <Footer />
    </div>
  );
};

export default NorthAfricaLandingPage;