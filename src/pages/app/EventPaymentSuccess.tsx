import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const EventPaymentSuccess: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState<string>('');
  const [eventSlug, setEventSlug] = useState<string | null>(null);

  // SEO: set title, meta, canonical
  useEffect(() => {
    const title = verified ? `Payment Success - ${eventTitle || 'Event'}` : 'Verifying Payment';
    document.title = title;

    const metaDesc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    metaDesc.setAttribute('content', `Payment confirmation for ${eventTitle || 'event'}.`);
    if (!metaDesc.parentNode) document.head.appendChild(metaDesc);

    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', window.location.href);
    if (!canonical.parentNode) document.head.appendChild(canonical);
  }, [verified, eventTitle]);

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      const { data } = await supabase
        .from('events')
        .select('title, slug')
        .eq('id', id)
        .single();
      if (data) {
        setEventTitle(data.title || 'Event');
        setEventSlug(data.slug || null);
      }
    };
    loadEvent();
  }, [id]);

  useEffect(() => {
    const verify = async () => {
      if (!sessionId) { setVerified(false); setVerifying(false); return; }
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId }
      });
      if (error) {
        setVerified(false);
      } else {
        setVerified(!!data?.success);
        setAmount(data?.amount_total ?? null);
        setCurrency((data?.currency || 'usd').toUpperCase());
      }
      setVerifying(false);
    };
    verify();
  }, [sessionId]);

  const formattedAmount = useMemo(() => {
    if (amount == null) return '';
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format((amount || 0) / 100);
    } catch {
      return `$${((amount || 0) / 100).toFixed(2)}`;
    }
  }, [amount, currency]);

  const eventLink = eventSlug ? `/events/${eventSlug}` : (id ? `/app/events/${id}` : '/app/events');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-12">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">{verifying ? 'Verifying your payment...' : (verified ? 'Payment confirmed' : 'Payment not confirmed')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {verified && (
              <p>Thank you. Your payment of {formattedAmount} {currency} for <strong>{eventTitle}</strong> was successful. A confirmation email has been sent.</p>
            )}
            {!verified && !verifying && (
              <p>We could not confirm your payment. If you were charged, it may still be processing. Please check your email or try again.</p>
            )}
            <div className="pt-2">
              <Link to={eventLink}>
                <Button variant="default">Back to event</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EventPaymentSuccess;
