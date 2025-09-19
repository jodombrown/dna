import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Filter, GitCompare, Download, Eye, TrendingUp, Users, DollarSign, Building2 } from 'lucide-react';
import NorthAfricaMap from './NorthAfricaMap';

interface RegionalDataHubProps {
  onCountrySelect: (country: string) => void;
  onIndustrySelect: (industry: string) => void;
  selectedCountry: string | null;
  selectedPathway?: string;
}

const RegionalDataHub: React.FC<RegionalDataHubProps> = ({ 
  onCountrySelect, 
  onIndustrySelect, 
  selectedCountry,
  selectedPathway 
}) => {
  const [filterBy, setFilterBy] = useState<string>('all');
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  // Dynamic stats based on selected pathway
  const getPathwayStats = () => {
    const baseStats = [
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

    // Customize stats based on pathway
    if (selectedPathway === 'investor') {
      baseStats[2] = {
        icon: TrendingUp,
        label: 'Investment ROI Avg',
        value: '18.5%',
        trend: '+4.2%',
        description: 'Annual returns'
      };
    } else if (selectedPathway === 'entrepreneur') {
      baseStats[3] = {
        icon: Building2,
        label: 'Startup Success Rate',
        value: '67%',
        trend: '+12%',
        description: '3-year survival'
      };
    }

    return baseStats;
  };

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
      diasporaSize: '8.2M',
      investmentPotential: 'High',
      key_sectors: ['Technology', 'Tourism', 'Agriculture'],
      description: 'Ancient civilization meets modern innovation'
    },
    {
      name: 'Algeria',
      capital: 'Algiers', 
      population: '45M',
      gdp: '$151B',
      flag: '🇩🇿',
      diasporaSize: '1.8M',
      investmentPotential: 'Medium',
      key_sectors: ['Energy', 'Mining', 'Agriculture'],
      description: 'Largest country in Africa by land area'
    },
    {
      name: 'Morocco',
      capital: 'Rabat',
      population: '37M', 
      gdp: '$134B',
      flag: '🇲🇦',
      diasporaSize: '5.1M',
      investmentPotential: 'High',
      key_sectors: ['Manufacturing', 'Tourism', 'Agriculture'],
      description: 'Gateway between Africa and Europe'
    },
    {
      name: 'Sudan',
      capital: 'Khartoum',
      population: '45M',
      gdp: '$35B', 
      flag: '🇸🇩',
      diasporaSize: '2.3M',
      investmentPotential: 'Emerging',
      key_sectors: ['Agriculture', 'Mining', 'Energy'],
      description: 'Crossroads of Africa and the Arab world'
    },
    {
      name: 'Tunisia',
      capital: 'Tunis',
      population: '12M',
      gdp: '$47B',
      flag: '🇹🇳',
      diasporaSize: '1.2M',
      investmentPotential: 'Medium',
      key_sectors: ['Manufacturing', 'Tourism', 'Technology'],
      description: 'Birthplace of the Arab Spring'
    },
    {
      name: 'Libya',
      capital: 'Tripoli',
      population: '7M',
      gdp: '$25B',
      flag: '🇱🇾',
      diasporaSize: '0.8M',
      investmentPotential: 'Emerging',
      key_sectors: ['Energy', 'Manufacturing', 'Agriculture'], 
      description: 'Oil-rich North African nation'
    }
  ];

  const handleCountryToggle = (countryName: string) => {
    if (compareMode) {
      setSelectedCountries(prev => 
        prev.includes(countryName) 
          ? prev.filter(c => c !== countryName)
          : [...prev, countryName].slice(0, 3) // Max 3 countries
      );
    } else {
      onCountrySelect(countryName);
    }
  };

  const filteredCountries = northAfricaCountries.filter(country => {
    if (filterBy === 'all') return true;
    if (filterBy === 'high-investment') return country.investmentPotential === 'High';
    if (filterBy === 'large-diaspora') return parseFloat(country.diasporaSize) > 3;
    return true;
  });

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-north-africa-sand/20 to-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-6 w-6 bg-north-africa-terracotta rounded-full" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-dna-forest to-north-africa-desert bg-clip-text text-transparent">
              Interactive Data Hub
            </h2>
            <div className="h-6 w-6 bg-north-africa-oasis rounded-full" />
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore economic indicators, market opportunities, and diaspora insights with advanced filtering and comparison tools.
          </p>
        </div>

        {/* Smart Controls */}
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-dna-emerald/20">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="high-investment">High Investment Potential</SelectItem>
                  <SelectItem value="large-diaspora">Large Diaspora Population</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant={compareMode ? "default" : "outline"}
                onClick={() => setCompareMode(!compareMode)}
                className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
              >
                <GitCompare className="h-4 w-4 mr-2" />
                {compareMode ? 'Exit Compare' : 'Compare Mode'}
              </Button>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Trends
              </Button>
            </div>
          </div>

          {compareMode && selectedCountries.length > 0 && (
            <div className="mt-4 p-4 bg-dna-emerald/10 rounded-lg">
              <p className="text-sm font-medium text-dna-forest mb-2">
                Comparing: {selectedCountries.join(', ')} ({selectedCountries.length}/3)
              </p>
              <Button size="sm" className="bg-dna-emerald hover:bg-dna-emerald/90">
                Generate Comparison Report
              </Button>
            </div>
          )}
        </div>

        {/* Regional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {getPathwayStats().map((stat, index) => (
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Interactive Map */}
          <div className="lg:col-span-2">
            <Card className="border-dna-emerald/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-dna-forest">
                  <Building2 className="h-5 w-5 text-dna-emerald" />
                  Regional Map & Country Selector
                </CardTitle>
                {compareMode && (
                  <Badge variant="secondary" className="w-fit">
                    Click countries to compare (max 3)
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <NorthAfricaMap 
                  onCountrySelect={handleCountryToggle}
                  selectedCountry={selectedCountry}
                  compareMode={compareMode}
                  selectedCountries={selectedCountries}
                />
              </CardContent>
            </Card>
          </div>

          {/* Key Industries & Tools */}
          <div className="space-y-6">
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
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-north-africa-sand/30 to-dna-mint/20 rounded-lg hover:from-dna-emerald/10 hover:to-dna-copper/10 transition-all duration-300 group cursor-pointer hover:shadow-md"
                      onClick={() => onIndustrySelect(industry)}
                    >
                      <span className="font-medium text-dna-forest group-hover:text-dna-emerald transition-colors">{industry}</span>
                      <ArrowRight className="h-4 w-4 text-dna-copper group-hover:text-dna-emerald transition-colors" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Diaspora Quick Stats */}
            <Card className="border-dna-copper/20 bg-gradient-to-br from-white to-dna-copper/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-dna-forest text-sm">
                  <Users className="h-4 w-4 text-dna-copper" />
                  Diaspora at a Glance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Diaspora</span>
                    <span className="font-semibold text-dna-forest">19.4M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Annual Remittances</span>
                    <span className="font-semibold text-dna-forest">$28.7B</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Investments</span>
                    <span className="font-semibold text-dna-forest">$4.2B</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filtered Countries Grid */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-dna-forest">
              Country Deep Dive {filterBy !== 'all' && `(${filteredCountries.length} filtered)`}
            </h3>
            {selectedPathway && (
              <Badge variant="outline" className="border-dna-emerald text-dna-emerald">
                Optimized for {selectedPathway}s
              </Badge>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCountries.map((country, index) => (
              <Card 
                key={index} 
                className={`group hover:shadow-lg transition-all duration-300 cursor-pointer ${
                  compareMode && selectedCountries.includes(country.name) 
                    ? 'ring-2 ring-dna-emerald bg-dna-emerald/5' 
                    : ''
                }`}
                onClick={() => handleCountryToggle(country.name)}
              >
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
                    <div>
                      <p className="text-sm text-muted-foreground">Diaspora Size</p>
                      <p className="font-semibold">{country.diasporaSize}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Investment Potential</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          country.investmentPotential === 'High' ? 'border-green-500 text-green-700' :
                          country.investmentPotential === 'Medium' ? 'border-yellow-500 text-yellow-700' :
                          'border-blue-500 text-blue-700'
                        }`}
                      >
                        {country.investmentPotential}
                      </Badge>
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
      </div>
    </section>
  );
};

export default RegionalDataHub;