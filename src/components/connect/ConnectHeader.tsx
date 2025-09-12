import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Users, Briefcase, Heart } from 'lucide-react';

const ConnectHeader: React.FC = () => {
  return (
    <div className="border-b bg-gradient-to-r from-dna-emerald/5 via-background to-dna-copper/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* DNA Connect Branding */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-dna-emerald rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              DNA <span className="text-dna-emerald">Connect</span>
            </h1>
          </div>
          
          <p className="text-lg text-muted-foreground mb-6">
            Discover and connect with African diaspora professionals worldwide. Build meaningful relationships that transcend borders.
          </p>
          
          {/* DNA Pillars Preview */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <Badge variant="secondary" className="bg-dna-emerald/10 text-dna-emerald border-dna-emerald/20 px-3 py-1">
              <Users className="w-3 h-3 mr-1" />
              Connect
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Briefcase className="w-3 h-3 mr-1" />
              Collaborate
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Heart className="w-3 h-3 mr-1" />
              Contribute
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Globe className="w-3 h-3 mr-1" />
              Discover
            </Badge>
          </div>
          
          {/* Mission Statement */}
          <Card className="max-w-2xl mx-auto border-l-4 border-l-dna-emerald bg-background/50 backdrop-blur">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                "Ubuntu: I am because we are. Building bridges across continents, 
                one meaningful connection at a time."
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConnectHeader;