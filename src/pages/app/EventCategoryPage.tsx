
import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ModernEventCard from '@/components/connect/ModernEventCard';
import { eventCategories, additionalEvents } from '@/components/connect/eventData';
import { Event } from '@/types/search';
import { toast } from 'sonner';
import { RequireProfileScore } from '@/components/profile/RequireProfileScore';
import { ChevronLeft } from 'lucide-react';
const EventCategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const category = useMemo(() => eventCategories.find(c => c.id === slug), [slug]);

  useEffect(() => {
    const name = category?.name ?? 'Events';
    document.title = `${name} Events | DNA`;
    const meta = document.querySelector('meta[name="description"]');
    const desc = category ? `${category.name} events: ${category.description}` : 'Browse events by category on DNA.';
    if (meta) meta.setAttribute('content', desc);

    // Set canonical tag
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const href = window.location.origin + `/events/category/${slug ?? ''}`;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }, [category, slug]);

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Category not found</h1>
        <Button className="mt-4" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  // Placeholder events; in production fetch from Supabase filtered by category
  const events: Event[] = additionalEvents;

  const handleEventClick = (ev: Event) => navigate(`/app/events/${ev.id}`);
  const handleRegister = (ev: Event) => {
    toast.info('Registration coming soon');
  };

  const handleSubscribe = () => toast.success(`Subscribed to ${category.name} updates`);
  const handleHost = () => navigate('/events/new');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/connect')}
        className="mb-4 -ml-2 hover:bg-dna-emerald/10 hover:text-dna-forest"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Events
      </Button>
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{category.icon} {category.name} Events</h1>
        <p className="text-muted-foreground mt-2">{category.description}</p>
        <div className="mt-4 flex gap-3">
          <Button onClick={handleSubscribe}>Subscribe</Button>
          <RequireProfileScore min={50} featureName="Create Event" showToast>
            <Button variant="outline" onClick={handleHost}>Host Event</Button>
          </RequireProfileScore>
        </div>
      </header>

      <main>
        <section>
          <h2 className="sr-only">Upcoming {category.name} events</h2>
          {events.length === 0 ? (
            <div className="bg-background rounded-lg border p-6">No events yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((ev) => (
                <ModernEventCard
                  key={ev.id}
                  event={ev}
                  onEventClick={handleEventClick}
                  onRegisterEvent={() => handleRegister(ev)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default EventCategoryPage;
