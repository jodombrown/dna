import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  UserPlus, 
  Building, 
  Calendar, 
  Target, 
  Mail, 
  Search,
  Heart,
  MessageCircle,
  Plus
} from 'lucide-react';
import AppHeader from '@/components/app/AppHeader';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useNetwork } from '@/hooks/useNetwork';

const MyNetwork = () => {
  useScrollToTop();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('connections');
  const { loading, connections, communities, counts, getDataForTab } = useNetwork();

  const sidebarItems = [
    { id: 'connections', label: 'Connections', icon: Users, count: counts.connections },
    { id: 'followers', label: 'Followers & Following', icon: UserPlus, count: counts.followers },
    { id: 'communities', label: 'Communities', icon: Building, count: counts.communities },
    { id: 'events', label: 'Events', icon: Calendar, count: counts.events },
    { id: 'initiatives', label: 'Initiatives', icon: Target, count: counts.initiatives },
    { id: 'newsletters', label: 'Newsletters', icon: Mail, count: counts.newsletters }
  ];

  const renderEmptyState = (title: string, description: string, icon: React.ReactNode) => (
    <div className="text-center py-12">
      <div className="text-gray-300 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-dna-forest mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Button className="bg-dna-emerald hover:bg-dna-emerald/90 text-white">
        <Plus className="h-4 w-4 mr-2" />
        Get Started
      </Button>
    </div>
  );

  const renderConnections = () => {
    if (loading) {
      return <div className="text-center py-8">Loading connections...</div>;
    }

    return (
      <div className="space-y-4">
        {connections.length === 0 ? (
          renderEmptyState(
            'No connections yet',
            'Start connecting with professionals in the DNA network',
            <Users className="h-12 w-12 mx-auto" />
          )
        ) : (
          connections.map((connection) => (
            <Card key={connection.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={connection.avatar} />
                    <AvatarFallback className="bg-dna-emerald text-white">
                      {connection.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-dna-forest">{connection.name}</h3>
                        <p className="text-sm text-gray-600">{connection.role}</p>
                        <p className="text-sm text-gray-500">{connection.location}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {connection.mutualConnections} mutual connections
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-dna-emerald text-dna-emerald">
                          {connection.pillar}
                        </Badge>
                        {connection.status === 'pending' && (
                          <Badge variant="secondary" className="text-xs">
                            Pending
                          </Badge>
                        )}
                        {connection.status === 'received' && (
                          <Badge variant="secondary" className="text-xs bg-dna-gold/10 text-dna-gold">
                            Received
                          </Badge>
                        )}
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };

  const renderCommunities = () => {
    if (loading) {
      return <div className="text-center py-8">Loading communities...</div>;
    }

    return (
      <div className="space-y-4">
        {communities.length === 0 ? (
          renderEmptyState(
            'No communities joined',
            'Join communities to connect with like-minded professionals',
            <Building className="h-12 w-12 mx-auto" />
          )
        ) : (
          communities.map((community) => (
            <Card key={community.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-dna-forest mb-1">{community.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{community.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{community.members.toLocaleString()} members</span>
                      <Badge variant="secondary" className="text-xs">
                        {community.category}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'connections':
        return renderConnections();
      case 'followers':
        return renderEmptyState(
          'No followers yet', 
          'Share your expertise to attract followers', 
          <UserPlus className="h-12 w-12 mx-auto" />
        );
      case 'communities':
        return renderCommunities();
      case 'events':
        return renderEmptyState(
          'No events', 
          'Discover and join events in your network', 
          <Calendar className="h-12 w-12 mx-auto" />
        );
      case 'initiatives':
        return renderEmptyState(
          'No initiatives', 
          'Join or create impact initiatives', 
          <Target className="h-12 w-12 mx-auto" />
        );
      case 'newsletters':
        return renderEmptyState(
          'No newsletters', 
          'Subscribe to newsletters from your network', 
          <Mail className="h-12 w-12 mx-auto" />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile Tab Navigation */}
        <div className="lg:hidden mb-6">
          <div className="flex overflow-x-auto scrollbar-thin space-x-2 pb-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeTab === item.id 
                      ? 'bg-dna-emerald text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  <Badge variant="secondary" className="text-xs ml-1">
                    {item.count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-dna-forest">Manage My Network</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                          activeTab === item.id 
                            ? 'bg-dna-emerald/10 border-r-2 border-dna-emerald text-dna-emerald' 
                            : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {item.count}
                        </Badge>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="text-dna-forest">
                    {sidebarItems.find(item => item.id === activeTab)?.label}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search network..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full sm:w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {renderTabContent()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyNetwork;