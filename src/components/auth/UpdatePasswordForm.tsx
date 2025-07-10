
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const UpdatePasswordForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if we have the required parameters for custom password reset
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (!token || !email) {
      toast({
        title: "Invalid Reset Link",
        description: "This password reset link is invalid or has expired.",
        variant: "destructive",
      });
      navigate('/auth');
    }
  }, [searchParams, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter a new password.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const email = searchParams.get('email');
      const token = searchParams.get('token');
      
      if (!email || !token) {
        toast({
          title: "Invalid Reset Link",
          description: "This password reset link is invalid or has expired.",
          variant: "destructive",
        });
        return;
      }

      // Update password directly using admin function
      const { error } = await supabase.functions.invoke('update-user-password', {
        body: {
          email: email,
          token: token,
          newPassword: password
        }
      });

      if (error) {
        console.error('Password update error:', error);
        toast({
          title: "Update Failed",
          description: error.message || "Failed to update password. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password Updated",
          description: "Your password has been updated successfully. You can now sign in.",
        });
        navigate('/auth');
      }
    } catch (error: any) {
      console.error('Unexpected password update error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-dna-forest">
          Update Password
        </CardTitle>
        <CardDescription className="text-center">
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-dna-forest">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-dna-forest">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-dna-copper hover:bg-dna-gold text-white"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UpdatePasswordForm;
