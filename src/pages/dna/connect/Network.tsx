import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ConnectionRequestCard } from '@/components/connect/ConnectionRequestCard';
import { SentRequestCard } from '@/components/network/SentRequestCard';
import { ConnectionCard } from '@/components/connect/ConnectionCard';
import { MemberCard } from '@/components/connect/MemberCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Users, UserPlus, UserCheck, Search, SlidersHorizontal } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Network() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'requests');
  const [requests, setRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState({ requests: true, sentRequests: true, connections: true, suggestions: true });

  // Connection search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('alphabetical');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      loadRequests();
      loadSentRequests();
      loadConnections();
      loadSuggestions();
    }
  }, [user]);

  const loadRequests = async () => {
    if (!user) return;
    try {
      setLoading(prev => ({ ...prev, requests: true }));
      const { data, error } = await supabase.rpc('get_connection_requests', { user_id: user.id });
      if (error) throw error;
      setRequests(data || []);
    } finally {
      setLoading(prev => ({ ...prev, requests: false }));
    }
  };

  const loadSentRequests = async () => {
    if (!user) return;
    try {
      setLoading(prev => ({ ...prev, sentRequests: true }));
      const { data, error } = await supabase.rpc('get_sent_connection_requests', { p_user_id: user.id });
      if (error) throw error;
      setSentRequests(data || []);
    } finally {
      setLoading(prev => ({ ...prev, sentRequests: false }));
    }
  };

  const loadConnections = async () => {
    if (!user) return;
    try {
      setLoading(prev => ({ ...prev, connections: true }));
      const { data, error } = await supabase.rpc('get_user_connections', { p_user_id: user.id, p_limit: 50, p_offset: 0 });
      if (error) throw error;
      setConnections(data || []);
    } finally {
      setLoading(prev => ({ ...prev, connections: false }));
    }
  };

  const loadSuggestions = async () => {
    if (!user) return;
    try {
      setLoading(prev => ({ ...prev, suggestions: true }));
      const { data, error } = await supabase.rpc('get_suggested_connections', { p_user_id: user.id, p_limit: 10 });
      if (error) throw error;
      setSuggestions(data || []);
    } finally {
      setLoading(prev => ({ ...prev, suggestions: false }));
    }
  };

  // Filter and sort connections
  const filteredConnections = useMemo(() => {
    let filtered = [...connections];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.full_name?.toLowerCase().includes(query) ||
        c.headline?.toLowerCase().includes(query) ||
        c.profession?.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      default:
        break;
    }

    return filtered;
  }, [connections, searchQuery, sortBy]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSearchParams({ tab: v }); }}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="requests">
            <UserPlus className="h-4 w-4 mr-2" />
            Requests {requests.length > 0 && <span className="ml-1 bg-dna-copper text-white rounded-full px-2 py-0.5 text-xs">{requests.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="sent">
            <UserPlus className="h-4 w-4 mr-2" />
            Sent {sentRequests.length > 0 && <span className="ml-1 bg-amber-500 text-white rounded-full px-2 py-0.5 text-xs">{sentRequests.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="connections">
            <UserCheck className="h-4 w-4 mr-2" />
            Connections
          </TabsTrigger>
          <TabsTrigger value="suggestions">
            <Users className="h-4 w-4 mr-2" />
            Suggested
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>People who want to connect with you</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.requests ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : requests.length === 0 ? (
                <Alert><UserPlus className="h-4 w-4" /><AlertDescription>No pending requests.</AlertDescription></Alert>
              ) : (
                <div className="space-y-3">{requests.map(r => <ConnectionRequestCard key={r.connection_id} request={r} onRequestHandled={() => { loadRequests(); loadConnections(); }} />)}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent">
          <Card>
            <CardHeader>
              <CardTitle>Sent Requests</CardTitle>
              <CardDescription>Connection requests waiting for response</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.sentRequests ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : sentRequests.length === 0 ? (
                <Alert><UserPlus className="h-4 w-4" /><AlertDescription>You haven't sent any connection requests.</AlertDescription></Alert>
              ) : (
                <div className="space-y-3">{sentRequests.map(r => <SentRequestCard key={r.connection_id} request={r} onWithdraw={loadSentRequests} />)}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Connections</CardTitle>
                  <CardDescription>
                    {connections.length} connection{connections.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
              </div>

              {/* Search and Sort Controls */}
              <div className={`space-y-3 mt-4 ${showFilters ? '' : 'hidden'}`}>
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, headline, or profession..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Sort Dropdown */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alphabetical">Alphabetical</SelectItem>
                      <SelectItem value="recent">Recently Connected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                {(searchQuery || sortBy !== 'alphabetical') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSortBy('alphabetical');
                    }}
                    className="text-xs"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading.connections ? (
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              ) : connections.length === 0 ? (
                <Alert>
                  <UserCheck className="h-4 w-4" />
                  <AlertDescription>No connections yet.</AlertDescription>
                </Alert>
              ) : filteredConnections.length === 0 ? (
                <Alert>
                  <Search className="h-4 w-4" />
                  <AlertDescription>
                    No connections match your search. Try different keywords.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {filteredConnections.map(c => (
                    <ConnectionCard
                      key={c.id}
                      connection={c}
                      onConnectionRemoved={() => {
                        loadConnections();
                        loadSuggestions();
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions">
          <Card>
            <CardHeader>
              <CardTitle>Suggested Connections</CardTitle>
              <CardDescription>People you might want to connect with</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.suggestions ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : suggestions.length === 0 ? (
                <Alert><Users className="h-4 w-4" /><AlertDescription>No suggestions available.</AlertDescription></Alert>
              ) : (
                <div className="space-y-3">{suggestions.map(m => <MemberCard key={m.id} member={m} onConnectionSent={loadSuggestions} />)}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
