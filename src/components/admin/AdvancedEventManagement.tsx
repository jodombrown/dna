
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock,
  Star,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string;
  date_time: string;
  location: string;
  is_virtual: boolean;
  is_featured: boolean;
  attendee_count: number;
  max_attendees: number;
  type: string;
  created_by: string;
  created_at: string;
}

interface AdvancedEventManagementProps {
  events: Event[];
  onFeatureEvent: (eventId: string) => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
  onCreateEvent: () => void;
  isLoading: boolean;
}

const AdvancedEventManagement: React.FC<AdvancedEventManagementProps> = ({
  events,
  onFeatureEvent,
  onEditEvent,
  onDeleteEvent,
  onCreateEvent,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'featured' && event.is_featured) ||
                         (filterStatus === 'virtual' && event.is_virtual) ||
                         (filterStatus === 'in-person' && !event.is_virtual);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getEventTypeBadge = (type: string) => {
    const colors = {
      'workshop': 'bg-blue-100 text-blue-800',
      'conference': 'bg-purple-100 text-purple-800',
      'networking': 'bg-green-100 text-green-800',
      'webinar': 'bg-orange-100 text-orange-800',
      'meetup': 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-dna-emerald" />
          <h2 className="text-2xl font-bold">Advanced Event Management</h2>
        </div>
        <Button onClick={onCreateEvent} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Event
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="webinar">Webinar</SelectItem>
                <SelectItem value="meetup">Meetup</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="in-person">In Person</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getEventTypeBadge(event.type)}>
                      {event.type}
                    </Badge>
                    {event.is_featured && (
                      <Badge className="bg-dna-gold text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {event.is_virtual && (
                      <Badge variant="outline">Virtual</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {event.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
              )}
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(event.date_time).toLocaleDateString()}</span>
                </div>
                
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>
                    {event.attendee_count}
                    {event.max_attendees && ` / ${event.max_attendees}`} attendees
                  </span>
                </div>
              </div>
              
              <div className="text-xs text-gray-400">
                Created {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFeatureEvent(event.id)}
                  disabled={isLoading}
                  className={event.is_featured ? "text-dna-gold" : ""}
                >
                  <Star className="w-4 h-4" />
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditEvent(event)}
                    disabled={isLoading}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteEvent(event.id)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedEventManagement;
