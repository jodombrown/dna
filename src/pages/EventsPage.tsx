import React from 'react';
import EventsTab from '@/components/connect/tabs/EventsTab';

const EventsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <EventsTab searchTerm="" />
      </div>
    </div>
  );
};

export default EventsPage;
