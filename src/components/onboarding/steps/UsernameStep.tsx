import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

interface AISuggestion {
  username: string;
  explanation: string;
}

interface UsernameStepProps {
  data: {
    full_name?: string;
    username?: string;
    country_of_origin?: string;
    current_country?: string;
    industry?: string;
  };
  updateData: (updates: any) => void;
}

const UsernameStep: React.FC<UsernameStepProps> = ({ data, updateData }) => {
  const [username, setUsername] = useState(data.username || '');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [manualSuggestions, setManualSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const changesLeft = 2; // New users get 2 changes

  useEffect(() => {
    // Load AI suggestions when component mounts
    if (data.full_name) {
      generateAISuggestions();
    }
  }, [data.full_name, data.country_of_origin, data.industry]);

  useEffect(() => {
    if (username.length < 3) {
      setIsAvailable(null);
      setManualSuggestions([]);
      return;
    }

    const timeout = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 400);

    return () => clearTimeout(timeout);
  }, [username]);

  const generateAISuggestions = async () => {
    if (!data.full_name) return;

    setLoadingSuggestions(true);
    
    try {
      const { data: suggestions, error } = await supabase.functions.invoke('suggest-usernames', {
        body: {
          fullName: data.full_name,
          industry: data.industry || 'Professional',
          countryOrigin: data.country_of_origin,
          currentLocation: data.current_country
        }
      });

      if (error) throw error;

      setAiSuggestions(suggestions.suggestions || []);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      // Fallback to manual suggestions
      generateFallbackSuggestions();
    }

    setLoadingSuggestions(false);
  };

  const generateFallbackSuggestions = () => {
    if (!data.full_name) return;

    const name = data.full_name.toLowerCase().replace(/\s+/g, '_');
    const firstName = data.full_name.split(' ')[0]?.toLowerCase();
    const country = data.country_of_origin?.toLowerCase().slice(0, 4) || 'afr';
    
    const fallbacks: AISuggestion[] = [
      {
        username: `${firstName}_${country}`,
        explanation: `Combines your first name with your origin country`
      },
      {
        username: `${name.slice(0, 12)}_pro`,
        explanation: "Professional username based on your name"
      },
      {
        username: `${firstName}.connects`,
        explanation: "Perfect for building diaspora connections"
      },
      {
        username: `diaspora_${firstName}`,
        explanation: "Celebrates your diaspora identity"
      }
    ];

    setAiSuggestions(fallbacks);
  };

  const checkUsernameAvailability = async (name: string) => {
    setChecking(true);
    
    try {
      const { data: existingUser, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', name)
        .single();

      const taken = !!existingUser && !error;
      setIsAvailable(!taken);

      if (taken) {
        generateManualSuggestions(name);
      } else {
        setManualSuggestions([]);
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setIsAvailable(false);
    }

    setChecking(false);
  };

  const generateManualSuggestions = (base: string): void => {
    const suffix = Math.floor(Math.random() * 1000);
    const suggestions = [
      `${base}_${suffix}`,
      `${base}.${Math.floor(Math.random() * 100)}`,
      `${base}_${new Date().getFullYear()}`,
      `${base}_dna`,
      `${base}_connects`,
    ];
    setManualSuggestions(suggestions);
  };

  const selectUsername = (selectedUsername: string) => {
    setUsername(selectedUsername);
    updateData({ username: selectedUsername });
  };

  const handleInputChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    setUsername(sanitized);
    updateData({ username: sanitized });
  };

  const usedChanges = 2 - changesLeft;
  const progressValue = (usedChanges / 2) * 100;

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4">
      <div className="text-center space-y-2 pt-6">
        <h2 className="text-xl sm:text-2xl font-bold text-dna-forest">Claim Your Username</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          This will be your unique identity in the diaspora network
        </p>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Manual Input */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-base">Username *</Label>
            <div className="relative">
              <Input
                id="username"
                value={username}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="choose_your_username"
                className={`pr-10 min-h-[44px] ${
                  username.length >= 3
                    ? isAvailable === true
                      ? 'border-green-500 focus:border-green-500'
                      : isAvailable === false
                      ? 'border-destructive focus:border-destructive'
                      : ''
                    : ''
                }`}
              />
              
              {checking && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
              )}
              
              {!checking && username.length >= 3 && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isAvailable === true && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {isAvailable === false && (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )}
                </div>
              )}
            </div>

            {username.length >= 3 && !checking && (
              <>
                {isAvailable === true && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <span>🎉</span>
                    <span className="font-medium">@{username} is available!</span>
                  </div>
                )}
                
                {isAvailable === false && manualSuggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-destructive">@{username} is taken. Try these alternatives:</p>
                    <div className="flex flex-wrap gap-2">
                      {manualSuggestions.map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          onClick={() => selectUsername(suggestion)}
                          className="text-xs h-8"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* AI Suggestions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-dna-copper" />
                <h4 className="font-medium text-foreground">AI Suggestions</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={generateAISuggestions}
                disabled={loadingSuggestions}
                className="h-8 px-2"
              >
                {loadingSuggestions ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
              </Button>
            </div>

            {loadingSuggestions ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-dna-copper" />
                <span className="ml-2 text-sm text-muted-foreground">Generating suggestions...</span>
              </div>
            ) : aiSuggestions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {aiSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-dna-emerald/50 ${
                      username === suggestion.username 
                        ? 'border-dna-emerald bg-dna-emerald/5' 
                        : 'border-border hover:bg-accent/50'
                    }`}
                    onClick={() => selectUsername(suggestion.username)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2 text-xs">
                          @{suggestion.username}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{suggestion.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                AI suggestions will appear here based on your profile
              </p>
            )}
          </div>

          {/* Changes Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Username changes available</span>
              <span className="font-medium">{changesLeft}/2</span>
            </div>
            <Progress value={progressValue} className="h-2" />
            <p className="text-xs text-muted-foreground">
              You can change your username up to 2 times after joining
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <div className="bg-accent/50 p-4 rounded-lg border">
        <h5 className="text-sm font-medium text-foreground mb-2">Username Requirements:</h5>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• 3-20 characters long</li>
          <li>• Only letters, numbers, dots (.), underscores (_), and hyphens (-)</li>
          <li>• Must be unique across the platform</li>
          <li>• Cannot be changed more than twice</li>
        </ul>
      </div>
    </div>
  );
};

export default UsernameStep;