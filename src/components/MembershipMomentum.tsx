
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Zap, Gift, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MembershipMomentum = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
      toast({
        title: "You're in! 🎉",
        description: "Welcome to the DNA community. You'll receive launch updates and early access.",
      });
    }, 1000);
  };

  const benefits = [
    { icon: Zap, text: "First access to beta features" },
    { icon: Users, text: "Connect with founding members" },
    { icon: Gift, text: "Complimentary premium features" }
  ];

  const recentJoins = [
    "Sarah K. (Nigeria → NYC) joined 2 hours ago",
    "Michael O. (Kenya → London) joined 4 hours ago", 
    "Aisha M. (Ghana → Dubai) joined 6 hours ago"
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-dna-emerald/5 via-white to-dna-copper/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Live momentum indicators */}
        <div className="flex justify-center gap-4 mb-8">
          <Badge className="bg-green-100 text-green-800 border-green-200 animate-pulse">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            47 joined this week
          </Badge>
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Users className="w-3 h-3 mr-1" />
            3,247 total members
          </Badge>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Join Africa's Most Connected Diaspora Network
        </h2>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Be among the first to experience the platform that's already transforming how diaspora professionals create impact across Africa.
        </p>

        {/* Waitlist Form */}
        <Card className="max-w-md mx-auto mb-8 shadow-lg">
          <CardContent className="p-6">
            {!isSubmitted ? (
              <form onSubmit={handleJoinWaitlist} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-center"
                  required
                />
                <Button 
                  type="submit" 
                  className="w-full bg-dna-emerald hover:bg-dna-forest"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Joining...' : 'Join the Movement'}
                  {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </form>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to DNA!</h3>
                <p className="text-gray-600">You'll receive launch updates and early access soon.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Early Member Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center justify-center gap-3 text-gray-700">
              <benefit.icon className="w-5 h-5 text-dna-emerald" />
              <span>{benefit.text}</span>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
          <h4 className="font-semibold text-gray-900 mb-4">Recent Members</h4>
          <div className="space-y-2">
            {recentJoins.map((join, index) => (
              <p key={index} className="text-sm text-gray-600">{join}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MembershipMomentum;
