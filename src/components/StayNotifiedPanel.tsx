
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Bell, Mail, Users, Target, Heart } from 'lucide-react';
import SimpleEmailForm from '@/components/SimpleEmailForm';

interface StayNotifiedPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const StayNotifiedPanel = ({ isOpen, onClose }: StayNotifiedPanelProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-dna-emerald/10 rounded-lg">
              <Bell className="w-6 h-6 text-dna-emerald" />
            </div>
            <Badge className="bg-dna-copper text-white">
              Platform Preview
            </Badge>
          </div>
          <SheetTitle className="text-2xl text-gray-900">Stay Notified About DNA Platform</SheetTitle>
          <SheetDescription className="text-base text-gray-600">
            Be the first to know when the Diaspora Network Africa platform launches and get exclusive early access
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8">
          {/* What to Expect Section */}
          <div className="bg-gradient-to-r from-dna-emerald/5 to-dna-copper/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-dna-emerald" />
              What to Expect When You Join
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-dna-emerald text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Early Access Network</h4>
                  <p className="text-gray-700 text-sm">Connect with verified African diaspora professionals before the public launch</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-dna-copper text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Exclusive Launch Events</h4>
                  <p className="text-gray-700 text-sm">Join virtual and in-person events designed to build connections and collaborations</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-dna-mint text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Priority Project Matching</h4>
                  <p className="text-gray-700 text-sm">Get first access to collaboration opportunities that match your skills and interests</p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Preview Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              The DNA Platform: Connect, Collaborate, Contribute
            </h3>
            <p className="text-gray-700 mb-4">
              We're building the world's most comprehensive platform for African diaspora professionals. 
              Our three-pillar approach ensures meaningful connections lead to real impact:
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="w-10 h-10 bg-dna-emerald/10 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <Users className="w-5 h-5 text-dna-emerald" />
                </div>
                <h4 className="font-medium text-dna-emerald mb-1">Connect</h4>
                <p className="text-gray-600">Professional networking with verified diaspora</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="w-10 h-10 bg-dna-copper/10 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <Target className="w-5 h-5 text-dna-copper" />
                </div>
                <h4 className="font-medium text-dna-copper mb-1">Collaborate</h4>
                <p className="text-gray-600">Work on meaningful projects together</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="w-10 h-10 bg-dna-mint/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-dna-emerald" />
                </div>
                <h4 className="font-medium text-dna-emerald mb-1">Contribute</h4>
                <p className="text-gray-600">Create lasting impact across Africa</p>
              </div>
            </div>
          </div>

          {/* Email Form */}
          <div>
            <SimpleEmailForm />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StayNotifiedPanel;
