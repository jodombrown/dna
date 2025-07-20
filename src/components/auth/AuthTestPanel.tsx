import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TestTube } from 'lucide-react';

const AuthTestPanel = () => {
  const { signUp, signIn, signInWithLinkedIn, user, session } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [testData, setTestData] = useState({
    email: 'test@example.com',
    password: 'testpass123',
    fullName: 'Test User'
  });

  const handleTestSignUp = async () => {
    setIsLoading(true);
    try {
      const { error } = await signUp(testData.email, testData.password, testData.fullName);
      
      if (error) {
        toast({
          title: "Sign-up failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success!",
          description: "Test user created. Check email for confirmation.",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Unexpected error during sign-up",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleTestSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signIn(testData.email, testData.password);
      
      if (error) {
        toast({
          title: "Sign-in failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success!",
          description: "Signed in successfully",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Unexpected error during sign-in",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleLinkedInTest = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithLinkedIn();
      
      if (error) {
        toast({
          title: "LinkedIn OAuth failed",
          description: error.message || "Please check your LinkedIn OAuth configuration",
          variant: "destructive"
        });
      } else {
        toast({
          title: "LinkedIn OAuth initiated",
          description: "Redirecting to LinkedIn...",
        });
      }
    } catch (err) {
      toast({
        title: "LinkedIn OAuth Error",
        description: "Check browser console for details",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Auth Testing Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Auth Status */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium">Current Status:</p>
          <p className="text-sm text-gray-600">
            User: {user ? user.email : 'Not authenticated'}
          </p>
          <p className="text-sm text-gray-600">
            Session: {session ? 'Active' : 'None'}
          </p>
        </div>

        {/* Test Data Inputs */}
        <div className="space-y-2">
          <Label htmlFor="test-email">Test Email</Label>
          <Input
            id="test-email"
            type="email"
            value={testData.email}
            onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="test-password">Test Password</Label>
          <Input
            id="test-password"
            type="password"
            value={testData.password}
            onChange={(e) => setTestData(prev => ({ ...prev, password: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="test-name">Test Full Name</Label>
          <Input
            id="test-name"
            value={testData.fullName}
            onChange={(e) => setTestData(prev => ({ ...prev, fullName: e.target.value }))}
          />
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleTestSignUp}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test Sign Up'}
          </Button>

          <Button
            onClick={handleTestSignIn}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test Sign In'}
          </Button>
        </div>

        <Button
          onClick={handleLinkedInTest}
          disabled={isLoading}
          className="w-full"
          variant="outline"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test LinkedIn OAuth'}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          Note: Email confirmation is auto-enabled for testing
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthTestPanel;