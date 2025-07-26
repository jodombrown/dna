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
      {/* Network Stats */}
      <div className="grid grid-cols-4 gap-4">
        {networkStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-dna-forest">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-xs text-dna-emerald">{stat.change} this week</p>
                </div>
                <stat.icon className="w-8 h-8 text-dna-copper" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
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
                <div className="flex space-x-2">
                  <Button size="sm" className="bg-dna-copper hover:bg-dna-gold text-white">
                    Accept
                  </Button>
                  <Button size="sm" variant="outline">
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* People You May Know */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-dna-forest">People You May Know</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestions.map((person) => (
              <div key={person.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-dna-emerald text-white">
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-dna-forest">{person.name}</p>
                    <p className="text-sm text-gray-600">{person.title}</p>
                    <p className="text-xs text-gray-500">{person.mutual} mutual connections</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white">
                  Connect
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NetworkMainContent;