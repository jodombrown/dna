import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    location: '',
    username: ''
  });
  
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [suggestedUsernames, setSuggestedUsernames] = useState<string[]>([]);

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
    const isValid = /^[a-z0-9._]+$/.test(username);
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
      value = value.toLowerCase().replace(/[^a-z0-9._]/g, '');
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
          location: formData.location,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      toast({
        title: "Welcome to DNA!",
        description: "Your profile has been created successfully."
      });

      navigate('/app');
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
                <Label htmlFor="location">Current Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, Country"
                  required
                />
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