import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import BetaApplicationForm from '@/components/waitlist/BetaApplicationForm';

const BetaApplicationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-dna-copper hover:text-dna-copper/80"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-dna-forest mb-4">
              Join the DNA Beta Program
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Be part of shaping the future of the African diaspora network. 
              Help us build a platform that connects, empowers, and amplifies our global community.
            </p>
          </div>
        </div>

        {/* Beta Application Form */}
        <BetaApplicationForm 
          onSuccess={() => {
            // Could redirect to a thank you page or stay here
            setTimeout(() => {
              navigate('/');
            }, 3000);
          }}
        />

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-dna-forest mb-4">
              What to Expect as a Beta Member
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <h4 className="font-medium text-dna-copper mb-2">Early Access</h4>
                <p className="text-sm text-gray-600">
                  Get exclusive access to DNA platform features before public launch
                </p>
              </div>
              <div>
                <h4 className="font-medium text-dna-copper mb-2">Shape the Future</h4>
                <p className="text-sm text-gray-600">
                  Your feedback directly influences platform development and features
                </p>
              </div>
              <div>
                <h4 className="font-medium text-dna-copper mb-2">Community Building</h4>
                <p className="text-sm text-gray-600">
                  Connect with fellow diaspora members and contribute to early initiatives
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetaApplicationPage;