import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, MessageSquare, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const NetworkMainContent = () => {
  const networkStats = [
    { label: 'Connections', value: '847', icon: Users, change: '+12' },
    { label: 'Followers', value: '1.2K', icon: UserPlus, change: '+34' },
    { label: 'Messages', value: '156', icon: MessageSquare, change: '+5' },
    { label: 'Profile Views', value: '89', icon: TrendingUp, change: '+7' }
  ];

  const pendingConnections = [
    { id: 1, name: 'Amara Okafor', title: 'Tech Entrepreneur, Lagos', mutual: 5 },
    { id: 2, name: 'Kwame Asante', title: 'Investment Banker, Accra', mutual: 12 },
    { id: 3, name: 'Fatima Al-Rashid', title: 'Digital Nomad, Cairo', mutual: 8 }
  ];

  const suggestions = [
    { id: 1, name: 'Dr. Aisha Patel', title: 'Healthcare Innovation, Nairobi', mutual: 15 },
    { id: 2, name: 'Marcus Johnson', title: 'Fintech Executive, Cape Town', mutual: 9 },
    { id: 3, name: 'Zara Okonkwo', title: 'Sustainable Development, Abuja', mutual: 7 }
  ];

  return (
    <div className="space-y-6">
      {/* Network Stats - Mobile responsive grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {networkStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-3 lg:p-4">
              <div className="text-center lg:flex lg:items-center lg:justify-between">
                <div>
                  <p className="text-xl lg:text-2xl font-bold text-dna-forest">{stat.value}</p>
                  <p className="text-xs lg:text-sm text-gray-600">{stat.label}</p>
                  <p className="text-xs text-dna-emerald">{stat.change} this week</p>
                </div>
                <stat.icon className="w-6 h-6 lg:w-8 lg:h-8 text-dna-copper mx-auto lg:mx-0 mt-2 lg:mt-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Pending Connection Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-dna-forest">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingConnections.map((person) => (
              <div key={person.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-dna-mint text-dna-forest">
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-dna-forest">{person.name}</p>
                    <p className="text-sm text-gray-600">{person.title}</p>
                    <p className="text-xs text-gray-500">{person.mutual} mutual connections</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                  <Button size="sm" className="bg-dna-copper hover:bg-dna-gold text-white min-w-[60px]">
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" className="min-w-[60px]">
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* People You May Know - Removed duplicate. Use ConnectionRecommendationsWidget instead */}
      </div>
    </div>
  );
};

export default NetworkMainContent;