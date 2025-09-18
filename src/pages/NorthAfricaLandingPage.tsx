import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, TrendingUp, Users, MapPin, DollarSign, Building2, Zap, Globe, Star, Heart } from 'lucide-react';
import UnifiedHeader from '@/components/UnifiedHeader';
import Footer from '@/components/Footer';
import NorthAfricaMap from '@/components/regional/NorthAfricaMap';
import CountryDashboard from '@/components/regional/CountryDashboard';
import DiasporaSection from '@/components/regional/DiasporaSection';
import MonthlyUpdateHub from '@/components/regional/MonthlyUpdateHub';
import NewsletterSignup from '@/components/regional/NewsletterSignup';
import heroImage from '@/assets/north-africa-hero.jpg';
import diasporaImage from '@/assets/diaspora-connection.jpg';
import overviewImage from '@/assets/north-africa-overview.jpg';

const NorthAfricaLandingPage = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

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

  const keyIndustries = [
    'Energy & Mining',
    'Agriculture',
    'Tourism',
    'Manufacturing',
    'Technology',
    'Financial Services'
  ];

  const northAfricaCountries = [
    {
      name: 'Egypt',
      capital: 'Cairo',
      population: '105M',
      gdp: '$469B',
      flag: '🇪🇬',
      key_sectors: ['Technology', 'Tourism', 'Agriculture'],
      description: 'Ancient civilization meets modern innovation'
    },
    {
      name: 'Algeria',
      capital: 'Algiers', 
      population: '45M',
      gdp: '$151B',
      flag: '🇩🇿',
      key_sectors: ['Energy', 'Mining', 'Agriculture'],
      description: 'Largest country in Africa by land area'
    },
    {
      name: 'Morocco',
      capital: 'Rabat',
      population: '37M', 
      gdp: '$134B',
      flag: '🇲🇦',
      key_sectors: ['Manufacturing', 'Tourism', 'Agriculture'],
      description: 'Gateway between Africa and Europe'
    },
    {
      name: 'Sudan',
      capital: 'Khartoum',
      population: '45M',
      gdp: '$35B', 
      flag: '🇸🇩',
      key_sectors: ['Agriculture', 'Mining', 'Energy'],
      description: 'Crossroads of Africa and the Arab world'
    },
    {
      name: 'Tunisia',
      capital: 'Tunis',
      population: '12M',
      gdp: '$47B',
      flag: '🇹🇳', 
      key_sectors: ['Manufacturing', 'Tourism', 'Technology'],
      description: 'Birthplace of the Arab Spring'
    },
    {
      name: 'Libya',
      capital: 'Tripoli',
      population: '7M',
      gdp: '$25B',
      flag: '🇱🇾',
      key_sectors: ['Energy', 'Manufacturing', 'Agriculture'], 
      description: 'Oil-rich North African nation'
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

      {/* Interactive Map Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-north-africa-sand/20 to-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-6 w-6 bg-north-africa-terracotta rounded-full" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-dna-forest to-north-africa-desert bg-clip-text text-transparent">
                Regional Overview
              </h2>
              <div className="h-6 w-6 bg-north-africa-oasis rounded-full" />
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Click on any country to explore detailed economic indicators, innovation ecosystems, and diaspora insights.
            </p>
            
            {/* Overview Image */}
            <div className="mt-8 mb-12 relative rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
              <img 
                src={overviewImage} 
                alt="North Africa Economic Overview" 
                className="w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dna-forest/70 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-semibold">Economic Powerhouse</h3>
                <p className="text-sm opacity-90">6 countries, 251M people, $945B combined GDP</p>
              </div>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Map */}
            <div className="lg:col-span-2">
              <NorthAfricaMap 
                onCountrySelect={setSelectedCountry}
                selectedCountry={selectedCountry}
              />
            </div>
            
            {/* Key Industries */}
            <div>
              <Card className="border-dna-emerald/20 bg-gradient-to-br from-white to-dna-mint/10">
                <CardHeader className="border-b border-dna-emerald/10">
                  <CardTitle className="flex items-center gap-2 text-dna-forest">
                    <Building2 className="h-5 w-5 text-dna-emerald" />
                    Key Industries
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {keyIndustries.map((industry, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-north-africa-sand/30 to-dna-mint/20 rounded-lg hover:from-dna-emerald/10 hover:to-dna-copper/10 transition-all duration-300 group">
                        <span className="font-medium text-dna-forest group-hover:text-dna-emerald transition-colors">{industry}</span>
                        <Zap className="h-4 w-4 text-dna-copper group-hover:text-dna-emerald transition-colors" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Countries Grid */}
      <section className="py-16 px-4 bg-gradient-to-br from-north-africa-sand/10 via-background to-dna-mint/5">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-dna-forest to-dna-emerald bg-clip-text text-transparent">
              Country Snapshots
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Detailed economic indicators and innovation highlights from across the region.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {northAfricaCountries.map((country, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedCountry(country.name)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{country.flag}</span>
                      <div>
                        <CardTitle className="text-lg">{country.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{country.capital}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Population</p>
                      <p className="font-semibold">{country.population}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">GDP</p>
                      <p className="font-semibold">{country.gdp}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{country.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {country.key_sectors.map((sector, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

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

      <Footer />
    </div>
  );
};

export default NorthAfricaLandingPage;