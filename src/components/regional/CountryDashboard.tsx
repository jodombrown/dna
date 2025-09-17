import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, TrendingUp, Building2, Users, DollarSign, Zap, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CountryDashboardProps {
  countryName: string;
  onClose: () => void;
}

interface CountryData {
  id: string;
  name: string;
  capital: string;
  population: number;
  description: string;
  iso_code: string;
}

const CountryDashboard: React.FC<CountryDashboardProps> = ({ countryName, onClose }) => {
  const [countryData, setCountryData] = useState<CountryData | null>(null);
  const [economicData, setEconomicData] = useState<any[]>([]);
  const [innovationData, setInnovationData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCountryData();
  }, [countryName]);

  const fetchCountryData = async () => {
    try {
      setLoading(true);
      
      // Fetch basic country info
      const { data: country, error: countryError } = await supabase
        .from('countries')
        .select('*')
        .eq('name', countryName)
        .single();

      if (countryError) {
        console.error('Error fetching country:', countryError);
        return;
      }

      setCountryData(country);

      // Fetch economic indicators
      const { data: economic, error: economicError } = await supabase
        .from('economic_indicators')
        .select('*')
        .eq('country_id', country.id)
        .order('year', { ascending: false })
        .limit(10);

      if (!economicError) {
        setEconomicData(economic || []);
      }

      // Fetch innovation data
      const { data: innovation, error: innovationError } = await supabase
        .from('innovation_data')
        .select('*')
        .eq('country_id', country.id)
        .eq('featured', true)
        .limit(6);

      if (!innovationError) {
        setInnovationData(innovation || []);
      }
      
    } catch (error) {
      console.error('Error fetching country data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration when database is empty
  const mockEconomicData = [
    { indicator_type: 'GDP', value: 469, unit: 'B USD', year: 2024 },
    { indicator_type: 'GDP Growth', value: 3.8, unit: '%', year: 2024 },
    { indicator_type: 'Inflation', value: 2.1, unit: '%', year: 2024 },
    { indicator_type: 'FDI', value: 8.2, unit: 'B USD', year: 2024 }
  ];

  const mockInnovationData = [
    { name: 'Swvl', organization_type: 'startup', sector: 'Transportation', founded_year: 2017 },
    { name: 'MoneyFellows', organization_type: 'startup', sector: 'Fintech', founded_year: 2016 },
    { name: 'Fawry', organization_type: 'startup', sector: 'Payments', founded_year: 2008 },
    { name: 'Vezeeta', organization_type: 'startup', sector: 'Healthcare', founded_year: 2012 }
  ];

  const provinces = [
    { name: 'Greater Cairo', population: '20.9M', description: 'Capital metropolitan area' },
    { name: 'Alexandria', population: '5.2M', description: 'Mediterranean port city' },
    { name: 'Giza', population: '4.7M', description: 'Home to the Great Pyramids' },
    { name: 'Qalyubia', population: '5.6M', description: 'Industrial hub north of Cairo' }
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Loading country data...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-3">
              <span className="text-3xl">
                {countryName === 'Egypt' && '🇪🇬'}
                {countryName === 'Morocco' && '🇲🇦'}
                {countryName === 'Algeria' && '🇩🇿'}
                {countryName === 'Tunisia' && '🇹🇳'}
                {countryName === 'Libya' && '🇱🇾'}
                {countryName === 'Sudan' && '🇸🇩'}
              </span>
              {countryName}
            </CardTitle>
            <p className="text-muted-foreground">
              {countryData?.description || `Detailed insights for ${countryName}`}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="economic">Economic</TabsTrigger>
              <TabsTrigger value="innovation">Innovation</TabsTrigger>
              <TabsTrigger value="provinces">Provinces</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">Population</h3>
                    <p className="text-2xl font-bold">
                      {countryData?.population ? (countryData.population / 1000000).toFixed(0) + 'M' : '105M'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <MapPin className="h-8 w-8 text-secondary mx-auto mb-2" />
                    <h3 className="font-semibold">Capital</h3>
                    <p className="text-2xl font-bold">{countryData?.capital || 'Cairo'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Building2 className="h-8 w-8 text-accent mx-auto mb-2" />
                    <h3 className="font-semibold">ISO Code</h3>
                    <p className="text-2xl font-bold">{countryData?.iso_code || 'EG'}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="economic" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(economicData.length > 0 ? economicData : mockEconomicData).map((indicator, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <Badge variant="outline" className="text-xs">{indicator.year}</Badge>
                      </div>
                      <h4 className="font-semibold text-sm">{indicator.indicator_type}</h4>
                      <p className="text-xl font-bold">
                        {indicator.value}{indicator.unit}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="innovation" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(innovationData.length > 0 ? innovationData : mockInnovationData).map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <Badge variant="outline" className="text-xs">
                          {item.organization_type}
                        </Badge>
                      </div>
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.sector}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Founded: {item.founded_year}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="provinces" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                {provinces.map((province, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <Badge variant="outline" className="text-xs">
                          Province
                        </Badge>
                      </div>
                      <h4 className="font-semibold">{province.name}</h4>
                      <p className="text-sm text-muted-foreground">{province.description}</p>
                      <p className="text-lg font-bold mt-2">{province.population}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CountryDashboard;