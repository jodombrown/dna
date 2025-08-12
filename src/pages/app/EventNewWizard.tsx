import React, { useEffect, useState } from 'react';
import EventCreateWizard from '@/components/events/EventCreateWizard/index';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const EventNewWizard: React.FC = () => {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Create Event (Admin) | DNA';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Admin-only event creation wizard for DNA.');
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const href = window.location.origin + '/events/new';
    if (!link) { link = document.createElement('link'); link.setAttribute('rel', 'canonical'); document.head.appendChild(link); }
    link.setAttribute('href', href);
  }, []);

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        if (!user) { setAllowed(false); return; }
        let isAdmin = false;
        try {
          const { data: role } = await supabase.rpc('get_admin_role', { _user_id: user.id });
          if (role) isAdmin = true;
        } catch (_e) {
          const email = (user as any).email ?? (user.user_metadata?.email as string | undefined);
          if (email && email.endsWith('@diasporanetwork.africa')) isAdmin = true;
        }
        setAllowed(isAdmin);
      } finally {
        setChecking(false);
      }
    };
    check();
  }, []);

  if (checking) {
    return (
      <div className="container mx-auto py-12 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Checking access…</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please wait while we verify your access.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="container mx-auto py-12 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Event creation is limited</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              For now, only DNA admins can create events. We’ll open this up soon.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
              <Button onClick={() => navigate('/app/events')}>View events</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <EventCreateWizard />;
};

export default EventNewWizard;