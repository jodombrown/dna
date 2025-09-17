import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, TrendingUp, Users, MapPin, DollarSign, Building2, Zap } from 'lucide-react';
import UnifiedHeader from '@/components/UnifiedHeader';
import Footer from '@/components/Footer';
import NorthAfricaMap from '@/components/regional/NorthAfricaMap';
import CountryDashboard from '@/components/regional/CountryDashboard';
import DiasporaSection from '@/components/regional/DiasporaSection';
import MonthlyUpdateHub from '@/components/regional/MonthlyUpdateHub';
import NewsletterSignup from '@/components/regional/NewsletterSignup';

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <UnifiedHeader />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 text-sm font-medium">
              Regional Economic Hub
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              North Africa
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Discover the economic landscape, innovation ecosystem, and diaspora contributions 
              across North Africa's dynamic markets and emerging opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="group">
                Explore Regional Data
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg">
                Subscribe to Updates
              </Button>
            </div>
          </div>

          {/* Regional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {regionalStats.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {stat.trend}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                  <p className="text-sm font-medium text-foreground mb-1">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Regional Overview</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Click on any country to explore detailed economic indicators, innovation ecosystems, and diaspora insights.
            </p>
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Key Industries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {keyIndustries.map((industry, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">{industry}</span>
                        <Zap className="h-4 w-4 text-primary" />
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
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Country Snapshots</h2>
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