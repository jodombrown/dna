import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckCircle, XCircle, Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon',
  'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt',
  'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
  'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar',
  'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia',
  'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
  'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan',
  'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania',
  'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal',
  'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea',
  'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
  'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela',
  'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isCheckingAdminStatus, setIsCheckingAdminStatus] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: user?.email || '',
    location: '',
    username: ''
  });
  
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [suggestedUsernames, setSuggestedUsernames] = useState<string[]>([]);
  const [locationOpen, setLocationOpen] = useState(false);

  // Check if user is an admin on mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.email) {
        setIsCheckingAdminStatus(false);
        return;
      }

      // Check if user has diasporanetwork.africa email
      if (user.email.endsWith('@diasporanetwork.africa')) {
        try {
          // Check if user is already in admin_users table
          const { data: adminUser, error } = await supabase
            .from('admin_users')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            console.error('Admin check error:', error);
            setIsCheckingAdminStatus(false);
            return;
          }

          if (adminUser) {
            // User is already an admin, redirect to admin dashboard
            toast({
              title: "Welcome Admin!",
              description: "Redirecting to admin dashboard...",
            });
            navigate('/admin');
            return;
          }

          // User has diasporanetwork.africa email but not in admin table yet
          // The trigger should handle this automatically, but let's wait a moment
          setTimeout(() => {
            toast({
              title: "Admin Access Granted!",
              description: "Welcome to the DNA admin panel.",
            });
            navigate('/admin');
          }, 1000);
          return;
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
      
      setIsCheckingAdminStatus(false);
    };

    checkAdminStatus();
  }, [user, navigate, toast]);

  // Generate username suggestions based on full name
  const generateUsernameSuggestions = (name: string) => {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const nameParts = name.toLowerCase().split(' ').filter(part => part.length > 0);
    
    const suggestions = [];
    
    if (nameParts.length >= 2) {
      // firstname.lastname
      suggestions.push(nameParts.join('.'));
      // firstnamelastname
      suggestions.push(nameParts.join(''));
      // firstname_lastname
      suggestions.push(nameParts.join('_'));
      // firstname-lastname
      suggestions.push(nameParts.join('-'));
      // firstinitiallastname
      suggestions.push(nameParts[0][0] + nameParts[nameParts.length - 1]);
    }
    
    // Add number variations
    suggestions.forEach(base => {
      suggestions.push(base + '1');
      suggestions.push(base + '2');
      suggestions.push(base + '3');
    });
    
    return suggestions.slice(0, 6); // Return first 6 suggestions
  };

  // Check if username is available
  const checkUsername = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    
    // Validate username format
    const isValid = /^[a-z0-9._-]+$/.test(username);
    if (!isValid) {
      setUsernameStatus('idle');
      return;
    }
    
    setUsernameStatus('checking');
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .maybeSingle();
      
      if (error) {
        console.error('Username check error:', error);
        setUsernameStatus('idle');
        return;
      }
      
      if (data) {
        setUsernameStatus('taken');
        // Generate suggestions when username is taken
        const suggestions = generateUsernameSuggestions(formData.full_name);
        const availableSuggestions = [];
        
        for (const suggestion of suggestions) {
          const { data: existingUser } = await supabase
            .from('users')
            .select('username')
            .eq('username', suggestion)
            .maybeSingle();
          
          if (!existingUser) {
            availableSuggestions.push(suggestion);
          }
        }
        
        setSuggestedUsernames(availableSuggestions);
      } else {
        setUsernameStatus('available');
        setSuggestedUsernames([]);
      }
    } catch (error) {
      console.error('Username check error:', error);
      setUsernameStatus('idle');
    }
  };

  // Debounced username checking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.username) {
        checkUsername(formData.username);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  const handleInputChange = (field: string, value: string) => {
    if (field === 'username') {
      // Ensure username is lowercase and contains only allowed characters
      value = value.toLowerCase().replace(/[^a-z0-9._-]/g, '');
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUsernameSelect = (username: string) => {
    setFormData(prev => ({
      ...prev,
      username
    }));
    setUsernameStatus('available');
    setSuggestedUsernames([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (usernameStatus !== 'available') {
      toast({
        title: "Username required",
        description: "Please choose an available username.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // Insert into users table
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          full_name: formData.full_name,
          email: formData.email,
          location: formData.location,
          username: formData.username,
          role: 'individual'
        }]);

      if (userError) {
        throw userError;
      }

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          email: formData.email,
          location: formData.location,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      toast({
        title: "Welcome to DNA!",
        description: "Now let's complete your profile setup."
      });

      navigate('/profile/setup');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking admin status
  if (isCheckingAdminStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Card className="shadow-xl">
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-dna-emerald mx-auto mb-4" />
                <p className="text-gray-600">Setting up your account...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-dna-forest mb-2">
              Complete Your DNA Profile
            </CardTitle>
            <p className="text-gray-600">
              Just a few details to get you started
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={!!user?.email}
                />
                {user?.email && (
                  <p className="text-sm text-gray-500">Email is pre-filled from your account</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Current Location</Label>
                <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={locationOpen}
                      className="w-full justify-between"
                    >
                      {formData.location || "Select country..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search country..." />
                      <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                          {COUNTRIES.map((country) => (
                            <CommandItem
                              key={country}
                              value={country}
                              onSelect={(currentValue) => {
                                setFormData(prev => ({
                                  ...prev,
                                  location: currentValue === formData.location ? "" : currentValue
                                }));
                                setLocationOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.location === country ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {country}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Choose a username"
                    required
                    className="pr-10"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {usernameStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                    {usernameStatus === 'available' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {usernameStatus === 'taken' && <XCircle className="h-4 w-4 text-red-500" />}
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Your profile will be available at: diasporanetwork.africa/profile/{formData.username || 'username'}
                </p>
                
                {usernameStatus === 'taken' && suggestedUsernames.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Suggestions:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedUsernames.map(suggestion => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleUsernameSelect(suggestion)}
                          className="text-sm bg-dna-mint/20 text-dna-forest px-3 py-1 rounded-full hover:bg-dna-mint/30 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
                disabled={isLoading || usernameStatus !== 'available'}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  'Complete Profile'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPage;