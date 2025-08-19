import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Lock, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLaunchTimeFormatted } from '@/utils/prelaunchGate';

const PrelaunchBanner = () => {
  const navigate = useNavigate();
  const launchTime = getLaunchTimeFormatted();

  return (
    <div className="bg-gradient-to-r from-dna-copper/10 via-dna-gold/10 to-dna-emerald/10 border-b">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Card className="bg-white/80 backdrop-blur-sm border-dna-copper/20 shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-dna-copper to-dna-gold rounded-full flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dna-forest mb-1">
                    Platform Opening Soon
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      Early access begins {launchTime}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => navigate('/admin-login')}
                  variant="outline"
                  size="sm"
                  className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Admin Access
                </Button>
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-dna-copper hover:bg-dna-copper/90 text-white"
                  size="sm"
                >
                  Join Waitlist
                </Button>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Coming September 1st:</strong> Connect with the global African diaspora, 
                collaborate on impactful projects, and contribute to Africa's development through innovation.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PrelaunchBanner;