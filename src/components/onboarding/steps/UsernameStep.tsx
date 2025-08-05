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
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-dna-forest mb-2">Choose Your DNA Username</h3>
        <p className="text-gray-600">This will be your unique identity in the diaspora network</p>
      </div>

      {/* Manual Input */}
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <Input
            id="username"
            value={username}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="choose_username"
            className={`pr-10 ${
              username.length >= 3
                ? isAvailable === true
                  ? 'border-green-500 focus:border-green-500'
                  : isAvailable === false
                  ? 'border-red-500 focus:border-red-500'
                  : ''
                : ''
            }`}
          />
          
          {checking && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-500" />
          )}
          
          {!checking && username.length >= 3 && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isAvailable === true && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              {isAvailable === false && (
                <AlertCircle className="w-4 h-4 text-red-500" />
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
                <p className="text-sm text-red-500">@{username} is taken. Try these alternatives:</p>
                <div className="flex flex-wrap gap-2">
                  {manualSuggestions.map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => selectUsername(suggestion)}
                      className="text-xs h-7"
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
      <Card className="border-dna-mint/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-dna-copper" />
              <h4 className="font-medium text-dna-forest">AI Suggestions</h4>
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
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-dna-copper" />
              <span className="ml-2 text-sm text-gray-600">Generating personalized suggestions...</span>
            </div>
          ) : aiSuggestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-dna-emerald/50 ${
                    username === suggestion.username 
                      ? 'border-dna-emerald bg-dna-emerald/5' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => selectUsername(suggestion.username)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-2 text-xs">
                        @{suggestion.username}
                      </Badge>
                      <p className="text-xs text-gray-600">{suggestion.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              AI suggestions will appear here based on your profile
            </p>
          )}
        </CardContent>
      </Card>

      {/* Changes Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Username changes used</span>
          <span className="font-medium">{usedChanges}/2</span>
        </div>
        <Progress value={progressValue} className="h-2" />
        <p className="text-xs text-gray-500">
          You can change your username 2 more times after joining
        </p>
      </div>

      {/* Requirements */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <h5 className="text-sm font-medium text-blue-900 mb-1">Username Requirements:</h5>
        <ul className="text-xs text-blue-700 space-y-1">
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