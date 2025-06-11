
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import JoinDNADialog from '@/components/auth/JoinDNADialog';
import SurveyDialog from '@/components/survey/SurveyDialog';

const UserActions = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleJoinDNA = () => {
    setIsJoinDialogOpen(true);
  };

  const handleTakeSurvey = () => {
    setIsSurveyOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate('/admin-login')}
            className="border-dna-forest text-dna-forest hover:bg-dna-forest hover:text-white"
          >
            <Shield className="w-4 h-4 mr-2" />
            Authorize
          </Button>
        </div>

        <JoinDNADialog 
          isOpen={isJoinDialogOpen} 
          onClose={() => setIsJoinDialogOpen(false)}
          onTakeSurvey={handleTakeSurvey}
        />
        <SurveyDialog 
          isOpen={isSurveyOpen} 
          onClose={() => setIsSurveyOpen(false)} 
        />
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Shield className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium leading-none">{user.email}</p>
          <p className="text-xs leading-none text-muted-foreground">
            Admin User
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/dashboard')}>
          <User className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/my-profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>My Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserActions;
