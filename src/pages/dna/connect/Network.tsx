import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ConnectionRequestCard } from '@/components/connect/ConnectionRequestCard';
import { ConnectionCard } from '@/components/connect/ConnectionCard';
import { MemberCard } from '@/components/connect/MemberCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, UserPlus, UserCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSearchParams } from 'react-router-dom';

export default function Network() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'requests');
  const [requests, setRequests] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState({ requests: true, connections: true, suggestions: true });

  useEffect(() => {
    if (user) {
      loadRequests();
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

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSearchParams({ tab: v }); }}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests">
            <UserPlus className="h-4 w-4 mr-2" />
            Requests {requests.length > 0 && <span className="ml-1 bg-dna-copper text-white rounded-full px-2 py-0.5 text-xs">{requests.length}</span>}
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

        <TabsContent value="connections">
          <Card>
            <CardHeader>
              <CardTitle>My Connections</CardTitle>
              <CardDescription>People you're connected with</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.connections ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : connections.length === 0 ? (
                <Alert><UserCheck className="h-4 w-4" /><AlertDescription>No connections yet.</AlertDescription></Alert>
              ) : (
                <div className="space-y-3">{connections.map(c => <ConnectionCard key={c.id} connection={c} onConnectionRemoved={() => { loadConnections(); loadSuggestions(); }} />)}</div>
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
