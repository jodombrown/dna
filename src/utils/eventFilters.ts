
import { Event, EventFilters } from '@/types/eventTypes';

export const filterEvents = (events: Event[], filters: EventFilters): Event[] => {
  return events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesType = filters.typeFilter === 'all' || event.type === filters.typeFilter;
    
    const now = new Date();
    const eventDate = new Date(event.date_time);
    
    let matchesTab = true;
    if (filters.activeTab === 'upcoming') {
      matchesTab = eventDate > now;
    } else if (filters.activeTab === 'past') {
      matchesTab = eventDate < now;
    } else if (filters.activeTab === 'featured') {
      matchesTab = event.is_featured;
    }
    
    return matchesSearch && matchesType && matchesTab;
  });
};
