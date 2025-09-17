import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, CheckCircle, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NewsletterSignupProps {
  region: string;
}

const NewsletterSignup: React.FC<NewsletterSignupProps> = ({ region }) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [subscriptionType, setSubscriptionType] = useState('monthly');
  const [countryInterests, setCountryInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const northAfricaCountries = [
    { name: 'Egypt', flag: '🇪🇬' },
    { name: 'Morocco', flag: '🇲🇦' },
    { name: 'Algeria', flag: '🇩🇿' },
    { name: 'Tunisia', flag: '🇹🇳' },
    { name: 'Libya', flag: '🇱🇾' },
    { name: 'Sudan', flag: '🇸🇩' }
  ];

  const handleCountryInterestChange = (countryName: string, checked: boolean) => {
    if (checked) {
      setCountryInterests(prev => [...prev, countryName]);
    } else {
      setCountryInterests(prev => prev.filter(name => name !== countryName));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !fullName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get region ID for North Africa
      const { data: regionData, error: regionError } = await supabase
        .from('regions')
        .select('id')
        .eq('name', 'North Africa')
        .single();

      if (regionError) {
        throw regionError;
      }

      // Get country IDs for selected countries
      let countryIds: string[] = [];
      if (countryInterests.length > 0) {
        const { data: countriesData, error: countriesError } = await supabase
          .from('countries')
          .select('id')
          .in('name', countryInterests);

        if (!countriesError && countriesData) {
          countryIds = countriesData.map(country => country.id);
        }
      }

      // Insert newsletter subscription
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert({
          email,
          full_name: fullName,
          region_interest: regionData.id,
          country_interests: countryIds.length > 0 ? countryIds : null,
          subscription_type: subscriptionType,
          is_active: true
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already Subscribed",
            description: "You're already subscribed to our newsletter!",
            variant: "default"
          });
        } else {
          throw error;
        }
      } else {
        setIsSubscribed(true);
        toast({
          title: "Successfully Subscribed!",
          description: "You'll receive our next North Africa update soon.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      toast({
        title: "Subscription Failed",
        description: "Please try again later or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubscribed) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <Card className="text-center bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
            <CardContent className="p-8">
              <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Welcome to the {region} Network!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for subscribing. You'll receive our {subscriptionType} updates featuring:
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">Economic Insights</p>
                </div>
                <div className="text-center">
                  <Mail className="h-8 w-8 text-secondary mx-auto mb-2" />
                  <p className="text-sm font-medium">Innovation Updates</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="text-sm font-medium">Diaspora Stories</p>
                </div>
              </div>
              <Button variant="outline">
                Share with Your Network
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Stay Connected</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get monthly insights, economic updates, and diaspora stories from {region} 
            delivered directly to your inbox.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-primary" />
              Subscribe to {region} Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscription-type">Update Frequency</Label>
                <Select value={subscriptionType} onValueChange={setSubscriptionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly Updates</SelectItem>
                    <SelectItem value="quarterly">Quarterly Reports</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Country Interests (Optional)</Label>
                <p className="text-sm text-muted-foreground">
                  Select countries you're most interested in receiving updates about:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {northAfricaCountries.map((country) => (
                    <div key={country.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={country.name}
                        checked={countryInterests.includes(country.name)}
                        onCheckedChange={(checked) => 
                          handleCountryInterestChange(country.name, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={country.name} 
                        className="text-sm flex items-center gap-2 cursor-pointer"
                      >
                        <span>{country.flag}</span>
                        {country.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What you'll receive:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Economic indicators and market analysis</li>
                  <li>• Innovation ecosystem updates and startup spotlights</li>
                  <li>• Political developments and policy changes</li>
                  <li>• Diaspora success stories and investment opportunities</li>
                  <li>• Exclusive insights and networking events</li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe to Updates'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By subscribing, you agree to receive updates from Diaspora Network Africa. 
                You can unsubscribe at any time.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default NewsletterSignup;