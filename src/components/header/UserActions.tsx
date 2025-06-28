
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { User, Users, MessageCircle } from 'lucide-react';
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
  const navigate = useNavigate();
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);

  const handleJoinDNA = () => {
    setIsJoinDialogOpen(true);
  };

  const handleTakeSurvey = () => {
    setIsSurveyOpen(true);
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          onClick={handleJoinDNA}
          className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
        >
          <Users className="w-4 h-4 mr-2" />
          Join DNA
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex flex-col space-y-1 p-2">
              <p className="text-sm font-medium leading-none">Demo User</p>
              <p className="text-xs leading-none text-muted-foreground">
                Platform Preview
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/clean-social-feed')}>
              <MessageCircle className="mr-2 h-4 w-4" />
              <span>Demo Feed</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/connect')}>
              <Users className="mr-2 h-4 w-4" />
              <span>Connect Preview</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleTakeSurvey}>
              <span>Take Survey</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
};

export default UserActions;
